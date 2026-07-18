export const store = {
    users: [],
    businessProfiles: [],
    cashTransactions: [],
    inventoryItems: [],
    forecastRuns: [],
    alerts: [],
    scenarios: [],
};
export const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const nowIso = () => new Date().toISOString();
