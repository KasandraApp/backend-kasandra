# BACKEND TASK BREAKDOWN — KasandraApp

**Repository:** backend-kasandra<br>
**Stack:** TypeScript · Hono · Bun · Zod · Drizzle ORM · PostgreSQL · Redis · Docker · Kubernetes<br>
**Sumber:** PRD.md, SDD.md, SRS.md (v1.0)<br>
**Metodologi:** Agile Scrum — dipecah per Epic, mengikuti arsitektur 6 layer (Route → Controller → Service → Repository → Schema/Validation → Utility)

Legenda Prioritas: **P1** = Prioritas Tinggi (wajib MVP) · **P2** = Prioritas Menengah (opsional bila waktu cukup) · **P3** = Prioritas Rendah / Roadmap

---

## EPIC 0 — Project Setup & Infrastructure (P1)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-001 | Inisialisasi project Bun + Hono + TypeScript | Setup `package.json`, `tsconfig.json`, entry `server.ts` & `app.ts` | ✅ |
| BE-002 | Setup struktur folder backend | Buat folder `routes/`, `controllers/`, `services/`, `repositories/`, `schemas/`, `db/`, `middleware/`, `utils/`, `types/`, `tests/` sesuai SDD 3.7 | ✅ |
| BE-003 | Konfigurasi environment | `config/env.ts`, `config/constants.ts`, `.env.example` | ✅ |
| BE-004 | Setup koneksi database | `config/database.ts`, integrasi Drizzle ORM ke PostgreSQL | ✅ |
| BE-005 | Setup Drizzle config & migration tooling | `drizzle.config.ts`, folder `db/migrations/`, `db/seeds/` | ✅ |
| BE-006 | Setup middleware dasar | `error.middleware.ts`, `logger.middleware.ts`, `rate-limit.middleware.ts` | ✅ |
| BE-007 | Setup format response & error standar | `utils/response.ts` mengikuti kontrak sukses/error (SDD 5.2–5.3) | ✅ |
| BE-008 | Setup OpenAPI/Swagger | Dokumentasi API otomatis untuk seluruh endpoint | ✅ |
| BE-009 | Setup Dockerfile backend | Multi-stage build untuk image produksi | ✅ |
| BE-010 | Setup Docker Compose (local dev) | Backend + Postgres container, opsional Redis | ✅ |
| BE-011 | Setup CI/CD dasar (GitHub Actions) | Lint, test, build image | ⏳ |
| BE-012 | Setup logging terstruktur | `utils/logger.ts` — log request, response status, error, forecast generation, alert generation (SDD 7.5) | ⏳ |

---

## EPIC 1 — Database Schema Design (P1)

Sesuai SDD Bab IV & SRS Bab VII. Semua penamaan tabel/kolom `snake_case`.

| ID | Task | Tabel / Detail |
| :---- | :---- | :---- |
| BE-101 | Desain & migrasi tabel `users` | id, full_name, email, password_hash, created_at, updated_at | ✅ |
| BE-102 | Desain & migrasi tabel `business_profiles` | id, user_id (FK), business_name, business_type, currency_code, timestamps | ✅ |
| BE-103 | Desain & migrasi tabel `cash_transactions` | id, business_profile_id (FK), transaction_date, type (income/expense), amount, description, timestamps | ✅ |
| BE-104 | Desain & migrasi tabel `inventory_items` | id, business_profile_id (FK), item_name, current_stock, average_sales_per_day, unit, minimum_threshold, timestamps | ✅ |
| BE-105 | Desain & migrasi tabel `inventory_movements` | id, inventory_item_id (FK), movement_date, movement_type (in/out/adjustment), quantity, note, timestamps | ✅ |
| BE-106 | Desain & migrasi tabel `forecast_runs` | id, business_profile_id (FK), forecast_type (cash/inventory), source_snapshot_json, result_json, horizon_days, generated_at | ✅ |
| BE-107 | Desain & migrasi tabel `what_if_scenarios` | id, business_profile_id (FK), scenario_name, parameter_json, result_json, timestamps | ✅ |
| BE-108 | Desain & migrasi tabel `alerts` | id, business_profile_id (FK), alert_type (cash/inventory), severity (info/warning/critical), message, status (active/read/resolved), trigger_value, timestamps | ✅ |
| BE-109 | Desain & migrasi tabel `export_logs` | id, business_profile_id (FK), export_type (pdf/excel), file_path, created_at | ✅ |
| BE-110 | Buat index yang direkomendasikan | `cash_transactions(business_profile_id, transaction_date)`, `inventory_items(business_profile_id, item_name)`, `inventory_movements(inventory_item_id, movement_date)`, `forecast_runs(business_profile_id, generated_at)`, `alerts(business_profile_id, status, severity)` | ✅ |
| BE-111 | Setup relasi antar tabel (FK constraints) | users → business_profiles → (cash_transactions, inventory_items, forecast_runs, what_if_scenarios, alerts, export_logs); inventory_items → inventory_movements | ✅ |
| BE-112 | Seed data dummy untuk development | Data contoh untuk testing lokal | ✅ |

