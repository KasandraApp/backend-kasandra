import { ALERT_THRESHOLDS, DEFAULT_HORIZON_DAYS } from '../config/constants.js';
export function toNumber(value) {
    if (value === null || value === undefined)
        return 0;
    return typeof value === 'number' ? value : Number(value);
}
export function calculateCurrentBalance(transactions) {
    return transactions.reduce((balance, tx) => {
        return tx.type === 'income' ? balance + tx.amount : balance - tx.amount;
    }, 0);
}
export function calculateBalanceAtDate(transactions, upToDate) {
    return transactions
        .filter((tx) => tx.transactionDate <= upToDate)
        .reduce((balance, tx) => {
        return tx.type === 'income' ? balance + tx.amount : balance - tx.amount;
    }, 0);
}
export function calculateAverageDaily(transactions, type, lookbackDays = 30) {
    if (transactions.length === 0)
        return 0;
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - lookbackDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const filtered = transactions.filter((tx) => tx.type === type && tx.transactionDate >= cutoffStr);
    if (filtered.length === 0) {
        const allOfType = transactions.filter((tx) => tx.type === type);
        if (allOfType.length === 0)
            return 0;
        const total = allOfType.reduce((sum, tx) => sum + tx.amount, 0);
        const uniqueDays = new Set(allOfType.map((tx) => tx.transactionDate)).size;
        return total / Math.max(uniqueDays, 1);
    }
    const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
    const uniqueDays = new Set(filtered.map((tx) => tx.transactionDate)).size;
    return total / Math.max(uniqueDays, 1);
}
export function projectCash(params) {
    const horizonDays = params.horizonDays ?? DEFAULT_HORIZON_DAYS;
    const netDaily = params.avgDailyIncome - params.avgDailyExpense;
    const projection = [];
    for (let day = 0; day <= horizonDays; day++) {
        projection.push({
            day,
            label: `H+${day}`,
            value: params.currentBalance + netDaily * day,
        });
    }
    return projection;
}
export function findDeficitDay(projection) {
    const deficit = projection.find((point) => point.day > 0 && point.value < 0);
    return deficit ? deficit.day : null;
}
export function calculateWeeklyChangePercent(currentBalance, balanceWeekAgo) {
    if (balanceWeekAgo === 0) {
        return currentBalance > 0 ? 100 : 0;
    }
    return ((currentBalance - balanceWeekAgo) / Math.abs(balanceWeekAgo)) * 100;
}
export function projectInventoryItems(items) {
    return items.map((item) => {
        const daysRemaining = item.averageSalesPerDay > 0 ? item.currentStock / item.averageSalesPerDay : Infinity;
        let severity = 'info';
        if (daysRemaining < ALERT_THRESHOLDS.inventoryCriticalDays) {
            severity = 'critical';
        }
        else if (daysRemaining < ALERT_THRESHOLDS.inventoryCriticalDays * 2) {
            severity = 'warning';
        }
        return {
            itemId: item.id,
            itemName: item.itemName,
            unit: item.unit,
            currentStock: item.currentStock,
            averageSalesPerDay: item.averageSalesPerDay,
            daysRemaining: Number.isFinite(daysRemaining) ? Math.round(daysRemaining * 10) / 10 : 999,
            severity,
        };
    });
}
export function applyWhatIfParameters(baseIncome, baseExpense, parameters) {
    const expenseIncrease = parameters.expenseIncreasePercentage ?? 0;
    const incomeDecrease = parameters.incomeDecreasePercentage ?? 0;
    const avgDailyIncome = parameters.avgDailyIncome ?? baseIncome * (1 - incomeDecrease / 100);
    const avgDailyExpense = parameters.avgDailyExpense ?? baseExpense * (1 + expenseIncrease / 100);
    return { avgDailyIncome, avgDailyExpense };
}
export function classifySimulationScenario(projectedBalance, baselineBalance) {
    const delta = projectedBalance - baselineBalance;
    let label = 'Skenario stabil';
    if (projectedBalance < 0) {
        label = 'Skenario defisit';
    }
    else if (delta < 0) {
        label = 'Skenario waspada';
    }
    else if (delta > 0) {
        label = 'Skenario positif';
    }
    return { label, delta };
}
export function generateAlerts(params) {
    const alerts = [];
    const deficitDay = findDeficitDay(params.cashProjection);
    if (deficitDay !== null && deficitDay <= ALERT_THRESHOLDS.cashCriticalDays) {
        alerts.push({
            alertType: 'cash',
            severity: 'critical',
            message: `Kas diproyeksikan defisit pada H+${deficitDay}. Segera evaluasi biaya operasional.`,
            triggerValue: deficitDay,
            detail: 'Evaluasi pengeluaran operasional dan prioritaskan pemasukan.',
        });
    }
    else if (deficitDay !== null && deficitDay <= 14) {
        alerts.push({
            alertType: 'cash',
            severity: 'warning',
            message: `Kas Diperkirakan Menipis dalam 2 Minggu. Proyeksi defisit di H+${deficitDay}.`,
            triggerValue: deficitDay,
            detail: 'Perlu evaluasi biaya operasional.',
        });
    }
    const criticalItems = params.inventoryProjection.filter((item) => item.severity === 'critical');
    if (criticalItems.length > 0) {
        const names = criticalItems.map((item) => item.itemName).join(' & ');
        alerts.push({
            alertType: 'inventory',
            severity: 'critical',
            message: `${criticalItems.length} Item Stok Kritis. Segera Isi Ulang dalam <3 Hari`,
            triggerValue: criticalItems.length,
            detail: `${criticalItems.length} item (${names}) diperkirakan habis dalam kurang dari 3 hari.`,
        });
    }
    const warningItems = params.inventoryProjection.filter((item) => item.severity === 'warning');
    if (warningItems.length > 0 && criticalItems.length === 0) {
        alerts.push({
            alertType: 'inventory',
            severity: 'warning',
            message: `${warningItems.length} item stok mendekati batas aman.`,
            triggerValue: warningItems.length,
            detail: 'Pertimbangkan restock dalam minggu ini.',
        });
    }
    if (alerts.length === 0) {
        alerts.push({
            alertType: 'cash',
            severity: 'info',
            message: 'Kondisi kas dan stok dalam batas aman.',
            triggerValue: 0,
            detail: 'Lanjutkan pencatatan harian.',
        });
    }
    return alerts;
}
