export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  authProvider: 'email' | 'google';
  createdAt: string;
  updatedAt: string;
};

export type BusinessProfileRecord = {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
};

export type CashTransactionRecord = {
  id: string;
  businessProfileId: string;
  transactionDate: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItemRecord = {
  id: string;
  businessProfileId: string;
  itemName: string;
  currentStock: number;
  averageSalesPerDay: number;
  unit: 'kg' | 'liter' | 'pcs' | 'pack';
  minimumThreshold: number;
  createdAt: string;
  updatedAt: string;
};

export type ForecastRunRecord = {
  id: string;
  businessProfileId: string;
  forecastType: string;
  sourceSnapshotJson: Record<string, unknown>;
  resultJson: Record<string, unknown>;
  horizonDays: number;
  generatedAt: string;
};

export type AlertRecord = {
  id: string;
  businessProfileId: string;
  alertType: 'cash' | 'inventory';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detail: string | null;
  status: 'active' | 'read' | 'resolved';
  triggerValue: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ScenarioRecord = {
  id: string;
  businessProfileId: string;
  scenarioName: string;
  parameterJson: Record<string, unknown>;
  resultJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export const store = {
  users: [] as UserRecord[],
  businessProfiles: [] as BusinessProfileRecord[],
  cashTransactions: [] as CashTransactionRecord[],
  inventoryItems: [] as InventoryItemRecord[],
  forecastRuns: [] as ForecastRunRecord[],
  alerts: [] as AlertRecord[],
  scenarios: [] as ScenarioRecord[],
};

export const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const nowIso = () => new Date().toISOString();
