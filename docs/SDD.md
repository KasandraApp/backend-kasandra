**SOFTWARE DESIGN DOCUMENT (SDD)**   
**KasandraApp**

| Versi | 1.0 |
| :---- | :---- |
| **Status** | Draft Desain Sistem |
| **Repository Terpisah** | frontend-kasandra, backend-kasandra, ml-kasandra |
| **Target Platform** | Web Platform untuk Proyeksi Kas dan Stok UMKM |
| **Arsitektur Deployment** | Docker \+ Kubernetes |

**DAFTAR ISI**

1. [BAB I](#bab-i)
   1. [PENDAHULUAN](#pendahuluan)
      1. [Tujuan Dokumen](#1.1-tujuan-dokumen)
      2. [Ringkasan Produk dan Arah Desain](#1.2-ringkasan-produk-dan-arah-desain)
2. [BAB II](#bab-ii)
   1. [PRINSIP DESAIN & ARSITEKTUR SISTEM](#prinsip-desain-&-arsitektur-sistem)
      1. [Prinsip Utama](#2.1-prinsip-utama)
      2. [Implikasi Desain](#2.2-implikasi-desain)
      3. [Arsitektur Tingkat Tinggi](#2.3-arsitektur-tingkat-tinggi)
      4. [Arsitektur Logis](#2.4-arsitektur-logis)
      5. [Keputusan RabbitMQ](#2.5-keputusan-rabbitmq)
3. [BAB III](#bab-iii)
   1. [DESAIN DEPLOYMENT & BACKEND](#desain-deployment-&-backend)
      1. [Local Development](#3.1-local-development)
      2. [Staging / Production](#3.2-staging-/-production)
      3. [Rekomendasi Cluster Layout](#3.3-rekomendasi-cluster-layout)
      4. [Resource Allocation Awal](#3.4-resource-allocation-awal)
      5. [Framework Utama Backend](#3.5-framework-utama-backend)
      6. [Arsitektur Internal Backend](#3.6-arsitektur-internal-backend)
      7. [Struktur Folder Backend](#3.7-struktur-folder-backend)
4. [BAB IV](#bab-iv)
   1. [DESAIN DATABASE, FORECAST, DAN ALERT ENGINE](#desain-database,-forecast,-dan-alert-engine)
      1. [Database Utama](#4.1-database-utama)
      2. [Konvensi Nama](#4.2-konvensi-nama)
      3. [Entitas Inti](#4.3-entitas-inti)
         1. [users (Menyimpan Akun Pengguna)](#4.3.1-users-\(menyimpan-akun-pengguna\))
         2. [business_profiles (Menyimpan Profil Usaha Milik User)](#4.3.2-business_profiles-\(menyimpan-profil-usaha-milik-user\))
         3. [cash_transactions (Menyimpan Transaksi Kas Harian)](#4.3.3-cash_transactions-\(menyimpan-transaksi-kas-harian\))
         4. [inventory_items (Menyimpan Data Barang)](#4.3.4-inventory_items-\(menyimpan-data-barang\))
         5. [inventory_movements (Menyimpan Pergerakan Stok)](#4.3.5-inventory_movements-\(menyimpan-pergerakan-stok\))
         6. [forecast_runs (Menyimpan Hasil Forecast)](#4.3.6-forecast_runs-\(menyimpan-hasil-forecast\))
         7. [what_if_scenarios (Menyimpan Skenario Simulasi)](#4.3.7-what_if_scenarios-\(menyimpan-skenario-simulasi\))
         8. [alerts (Menyimpan Alert Yang Dihasilkan Sistem)](#4.3.8-alerts-\(menyimpan-alert-yang-dihasilkan-sistem\))
         9. [export_logs (Menyimpan Riwayat Export)](#4.3.9-export_logs-\(menyimpan-riwayat-export\))
      4. [Relasi Antar Tabel](#4.4-relasi-antar-tabel)
      5. [Indeks yang Direkomendasikan](#4.5-indeks-yang-direkomendasikan)
      6. [Catatan Desain Database](#4.6-catatan-desain-database)
      7. [Forecast Engine MVP](#4.7-forecast-engine-mvp)
      8. [Parameter What-If](#4.8-parameter-what-if)
      9. [Alert Logic](#4.9-alert-logic)
      10. [Output Alert](#4.10-output-alert)
5. [BAB V](#bab-v)
   1. [DESAIN API & DESAIN KOMUNIKASI INTERNAL](#desain-api-&-desain-komunikasi-internal)
      1. [Prinsip API](#5.1-prinsip-api)
      2. [Format Response Standar](#5.2-format-response-standar)
      3. [Format Error Standar](#5.3-format-error-standar)
      4. [Endpoint Inti](#5.4-endpoint-inti)
      5. [Kontrak Data Contoh](#5.5-kontrak-data-contoh)
      6. [Backend ke Database](#5.6-backend-ke-database)
      7. [Backend ke ML Service](#5.7-backend-ke-ml-service)
      8. [Backend ke Worker Async](#5.8-backend-ke-worker-async)
6. [BAB VI](#bab-vi)
   1. [DESAIN FRONTEND-BACKEND CONTRACT & ERROR HANDLING](#desain-frontend-backend-contract-&-error-handling)
      1. [Strategi Kontrak](#6.1-strategi-kontrak)
      2. [Data Sinkronisasi](#6.2-data-sinkronisasi)
      3. [Jenis Error](#6.3-jenis-error)
      4. [Strategi Handling](#6.4-strategi-handling)
7. [BAB VII](#bab-vii)
   1. [DESAIN SECURITY, OBSERVABILITY, DAN TESTING](#desain-security,-observability,-dan-testing)
      1. [Autentikasi](#7.1-autentikasi)
      2. [Otorisasi](#7.2-otorisasi)
      3. [Secret Management](#7.3-secret-management)
      4. [Network Security](#7.4-network-security)
      5. [Logging](#7.5-logging)
      6. [Monitoring](#7.6-monitoring)
      7. [Tracing](#7.7-tracing)
      8. [Unit Test](#7.8-unit-test)
      9. [Integration Test](#7.9-integration-test)
      10. [E2E Test](#7.10-e2e-test)
      11. [Performance Test](#7.11-performance-test)
8. [BAB VIII](#bab-viii)
   1. [DESAIN FOLDER REPO KESELURUHAN, KUBERNETES MANIFEST, EVOLUSI KE FASE LANJUTAN, DAN KEPUTUSAN ARSITEKTUR FINAL](#desain-folder-repo-keseluruhan,-kubernetes-manifest,-evolusi-ke-fase-lanjutan,-dan-keputusan-arsitektur-final)
      1. [Desain Folder Repository Secara Keseluruhan](#8.1-desain-folder-repository-secara-keseluruhan)
      2. [Frontend (Kubernetes)](#8.2-frontend-\(kubernetes\))
      3. [Backend (Kubernetes)](#8.3-backend-\(kubernetes\))
      4. [ML Service (Kubernetes)](#8.4-ml-service-\(kubernetes\))
      5. [PostgreSQL (Kubernetes)](#8.5-postgresql-\(kubernetes\))
      6. [Saran Namespace (Kubernetes)](#8.6-saran-namespace-\(kubernetes\))
      7. [Tahap Lanjutan 1 : MVP](#8.7-tahap-lanjutan-1-:-mvp)
      8. [Tahap Lanjutan 2 : Automation Layer](#8.8-tahap-lanjutan-2-:-automation-layer)
      9. [Tahap Lanjutan 3 : Predictive Platform](#8.9-tahap-lanjutan-3-:-predictive-platform)
      10. [Keputusan Arsitektur Final](#8.10-keputusan-arsitektur-final)
9. [BAB IX](#bab-ix)
   1. [KESIMPULAN](#kesimpulan)

<a id="bab-i"></a>
# BAB I

<a id="pendahuluan"></a>
## PENDAHULUAN

<a id="1.1-tujuan-dokumen"></a>
### 1.1 Tujuan Dokumen

Dokumen ini menjelaskan desain teknis KasandraApp secara *end-to-end*, mencakup arsitektur sistem, desain *database*, rancangan API, struktur *backend*, alur data, strategi *deployment*, serta pertimbangan teknis utama. Desain ini disusun mengikuti scope MVP KasandraApp yang berfokus pada input data, *dashboard* visualisasi, simulasi *what-if*, dan *alert*, sementara *roadmap* penuh tetap membuka ruang untuk integrasi POS, bank, ML, serta otomasi notifikasi.

<a id="1.2-ringkasan-produk-dan-arah-desain"></a>
### 1.2 Ringkasan Produk dan Arah Desain

KasandraApp dirancang sebagai *platform digital twin* keuangan dan stok UMKM. Sistem ini memproyeksikan kondisi kas dan inventaris secara proaktif agar pengguna bisa mengambil keputusan sebelum krisis terjadi. Berdasarkan dokumen fitur dan proposal yang ada, pembeda utamanya ada pada kombinasi proyeksi 30 hari, simulasi *what-if* interaktif, dan sistem *alert* yang memberi sinyal dini saat stok atau kas memasuki kondisi kritis.  
Desain sistem yang paling sesuai untuk tahap ini adalah:

* frontend terpisah,  
* backend API terpisah,  
* ML service terpisah untuk fase lanjutan,  
* *database* relasional utama,  
* *containerized deployment*,  
* orkestrasi Kubernetes.

Untuk MVP, backend sebaiknya tetap sederhana dan deterministik, artinya proyeksi dihitung dengan logika linier di backend utama. ML service disiapkan sebagai jalur pertumbuhan, bukan komponen wajib pada tahap awal.

<a id="bab-ii"></a>
# BAB II

<a id="prinsip-desain-&-arsitektur-sistem"></a>
## PRINSIP DESAIN & ARSITEKTUR SISTEM

<a id="2.1-prinsip-utama"></a>
### 2.1 Prinsip Utama

1. **Separation of Concerns**  
   Frontend, backend, dan ML dipisahkan secara jelas.  
2. **MVP First**  
   Struktur sistem harus cukup kuat untuk roadmap penuh, tetapi implementasi awal tetap ringan dan cepat selesai.  
3. **Type Safety**  
   Backend TypeScript \+ Hono dipadukan dengan skema validasi yang ketat agar kontrak data stabil.  
4. **Deterministic Core**  
   *Forecast* MVP dihitung dengan rumus linier yang dapat dijelaskan, diuji, dan diaudit.  
5. **Kubernetes-Ready**  
   Semua *service* harus siap dijalankan sebagai *container* dan di*deploy* dalam cluster.  
6. **Incremental Evolution**  
   Fase lanjutan dapat menambahkan RabbitMQ, *worker*, *cache*, dan ML tanpa memecah fondasi utama.  
   

<a id="2.2-implikasi-desain"></a>
### 2.2 Implikasi Desain

Prinsip di atas membuat KasandraApp cocok dibuat sebagai *service-oriented architecture* ringan:

* Backend Hono menangani *request* utama.  
* *Database* menyimpan data sistem.  
* Frontend hanya fokus tampilan.  
* ML service Python dipanggil saat diperlukan di fase lanjut.


<a id="2.3-arsitektur-tingkat-tinggi"></a>
### 2.3 Arsitektur Tingkat Tinggi

1. **Frontend App**  
* React \+ TypeScript  
* *Dashboard, input form, what-if slider, alert panel*  
2. **Backend API**  
* TypeScript \+ Hono  
* Validasi input, *business logic, forecast linier, CRUD, alert engine, export handler*  
3. **Database**  
* PostgreSQL  
* Menyimpan data *user*, profil usaha, transaksi, stok, *forecast*, simulasi, *alert*  
4. **ML Service**  
* Python \+ FastAPI  
* Disiapkan untuk *forecasting* lanjutan, *anomaly detection, time-series*  
5. **Container Runtime**  
* Docker  
6. **Orchestrator**  
* Kubernetes


<a id="2.4-arsitektur-logis"></a>
### 2.4 Arsitektur Logis

\[Gambar Arsitektur\]  
Untuk MVP, jalur utama hanya frontend → backend → database.  
ML service dan *queue broker* belum wajib berada di *critical path*. Fitur *alert* visual yang menjadi bagian inti MVP cukup dihitung langsung di *backend*. Hal ini sejalan dengan *scope* yang menekankan logika linier, bukan ML asli, pada fase awal.

<a id="2.5-keputusan-rabbitmq"></a>
### 2.5 Keputusan RabbitMQ

RabbitMQ tidak masuk *critical path* MVP. RabbitMQ baru relevan saat ada kebutuhan proses asinkron seperti:

* email *alert*,  
* *export* PDF,  
* *batch forecasting*,  
* sinkronisasi POS,  
* sinkronisasi bank,  
* job ML berat.

Desain SDD ini memosisikan RabbitMQ sebagai komponen fase lanjut, bukan komponen wajib awal.

<a id="bab-iii"></a>
# BAB III

<a id="desain-deployment-&-backend"></a>
## DESAIN DEPLOYMENT & BACKEND

<a id="3.1-local-development"></a>
### 3.1 Local Development

* Docker Compose  
* Postgres container  
* Backend container  
* Frontend container  
* Opsional ML container

<a id="3.2-staging-/-production"></a>
### 3.2 Staging / Production

Gunakan Kubernetes: 

* Deployment untuk frontend, backend, dan ML  
* Service untuk internal networking  
* Ingress untuk akses publik  
* ConfigMap untuk konfigurasi non-rahasia  
* Secret untuk kredensial  
* StatefulSet atau Deployment \+ PVC untuk PostgreSQL  
* HPA untuk service yang perlu autoscaling

<a id="3.3-rekomendasi-cluster-layout"></a>
### 3.3 Rekomendasi Cluster Layout

\[Gambar\]

<a id="3.4-resource-allocation-awal"></a>
### 3.4 Resource Allocation Awal

* Frontend: 0.25–0.5 CPU, 256–512 Mi RAM  
* Backend: 0.5–1 CPU, 512 Mi–1 Gi RAM  
* ML service: 0.5–1 CPU, 512 Mi–1 Gi RAM  
* PostgreSQL: 1 CPU, 1–2 Gi RAM, persistent volume


<a id="3.5-framework-utama-backend"></a>
### 3.5 Framework Utama Backend

* TypeScript: menjaga stabilitas kontrak data.  
* Hono: ringan dan cepat.  
* Zod: membuat validasi request jelas.  
* Drizzle ORM: memberi kontrol schema yang baik.  
* OpenAPI/Swagger untuk dokumentasi API

<a id="3.6-arsitektur-internal-backend"></a>
### 3.6 Arsitektur Internal Backend

Backend dibagi menjadi 6 layer:

* Route Layer  
  Menerima HTTP request dan meneruskan ke handler.  
* Controller / Handler Layer  
  Mengambil data request, memanggil service, membentuk response.  
* Service Layer  
  Berisi business logic utama seperti forecast, alert, dan simulasi.  
* Repository Layer  
  Mengakses database melalui ORM.  
* Schema / Validation Layer  
  Validasi payload dengan Zod.  
* Utility Layer  
  Helper untuk tanggal, hitung proyeksi, format response, error mapping.

<a id="3.7-struktur-folder-backend"></a>
### 3.7 Struktur Folder Backend

backend-kasandra/   
├── src/   
│├── app.ts   
│├── server.ts   
│├── config/   
││ ├── env.ts   
││ ├── database.ts   
││ └── constants.ts   
│├── routes/   
││ ├── auth.route.ts   
││ ├── cash.route.ts   
││ ├── inventory.route.ts   
││ ├── forecast.route.ts   
││ ├── whatif.route.ts   
││ ├── alert.route.ts   
││ └── export.route.ts   
│├── controllers/   
││ ├── auth.controller.ts   
││ ├── cash.controller.ts   
││ ├── inventory.controller.ts   
││ ├── forecast.controller.ts   
││ ├── whatif.controller.ts   
││ ├── alert.controller.ts   
││ └── export.controller.ts   
│├── services/   
││ ├── auth.service.ts   
││ ├── cash.service.ts   
││ ├── inventory.service.ts   
││ ├── forecast.service.ts   
││ ├── whatif.service.ts   
││ ├── alert.service.ts   
││ ├── export.service.ts   
││ └── ml.service.ts   
│├── repositories/   
││ ├── user.repository.ts   
││ ├── cash.repository.ts   
││ ├── inventory.repository.ts   
││ ├── forecast.repository.ts   
││ ├── scenario.repository.ts   
││ └── alert.repository.ts   
│├── schemas/   
││ ├── auth.schema.ts   
││ ├── cash.schema.ts   
││ ├── inventory.schema.ts   
││ ├── forecast.schema.ts   
││ ├── whatif.schema.ts   
││ └── alert.schema.ts   
│├── db/   
││ ├── index.ts   
││ ├── schema.ts   
││ ├── migrations/   
││ └── seeds/   
│├── middleware/   
││ ├── auth.middleware.ts   
││ ├── error.middleware.ts   
││ ├── rate-limit.middleware.ts   
││ └── logger.middleware.ts   
│├── utils/   
││ ├── response.ts   
││ ├── date.ts   
││ ├── calculation.ts   
││ └── logger.ts   
│└── types/   
│ └── api.ts   
├── tests/   
├── Dockerfile   
├── drizzle.config.ts   
├── package.json   
└── tsconfig.json 

* routes/ \= definisi *endpoint*  
* controllers/ \= penerima *request* dan pembentuk *response*  
* services/ \= logika bisnis  
* repositories/ \= *query database*  
* schemas/ \= validasi *payload*  
* db/ \= *schema*, migrasi, *seed*  
* middleware/ \= *auth, error handling, logging*  
* utils/ \= *helper* umum

Struktur ini memisahkan logika dengan jelas dan cocok untuk pengembangan bertahap.

<a id="bab-iv"></a>
# BAB IV

<a id="desain-database,-forecast,-dan-alert-engine"></a>
## DESAIN DATABASE, FORECAST, DAN ALERT ENGINE

<a id="4.1-database-utama"></a>
### 4.1 Database Utama

Database yang direkomendasikan adalah PostgreSQL karena kuat untuk data transaksi, cocok untuk data relasional, mendukung *query* analitik yang baik, mudah dikelola di Kubernetes.

<a id="4.2-konvensi-nama"></a>
### 4.2 Konvensi Nama

Mengikuti referensi naming convention yang ada sebelumnya:

* Database Name: snake\_case  
* Table Name: snake\_case  
* Column Name: snake\_case  
* Backend File Name: snake\_case  
* Frontend Component: PascalCase


<a id="4.3-entitas-inti"></a>
### 4.3 Entitas Inti

<a id="4.3.1-users-(menyimpan-akun-pengguna)"></a>
#### 4.3.1 users (Menyimpan Akun Pengguna)

* id UUID / serial  
* full\_name  
* email  
* password\_hash  
* created\_at  
* updated\_at

<a id="4.3.2-business_profiles-(menyimpan-profil-usaha-milik-user)"></a>
#### 4.3.2 business_profiles (Menyimpan Profil Usaha Milik User)

* id  
* user\_id  
* business\_name  
* business\_type  
* currency\_code  
* created\_at  
* updated\_at

<a id="4.3.3-cash_transactions-(menyimpan-transaksi-kas-harian)"></a>
#### 4.3.3 cash_transactions (Menyimpan Transaksi Kas Harian)

* id  
* business\_profile\_id  
* transaction\_date  
* type (income / expense)  
* amount  
* description  
* created\_at  
* updated\_at

<a id="4.3.4-inventory_items-(menyimpan-data-barang)"></a>
#### 4.3.4 inventory_items (Menyimpan Data Barang)

* id  
* business\_profile\_id  
* item\_name  
* current\_stock  
* average\_sales\_per\_day  
* unit  
* minimum\_threshold  
* created\_at  
* updated\_at

<a id="4.3.5-inventory_movements-(menyimpan-pergerakan-stok)"></a>
#### 4.3.5 inventory_movements (Menyimpan Pergerakan Stok)

* id  
* inventory\_item\_id  
* movement\_date  
* movement\_type (in / out / adjustment)  
* quantity  
* note  
* created\_at  
* updated\_at

<a id="4.3.6-forecast_runs-(menyimpan-hasil-forecast)"></a>
#### 4.3.6 forecast_runs (Menyimpan Hasil Forecast)

* id  
* business\_profile\_id  
* forecast\_type (cash / inventory)  
* source\_snapshot\_json  
* result\_json  
* horizon\_days  
* generated\_at

<a id="4.3.7-what_if_scenarios-(menyimpan-skenario-simulasi)"></a>
#### 4.3.7 what_if_scenarios (Menyimpan Skenario Simulasi)

* id  
* business\_profile\_id  
* scenario\_name  
* parameter\_json  
* result\_json  
* created\_at  
* updated\_at

<a id="4.3.8-alerts-(menyimpan-alert-yang-dihasilkan-sistem)"></a>
#### 4.3.8 alerts (Menyimpan Alert Yang Dihasilkan Sistem)

* id  
* business\_profile\_id  
* alert\_type (cash / inventory)  
* severity (info / warning / critical)  
* message  
* status (active / read / resolved)  
* trigger\_value  
* created\_at  
* updated\_at

<a id="4.3.9-export_logs-(menyimpan-riwayat-export)"></a>
#### 4.3.9 export_logs (Menyimpan Riwayat Export)

* id  
* business\_profile\_id  
* export\_type (pdf / excel)  
* file\_path  
* created\_at

<a id="4.4-relasi-antar-tabel"></a>
### 4.4 Relasi Antar Tabel

* users 1..N business\_profiles  
* business\_profiles 1..N cash\_transactions  
* business\_profiles 1..N inventory\_items  
* inventory\_items 1..N inventory\_movements  
* business\_profiles 1..N forecast\_runs  
* business\_profiles 1..N what\_if\_scenarios  
* business\_profiles 1..N alerts  
* business\_profiles 1..N export\_logs


<a id="4.5-indeks-yang-direkomendasikan"></a>
### 4.5 Indeks yang Direkomendasikan

* cash\_transactions(business\_profile\_id, transaction\_date)  
* inventory\_items(business\_profile\_id, item\_name)  
* inventory\_movements(inventory\_item\_id, movement\_date)  
* forecast\_runs(business\_profile\_id, generated\_at)  
* alerts(business\_profile\_id, status, severity)


<a id="4.6-catatan-desain-database"></a>
### 4.6 Catatan Desain Database

* Simpan nilai hasil *forecast* dalam bentuk JSON agar fleksibel untuk revisi formula.  
* Simpan *snapshot* input agar setiap hasil *forecast* bisa diaudit.  
* Gunakan *soft delete* hanya jika benar-benar perlu.  
* *Audit trail* disarankan untuk versi lebih lanjut, bukan wajib MVP.

<a id="4.7-forecast-engine-mvp"></a>
### 4.7 Forecast Engine MVP

Forecast MVP memakai pendekatan linier:

* kas \= saldo sekarang \+ akumulasi *income* \- *expense* proyeksi,  
* stok \= current\_stock \- (average\_sales\_per\_day × hari).

<a id="4.8-parameter-what-if"></a>
### 4.8 Parameter What-If

Contoh parameter:

* kenaikan pengeluaran X%  
* perubahan penjualan harian  
* perubahan stok awal  
* perubahan biaya operasional


<a id="4.9-alert-logic"></a>
### 4.9 Alert Logic

*Alert* dibentuk dari hasil *forecast*:

* stok \< 3 hari → critical  
* kas \< 0 dalam 7 hari → critical  
* mendekati threshold → warning  
* kondisi aman → info


<a id="4.10-output-alert"></a>
### 4.10 Output Alert

Setiap *alert* minimal berisi:

* tipe *alert*,  
* *severity*,  
* pesan manusiawi,  
* nilai pemicu,  
* *timestamp*,  
* status baca/belum.

<a id="bab-v"></a>
# BAB V

<a id="desain-api-&-desain-komunikasi-internal"></a>
## DESAIN API & DESAIN KOMUNIKASI INTERNAL

<a id="5.1-prinsip-api"></a>
### 5.1 Prinsip API

* RESTful  
* versioned: /api/v1  
* *response* konsisten  
* *error* format seragam  
* *payload* divalidasi dengan Zod


<a id="5.2-format-response-standar"></a>
### 5.2 Format Response Standar

{  
"success": true,   
"message": "Data berhasil disimpan",  
"data": {}   
}

<a id="5.3-format-error-standar"></a>
### 5.3 Format Error Standar

{   
"success": false,   
"message": "Validasi gagal",   
"errors": \[ {   
"field": "amount",   
"message": "Amount harus berupa angka positif"   
} \]   
}

<a id="5.4-endpoint-inti"></a>
### 5.4 Endpoint Inti

1. **Auth**  
* POST /api/v1/auth/register  
* POST /api/v1/auth/login  
* POST /api/v1/auth/logout  
* GET /api/v1/auth/me  
2. **Cash**  
* GET /api/v1/cash-transactions  
* POST /api/v1/cash-transactions  
* GET /api/v1/cash-transactions/:id  
* PATCH /api/v1/cash-transactions/:id  
* DELETE /api/v1/cash-transactions/:id  
3. **Inventory**  
* GET /api/v1/inventory-items  
* POST /api/v1/inventory-items  
* GET /api/v1/inventory-items/:id  
* PATCH /api/v1/inventory-items/:id  
* DELETE /api/v1/inventory-items/:id  
4. **Inventory Movement**  
* GET /api/v1/inventory-movements  
* POST	/api/v1/inventory-movements  
* PATCH /api/v1/inventory-movements/{id}  
* DELETE /api/v1/inventory-movements/{id}  
5. **Forecast**  
* GET /api/v1/forecast  
* POST /api/v1/forecast/recalculate  
* GET /api/v1/forecast/history  
6. **What-If**  
* POST /api/v1/what-if/simulate  
* GET /api/v1/what-if/history  
* GET /api/v1/what-if/:id  
* DELETE /api/v1/what-if/:id  
7. **Alerts**  
* GET /api/v1/alerts  
* GET /api/v1/alerts/:id  
* PATCH /api/v1/alerts/:id/read  
* PATCH /api/v1/alerts/:id/resolve  
8. **Exports**  
* POST /api/v1/exports/pdf  
* POST /api/v1/exports/excel  
* GET /api/v1/exports/history  
9. **ML Service (Roadmap)**  
* POST /predict/cash  
* POST /predict/inventory	  
* POST /detect/anomaly	  
* GET /health


<a id="5.5-kontrak-data-contoh"></a>
### 5.5 Kontrak Data Contoh

1. **Create Cash Transaction**  
   *Request*:  
   { 

   "business\_profile\_id": "uuid",   
   "transaction\_date": "2026-07-16",   
   "type": "expense",   
   "amount": 150000,   
   "description": "Beli bahan baku” 

   }   
     
2. **Simulate What-If**  
   *Request*:  
   { 

   "business\_profile\_id": "uuid",   
   "scenario\_name": "Expense naik 15%",   
   "parameters": { "expense\_increase\_percentage": 15 } 

   }  
     
3. **Forecast Response**  
   { 

   "success": true,   
   "data": { 

   "cash\_projection": \[...\],   
   "inventory\_projection": \[...\],   
   "alert\_summary": { 

   "severity": "warning",   
   "message": "Stok diprediksi habis dalam 4 hari” 

   } 

   }

   }  
   

<a id="5.6-backend-ke-database"></a>
### 5.6 Backend ke Database

Backend menggunakan Drizzle ORM untuk *query* terstruktur dan *type-safe*.

<a id="5.7-backend-ke-ml-service"></a>
### 5.7 Backend ke ML Service

Untuk *roadmap* lanjutan:

* backend memanggil ML service via HTTP internal,  
* ML service mengembalikan hasil prediksi,  
* hasil disimpan sebagai *forecast* baru.


<a id="5.8-backend-ke-worker-async"></a>
### 5.8 Backend ke Worker Async

Jika RabbitMQ ditambahkan di fase lanjutan:

* backend publish *event*,  
* *worker* memproses *email, export*, atau *job* berat,  
* frontend tetap menerima *response* cepat.

RabbitMQ bukan bagian wajib MVP, tetapi desain backend harus memudahkannya jika nanti dibutuhkan.

<a id="bab-vi"></a>
# BAB VI

<a id="desain-frontend-backend-contract-&-error-handling"></a>
## DESAIN FRONTEND-BACKEND CONTRACT & ERROR HANDLING

<a id="6.1-strategi-kontrak"></a>
### 6.1 Strategi Kontrak

* Definisikan *schema request* dan *response* terlebih dahulu di backend.  
* Sinkronkan tipe data dengan frontend menggunakan *shared contract* bila memungkinkan.  
* Gunakan OpenAPI sebagai sumber referensi integrasi.

<a id="6.2-data-sinkronisasi"></a>
### 6.2 Data Sinkronisasi

Frontend membutuhkan data:

* ringkasan saldo,  
* grafik proyeksi,  
* status *alert*,  
* data stok,  
* hasil simulasi,  
* riwayat *forecast*.

Backend harus selalu mengembalikan data yang cukup untuk *render dashboard* tanpa banyak *request* tambahan.

<a id="6.3-jenis-error"></a>
### 6.3 Jenis Error

* validasi *request*,  
* *not found,*  
* *unauthorized,*  
* *forbidden,*  
* *conflict,*  
* *internal server error*.


<a id="6.4-strategi-handling"></a>
### 6.4 Strategi Handling

* *Error* ditangani oleh *middleware* global.  
* *Response error* seragam.  
* *Error log* disimpan di *server logs*.  
* *Error* kritis bisa dikirim ke *observability stack* di fase lanjut.

<a id="bab-vii"></a>
# BAB VII

<a id="desain-security,-observability,-dan-testing"></a>
## DESAIN SECURITY, OBSERVABILITY, DAN TESTING

<a id="7.1-autentikasi"></a>
### 7.1 Autentikasi

Jika *login* diaktifkan pada fase tertentu:

* JWT *access token*  
* *Refresh token*  
* *Hash password* dengan algoritma yang aman


<a id="7.2-otorisasi"></a>
### 7.2 Otorisasi

* *User* hanya dapat mengakses data profil usahanya sendiri.  
* Semua *query* wajib memfilter berdasarkan business\_profile\_id.


<a id="7.3-secret-management"></a>
### 7.3 Secret Management

* Semua *secret* disimpan di Kubernetes Secret.  
* Tidak boleh *hardcode* di repo.  
* Variabel lingkungan dikelola lewat ConfigMap dan Secret.


<a id="7.4-network-security"></a>
### 7.4 Network Security

* *Database* tidak diekspos publik,  
* ML service hanya bisa diakses *internal cluster*,  
* ingress hanya untuk *service* publik yang dibutuhkan.


<a id="7.5-logging"></a>
### 7.5 Logging

Backend harus punya *log* untuk:

* *request* masuk,  
* *response status,*  
* *error*,  
* *forecast generation,*  
* *alert generation.*


<a id="7.6-monitoring"></a>
### 7.6 Monitoring

Di fase produksi disarankan:

* *metrics endpoint*,  
* Prometheus,  
* Grafana,  
* *alerting* untuk *error rate* dan *latency*.


<a id="7.7-tracing"></a>
### 7.7 Tracing

Belum wajib untuk MVP, tetapi sangat berguna jika nanti *service* bertambah.

<a id="7.8-unit-test"></a>
### 7.8 Unit Test

* kalkulasi *forecast*,  
* *threshold alert,*  
* validasi *schema*,  
* *helper* utilitas.

<a id="7.9-integration-test"></a>
### 7.9 Integration Test

* *endpoint* CRUD,  
* *endpoint forecast,*  
* *database persistence,*  
* *response* format.

<a id="7.10-e2e-test"></a>
### 7.10 E2E Test

Skenario:

* input data  
* generate forecast  
* geser *what-if*  
* cek *alert*  
* *export* hasil

<a id="7.11-performance-test"></a>
### 7.11 Performance Test

* *latency endpoint*,  
* jumlah *request* saat *dashboard* dibuka,  
* kecepatan *update* grafik.

Pengujian ini selaras dengan metrik proposal yang menekankan *rendering* cepat, akurasi kalkulasi, dan *success rate* pengguna.

<a id="bab-viii"></a>
# BAB VIII

<a id="desain-folder-repo-keseluruhan,-kubernetes-manifest,-evolusi-ke-fase-lanjutan,-dan-keputusan-arsitektur-final"></a>
## DESAIN FOLDER REPO KESELURUHAN, KUBERNETES MANIFEST, EVOLUSI KE FASE LANJUTAN, DAN KEPUTUSAN ARSITEKTUR FINAL

<a id="8.1-desain-folder-repository-secara-keseluruhan"></a>
### 8.1 Desain Folder Repository Secara Keseluruhan

kasandra-app/   
├── frontend-kasandra/   
│ ├── src/   
│ ├── public/   
│ ├── Dockerfile   
│ └── package.json   
├── backend-kasandra/   
│ ├── src/   
│ ├── db/   
│ ├── Dockerfile   
│ └── package.json   
├── ml-kasandra/   
│ ├── app/   
│ ├── Dockerfile   
│ └── requirements.txt   
├── infra/   
│ ├── k8s/   
│ │ ├── frontend/   
│ │ ├── backend/   
│ │ ├── ml/   
│ │ ├── postgres/   
│ │ └── ingress/   
│ └── docker-compose/   
└── docs/   
├── PRD.md   
├── SRS.md   
└── SDD.md

Alasan Struktur Ini:

* Memisahkan aplikasi dan infrastruktur.  
* Memudahkan CI/CD.  
* Memudahkan *deployment* per *environment*.  
* Cocok untuk pengembangan tim.


<a id="8.2-frontend-(kubernetes)"></a>
### 8.2 Frontend (Kubernetes)

* Deployment  
* Service  
* Ingress


<a id="8.3-backend-(kubernetes)"></a>
### 8.3 Backend (Kubernetes)

* Deployment  
* Service  
* ConfigMap  
* Secret  
* HPA


<a id="8.4-ml-service-(kubernetes)"></a>
### 8.4 ML Service (Kubernetes)

* Deployment  
* Service  
* ConfigMap  
* Secret


<a id="8.5-postgresql-(kubernetes)"></a>
### 8.5 PostgreSQL (Kubernetes)

* StatefulSet  
* PersistentVolumeClaim  
* Service  
* Secret

<a id="8.6-saran-namespace-(kubernetes)"></a>
### 8.6 Saran Namespace (Kubernetes)

Pisahkan *namespace*:

* kasandra-dev  
* kasandra-staging  
* kasandra-prod

<a id="8.7-tahap-lanjutan-1-:-mvp"></a>
### 8.7 Tahap Lanjutan 1 : MVP

* backend menghitung *forecast* dan *alert* sendiri,  
* tidak ada *queue*,  
* tidak ada ML penuh,  
* fokus pada kualitas data dan UI.


<a id="8.8-tahap-lanjutan-2-:-automation-layer"></a>
### 8.8 Tahap Lanjutan 2 : Automation Layer

* tambah RabbitMQ,  
* tambah *worker export*/email,  
* tambah *caching*,  
* tambah ML service yang lebih aktif.


<a id="8.9-tahap-lanjutan-3-:-predictive-platform"></a>
### 8.9 Tahap Lanjutan 3 : Predictive Platform

* integrasi POS dan bank,  
* *anomaly detection,*  
* multi-variabel *what-if*,  
* *supplier recommendation,*  
* *auto draft* PO*.*

Desain sekarang harus tetap fleksibel agar semua fase ini tidak perlu *rewrite* besar.

<a id="8.10-keputusan-arsitektur-final"></a>
### 8.10 Keputusan Arsitektur Final

1. **Dipilih**  
* Frontend: React \+ TypeScript  
* Backend: TypeScript \+ Hono  
* Validation: Zod  
* ORM: Drizzle  
* Database: PostgreSQL  
* ML Service: Python \+ FastAPI  
* Runtime: Docker  
* Orchestration: Kubernetes  
2. **Tidak Digunakan di MVP**  
* RabbitMQ di *critical path*  
* ML berat di backend utama  
* *microservice* terlalu banyak  
* *event-driven architecture* penuh  
3. **Alasan**  
   Karena scope awal KasandraApp adalah membuktikan nilai produk melalui proyeksi, simulasi, dan *alert* yang cepat. Setelah itu baru diperluas ke automasi dan ML yang kompleks. Rancangan proposal memang menempatkan itu sebagai visi 100%, bukan wajib MVP.

## 

<a id="bab-ix"></a>
# BAB IX

<a id="kesimpulan"></a>
## KESIMPULAN

SDD KasandraApp yang paling tepat adalah desain yang rapi, modular, dan *Kubernetes-ready*, tetapi tetap realistis untuk *scope* MVP. Inti desainnya adalah backend Hono yang ringan, *database* PostgreSQL yang kuat, frontend terpisah untuk *dashboard* interaktif, dan ML service Python yang disiapkan untuk fase lanjutan. *Alert* dihitung langsung di *backend* untuk MVP, sedangkan RabbitMQ, *worker*, dan otomasi disimpan sebagai evolusi berikutnya.   
Dengan desain ini, KasandraApp bisa dibangun cepat untuk demo, tetapi tetap punya fondasi arsitektur yang cukup matang untuk berkembang menjadi platform *digital twin* UMKM yang lebih canggih.