# Implementation Backend Planning
## KasandraApp — MVP 50%

| Dokumen | Implementation Backend Planning |
|---|---|
| **Versi** | 1.0 |
| **Berdasarkan** | PRD v1.0, SDD v1.0, UI Design MVP 50% |
| **Stack** | TypeScript · Hono · Bun · Drizzle ORM · PostgreSQL |
| **Status** | Ready to Implement |

---

## Daftar Isi

1. [Keputusan Gap UI vs SDD](#1-keputusan-gap-ui-vs-sdd)
2. [Perubahan Schema Database](#2-perubahan-schema-database)
3. [Kontrak API Lengkap](#3-kontrak-api-lengkap)
4. [Logika Bisnis Inti](#4-logika-bisnis-inti)
5. [Struktur Folder Backend](#5-struktur-folder-backend)
6. [Urutan Implementasi](#6-urutan-implementasi)
7. [Checklist per Modul](#7-checklist-per-modul)

---

## 1. Keputusan Gap UI vs SDD

Seluruh keputusan di bawah ini bersifat final dan menjadi acuan implementasi.

### Gap #1 — Kolom `description` dihapus, `category` ditambahkan di `cash_transactions`

**Sebelum (SDD):**
```
cash_transactions: ..., description TEXT, ...
```

**Sesudah (Final):**
```
cash_transactions: ..., category VARCHAR(100) NOT NULL, ...
```

Field `description` dihilangkan seluruhnya. Field `category` wajib diisi user (contoh: "Penjualan", "Sewa", "Bahan Baku"). Tidak ada enum terkunci untuk category — user bebas mengetik teks.

---

### Gap #2 — `average_sales_per_day` adalah input manual user

Field `average_sales_per_day` di tabel `inventory_items` merupakan nilai yang **diinput langsung oleh user** saat menambah stok (field "Rata Jual/Hari" di UI). Backend tidak menghitung nilai ini secara otomatis dari riwayat transaksi. Nilai ini langsung dipakai sebagai parameter forecast ketahanan stok.

---

### Gap #3 — Inline edit transaksi

Edit transaksi dilakukan inline di baris riwayat (bukan modal terpisah). Tidak ada perubahan di BE. BE harus memastikan response `GET /cash-transactions` dan `GET /inventory-items` mengembalikan **semua field yang dibutuhkan untuk re-populate form inline**, termasuk `id`, `transaction_date`, `type`, `category`, `amount`.

---

### Gap #4 — Field yang bisa di-PATCH pada `cash_transactions`

`PATCH /api/v1/cash-transactions/:id` menerima semua field berikut (semua opsional, minimal satu harus ada):

```json
{
  "transaction_date": "2026-07-16",
  "type": "income" | "expense",
  "category": "Penjualan",
  "amount": 150000
}
```

---

### Gap #5 — Response `/forecast` harus berupa array per hari

`result_json` di `forecast_runs` dan response `GET /api/v1/forecast` harus mengembalikan array H+0 sampai H+30 untuk mendukung tooltip hover di chart. Struktur wajib:

```json
{
  "cash_projection": [
    { "day": 0, "label": "H+0", "value": 10500000 },
    { "day": 1, "label": "H+1", "value": 10200000 },
    ...
    { "day": 30, "label": "H+30", "value": -20000000 }
  ],
  "inventory_projection": [
    {
      "item_id": "uuid",
      "item_name": "Ayam Betutu",
      "days_remaining": 2,
      "severity": "critical"
    },
    ...
  ],
  "cash_summary": {
    "current_balance": 10500000,
    "change_from_last_week_pct": 12.4,
    "projected_30d": -20000000,
    "deficit_at_day": 6
  },
  "alert_summary": [
    {
      "type": "cash",
      "severity": "warning",
      "message": "Kas diperkirakan menipis dalam 2 minggu",
      "detail": "Proyeksi defisit di H+8. Perlu evaluasi biaya operasional."
    },
    {
      "type": "inventory",
      "severity": "critical",
      "message": "2 Item Stok Kritis. Segera Isi Ulang dalam <3 Hari",
      "detail": "2 item (Ayam Betutu & Tahu) diperkirakan habis dalam kurang dari 3 hari."
    }
  ]
}
```

---

### Gap #6 — Simulasi what-if selalu disimpan ke DB

Setiap kali user menggeser slider dan menekan "hitung" (atau setelah debounce), `POST /api/v1/what-if/simulate` langsung menyimpan skenario ke tabel `what_if_scenarios`. `scenario_name` di-generate otomatis oleh backend berdasarkan parameter, contoh: `"Pengeluaran naik 15%, Pemasukan turun 63%"`. User tidak perlu mengisi nama skenario secara manual.

---

### Gap #7 — Google OAuth masuk MVP

Auth mendukung dua jalur:
1. **Email + Password** (register/login manual)
2. **Google OAuth 2.0** (tombol "Lanjutkan dengan Google")

Library yang digunakan: `@hono/oauth-providers` atau implementasi manual via Google OAuth 2.0 Authorization Code flow. Kedua jalur menghasilkan JWT access token yang sama formatnya. Tabel `users` ditambahkan kolom `google_id` dan `auth_provider`.

---

### Gap #8 — Enum `unit` untuk inventory

Kolom `unit` di tabel `inventory_items` menggunakan enum PostgreSQL dengan nilai terkunci:

```sql
CREATE TYPE unit_enum AS ENUM ('kg', 'liter', 'unit', 'pack');
```

---

## 2. Perubahan Schema Database

Ini adalah schema final dengan seluruh gap sudah diaplikasikan. Gunakan ini sebagai acuan Drizzle schema (`src/db/schema.ts`).

### 2.1 Tabel `users` (diperbarui)

```typescript
export const users = pgTable('users', {
  id:            uuid('id').defaultRandom().primaryKey(),
  full_name:     varchar('full_name', { length: 255 }).notNull(),
  email:         varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash'),                          // nullable jika OAuth
  google_id:     varchar('google_id', { length: 255 }).unique(), // Gap #7
  auth_provider: varchar('auth_provider', { length: 50 })        // 'email' | 'google'
                 .notNull().default('email'),                     // Gap #7
  created_at:    timestamp('created_at').defaultNow().notNull(),
  updated_at:    timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.2 Tabel `business_profiles` (tidak berubah)

```typescript
export const business_profiles = pgTable('business_profiles', {
  id:            uuid('id').defaultRandom().primaryKey(),
  user_id:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  business_name: varchar('business_name', { length: 255 }).notNull(),
  business_type: varchar('business_type', { length: 100 }),
  currency_code: varchar('currency_code', { length: 10 }).notNull().default('IDR'),
  created_at:    timestamp('created_at').defaultNow().notNull(),
  updated_at:    timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.3 Tabel `cash_transactions` (diperbarui — Gap #1)

```typescript
export const cash_transactions = pgTable('cash_transactions', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  business_profile_id: uuid('business_profile_id').notNull()
                       .references(() => business_profiles.id, { onDelete: 'cascade' }),
  transaction_date:    date('transaction_date').notNull(),
  type:                varchar('type', { length: 10 }).notNull(), // 'income' | 'expense'
  category:            varchar('category', { length: 100 }).notNull(), // Gap #1: ganti description
  amount:              numeric('amount', { precision: 15, scale: 2 }).notNull(),
  // ❌ description: dihapus (Gap #1)
  created_at:          timestamp('created_at').defaultNow().notNull(),
  updated_at:          timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.4 Tabel `inventory_items` (diperbarui — Gap #2 & #8)

```typescript
export const unit_enum = pgEnum('unit_enum', ['kg', 'liter', 'unit', 'pack']); // Gap #8

export const inventory_items = pgTable('inventory_items', {
  id:                   uuid('id').defaultRandom().primaryKey(),
  business_profile_id:  uuid('business_profile_id').notNull()
                        .references(() => business_profiles.id, { onDelete: 'cascade' }),
  item_name:            varchar('item_name', { length: 255 }).notNull(),
  current_stock:        numeric('current_stock', { precision: 12, scale: 2 }).notNull().default('0'),
  average_sales_per_day: numeric('average_sales_per_day', { precision: 10, scale: 2 })
                        .notNull().default('0'), // Gap #2: user-input manual
  unit:                 unit_enum('unit').notNull().default('unit'), // Gap #8
  minimum_threshold:    numeric('minimum_threshold', { precision: 10, scale: 2 }).default('0'),
  created_at:           timestamp('created_at').defaultNow().notNull(),
  updated_at:           timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.5 Tabel `inventory_movements` (tidak berubah)

```typescript
export const inventory_movements = pgTable('inventory_movements', {
  id:                uuid('id').defaultRandom().primaryKey(),
  inventory_item_id: uuid('inventory_item_id').notNull()
                     .references(() => inventory_items.id, { onDelete: 'cascade' }),
  movement_date:     date('movement_date').notNull(),
  movement_type:     varchar('movement_type', { length: 20 }).notNull(), // 'in' | 'out' | 'adjustment'
  quantity:          numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  note:              text('note'),
  created_at:        timestamp('created_at').defaultNow().notNull(),
  updated_at:        timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.6 Tabel `forecast_runs` (diperbarui — Gap #5)

```typescript
export const forecast_runs = pgTable('forecast_runs', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  business_profile_id: uuid('business_profile_id').notNull()
                       .references(() => business_profiles.id, { onDelete: 'cascade' }),
  forecast_type:       varchar('forecast_type', { length: 20 }).notNull(), // 'cash' | 'inventory' | 'combined'
  source_snapshot_json: jsonb('source_snapshot_json').notNull(), // snapshot input saat forecast dibuat
  result_json:         jsonb('result_json').notNull(), // Gap #5: array per hari H+0..H+30
  horizon_days:        integer('horizon_days').notNull().default(30),
  generated_at:        timestamp('generated_at').defaultNow().notNull(),
});
```

### 2.7 Tabel `what_if_scenarios` (diperbarui — Gap #6)

```typescript
export const what_if_scenarios = pgTable('what_if_scenarios', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  business_profile_id: uuid('business_profile_id').notNull()
                       .references(() => business_profiles.id, { onDelete: 'cascade' }),
  scenario_name:       varchar('scenario_name', { length: 255 }).notNull(), // Gap #6: auto-generated
  parameter_json:      jsonb('parameter_json').notNull(),
  result_json:         jsonb('result_json').notNull(),
  created_at:          timestamp('created_at').defaultNow().notNull(),
  updated_at:          timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.8 Tabel `alerts` (tidak berubah)

```typescript
export const alerts = pgTable('alerts', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  business_profile_id: uuid('business_profile_id').notNull()
                       .references(() => business_profiles.id, { onDelete: 'cascade' }),
  alert_type:          varchar('alert_type', { length: 20 }).notNull(), // 'cash' | 'inventory'
  severity:            varchar('severity', { length: 20 }).notNull(), // 'info' | 'warning' | 'critical'
  message:             text('message').notNull(),
  detail:              text('detail'),
  status:              varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'read' | 'resolved'
  trigger_value:       numeric('trigger_value', { precision: 15, scale: 2 }),
  created_at:          timestamp('created_at').defaultNow().notNull(),
  updated_at:          timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.9 Indeks yang Direkomendasikan

```sql
-- cash_transactions
CREATE INDEX idx_cash_transactions_profile_date
  ON cash_transactions(business_profile_id, transaction_date DESC);

-- inventory_items
CREATE INDEX idx_inventory_items_profile
  ON inventory_items(business_profile_id);

-- inventory_movements
CREATE INDEX idx_inventory_movements_item_date
  ON inventory_movements(inventory_item_id, movement_date DESC);

-- forecast_runs
CREATE INDEX idx_forecast_runs_profile_generated
  ON forecast_runs(business_profile_id, generated_at DESC);

-- alerts
CREATE INDEX idx_alerts_profile_status_severity
  ON alerts(business_profile_id, status, severity);

-- users
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
```

---

## 3. Kontrak API Lengkap

Base URL: `/api/v1`
Auth: Bearer JWT (kecuali endpoint auth publik)
Response format selalu:
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

---

### 3.1 Auth Module

#### `POST /api/v1/auth/register`
Register dengan email + password.

Request:
```json
{
  "full_name": "Budi Santoso",
  "business_name": "Warung Berkah",
  "email": "budi@gmail.com",
  "password": "min8karakter"
}
```

Response `201`:
```json
{
  "success": true,
  "message": "Akun berhasil dibuat",
  "data": {
    "access_token": "eyJ...",
    "user": { "id": "uuid", "full_name": "Budi Santoso", "email": "budi@gmail.com" },
    "business_profile": { "id": "uuid", "business_name": "Warung Berkah" }
  }
}
```

Validasi: `full_name` min 2 char, `business_name` min 2 char, `email` valid format, `password` min 8 char. Saat register, `business_profile` otomatis dibuat (1 user = 1 profil usaha di MVP).

---

#### `POST /api/v1/auth/login`
Login dengan email + password.

Request:
```json
{ "email": "budi@gmail.com", "password": "min8karakter" }
```

Response `200`:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJ...",
    "user": { "id": "uuid", "full_name": "Budi Santoso", "email": "budi@gmail.com" },
    "business_profile": { "id": "uuid", "business_name": "Warung Berkah" }
  }
}
```

---

#### `GET /api/v1/auth/google` — Gap #7
Redirect ke Google OAuth consent screen.

Response: `302 Redirect` ke `https://accounts.google.com/o/oauth2/auth?...`

---

#### `GET /api/v1/auth/google/callback` — Gap #7
Callback dari Google. Backend menukar `code` dengan token Google, upsert user, lalu return JWT.

Response `200`:
```json
{
  "success": true,
  "message": "Login dengan Google berhasil",
  "data": {
    "access_token": "eyJ...",
    "user": { "id": "uuid", "full_name": "Budi Santoso", "email": "budi@gmail.com" },
    "business_profile": { "id": "uuid", "business_name": "Warung Berkah" },
    "is_new_user": true
  }
}
```

Catatan: Jika `is_new_user: true`, frontend redirect ke halaman onboarding isian `business_name`. Jika `false`, langsung ke dashboard.

---

#### `GET /api/v1/auth/me`
Ambil data user yang sedang login.

Response `200`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "full_name": "Budi Santoso", "email": "budi@gmail.com", "auth_provider": "google" },
    "business_profile": { "id": "uuid", "business_name": "Warung Berkah", "currency_code": "IDR" }
  }
}
```

---

#### `POST /api/v1/auth/logout`
Invalidate token (stateless JWT: cukup instruksikan FE untuk hapus token).

Response `200`: `{ "success": true, "message": "Logout berhasil" }`

---

### 3.2 Cash Transactions Module

#### `GET /api/v1/cash-transactions`
Ambil riwayat transaksi kas milik business profile aktif.

Query params:
- `limit` (default: 20)
- `offset` (default: 0)
- `from_date` (YYYY-MM-DD, opsional)
- `to_date` (YYYY-MM-DD, opsional)
- `type` (`income` | `expense`, opsional)

Response `200`:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "transaction_date": "2026-07-13",
        "type": "income",
        "category": "Penjualan",
        "amount": 1677000,
        "created_at": "2026-07-13T08:00:00Z"
      }
    ],
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### `POST /api/v1/cash-transactions`
Tambah transaksi baru.

Request:
```json
{
  "transaction_date": "2026-07-16",
  "type": "expense",
  "category": "Sewa",
  "amount": 677000
}
```

Validasi:
- `transaction_date`: valid date, tidak boleh lebih dari hari ini + 1
- `type`: harus `income` atau `expense`
- `category`: string, min 1 char, max 100 char
- `amount`: number positif, > 0

Response `201`: return objek transaksi yang baru dibuat.

Setelah insert, **trigger recalculate forecast** (lihat section 4.1).

---

#### `GET /api/v1/cash-transactions/:id`
Ambil detail satu transaksi.

Response `200`: return satu objek transaksi.

---

#### `PATCH /api/v1/cash-transactions/:id`
Edit transaksi (inline edit dari UI). Semua field opsional, minimal satu harus ada. — Gap #4

Request:
```json
{
  "transaction_date": "2026-07-16",
  "type": "income",
  "category": "Penjualan",
  "amount": 1800000
}
```

Response `200`: return objek transaksi yang sudah diperbarui.

Setelah update, **trigger recalculate forecast**.

---

#### `DELETE /api/v1/cash-transactions/:id`
Hapus transaksi. Tampilkan konfirmasi di FE sebelum hit endpoint ini.

Response `200`: `{ "success": true, "message": "Transaksi berhasil dihapus" }`

Setelah delete, **trigger recalculate forecast**.

---

### 3.3 Inventory Module

#### `GET /api/v1/inventory-items`
Ambil daftar stok barang.

Response `200`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "item_name": "Ayam Penyet",
        "current_stock": 6,
        "unit": "kg",
        "average_sales_per_day": 3,
        "minimum_threshold": 0,
        "days_remaining": 2,
        "severity": "critical",
        "created_at": "..."
      }
    ],
    "total": 2
  }
}
```

Catatan: `days_remaining` dan `severity` dihitung on-the-fly oleh backend saat return (tidak disimpan di DB), menggunakan formula `current_stock / average_sales_per_day`.

---

#### `POST /api/v1/inventory-items`
Tambah stok baru. — Gap #2 & #8

Request:
```json
{
  "item_name": "Ayam Penyet",
  "unit": "kg",
  "current_stock": 6,
  "average_sales_per_day": 3
}
```

Validasi:
- `item_name`: string, min 1, max 255
- `unit`: enum `kg` | `liter` | `unit` | `pack` — Gap #8
- `current_stock`: number >= 0
- `average_sales_per_day`: number >= 0 — Gap #2

Response `201`: return objek item yang baru dibuat beserta `days_remaining` dan `severity`.

Setelah insert, **trigger recalculate forecast**.

---

#### `PATCH /api/v1/inventory-items/:id`
Edit stok. Semua field opsional.

Request:
```json
{
  "item_name": "Ayam Penyet",
  "unit": "kg",
  "current_stock": 10,
  "average_sales_per_day": 2.5
}
```

Response `200`: return objek yang sudah diperbarui.

Setelah update, **trigger recalculate forecast**.

---

#### `DELETE /api/v1/inventory-items/:id`
Hapus item stok.

Response `200`: `{ "success": true, "message": "Stok berhasil dihapus" }`

Setelah delete, **trigger recalculate forecast**.

---

### 3.4 Forecast Module

#### `GET /api/v1/forecast`
Ambil hasil forecast terbaru untuk business profile aktif.

Response `200` — Gap #5:
```json
{
  "success": true,
  "data": {
    "forecast_id": "uuid",
    "generated_at": "2026-07-18T06:00:00Z",
    "cash_summary": {
      "current_balance": 10500000,
      "change_from_last_week_pct": 12.4,
      "projected_30d": -20000000,
      "deficit_at_day": 6
    },
    "cash_projection": [
      { "day": 0, "label": "H+0", "value": 10500000 },
      { "day": 1, "label": "H+1", "value": 9800000 },
      ...
      { "day": 30, "label": "H+30", "value": -20000000 }
    ],
    "inventory_projection": [
      {
        "item_id": "uuid",
        "item_name": "Ayam Betutu",
        "unit": "kg",
        "current_stock": 2,
        "average_sales_per_day": 1,
        "days_remaining": 2,
        "severity": "critical"
      }
    ],
    "alert_summary": [
      {
        "type": "cash",
        "severity": "warning",
        "message": "Kas Diperkirakan Menipis dalam 2 Minggu",
        "detail": "Proyeksi defisit di H+8. Perlu evaluasi biaya operasional."
      },
      {
        "type": "inventory",
        "severity": "critical",
        "message": "2 Item Stok Kritis. Segera Isi Ulang dalam <3 Hari",
        "detail": "2 item (Ayam Betutu & Tahu) diperkirakan habis dalam kurang dari 3 hari."
      }
    ]
  }
}
```

---

#### `POST /api/v1/forecast/recalculate`
Paksa recalculate forecast. Dipanggil otomatis oleh backend setelah setiap mutasi data (internal trigger), atau bisa dipanggil manual oleh FE jika perlu refresh.

Response `200`: sama dengan response `GET /api/v1/forecast`.

---

#### `GET /api/v1/forecast/history`
Riwayat forecast runs.

Response `200`:
```json
{
  "success": true,
  "data": {
    "history": [
      { "id": "uuid", "generated_at": "2026-07-18T06:00:00Z", "horizon_days": 30 }
    ]
  }
}
```

---

### 3.5 What-If Module

#### `POST /api/v1/what-if/simulate`
Jalankan simulasi dan **langsung simpan ke DB**. — Gap #6

Request:
```json
{
  "expense_increase_pct": 0,
  "income_decrease_pct": 63,
  "avg_income_per_day": 1800000,
  "avg_expense_per_day": 1000000
}
```

Backend akan auto-generate `scenario_name` berdasarkan parameter yang berubah dari baseline. Contoh: `"Pengeluaran naik 0%, Pemasukan turun 63%"`.

Response `200`:
```json
{
  "success": true,
  "data": {
    "scenario_id": "uuid",
    "scenario_name": "Pengeluaran naik 0%, Pemasukan turun 63%",
    "scenario_label": "Skenario stabil",
    "estimated_cash_h30": 20500000,
    "diff_from_baseline": 2300000,
    "cash_projection": [
      { "day": 0, "label": "H+0", "value": 10500000 },
      ...
      { "day": 30, "label": "H+30", "value": 20500000 }
    ]
  }
}
```

---

#### `GET /api/v1/what-if/history`
Riwayat skenario simulasi.

Response `200`:
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "uuid",
        "scenario_name": "Pengeluaran naik 0%, Pemasukan turun 63%",
        "estimated_cash_h30": 20500000,
        "created_at": "2026-07-18T09:00:00Z"
      }
    ]
  }
}
```

---

#### `GET /api/v1/what-if/:id`
Detail satu skenario simulasi.

Response `200`: return full scenario termasuk `parameter_json` dan `result_json`.

---

#### `DELETE /api/v1/what-if/:id`
Hapus skenario simulasi.

Response `200`: `{ "success": true, "message": "Skenario berhasil dihapus" }`

---

### 3.6 Alerts Module

#### `GET /api/v1/alerts`
Ambil semua alert aktif.

Query params: `status` (`active` | `read` | `resolved`, opsional)

Response `200`:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "alert_type": "inventory",
        "severity": "critical",
        "message": "2 Item Stok Kritis. Segera Isi Ulang dalam <3 Hari",
        "detail": "2 item (Ayam Betutu & Tahu) diperkirakan habis dalam kurang dari 3 hari.",
        "status": "active",
        "trigger_value": 2,
        "created_at": "..."
      }
    ],
    "total": 2
  }
}
```

---

#### `GET /api/v1/alerts/:id`
Detail satu alert.

---

#### `PATCH /api/v1/alerts/:id/read`
Tandai alert sebagai sudah dibaca.

Response `200`: return alert yang diperbarui dengan `status: "read"`.

---

#### `PATCH /api/v1/alerts/:id/resolve`
Tandai alert sebagai resolved.

Response `200`: return alert dengan `status: "resolved"`.

---

## 4. Logika Bisnis Inti

### 4.1 Forecast Engine (Linear MVP)

**Cash Projection (H+0 sampai H+30):**

```typescript
function calculateCashProjection(
  currentBalance: number,
  avgIncomePerDay: number,
  avgExpensePerDay: number,
  horizonDays: number = 30
): Array<{ day: number; label: string; value: number }> {
  const netPerDay = avgIncomePerDay - avgExpensePerDay;
  return Array.from({ length: horizonDays + 1 }, (_, day) => ({
    day,
    label: `H+${day}`,
    value: currentBalance + netPerDay * day,
  }));
}
```

`avgIncomePerDay` dan `avgExpensePerDay` dihitung dari **rata-rata 7 hari terakhir** transaksi yang tercatat. Jika data < 7 hari, gunakan semua data yang ada. Jika tidak ada data sama sekali, gunakan `0`.

`currentBalance` dihitung dari **sum semua transaksi income dikurangi expense** hingga hari ini.

**Inventory Projection:**

```typescript
function calculateDaysRemaining(currentStock: number, avgSalesPerDay: number): number {
  if (avgSalesPerDay <= 0) return Infinity; // tidak ada penjualan
  return Math.floor(currentStock / avgSalesPerDay);
}

function getInventorySeverity(daysRemaining: number): 'critical' | 'warning' | 'info' {
  if (daysRemaining <= 3) return 'critical';
  if (daysRemaining <= 7) return 'warning';
  return 'info';
}
```

---

### 4.2 Alert Logic

Alert di-generate **setiap kali forecast direcalculate**. Alert lama yang masih `active` untuk business profile tersebut dihapus dulu, lalu alert baru diinsert.

```typescript
function generateAlerts(forecastResult: ForecastResult): AlertInsert[] {
  const alerts: AlertInsert[] = [];

  // Cash alert
  const deficitDay = forecastResult.cash_projection.find(p => p.value < 0)?.day;
  if (deficitDay !== undefined) {
    if (deficitDay <= 7) {
      alerts.push({
        alert_type: 'cash',
        severity: 'critical',
        message: `Kas diperkirakan defisit dalam ${deficitDay} hari`,
        detail: `Proyeksi defisit di H+${deficitDay}. Perlu evaluasi biaya operasional.`,
        trigger_value: deficitDay,
      });
    } else if (deficitDay <= 14) {
      alerts.push({
        alert_type: 'cash',
        severity: 'warning',
        message: `Kas Diperkirakan Menipis dalam 2 Minggu`,
        detail: `Proyeksi defisit di H+${deficitDay}. Perlu evaluasi biaya operasional.`,
        trigger_value: deficitDay,
      });
    }
  }

  // Inventory alerts
  const criticalItems = forecastResult.inventory_projection.filter(i => i.severity === 'critical');
  const warningItems  = forecastResult.inventory_projection.filter(i => i.severity === 'warning');

  if (criticalItems.length > 0) {
    const names = criticalItems.map(i => i.item_name).join(' & ');
    alerts.push({
      alert_type: 'inventory',
      severity: 'critical',
      message: `${criticalItems.length} Item Stok Kritis. Segera Isi Ulang dalam <3 Hari`,
      detail: `${criticalItems.length} item (${names}) diperkirakan habis dalam kurang dari 3 hari.`,
      trigger_value: criticalItems.length,
    });
  }

  if (warningItems.length > 0) {
    const names = warningItems.map(i => i.item_name).join(' & ');
    alerts.push({
      alert_type: 'inventory',
      severity: 'warning',
      message: `${warningItems.length} Item Stok Perlu Perhatian`,
      detail: `${names} diperkirakan habis dalam 4–7 hari.`,
      trigger_value: warningItems.length,
    });
  }

  return alerts;
}
```

---

### 4.3 What-If Simulation Engine — Gap #6

```typescript
function simulateWhatIf(params: {
  currentBalance: number;
  baselineAvgIncome: number;
  baselineAvgExpense: number;
  expenseIncreasePct: number;   // 0–100
  incomeDecreasePct: number;    // 0–100
  customAvgIncome?: number;
  customAvgExpense?: number;
  horizonDays?: number;
}): WhatIfResult {
  const { currentBalance, horizonDays = 30 } = params;

  const simIncome  = params.customAvgIncome
    ?? params.baselineAvgIncome * (1 - params.incomeDecreasePct / 100);
  const simExpense = params.customAvgExpense
    ?? params.baselineAvgExpense * (1 + params.expenseIncreasePct / 100);

  const projection = calculateCashProjection(currentBalance, simIncome, simExpense, horizonDays);
  const estimatedH30 = projection[horizonDays].value;

  // Baseline untuk perbandingan
  const baselineProjection = calculateCashProjection(
    currentBalance, params.baselineAvgIncome, params.baselineAvgExpense, horizonDays
  );
  const baselineH30 = baselineProjection[horizonDays].value;

  const diffFromBaseline = estimatedH30 - baselineH30;

  // Auto-generate scenario name — Gap #6
  const parts = [];
  if (params.expenseIncreasePct > 0) parts.push(`Pengeluaran naik ${params.expenseIncreasePct}%`);
  else parts.push(`Pengeluaran naik 0%`);
  if (params.incomeDecreasePct > 0) parts.push(`Pemasukan turun ${params.incomeDecreasePct}%`);
  else parts.push(`Pemasukan turun 0%`);
  const scenarioName = parts.join(', ');

  // Scenario label
  const scenarioLabel = diffFromBaseline >= 0 ? 'Skenario stabil' : 'Skenario berisiko';

  return { scenarioName, scenarioLabel, estimatedH30, diffFromBaseline, projection };
}
```

---

### 4.4 Google OAuth Flow — Gap #7

```
1. FE redirect user ke GET /api/v1/auth/google
2. Backend redirect ke Google consent screen dengan scope: openid, email, profile
3. Google redirect ke GET /api/v1/auth/google/callback?code=xxx
4. Backend tukar code dengan access_token Google
5. Backend GET https://www.googleapis.com/oauth2/v2/userinfo
6. Cek apakah user dengan google_id tersebut sudah ada di DB
   - Jika ada: update last_login, return JWT
   - Jika belum ada: insert user baru (password_hash = null, auth_provider = 'google')
     + buat business_profile kosong (business_name default ke nama Google user)
     + set is_new_user = true di response
7. Return JWT access token
```

Environment variables yang diperlukan:
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://api.kasandra.app/api/v1/auth/google/callback
```

---

## 5. Struktur Folder Backend

Mengacu SDD 3.7 dengan tambahan file untuk modul baru.

```
backend-kasandra/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts               # termasuk GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
│   │   ├── database.ts
│   │   └── constants.ts         # unit enum, alert threshold, dll.
│   ├── routes/
│   │   ├── auth.route.ts        # termasuk /google dan /google/callback
│   │   ├── cash.route.ts
│   │   ├── inventory.route.ts
│   │   ├── forecast.route.ts
│   │   ├── whatif.route.ts
│   │   ├── alert.route.ts
│   │   └── export.route.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── cash.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── forecast.controller.ts
│   │   ├── whatif.controller.ts
│   │   └── alert.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── oauth.service.ts     # Google OAuth logic — Gap #7
│   │   ├── cash.service.ts
│   │   ├── inventory.service.ts
│   │   ├── forecast.service.ts  # forecast engine — Gap #5
│   │   ├── alert.service.ts     # alert generation
│   │   └── whatif.service.ts    # simulation engine — Gap #6
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── cash.repository.ts
│   │   ├── inventory.repository.ts
│   │   ├── forecast.repository.ts
│   │   ├── scenario.repository.ts
│   │   └── alert.repository.ts
│   ├── schemas/                 # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── cash.schema.ts       # category field — Gap #1
│   │   ├── inventory.schema.ts  # unit enum — Gap #8
│   │   ├── forecast.schema.ts
│   │   ├── whatif.schema.ts
│   │   └── alert.schema.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts            # semua tabel Drizzle (lihat section 2)
│   │   ├── migrations/
│   │   └── seeds/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── logger.middleware.ts
│   └── utils/
│       ├── response.ts
│       ├── date.ts
│       ├── calculation.ts       # forecast & whatif helpers
│       ├── scenario-name.ts     # auto-generate scenario name — Gap #6
│       └── logger.ts
├── tests/
│   ├── unit/
│   │   ├── calculation.test.ts
│   │   ├── alert.test.ts
│   │   └── whatif.test.ts
│   └── integration/
│       ├── cash.test.ts
│       ├── inventory.test.ts
│       └── forecast.test.ts
├── Dockerfile
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 6. Urutan Implementasi

Implementasi dilakukan berurutan. Setiap tahap harus selesai dan bisa ditest sebelum lanjut ke tahap berikutnya.

### Tahap 1 — Fondasi (Hari 1–2)

- [ ] Setup project: Bun + Hono + Drizzle + PostgreSQL
- [ ] Konfigurasi `env.ts` dengan semua variabel environment
- [ ] Tulis Drizzle schema (`schema.ts`) sesuai section 2 — semua tabel sekaligus
- [ ] Jalankan migration pertama
- [ ] Setup middleware: error handler global, logger, response helper
- [ ] Setup Docker Compose untuk local dev (postgres + backend)

### Tahap 2 — Auth Module (Hari 2–3)

- [ ] `POST /auth/register` — email + password
- [ ] `POST /auth/login`
- [ ] `GET /auth/me`
- [ ] `POST /auth/logout`
- [ ] JWT middleware untuk protect routes
- [ ] `GET /auth/google` + `GET /auth/google/callback` — Gap #7
- [ ] Unit test: validasi schema auth

### Tahap 3 — Cash Transactions Module (Hari 3–4)

- [ ] `GET /cash-transactions` dengan pagination & filter
- [ ] `POST /cash-transactions` dengan validasi (category, type, amount) — Gap #1
- [ ] `GET /cash-transactions/:id`
- [ ] `PATCH /cash-transactions/:id` (semua field termasuk category) — Gap #4
- [ ] `DELETE /cash-transactions/:id`
- [ ] Integration test: CRUD cash

### Tahap 4 — Inventory Module (Hari 4–5)

- [ ] `GET /inventory-items` + hitung `days_remaining` & `severity` on-the-fly
- [ ] `POST /inventory-items` dengan enum unit — Gap #8 & Gap #2
- [ ] `PATCH /inventory-items/:id`
- [ ] `DELETE /inventory-items/:id`
- [ ] Integration test: CRUD inventory

### Tahap 5 — Forecast Engine (Hari 5–6)

- [ ] Tulis `calculateCashProjection()` di `utils/calculation.ts` — Gap #5
- [ ] Tulis `calculateDaysRemaining()` dan `getInventorySeverity()`
- [ ] Tulis `forecastService.recalculate(businessProfileId)` — ambil data, hitung, simpan ke `forecast_runs`
- [ ] `GET /forecast` — return latest forecast run
- [ ] `POST /forecast/recalculate`
- [ ] `GET /forecast/history`
- [ ] Hook recalculate ke setiap mutasi cash & inventory
- [ ] Unit test: semua fungsi kalkulasi
- [ ] Integration test: endpoint forecast

### Tahap 6 — What-If Module (Hari 6–7)

- [ ] Tulis `simulateWhatIf()` di `services/whatif.service.ts` — Gap #6
- [ ] Tulis `generateScenarioName()` di `utils/scenario-name.ts` — Gap #6
- [ ] `POST /what-if/simulate` — jalankan + simpan ke DB
- [ ] `GET /what-if/history`
- [ ] `GET /what-if/:id`
- [ ] `DELETE /what-if/:id`
- [ ] Unit test: simulation engine
- [ ] Unit test: scenario name generation

### Tahap 7 — Alert Module (Hari 7)

- [ ] Tulis `generateAlerts()` di `services/alert.service.ts`
- [ ] Hook alert generation ke setiap `forecast.recalculate()`
- [ ] `GET /alerts` dengan filter status
- [ ] `GET /alerts/:id`
- [ ] `PATCH /alerts/:id/read`
- [ ] `PATCH /alerts/:id/resolve`
- [ ] Unit test: alert logic & threshold
- [ ] Integration test: alert endpoint

### Tahap 8 — Polish & QA (Hari 8)

- [ ] Pastikan semua response mengikuti format standar `{ success, message, data }`
- [ ] Rate limiting di endpoint auth
- [ ] Cek semua query memfilter berdasarkan `business_profile_id` (keamanan data)
- [ ] Swagger/OpenAPI docs generate otomatis dari Hono
- [ ] E2E test: alur lengkap input data → forecast → what-if → alert

---

## 7. Checklist per Modul

Gunakan tabel ini sebagai tracking progress implementasi.

### Auth
| Item | Status |
|---|---|
| Register email+password | ⬜ |
| Login email+password | ⬜ |
| GET /auth/me | ⬜ |
| Logout | ⬜ |
| Google OAuth redirect | ⬜ |
| Google OAuth callback + upsert user | ⬜ |
| JWT middleware | ⬜ |
| Unit test schema | ⬜ |

### Cash Transactions
| Item | Status |
|---|---|
| GET list dengan pagination | ⬜ |
| POST dengan field category | ⬜ |
| GET by id | ⬜ |
| PATCH semua field (incl. category) | ⬜ |
| DELETE | ⬜ |
| Trigger forecast recalculate | ⬜ |
| Integration test | ⬜ |

### Inventory
| Item | Status |
|---|---|
| GET list + days_remaining + severity | ⬜ |
| POST dengan unit enum & avg_sales_per_day | ⬜ |
| PATCH | ⬜ |
| DELETE | ⬜ |
| Trigger forecast recalculate | ⬜ |
| Integration test | ⬜ |

### Forecast
| Item | Status |
|---|---|
| calculateCashProjection() — array H+0..H+30 | ⬜ |
| calculateDaysRemaining() + getInventorySeverity() | ⬜ |
| forecastService.recalculate() | ⬜ |
| GET /forecast — latest result | ⬜ |
| POST /forecast/recalculate | ⬜ |
| GET /forecast/history | ⬜ |
| Unit test kalkulasi | ⬜ |
| Integration test endpoint | ⬜ |

### What-If
| Item | Status |
|---|---|
| simulateWhatIf() | ⬜ |
| generateScenarioName() auto | ⬜ |
| POST /what-if/simulate + simpan ke DB | ⬜ |
| GET /what-if/history | ⬜ |
| GET /what-if/:id | ⬜ |
| DELETE /what-if/:id | ⬜ |
| Unit test simulation | ⬜ |

### Alerts
| Item | Status |
|---|---|
| generateAlerts() dari hasil forecast | ⬜ |
| Hook ke forecast recalculate | ⬜ |
| GET /alerts + filter status | ⬜ |
| GET /alerts/:id | ⬜ |
| PATCH /alerts/:id/read | ⬜ |
| PATCH /alerts/:id/resolve | ⬜ |
| Unit test alert logic | ⬜ |
| Integration test endpoint | ⬜ |

---

*Dokumen ini adalah satu-satunya sumber kebenaran untuk implementasi backend KasandraApp MVP 50%. Setiap perubahan keputusan arsitektur atau kontrak API harus diperbarui di sini terlebih dahulu sebelum diimplementasikan.*