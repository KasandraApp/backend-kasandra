**PRODUCT REQUIREMENTS DOCUMENT (PRD)**   
**KasandraApp**

| Nama Produk | Kasandra |
| :---- | :---- |
| **Repository Terpisah** | frontend-kasandra, backend-kasandra, ml-kasandra |
| **Versi Dokumen** | 1.0 |
| **Status** | Draft PRD untuk MVP & Roadmap Jangka Panjang |

**DAFTAR ISI**

1. [RINGKASAN PRODUK](#ringkasan-produk)
2. [LATAR BELAKANG & PROBLEM STATEMENT](#latar-belakang-&-problem-statement)
3. [TUJUAN PRODUK](#tujuan-produk)
   1. [Tujuan Bisnis](#tujuan-bisnis)
   2. [Tujuan Produk](#tujuan-produk-1)
   3. [Target Sukses MVP](#target-sukses-mvp)
4. [SASARAN PENGGUNA](#sasaran-pengguna)
   1. [Persona 1 : Pemilik UMKM](#persona-1-:-pemilik-umkm)
   2. [Persona 2 : Staf Admin / Operasional](#persona-2-:-staf-admin-/-operasional)
   3. [Persona 3 : Analisis Internal / Tim Produk](#persona-3-:-analisis-internal-/-tim-produk)
5. [NILAI PRODUK / UNIQUE SELLING PROPOSITION](#nilai-produk-/-unique-selling-proposition)
6. [RUANG LINGKUP PRODUK](#ruang-lingkup-produk)
   1. [MVP (Wajib Dikerjakan)](#mvp-\(wajib-dikerjakan\))
   2. [Fitur Opsional Jika Waktu Cukup](#fitur-opsional-jika-waktu-cukup)
   3. [Roadmap 100%](#roadmap-100%)
7. [USER JOURNEY UTAMA](#user-journey-utama)
8. [REQUIREMENT FUNGSIONAL](#requirement-fungsional)
   1. [Authentication](#authentication)
   2. [Data Management](#data-management)
   3. [Forecast Engine](#forecast-engine)
   4. [What-If Engine](#what-if-engine)
   5. [Alert Engine](#alert-engine)
   6. [Export](#export)
9. [REQUIREMENT NON-FUNGSIONAL](#requirement-non-fungsional)
   1. [Kinerja](#kinerja)
   2. [Akurasi](#akurasi)
   3. [Usability](#usability)
   4. [Maintainability](#maintainability)
   5. [Scalability](#scalability)
10. [REKOMENDASI ARSITEKTUR TEKNOLOGI](#rekomendasi-arsitektur-teknologi)
   1. [Frontend (frontend-kasandra)](#frontend-\(frontend-kasandra\))
   2. [Backend (backend-kasandra)](#backend-\(backend-kasandra\))
   3. [ML Service (ml-kasandra)](#ml-service-\(ml-kasandra\))
   4. [Database](#database)
11. [ARSITEKTUR SISTEM TINGKAT TINGGI](#arsitektur-sistem-tingkat-tinggi)
   1. [Komponen](#komponen)
   2. [Alur Data](#alur-data)
12. [MODEL DATA AWAL](#model-data-awal)
   1. [Tabel Inti](#tabel-inti)
   2. [Entitas Penting](#entitas-penting)
13. [API MINIMUM YANG DISARANKAN](#api-minimum-yang-disarankan)
   1. [Auth](#auth)
   2. [Cash](#cash)
   3. [Inventory](#inventory)
   4. [Forecast](#forecast)
   5. [What-If](#what-if)
   6. [Alerts](#alerts)
   7. [Export](#export-1)
14. [KPI / SUCCESS MATRICS](#kpi-/-success-matrics)
15. [METODOLOGI PENGEMBANGAN](#metodologi-pengembangan)
16. [SCOPE YANG TIDAK DICAKUP DI MVP](#scope-yang-tidak-dicakup-di-mvp)
17. [RISIKO UTAMA](#risiko-utama)
18. [DEFINISI SUKSES PRODUK](#definisi-sukses-produk)
19. [REKOMENDASI PRIORITAS EKSEKUSI](#rekomendasi-prioritas-eksekusi)
   1. [Prioritas 1](#prioritas-1)
   2. [Prioritas 2](#prioritas-2)
   3. [Prioritas 3](#prioritas-3)
20. [NAMING CONVENTION](#naming-convention)
21. [KESIMPULAN](#kesimpulan)

<a id="ringkasan-produk"></a>
## 1. **RINGKASAN PRODUK**

   KasandraApp adalah platform *digital twin* untuk UMKM yang memproyeksikan kondisi kas dan stok secara proaktif melalui *dashboard* visual, simulasi *what-if*, dan sistem *alert*. Fokus utama versi awal adalah MVP sebesar 50% dari visi penuh sistem, dengan fitur inti berupa input data operasional, visualisasi proyeksi 30 hari, simulasi interaktif, dan peringatan dini. Visi jangka panjangnya mencakup integrasi data otomatis dari POS/bank, analitik ML *time-series*, simulasi multi-variabel, serta *alert* yang dapat ditindaklanjuti secara otomatis.  
   

<a id="latar-belakang-&-problem-statement"></a>
## 2. **LATAR BELAKANG & PROBLEM STATEMENT**

   Banyak UMKM menghadapi masalah utama pada ketidaksinkronan antara aliran kas dan stok fisik. Data operasional sering terlambat dicatat, membuat pemilik usaha sulit melihat potensi *stock out* atau defisit kas sebelum masalah terjadi. Saat ini juga masih banyak solusi yang hanya bersifat reaktif, yaitu sekadar mencatat histori, bukan memproyeksikan risiko masa depan. KasandraApp dirancang untuk mengisi celah itu dengan pendekatan prediktif yang ringan dan mudah dipakai lewat web.  
   

<a id="tujuan-produk"></a>
## 3. **TUJUAN PRODUK**

<a id="tujuan-bisnis"></a>
### 3.1 **Tujuan Bisnis**

   KasandraApp membantu UMKM mengambil keputusan yang lebih cepat dan lebih aman terkait pengeluaran, pembelian stok, dan mitigasi risiko operasional.

<a id="tujuan-produk-1"></a>
### 3.2 **Tujuan Produk**

* Menyediakan pencatatan operasional yang sederhana dan terstruktur.  
* Menampilkan proyeksi kas dan stok dalam bentuk visual yang mudah dibaca.  
* Memberikan simulasi *what-if* agar pengguna bisa menguji skenario perubahan biaya atau stok.  
* Menampilkan *alert* saat kondisi kritis terdeteksi.

<a id="target-sukses-mvp"></a>
### 3.3 **Target Sukses MVP**

* Seluruh fitur inti berjalan stabil pada mode *web*.  
* Proyeksi dan grafik dapat diperbarui secara cepat saat parameter berubah.  
* Pengguna bisa menyelesaikan alur utama tanpa panduan teknis yang rumit.


<a id="sasaran-pengguna"></a>
## 4. **SASARAN PENGGUNA**

<a id="persona-1-:-pemilik-umkm"></a>
### 4.1 **Persona 1 : Pemilik UMKM**

   Butuh gambaran cepat tentang kondisi kas dan stok untuk mengambil keputusan harian.

<a id="persona-2-:-staf-admin-/-operasional"></a>
### 4.2 **Persona 2 : Staf Admin / Operasional**

   Menginput data pemasukan, pengeluaran, dan stok dengan cepat tanpa proses yang rumit.

<a id="persona-3-:-analisis-internal-/-tim-produk"></a>
### 4.3 **Persona 3 : Analisis Internal / Tim Produk**

   Membutuhkan data historis dan simulasi untuk evaluasi performa sistem serta pengembangan fitur berikutnya.

   

<a id="nilai-produk-/-unique-selling-proposition"></a>
## 5. **NILAI PRODUK / UNIQUE SELLING PROPOSITION**

   KasandraApp bukan sekadar aplikasi pembukuan. Produk ini memadukan dua domain yang biasanya terpisah, yaitu keuangan dan inventaris. Pembeda utamanya adalah:  
* Proyeksi kas dan stok ke depan.  
* Simulasi *what-if* berbasis *slider*.  
* *Alert* dini terhadap kondisi kritis.  
* *Roadmap* menuju *digital twin* yang lebih otomatis di masa depan.


<a id="ruang-lingkup-produk"></a>
## 6. **RUANG LINGKUP PRODUK**

<a id="mvp-(wajib-dikerjakan)"></a>
### 6.1 **MVP (Wajib Dikerjakan)**

   MVP berada di level 50% dari total visi sistem dan mencakup empat modul inti: input data, *dashboard* visualisasi, simulasi *what-if*, dan *alert*. Fitur *export*, riwayat, *login*, email notifikasi, dan integrasi data otomatis berada di prioritas opsional atau roadmap berikutnya.

 **Epic 1 : Modul Input Data**

  Fungsi:

- [ ] Input pemasukan harian.  
- [ ] Input pengeluaran harian.  
- [ ] Input stok barang.  
- [ ] Penyimpanan histori transaksi.

      

      Kriteria sukses:

- [ ] Pengguna dapat menambah, mengubah, menghapus, dan melihat data dengan mudah.  
- [ ] Data tersimpan konsisten dan siap dipakai untuk kalkulasi proyeksi.  
**Epic 2 : Dashboard Visualisasi**

  Fungsi:

- [ ] *Line chart* proyeksi kas 30 hari.  
- [ ] *Bar chart* sisa hari stok habis.  
- [ ] Ringkasan status kritis.

      Kriteria sukses:

- [ ] Grafik memuat data yang relevan.  
- [ ] Pembaruan visual terasa cepat.  
- [ ] Status mudah dipahami pada satu layar utama.  
**Epic 3 : Simulasi What-If**

  Fungsi:

- [ ] *Slider* untuk 1–2 variabel.  
- [ ] Simulasi kenaikan pengeluaran atau perubahan parameter lain  
- [ ] Update grafik secara *real-time.*

      Kriteria sukses:

- [ ] Perubahan *slider* langsung memengaruhi proyeksi.  
- [ ] Logika perhitungan bersifat linier untuk MVP, bukan ML penuh.  
**Epic 4 : Alert & Rekomendasi**

  Fungsi:

- [ ] *Banner* kuning/merah.  
- [ ] *Alert* stok kritis.  
- [ ] *Alert* defisit kas.  
- [ ] Pesan rekomendasi singkat.

      Kriteria sukses:

- [ ] *Alert* muncul sesuai ambang batas.  
- [ ] Sistem tidak menghasilkan notifikasi palsu berlebihan.

<a id="fitur-opsional-jika-waktu-cukup"></a>
### 6.2 **Fitur Opsional Jika Waktu Cukup**

* *Export* PDF / Excel  
* Riwayat simulasi  
* Perbandingan proyeksi vs realita  
* *Login*/*Register*  
* Multi-profil usaha  
* Email *alert*

<a id="roadmap-100%"></a>
### 6.3 **Roadmap 100%**

* Integrasi POS dan rekening bank  
* ML *time-series*  
* Deteksi anomali  
* Simulasi multi-variabel.  
* *Push notification*.  
* Rekomendasi *supplier* otomatis.  
* Draft *Purchase* Order otomatis.


<a id="user-journey-utama"></a>
## 7. **USER JOURNEY UTAMA**

* *User* membuka dashboard.  
* *User* mengisi pemasukan, pengeluaran, dan stok.  
* Sistem menghitung proyeksi kas dan umur stok.  
* *User* menggeser *slider what-if* untuk menguji skenario.  
* Grafik dan status *alert* berubah secara *real-time*.  
* *User* membaca rekomendasi dan mengambil keputusan.


<a id="requirement-fungsional"></a>
## 8. **REQUIREMENT FUNGSIONAL**

<a id="authentication"></a>
### 8.1 **Authentication**

   Untuk MVP, *login* bisa ditunda. Jika tetap dikerjakan, cukup sederhana:

* *Register*  
* *Login*  
* *Logout*  
* Sesi *user*

<a id="data-management"></a>
### 8.2 **Data Management**

* CRUD data keuangan harian.  
* CRUD data stok barang.  
* Validasi input angka dan tanggal.  
* Riwayat transaksi tersimpan per usaha/profil.

<a id="forecast-engine"></a>
### 8.3 **Forecast Engine**

* Menghitung kas 30 hari ke depan.  
* Menghitung estimasi stok habis berdasarkan rata-rata penjualan harian.  
* Memakai rumus deterministik/linier untuk MVP.

<a id="what-if-engine"></a>
### 8.4 **What-If Engine**

* Menerima perubahan parameter.  
* Menghitung ulang *output* proyeksi.  
* Memperbarui grafik tanpa reload halaman.

<a id="alert-engine"></a>
### 8.5 **Alert Engine**

* Stok \< 3 hari → *alert* kritis.  
* Kas diproyeksikan minus dalam 7 hari → *alert* kritis.  
* Kondisi *medium risk* ditampilkan dengan warna kuning.  
* Kondisi aman ditampilkan normal.

<a id="export"></a>
### 8.6 **Export**

* Ekspor hasil proyeksi,  
* Format PDF/Excel,  
* Hanya bila waktu MVP mencukupi.


<a id="requirement-non-fungsional"></a>
## 9. **REQUIREMENT NON-FUNGSIONAL**

<a id="kinerja"></a>
### 9.1 **Kinerja**

   Update grafik targetnya di bawah 1 detik saat parameter berubah.

<a id="akurasi"></a>
### 9.2 **Akurasi**

   Kalkulasi *backend* harus presisi tinggi untuk logika linier MVP.

<a id="usability"></a>
### 9.3 **Usability**

- [ ] Tugas utama harus bisa diselesaikan dalam waktu singkat.  
- [ ] Target keberhasilan tugas minimal 90%.  
- [ ] Alur utama tidak boleh terlalu banyak langkah.

<a id="maintainability"></a>
### 9.4 **Maintainability**

* Pemisahan frontend, backend, dan ML harus jelas.  
* *Naming convention* seragam.  
* Struktur file mudah dipahami tim.

<a id="scalability"></a>
### 9.5 **Scalability**

   Arsitektur harus siap naik kelas ke integrasi data otomatis dan ML di fase berikutnya.

   

<a id="rekomendasi-arsitektur-teknologi"></a>
## 10. **REKOMENDASI ARSITEKTUR TEKNOLOGI**

<a id="frontend-(frontend-kasandra)"></a>
### 10.1 **Frontend (frontend-kasandra)**

* TypeScript  
* React  
* Vite  
* Tailwind CSS  
* shadcn/ui  
* Recharts atau Chart.js  
* TanStack Query untuk *fetching state*  
* Zustand untuk *state* ringan

  Alasan: cepat dikembangkan, cocok untuk *dashboard* dan *chart*, mudah dipisahkan dengan backend Hono.

<a id="backend-(backend-kasandra)"></a>
### 10.2 **Backend (backend-kasandra)**

* Bahasa : TypeScript   
* Framework : Hono  
* Runtime : Bun  
* Validasi : Zod   
* ORM : Drizzle ORM  
* Database : PostgreSQL  
* Cache : Redis   
* API Docs : OpenAPI/Swagger untuk dokumentasi API  
* Container : Docker  
* Orchestration : Kubernetes (Produksi)  
* CI/CD : GitHub Actions

  Alasan: Hono ringan dan modern, TypeScript menjaga konsistensi tipe dari frontend ke backend, Drizzle cocok untuk *schema* yang jelas dan rapih, PostgreSQL aman untuk data transaksi yang akan tumbuh.

<a id="ml-service-(ml-kasandra)"></a>
### 10.3 **ML Service (ml-kasandra)**

* Python  
* FastAPI  
* pandas  
* numpy  
* scikit-learn  
* joblib  
* Celery / cron job opsional untuk tugas terjadwal

  Alasan: memisahkan komputasi ML dari backend utama, memudahkan migrasi dari kalkulasi sederhana ke model *time-series* nanti, cocok untuk *roadmap* analitik lanjutan.

<a id="database"></a>
### 10.4 **Database**

* PostgreSQL

  Alasan: cocok untuk transaksi, histori, dan *scaling*. 


<a id="arsitektur-sistem-tingkat-tinggi"></a>
## 11. **ARSITEKTUR SISTEM TINGKAT TINGGI**

<a id="komponen"></a>
### 11.1 **Komponen**

* Frontend Web  
* Backend API Hono  
* *Database* utama  
* ML service Python  
* Layanan notifikasi / *export* (opsional)

<a id="alur-data"></a>
### 11.2 **Alur Data**

   Frontend mengirim data input ke backend. Backend menyimpan data, menghitung proyeksi MVP, lalu mengirim hasil ke frontend untuk divisualisasikan. ML service belum wajib dipakai untuk MVP, tetapi disiapkan sebagai *service* terpisah untuk *roadmap* prediksi yang lebih canggih. Konsep pemisahan frontend-backend dan komputasi ML selaras dengan dokumen proposal.

   

<a id="model-data-awal"></a>
## 12. **MODEL DATA AWAL**

<a id="tabel-inti"></a>
### 12.1 **Tabel Inti**

* users  
* business\_profiles  
* cash\_transactions  
* inventory\_items  
* inventory\_movements  
* forecast\_runs  
* what\_if\_scenarios  
* alerts  
* export\_logs

<a id="entitas-penting"></a>
### 12.2 **Entitas Penting**

* Transaksi kas harian.  
* Stok barang.  
* Hasil proyeksi.  
* Skenario *what-if*.  
* Riwayat *alert*.  
  *Naming* yang konsisten sebaiknya mengikuti pola snake\_case untuk database dan *backend resource* sesuai referensi naming.


<a id="api-minimum-yang-disarankan"></a>
## 13. **API MINIMUM YANG DISARANKAN**

<a id="auth"></a>
### 13.1 **Auth**

* POST /auth/register  
* POST /auth/login  
* POST /auth/logout

<a id="cash"></a>
### 13.2 **Cash**

* GET /cash-transactions  
* POST /cash-transactions  
* PATCH /cash-transactions/:id  
* DELETE /cash-transactions/:id

<a id="inventory"></a>
### 13.3 **Inventory**

* GET /inventory-items  
* POST /inventory-items  
* PATCH /inventory-items/:id  
* DELETE /inventory-items/:id

<a id="forecast"></a>
### 13.4 **Forecast**

* GET /forecast  
* POST /forecast/recalculate

<a id="what-if"></a>
### 13.5 **What-If**

* POST /what-if/simulate  
* GET /what-if/history

<a id="alerts"></a>
### 13.6 **Alerts**

* GET /alerts  
* PATCH /alerts/:id/read

<a id="export-1"></a>
### 13.7 **Export**

* POST /exports/pdf  
* POST /exports/excel


<a id="kpi-/-success-matrics"></a>
## 14. **KPI / SUCCESS MATRICS**

- [ ] Update grafik kurang dari 1 detik.  
- [ ] Akurasi kalkulasi *backend* 100% untuk logika linier.  
- [ ] *Task success rate* minimum 90%.  
- [ ] *Time-on-task* maksimal 2 menit.  
- [ ] *Alert* kritis harus muncul tepat saat ambang batas terpenuhi.

      

<a id="metodologi-pengembangan"></a>
## 15. **METODOLOGI PENGEMBANGAN**

    Metodologi yang digunakan adalah Agile Scrum, karena:  
* Target waktu sangat ketat.  
* Fitur bisa diprioritaskan bertahap.  
* Frontend dan backend bisa dikembangkan paralel.  
* Risiko *bug* dan perubahan *scope* lebih mudah dikontrol.


<a id="scope-yang-tidak-dicakup-di-mvp"></a>
## 16. **SCOPE YANG TIDAK DICAKUP DI MVP**

* Integrasi bank/POS.  
* ML yang benar-benar kompleks.  
* *Auto-order supplier*.  
* *Barcode scanner* / IoT.  
* *Push notification* penuh.  
* *Automated purchase order*.  
* Simulasi multi-variabel kompleks.


<a id="risiko-utama"></a>
## 17. **RISIKO UTAMA**

* *Scope* melebar terlalu cepat.  
* Kalkulasi MVP terlalu kompleks padahal *deadline* dekat.  
* Frontend *chart* dan simulator tidak responsif.  
* Sinkronisasi kontrak data frontend-backend tidak konsisten.  
* ML service terlalu dini dipaksa masuk ke MVP.  
  Mitigasi: bekukan *scope* MVP, fokus pada 4 epic inti, jadikan ML service sebagai *roadmap* (bukan *blocker*), definisikan *schema API* sejak awal.


<a id="definisi-sukses-produk"></a>
## 18. **DEFINISI SUKSES PRODUK**

* Pengguna bisa *input* data dengan mudah.  
* *Dashboard* menampilkan proyeksi yang meyakinkan.  
* *What-if* berjalan interaktif.  
* *Alert* bekerja sesuai ambang batas.  
* Tim bisa mendemokan produk sebagai *digital twin* operasional UMKM, bukan sekadar aplikasi pembukuan biasa.


<a id="rekomendasi-prioritas-eksekusi"></a>
## 19. **REKOMENDASI PRIORITAS EKSEKUSI**

<a id="prioritas-1"></a>
### 19.1 **Prioritas 1**

- [ ] CRUD *cash transaction*  
- [ ] CRUD *inventory*  
- [ ] *Dashboard* proyeksi  
- [ ] *What-if slider*  
- [ ] *Alert engine*

<a id="prioritas-2"></a>
### 19.2 **Prioritas 2**

- [ ] *Export report*  
- [ ] *History scenario*  
- [ ] *Multi-profile*  
- [ ] *Login*/*register*

<a id="prioritas-3"></a>
### 19.3 **Prioritas 3**

- [ ] *Email notification*  
- [ ] Integrasi data otomatis  
- [ ] ML *forecasting*  
- [ ] *Automated action alerts*

      

<a id="naming-convention"></a>
## 20. **NAMING CONVENTION**

* Nama Repo: kebab-case dengan prefix kasandra  
* *Database*: snake\_case  
* Frontend Page/*Component*: PascalCase  
* Frontend Hook: camelCase dengan prefix use  
* Backend Router/Service/Model: snake\_case  
* Database Table: snake\_case.


<a id="kesimpulan"></a>
## 21. **KESIMPULAN**

    KasandraApp paling tepat diposisikan sebagai platform *digital twin* keuangan dan stok untuk UMKM, dengan MVP yang realistis dan roadmap yang sangat jelas. Untuk fase sekarang, fokus terbaik adalah membuktikan 4 hal: input data, proyeksi, simulasi, dan alert. Setelah itu, baru produk naik kelas ke integrasi data otomatis dan ML yang lebih canggih.