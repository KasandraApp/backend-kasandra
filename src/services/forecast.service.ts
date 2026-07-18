import { createId, nowIso } from '../utils/in-memory-store';
import { fail, ok } from '../utils/response';
import {
  calculateAverageDaily,
  calculateCurrentBalance,
  projectCash,
  projectInventoryItems,
  findDeficitDay,
  calculateWeeklyChangePercent,
  generateAlerts,
} from '../utils/calculation';
import { DEFAULT_HORIZON_DAYS } from '../config/constants';
import { cashRepository } from '../repositories/cash.repository';
import { inventoryRepository } from '../repositories/inventory.repository';
import { forecastRepository } from '../repositories/forecast.repository';
import { alertRepository } from '../repositories/alert.repository';

export const forecastService = {
  getLatest: async (businessProfileId: string) => {
    try {
      const latest = await forecastRepository.findLatest(businessProfileId);
      if (latest) {
        return ok({
          forecast_id: latest.id,
          generated_at: latest.generatedAt,
          ...(latest.resultJson as Record<string, unknown>),
        });
      }
    } catch (error) {
      return fail('Database unavailable while loading the forecast', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }

    return fail('No forecast found');
  },

  recalculate: async (businessProfileId: string) => {
    let transactions: Array<{ type: 'income' | 'expense'; amount: number; transactionDate: string }> = [];
    let inventoryItems: Array<{ id: string | number; itemName: string; unit: string; currentStock: number; averageSalesPerDay: number }> = [];

    const txRows = await cashRepository.findAll(businessProfileId);
    transactions = txRows.map((tx) => ({
      type: tx.type === 'expense' ? 'expense' : 'income',
      amount: Number(tx.amount ?? 0),
      transactionDate: typeof tx.transactionDate === 'string' ? tx.transactionDate : '',
    }));

    const inventoryRows = await inventoryRepository.findAllItems(businessProfileId);
    inventoryItems = inventoryRows.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      unit: item.unit,
      currentStock: Number(item.currentStock ?? 0),
      averageSalesPerDay: Number(item.averageSalesPerDay ?? 0),
    }));

    const currentBalance = calculateCurrentBalance(transactions);
    const avgIncome = calculateAverageDaily(transactions, 'income');
    const avgExpense = calculateAverageDaily(transactions, 'expense');

    const cashProjection = projectCash({ currentBalance, avgDailyIncome: avgIncome, avgDailyExpense: avgExpense, horizonDays: DEFAULT_HORIZON_DAYS });
    const inventoryProjection = projectInventoryItems(inventoryItems);
    const alerts = generateAlerts({ cashProjection, inventoryProjection });

    const result = {
      cash_projection: cashProjection.map((point) => ({ day: point.day, label: point.label, value: point.value })),
      inventory_projection: inventoryProjection.map((item) => ({
        item_id: item.itemId,
        item_name: item.itemName,
        unit: item.unit,
        current_stock: item.currentStock,
        average_sales_per_day: item.averageSalesPerDay,
        days_remaining: item.daysRemaining,
        severity: item.severity,
      })),
      cash_summary: {
        current_balance: currentBalance,
        change_from_last_week_pct: calculateWeeklyChangePercent(currentBalance, currentBalance),
        projected_30d: cashProjection[DEFAULT_HORIZON_DAYS]?.value ?? 0,
        deficit_at_day: findDeficitDay(cashProjection) ?? 0,
      },
      alert_summary: alerts.map((alert) => ({
        type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        detail: alert.detail ?? '',
      })),
    };

    await forecastRepository.save({
      businessProfileId,
      forecastType: 'cash',
      sourceSnapshotJson: {},
      resultJson: result,
      horizonDays: DEFAULT_HORIZON_DAYS,
    });

    await alertRepository.replaceActive(
      businessProfileId,
      alerts.map((alert) => ({
        alertType: alert.alertType as 'cash' | 'inventory',
        severity: alert.severity as 'info' | 'warning' | 'critical',
        message: alert.message,
        triggerValue: String(alert.triggerValue ?? 0),
      })),
    );

    return ok(result);
  },

  history: async (businessProfileId: string) => {
    try {
      const history = await forecastRepository.findHistory(businessProfileId);
      return ok({ history: history.map((run) => ({ id: run.id, generated_at: run.generatedAt, horizon_days: run.horizonDays })) });
    } catch (error) {
      return fail('Database unavailable while loading forecast history', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },
};