---

## EPIC 2 — Auth & User Management (P2, opsional — SRS FR-21, FR-22)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-201 | Schema validasi auth (Zod) | `auth.schema.ts` — register, login payload |
| BE-202 | Repository user | `user.repository.ts` — CRUD dasar users |
| BE-203 | Service auth | `auth.service.ts` — hash password, generate JWT access & refresh token |
| BE-204 | Controller & route `POST /api/v1/auth/register` | Registrasi user baru |
| BE-205 | Controller & route `POST /api/v1/auth/login` | Login, terbitkan token |
| BE-206 | Controller & route `POST /api/v1/auth/logout` | Invalidasi sesi/token |
| BE-207 | Controller & route `GET /api/v1/auth/me` | Ambil profil user yang sedang login |
| BE-208 | Middleware autentikasi | `auth.middleware.ts` — verifikasi JWT, inject user context |
| BE-209 | Middleware otorisasi berbasis business_profile_id | Pastikan user hanya akses data profil usahanya sendiri (SDD 7.2) |
| BE-210 | Dukungan multi-profil usaha | Endpoint & logic untuk lebih dari satu business_profile per user (FR-22) |

---

## EPIC 3 — Business Profile Module (P1, prasyarat modul lain)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-301 | Schema validasi business profile | Nama usaha, tipe usaha, currency_code |
| BE-302 | Repository business profile | Query CRUD ke tabel `business_profiles` |
| BE-303 | Service business profile | Logic pembuatan & pengelolaan profil usaha |
| BE-304 | Endpoint CRUD business profile | `GET/POST/PATCH/DELETE /api/v1/business-profiles` |

---

## EPIC 4 — Cash Transaction Module (P1 — FR-01, FR-03, FR-04)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-401 | Schema validasi (Zod) `cash.schema.ts` | Validasi transaction_date, type (income/expense), amount (angka positif), description; tolak input kosong/format tidak valid |
| BE-402 | Repository `cash.repository.ts` | Query CRUD + filter by business_profile_id & tanggal |
| BE-403 | Service `cash.service.ts` | Business logic pencatatan pemasukan/pengeluaran, trigger recalculation forecast setelah perubahan data (FR-07) |
| BE-404 | Route & controller `GET /api/v1/cash-transactions` | List transaksi (dengan filter/pagination) |
| BE-405 | Route & controller `POST /api/v1/cash-transactions` | Tambah transaksi baru |
| BE-406 | Route & controller `GET /api/v1/cash-transactions/:id` | Detail transaksi |
| BE-407 | Route & controller `PATCH /api/v1/cash-transactions/:id` | Update transaksi |
| BE-408 | Route & controller `DELETE /api/v1/cash-transactions/:id` | Hapus transaksi |
| BE-409 | Unit test kalkulasi & validasi cash | Uji validasi input dan agregasi saldo |

---

## EPIC 5 — Inventory Module (P1 — FR-02, FR-03, FR-04)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-501 | Schema validasi (Zod) `inventory.schema.ts` | item_name, current_stock, average_sales_per_day, unit, minimum_threshold |
| BE-502 | Repository `inventory.repository.ts` | CRUD `inventory_items` |
| BE-503 | Service `inventory.service.ts` | Logic update stok, hitung ulang proyeksi saat data berubah |
| BE-504 | Route & controller CRUD `inventory-items` | `GET/POST/GET :id/PATCH :id/DELETE :id` |
| BE-505 | Schema validasi `inventory-movements` | movement_type (in/out/adjustment), quantity, note |
| BE-506 | Repository pergerakan stok | Query ke tabel `inventory_movements`, update `current_stock` terkait |
| BE-507 | Route & controller CRUD `inventory-movements` | `GET/POST/PATCH :id/DELETE :id` |
| BE-508 | Unit test kalkulasi stok | Uji perubahan current_stock berdasarkan movement |

---

