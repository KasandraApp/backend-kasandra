import { beforeEach, describe, expect, it, vi } from 'vitest';

const cashFindAllMock = vi.fn();
const inventoryFindAllItemsMock = vi.fn();
const forecastSaveMock = vi.fn();
const alertReplaceActiveMock = vi.fn();
const alertFindActiveMock = vi.fn();
const scenarioCreateMock = vi.fn();

vi.mock('../src/repositories/cash.repository', () => ({
  cashRepository: {
    findAll: cashFindAllMock,
  },
}));

vi.mock('../src/repositories/inventory.repository', () => ({
  inventoryRepository: {
    findAllItems: inventoryFindAllItemsMock,
  },
}));

vi.mock('../src/repositories/forecast.repository', () => ({
  forecastRepository: {
    save: forecastSaveMock,
  },
}));

vi.mock('../src/repositories/alert.repository', () => ({
  alertRepository: {
    findActive: alertFindActiveMock,
    findById: vi.fn(),
    replaceActive: alertReplaceActiveMock,
    markRead: vi.fn(),
    markResolved: vi.fn(),
  },
}));

vi.mock('../src/repositories/scenario.repository', () => ({
  scenarioRepository: {
    create: scenarioCreateMock,
    findAll: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
  },
}));

import { forecastService } from '../src/services/forecast.service';
import { whatIfService } from '../src/services/whatif.service';
import { alertService } from '../src/services/alert.service';
import { cashService } from '../src/services/cash.service';
import { inventoryService } from '../src/services/inventory.service';

describe('api contract alignment', () => {
  beforeEach(() => {
    cashFindAllMock.mockReset();
    inventoryFindAllItemsMock.mockReset();
    forecastSaveMock.mockReset();
    alertReplaceActiveMock.mockReset();
    alertFindActiveMock.mockReset();
    scenarioCreateMock.mockReset();
  });

  it('returns forecast projection with value-based fields and snake_case inventory fields', async () => {
    cashFindAllMock.mockResolvedValue([
      { id: 'tx-1', businessProfileId: 'bp-1', transactionDate: '2026-07-18', type: 'income', amount: '1000' },
    ]);
    inventoryFindAllItemsMock.mockResolvedValue([
      { id: 'item-1', businessProfileId: 'bp-1', itemName: 'Ayam', unit: 'kg', currentStock: 2, averageSalesPerDay: 1 },
    ]);
    forecastSaveMock.mockResolvedValue({ id: 'forecast-1' });
    alertReplaceActiveMock.mockResolvedValue([]);

    const result = await forecastService.recalculate('bp-1');

    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.cash_projection[0]).toHaveProperty('value');
    expect(data.cash_projection[0]).not.toHaveProperty('balance');
    expect(data.inventory_projection[0]).toMatchObject({
      item_id: 'item-1',
      item_name: 'Ayam',
      days_remaining: 2,
      severity: 'critical',
    });
    expect(data.alert_summary[0]).toMatchObject({
      type: 'inventory',
      severity: 'critical',
      detail: expect.any(String),
    });
  });

  it('returns what-if payload with value-based projection and generated scenario name', async () => {
    scenarioCreateMock.mockResolvedValue({ id: 'scenario-1' });

    const result = await whatIfService.simulate('bp-1', {
      parameters: {
        expense_increase_percentage: 15,
        income_decrease_percentage: 63,
      },
    });

    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.scenario_name).toBe('Pengeluaran naik 15%, Pemasukan turun 63%');
    expect(data.cash_projection[0]).toHaveProperty('value');
    expect(data.cash_projection[0]).not.toHaveProperty('balance');
  });

  it('normalizes cash and inventory list payloads with snake_case fields', async () => {
    cashFindAllMock.mockResolvedValue([
      { id: 'tx-1', businessProfileId: 'bp-1', transactionDate: '2026-07-18', type: 'income', amount: '1000', category: 'Penjualan', createdAt: '2026-07-18T00:00:00.000Z' },
    ]);
    inventoryFindAllItemsMock.mockResolvedValue([
      { id: 'item-1', businessProfileId: 'bp-1', itemName: 'Ayam', currentStock: 2, averageSalesPerDay: 1, unit: 'kg', minimumThreshold: 0, createdAt: '2026-07-18T00:00:00.000Z', updatedAt: '2026-07-18T00:00:00.000Z' },
    ]);

    const cashResult = await cashService.list('bp-1');
    const inventoryResult = await inventoryService.list('bp-1');

    expect(cashResult.success).toBe(true);
    expect((cashResult.data as any).transactions[0]).toMatchObject({ transaction_date: '2026-07-18', category: 'Penjualan' });
    expect((cashResult.data as any).transactions[0]).not.toHaveProperty('transactionDate');

    expect(inventoryResult.success).toBe(true);
    expect((inventoryResult.data as any).items[0]).toMatchObject({ item_name: 'Ayam', days_remaining: 2, severity: 'critical' });
    expect((inventoryResult.data as any).items[0]).not.toHaveProperty('itemName');
  });

  it('normalizes alert payload to snake_case contract fields', async () => {
    alertFindActiveMock.mockResolvedValue([
      {
        id: 'alert-1',
        businessProfileId: 'bp-1',
        alertType: 'inventory',
        severity: 'critical',
        message: '2 Item Stok Kritis',
        detail: '2 item diperkirakan habis.',
        status: 'active',
        triggerValue: '2',
        createdAt: '2026-07-18T00:00:00.000Z',
      },
    ]);

    const result = await alertService.list('bp-1');

    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.alerts[0]).toMatchObject({
      alert_type: 'inventory',
      severity: 'critical',
      trigger_value: '2',
      detail: '2 item diperkirakan habis.',
    });
    expect(data.alerts[0]).not.toHaveProperty('alertType');
    expect(data.alerts[0]).not.toHaveProperty('triggerValue');
  });
});
