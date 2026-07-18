-- Seed data for local development and testing

BEGIN;

INSERT INTO users (full_name, email, password_hash) VALUES
    ('Admin Kasandra', 'admin@kasandra.local', '$2a$10$placeholderhash1'),
    ('Demo Owner', 'demo@kasandra.local', '$2a$10$placeholderhash2');

INSERT INTO business_profiles (user_id, business_name, business_type, currency_code) VALUES
    (1, 'Toko Maju', 'retail', 'IDR'),
    (2, 'UMKM Sukses', 'food', 'IDR');

INSERT INTO cash_transactions (business_profile_id, transaction_date, type, amount, description) VALUES
    (1, '2026-07-01', 'income', 1500000, 'Penjualan harian'),
    (1, '2026-07-02', 'expense', 450000, 'Belanja stok'),
    (2, '2026-07-01', 'income', 900000, 'Penjualan paket'),
    (2, '2026-07-02', 'expense', 180000, 'Operasional');

INSERT INTO inventory_items (business_profile_id, item_name, current_stock, average_sales_per_day, unit, minimum_threshold) VALUES
    (1, 'Kopi Arabika', 120, 8, 'kg', 20),
    (1, 'Gula', 60, 4, 'kg', 10),
    (2, 'Bolu', 35, 6, 'box', 8);

INSERT INTO inventory_movements (inventory_item_id, movement_date, movement_type, quantity, note) VALUES
    (1, '2026-07-01', 'in', 30, 'Restock supplier'),
    (1, '2026-07-02', 'out', 12, 'Penjualan'),
    (2, '2026-07-01', 'out', 8, 'Penjualan'),
    (3, '2026-07-01', 'in', 20, 'Produksi baru');

INSERT INTO forecast_runs (business_profile_id, forecast_type, source_snapshot_json, result_json, horizon_days) VALUES
    (1, 'cash', '{"period": "weekly"}', '{"projection": [1200000, 1300000, 1400000]}', 30),
    (1, 'inventory', '{"period": "weekly"}', '{"projection": [90, 80, 70]}', 30);

INSERT INTO what_if_scenarios (business_profile_id, scenario_name, parameter_json, result_json) VALUES
    (1, 'Naikkan biaya operasional 10%', '{"expense_increase_percentage": 10}', '{"projected_cash": 1150000}');

INSERT INTO alerts (business_profile_id, alert_type, severity, message, status, trigger_value) VALUES
    (1, 'inventory', 'critical', 'Stok mendekati batas minimum', 'active', 15),
    (2, 'cash', 'warning', 'Arus kas mulai menurun', 'active', 800000);

INSERT INTO export_logs (business_profile_id, export_type, file_path) VALUES
    (1, 'pdf', '/exports/forecast-1.pdf'),
    (2, 'excel', '/exports/forecast-2.xlsx');

COMMIT;