## EPIC 6 — Forecast Engine (P1 — FR-05, FR-06, FR-07)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-601 | Utility kalkulasi forecast | `utils/calculation.ts` — rumus linier: `kas = saldo sekarang + akumulasi income - expense proyeksi`; `stok = current_stock - (average_sales_per_day × hari)` |
| BE-602 | Utility helper tanggal | `utils/date.ts` — perhitungan horizon 30 hari |
| BE-603 | Service `forecast.service.ts` | Orkestrasi ambil data historis → hitung proyeksi kas & stok → simpan snapshot |
| BE-604 | Repository `forecast.repository.ts` | Simpan & ambil `forecast_runs` (source_snapshot_json, result_json) |
| BE-605 | Route & controller `GET /api/v1/forecast` | Ambil hasil forecast terbaru |
| BE-606 | Route & controller `POST /api/v1/forecast/recalculate` | Trigger perhitungan ulang manual |
| BE-607 | Route & controller `GET /api/v1/forecast/history` | Riwayat forecast per business_profile |
| BE-608 | Auto-recalculate hook | Panggil forecast service otomatis setiap kali cash/inventory data berubah (FR-07) |
| BE-609 | Unit test forecast engine | Uji akurasi kalkulasi linier kas & stok (target presisi tinggi — SRS 4.1) |
| BE-610 | Optimasi performa endpoint forecast | Pastikan response mendukung update grafik < 1 detik |

---

## EPIC 7 — What-If Simulation Engine (P1 — FR-11 s.d. FR-14)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-701 | Schema validasi (Zod) `whatif.schema.ts` | scenario_name, parameters (mis. expense_increase_percentage, perubahan penjualan harian, perubahan stok awal, perubahan biaya operasional) |
| BE-702 | Service `whatif.service.ts` | Terapkan parameter ke basis forecast linier, hasilkan proyeksi baru tanpa mengubah data asli |
| BE-703 | Repository `scenario.repository.ts` | Simpan & ambil `what_if_scenarios` (parameter_json, result_json) |
| BE-704 | Route & controller `POST /api/v1/what-if/simulate` | Jalankan simulasi, kembalikan hasil real-time |
| BE-705 | Route & controller `GET /api/v1/what-if/history` | Riwayat skenario simulasi |
| BE-706 | Route & controller `GET /api/v1/what-if/:id` | Detail satu skenario |
| BE-707 | Route & controller `DELETE /api/v1/what-if/:id` | Hapus skenario |
| BE-708 | Logic reset simulasi | Endpoint/response mendukung kembali ke kondisi baseline (FR-14) |
| BE-709 | Unit test what-if engine | Uji hasil simulasi terhadap berbagai kombinasi parameter |

---

## EPIC 8 — Alert Engine (P1 — FR-15 s.d. FR-18)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-801 | Utility threshold alert | Logic: stok < 3 hari → critical; kas < 0 dalam 7 hari → critical; mendekati threshold → warning; aman → info |
| BE-802 | Service `alert.service.ts` | Bandingkan hasil forecast dengan threshold, generate alert (tipe, severity, pesan, trigger_value, timestamp, status) |
| BE-803 | Generator pesan rekomendasi | Teks rekomendasi singkat sesuai kondisi alert (FR-18) |
| BE-804 | Repository `alert.repository.ts` | CRUD tabel `alerts` |
| BE-805 | Route & controller `GET /api/v1/alerts` | List alert aktif per business profile |
| BE-806 | Route & controller `GET /api/v1/alerts/:id` | Detail alert |
| BE-807 | Route & controller `PATCH /api/v1/alerts/:id/read` | Tandai alert sudah dibaca |
| BE-808 | Route & controller `PATCH /api/v1/alerts/:id/resolve` | Tandai alert selesai/resolved |
| BE-809 | Integrasi alert engine ke forecast pipeline | Alert otomatis ter-generate setiap forecast baru dihitung |
| BE-810 | Unit test alert threshold | Pastikan tidak ada notifikasi palsu berlebihan (kriteria sukses Epic 4 PRD) |

---

## EPIC 9 — Export Module (P2, opsional — FR-19, FR-20)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-901 | Service `export.service.ts` | Generate file PDF/Excel dari hasil forecast/simulasi |
| BE-902 | Repository `export_logs` | Simpan riwayat export (export_type, file_path) |
| BE-903 | Route & controller `POST /api/v1/exports/pdf` | Export ke PDF |
| BE-904 | Route & controller `POST /api/v1/exports/excel` | Export ke Excel |
| BE-905 | Route & controller `GET /api/v1/exports/history` | Riwayat export |
| BE-906 | (Roadmap) Pindahkan proses export ke worker async | Persiapan integrasi RabbitMQ agar export tidak blocking request (SDD 5.8) |

