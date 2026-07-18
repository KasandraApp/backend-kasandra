import {
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const unitEnum = pgEnum('unit_enum', ['kg', 'liter', 'pcs', 'pack']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  authProvider: varchar('auth_provider', { length: 50 }).notNull().default('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessType: varchar('business_type', { length: 100 }).notNull().default('general'),
  currencyCode: varchar('currency_code', { length: 10 }).notNull().default('IDR'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cashTransactions = pgTable(
  'cash_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessProfileId: uuid('business_profile_id')
      .notNull()
      .references(() => businessProfiles.id, { onDelete: 'cascade' }),
    transactionDate: date('transaction_date').notNull(),
    type: varchar('type', { length: 10 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('cash_transactions_type_check', sql`${table.type} IN ('income', 'expense')`),
    check('cash_transactions_amount_check', sql`${table.amount} > 0`),
  ],
);

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessProfileId: uuid('business_profile_id')
      .notNull()
      .references(() => businessProfiles.id, { onDelete: 'cascade' }),
    itemName: varchar('item_name', { length: 255 }).notNull(),
    currentStock: numeric('current_stock', { precision: 12, scale: 2 }).notNull().default('0'),
    averageSalesPerDay: numeric('average_sales_per_day', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    unit: unitEnum('unit').notNull().default('pcs'),
    minimumThreshold: numeric('minimum_threshold', { precision: 10, scale: 2 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('inventory_items_current_stock_check', sql`${table.currentStock} >= 0`),
    check('inventory_items_average_sales_check', sql`${table.averageSalesPerDay} >= 0`),
  ],
);

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    movementDate: date('movement_date').notNull(),
    movementType: varchar('movement_type', { length: 20 }).notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'inventory_movements_type_check',
      sql`${table.movementType} IN ('in', 'out', 'adjustment')`,
    ),
    check('inventory_movements_quantity_check', sql`${table.quantity} > 0`),
  ],
);

export const forecastRuns = pgTable(
  'forecast_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessProfileId: uuid('business_profile_id')
      .notNull()
      .references(() => businessProfiles.id, { onDelete: 'cascade' }),
    forecastType: varchar('forecast_type', { length: 20 }).notNull(),
    sourceSnapshotJson: jsonb('source_snapshot_json').notNull(),
    resultJson: jsonb('result_json').notNull(),
    horizonDays: integer('horizon_days').notNull().default(30),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('forecast_runs_type_check', sql`${table.forecastType} IN ('cash', 'inventory', 'combined')`),
    check('forecast_runs_horizon_check', sql`${table.horizonDays} > 0`),
  ],
);

export const whatIfScenarios = pgTable('what_if_scenarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessProfileId: uuid('business_profile_id')
    .notNull()
    .references(() => businessProfiles.id, { onDelete: 'cascade' }),
  scenarioName: varchar('scenario_name', { length: 255 }).notNull(),
  parameterJson: jsonb('parameter_json').notNull(),
  resultJson: jsonb('result_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessProfileId: uuid('business_profile_id')
      .notNull()
      .references(() => businessProfiles.id, { onDelete: 'cascade' }),
    alertType: varchar('alert_type', { length: 20 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull(),
    message: text('message').notNull(),
    detail: text('detail'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    triggerValue: numeric('trigger_value', { precision: 15, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('alerts_type_check', sql`${table.alertType} IN ('cash', 'inventory')`),
    check('alerts_severity_check', sql`${table.severity} IN ('info', 'warning', 'critical')`),
    check('alerts_status_check', sql`${table.status} IN ('active', 'read', 'resolved')`),
  ],
);

export const exportLogs = pgTable(
  'export_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessProfileId: uuid('business_profile_id')
      .notNull()
      .references(() => businessProfiles.id, { onDelete: 'cascade' }),
    exportType: varchar('export_type', { length: 10 }).notNull(),
    filePath: text('file_path').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check('export_logs_type_check', sql`${table.exportType} IN ('pdf', 'excel')`)],
);

export const usersRelations = relations(users, ({ many }) => ({
  businessProfiles: many(businessProfiles),
}));

export const businessProfilesRelations = relations(businessProfiles, ({ one, many }) => ({
  user: one(users, { fields: [businessProfiles.userId], references: [users.id] }),
  cashTransactions: many(cashTransactions),
  inventoryItems: many(inventoryItems),
  forecastRuns: many(forecastRuns),
  whatIfScenarios: many(whatIfScenarios),
  alerts: many(alerts),
  exportLogs: many(exportLogs),
}));

export const cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
  businessProfile: one(businessProfiles, {
    fields: [cashTransactions.businessProfileId],
    references: [businessProfiles.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [inventoryItems.businessProfileId],
    references: [businessProfiles.id],
  }),
  movements: many(inventoryMovements),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  inventoryItem: one(inventoryItems, {
    fields: [inventoryMovements.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const schema = {
  users,
  businessProfiles,
  cashTransactions,
  inventoryItems,
  inventoryMovements,
  forecastRuns,
  whatIfScenarios,
  alerts,
  exportLogs,
};
