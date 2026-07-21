-- Seed data for local development and testing
-- Uses CTE with RETURNING to properly reference UUID primary keys

BEGIN;

-- Create users (password: "password123" for both)
INSERT INTO users (full_name, email, password_hash) VALUES
    ('Admin Kasandra', 'admin@kasandra.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
    ('Demo Owner', 'demo@kasandra.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Create business profiles using subquery to get user UUIDs
INSERT INTO business_profiles (user_id, business_name, business_type, currency_code)
SELECT id, 'Toko Maju', 'retail', 'IDR' FROM users WHERE email = 'admin@kasandra.local';

INSERT INTO business_profiles (user_id, business_name, business_type, currency_code)
SELECT id, 'UMKM Sukses', 'food', 'IDR' FROM users WHERE email = 'demo@kasandra.local';

-- Cash transactions
INSERT INTO cash_transactions (business_profile_id, transaction_date, type, category, amount, note)
SELECT id, '2026-07-01', 'income', 'Penjualan', 1500000, 'Penjualan harian' FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO cash_transactions (business_profile_id, transaction_date, type, category, amount, note)
SELECT id, '2026-07-02', 'expense', 'Belanja Stok', 450000, 'Belanja stok' FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO cash_transactions (business_profile_id, transaction_date, type, category, amount, note)
SELECT id, '2026-07-01', 'income', 'Penjualan', 900000, 'Penjualan paket' FROM business_profiles WHERE business_name = 'UMKM Sukses';

INSERT INTO cash_transactions (business_profile_id, transaction_date, type, category, amount, note)
SELECT id, '2026-07-02', 'expense', 'Operasional', 180000, 'Operasional' FROM business_profiles WHERE business_name = 'UMKM Sukses';

-- Inventory items
INSERT INTO inventory_items (business_profile_id, item_name, current_stock, average_sales_per_day, unit, minimum_threshold)
SELECT id, 'Kopi Arabika', 120, 8, 'kg', 20 FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO inventory_items (business_profile_id, item_name, current_stock, average_sales_per_day, unit, minimum_threshold)
SELECT id, 'Gula', 60, 4, 'kg', 10 FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO inventory_items (business_profile_id, item_name, current_stock, average_sales_per_day, unit, minimum_threshold)
SELECT id, 'Bolu', 35, 6, 'pcs', 8 FROM business_profiles WHERE business_name = 'UMKM Sukses';

-- Inventory movements
INSERT INTO inventory_movements (inventory_item_id, movement_date, movement_type, quantity, note)
SELECT id, '2026-07-01', 'in', 30, 'Restock supplier' FROM inventory_items WHERE item_name = 'Kopi Arabika';

INSERT INTO inventory_movements (inventory_item_id, movement_date, movement_type, quantity, note)
SELECT id, '2026-07-02', 'out', 12, 'Penjualan' FROM inventory_items WHERE item_name = 'Kopi Arabika';

INSERT INTO inventory_movements (inventory_item_id, movement_date, movement_type, quantity, note)
SELECT id, '2026-07-01', 'out', 8, 'Penjualan' FROM inventory_items WHERE item_name = 'Gula';

INSERT INTO inventory_movements (inventory_item_id, movement_date, movement_type, quantity, note)
SELECT id, '2026-07-01', 'in', 20, 'Produksi baru' FROM inventory_items WHERE item_name = 'Bolu';

-- Forecast runs
INSERT INTO forecast_runs (business_profile_id, forecast_type, source_snapshot_json, result_json, horizon_days)
SELECT id, 'cash', '{"period": "weekly"}'::jsonb, '{"projection": [1200000, 1300000, 1400000]}'::jsonb, 30 FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO forecast_runs (business_profile_id, forecast_type, source_snapshot_json, result_json, horizon_days)
SELECT id, 'inventory', '{"period": "weekly"}'::jsonb, '{"projection": [90, 80, 70]}'::jsonb, 30 FROM business_profiles WHERE business_name = 'Toko Maju';

-- What-if scenarios
INSERT INTO what_if_scenarios (business_profile_id, scenario_name, parameter_json, result_json)
SELECT id, 'Naikkan biaya operasional 10%', '{"expense_increase_percentage": 10}'::jsonb, '{"projected_cash": 1150000}'::jsonb FROM business_profiles WHERE business_name = 'Toko Maju';

-- Alerts
INSERT INTO alerts (business_profile_id, alert_type, severity, message, status, trigger_value)
SELECT id, 'inventory', 'critical', 'Stok mendekati batas minimum', 'active', 15 FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO alerts (business_profile_id, alert_type, severity, message, status, trigger_value)
SELECT id, 'cash', 'warning', 'Arus kas mulai menurun', 'active', 800000 FROM business_profiles WHERE business_name = 'UMKM Sukses';

-- Export logs
INSERT INTO export_logs (business_profile_id, export_type, file_path)
SELECT id, 'pdf', '/exports/forecast-1.pdf' FROM business_profiles WHERE business_name = 'Toko Maju';

INSERT INTO export_logs (business_profile_id, export_type, file_path)
SELECT id, 'excel', '/exports/forecast-2.xlsx' FROM business_profiles WHERE business_name = 'UMKM Sukses';

COMMIT;