---

## EPIC 10 — Security, Middleware & Error Handling (P1)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-1001 | Global error handling middleware | Format error standar & seragam untuk semua jenis error (validasi, not found, unauthorized, forbidden, conflict, internal server error) |
| BE-1002 | Rate limiting | Middleware pembatas request |
| BE-1003 | Secret management | Pastikan seluruh secret (DB password, JWT secret) diakses lewat env var, tidak hardcode |
| BE-1004 | Validasi payload menyeluruh (Zod) | Terapkan di semua route sebelum masuk controller |
| BE-1005 | Otorisasi berbasis business_profile_id di semua query | Cegah akses lintas data antar user |

---

## EPIC 11 — Testing (P1 — SRS Bab IX)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-1101 | Unit test validasi input | Semua schema Zod |
| BE-1102 | Unit test kalkulasi forecast linier | Cash & inventory projection |
| BE-1103 | Unit test threshold alert | Semua kondisi severity |
| BE-1104 | Unit test helper/utility | date.ts, calculation.ts, response.ts |
| BE-1105 | Integration test endpoint CRUD | Cash, inventory, business profile |
| BE-1106 | Integration test endpoint forecast | End-to-end request → database persistence → response format |
| BE-1107 | Integration test database persistence | Migrasi & query terhadap PostgreSQL test instance |
| BE-1108 | E2E test alur utama | input data → generate forecast → geser what-if → cek alert → export hasil |
| BE-1109 | Performance test | Latency endpoint, jumlah request saat dashboard dibuka, kecepatan update grafik (< 1 detik) |

---

## EPIC 12 — Deployment & DevOps (P1)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-1201 | Dockerfile backend produksi | Image ringan, multi-stage |
| BE-1202 | Manifest Kubernetes: Deployment | Untuk backend-kasandra |
| BE-1203 | Manifest Kubernetes: Service | Internal networking |
| BE-1204 | Manifest Kubernetes: ConfigMap | Konfigurasi non-rahasia |
| BE-1205 | Manifest Kubernetes: Secret | Kredensial (DB password, JWT secret, dsb.) |
| BE-1206 | Manifest Kubernetes: HPA | Autoscaling backend |
| BE-1207 | Setup PostgreSQL di Kubernetes | StatefulSet/Deployment + PVC + Secret |
| BE-1208 | Setup namespace | kasandra-dev, kasandra-staging, kasandra-prod |
| BE-1209 | Resource allocation | Backend: 0.5–1 CPU, 512Mi–1Gi RAM |
| BE-1210 | Setup metrics endpoint | Persiapan Prometheus/Grafana di fase produksi |
| BE-1211 | CI/CD pipeline lengkap | Build, test, push image, deploy otomatis via GitHub Actions |

---

## EPIC 13 — Dokumentasi & API Contract (P1)

| ID | Task | Detail |
| :---- | :---- | :---- |
| BE-1301 | Dokumentasi OpenAPI/Swagger lengkap | Seluruh endpoint v1 (auth, cash, inventory, forecast, what-if, alerts, export) |
| BE-1302 | Dokumentasi kontrak request/response | Contoh payload sesuai SDD 5.5 (create cash transaction, simulate what-if, forecast response) |
| BE-1303 | README backend | Setup lokal, environment variable, cara migrasi & seeding |
| BE-1304 | Sinkronisasi tipe data ke frontend | Shared contract/type agar frontend-backend konsisten |

---

## Roadmap / Non-MVP (P3 — di luar scope MVP saat ini)

- Integrasi RabbitMQ untuk proses async (email alert, export PDF, batch forecasting)
- Endpoint ML Service (`POST /predict/cash`, `POST /predict/inventory`, `POST /detect/anomaly`, `GET /health`)
- Integrasi POS dan rekening bank
- Anomaly detection & simulasi multi-variabel
- Push notification & automated purchase order
- Rekomendasi supplier otomatis

---

## Ringkasan Prioritas Eksekusi

| Prioritas | Epic Terkait |
| :---- | :---- |
| **P1 (Wajib MVP)** | Epic 0, 1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13 |
| **P2 (Opsional bila waktu cukup)** | Epic 2 (Auth), Epic 9 (Export) |
| **P3 (Roadmap)** | RabbitMQ, ML Service, integrasi POS/bank, push notification, automasi PO |