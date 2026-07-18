**SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**   
**KasandraApp**

| Versi | 1.0 |
| :---- | :---- |
| **Status** | Draft Teknis |
| **Repository Terpisah** | frontend-kasandra, backend-kasandra, ml-kasandra |
| **Target Platform** | Web Application |
| **Arsitektur Deployment** | Docker \+ Kubernetes |

**DAFTAR ISI**

1. [BAB I](#bab-i)
   1. [PENDAHULUAN](#pendahuluan)
      1. [Tujuan Dokumen](#1.1-tujuan-dokumen)
      2. [Ruang Lingkup Produk](#1.2-ruang-lingkup-produk)
      3. [Definisi Singkat](#1.3-definisi-singkat)
2. [BAB II](#bab-ii)
   1. [DESKRIPSI UMUM](#deskripsi-umum)
      1. [Konteks Masalah](#2.1-konteks-masalah)
      2. [Tujuan Sistem](#2.2-tujuan-sistem)
      3. [Karakteristik Pengguna](#2.3-karakteristik-pengguna)
      4. [Asumsi Sistem](#2.4-asumsi-sistem)
3. [BAB III](#bab-iii)
   1. [KEBUTUHAN FUNGSIONAL](#kebutuhan-fungsional)
      1. [Manajemen Data Operasional](#3.1-manajemen-data-operasional)
      2. [Forecasting / Proyeksi](#3.2-forecasting-/-proyeksi)
      3. [Dashboard Visualisasi](#3.3-dashboard-visualisasi)
      4. [Simulasi What-If](#3.4-simulasi-what-if)
      5. [Alert & Rekomendasi](#3.5-alert-&-rekomendasi)
      6. [Riwayat & Export](#3.6-riwayat-&-export)
      7. [User Management](#3.7-user-management)
4. [BAB IV](#bab-iv)
   1. [KEBUTUHAN NONFUNGSIONAL](#kebutuhan-nonfungsional)
      1. [Kinerja](#4.1-kinerja)
      2. [Usability](#4.2-usability)
      3. [Keandalan](#4.3-keandalan)
      4. [Maintainability](#4.4-maintainability)
      5. [Skalabilitas](#4.5-skalabilitas)
      6. [Security](#4.6-security)
5. [BAB V](#bab-v)
   1. [ARSITEKTUR SISTEM](#arsitektur-sistem)
      1. [Arsitektur Logis](#5.1-arsitektur-logis)
      2. [Arsitektur Deployment](#5.2-arsitektur-deployment)
      3. [Komponen Kubernetes Minimum](#5.3-komponen-kubernetes-minimum)
6. [BAB VI](#bab-vi)
   1. [KEBUTUHAN ANTARMUKA](#kebutuhan-antarmuka)
      1. [Antarmuka Pengguna](#6.1-antarmuka-pengguna)
      2. [Antarmuka API](#6.2-antarmuka-api)
      3. [Antarmuka Layanan Internal](#6.3-antarmuka-layanan-internal)
7. [BAB VII](#bab-vii)
   1. [KEBUTUHAN DATA](#kebutuhan-data)
      1. [Entitas Inti](#7.1-entitas-inti)
      2. [Aturan Data](#7.2-aturan-data)
      3. [Retensi Data](#7.3-retensi-data)
8. [BAB VIII](#bab-viii)
   1. [KEBUTUHAN PROSES BISNIS](#kebutuhan-proses-bisnis)
      1. [Alur Input](#8.1-alur-input)
      2. [Alur What-If](#8.2-alur-what-if)
      3. [Alur Alert](#8.3-alur-alert)
9. [BAB IX](#bab-ix)
   1. [KEBUTUHAN PENGUJIAN](#kebutuhan-pengujian)
      1. [Unit Test](#9.1-unit-test)
      2. [Integration Test](#9.2-integration-test)
      3. [End-to-End Test](#9.3-end-to-end-test)
      4. [Performance Test](#9.4-performance-test)
10. [BAB X](#bab-x)
    1. [KEBUTUHAN DEPLOYMENT & OPERASIONAL](#kebutuhan-deployment-&-operasional)
       1. [Containerization](#10.1-containerization)
       2. [Orkestrasi Kubernetes](#10.2-orkestrasi-kubernetes)
       3. [Environment](#10.3-environment)
       4. [Konfigurasi Rahasia](#10.4-konfigurasi-rahasia)
11. [BAB XI](#bab-xi)
    1. [BATASAN SISTEM](#batasan-sistem)
       1. [MVP](#11.1-mvp)
       2. [Non-MVP](#11.2-non-mvp)
       3. [Kriteria Penerimaan](#11.3-kriteria-penerimaan)
       4. [Prioritas Implementasi](#11.4-prioritas-implementasi)
12. [BAB XII](#bab-xii)
    1. [KESIMPULAN](#kesimpulan)

<a id="bab-i"></a>
# BAB I

<a id="pendahuluan"></a>
## PENDAHULUAN

<a id="1.1-tujuan-dokumen"></a>
### 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan kebutuhan fungsional dan nonfungsional untuk KasandraApp, yaitu platform *digital twin* keuangan dan inventaris UMKM yang memproyeksikan kondisi kas dan stok secara proaktif. Fokus utama versi awal adalah MVP sebesar 50% dari visi penuh sistem, mencakup input data operasional, *dashboard* visualisasi, simulasi *what-if*, dan sistem *alert*.

<a id="1.2-ruang-lingkup-produk"></a>
### 1.2 Ruang Lingkup Produk

KasandraApp adalah aplikasi web untuk membantu UMKM melihat kondisi kas dan stok sebelum masalah terjadi. Sistem MVP mencakup:

* input data keuangan dan stok,  
* proyeksi kas 30 hari ke depan,  
* estimasi sisa hari stok habis,  
* simulasi *what-if* berbasis *slider*,  
* *alert* visual untuk kondisi kritis.

Fase lanjutan dapat mencakup integrasi POS dan rekening bank, model ML *time-series*, notifikasi otomatis, dan otomasi *purchase order*. Fitur-fitur itu belum menjadi bagian wajib MVP.

<a id="1.3-definisi-singkat"></a>
### 1.3 Definisi Singkat

* Digital Twin: representasi digital kondisi keuangan dan stok usaha.  
* What-If Simulation: simulasi perubahan parameter untuk melihat dampaknya ke proyeksi.  
* Alert Kritis: peringatan saat stok diprediksi habis kurang dari 3 hari atau kas diprediksi negatif dalam 7 hari.  
* MVP: versi minimal yang harus selesai untuk demo utama.

<a id="bab-ii"></a>
# BAB II

<a id="deskripsi-umum"></a>
## DESKRIPSI UMUM

<a id="2.1-konteks-masalah"></a>
### 2.1 Konteks Masalah

KasandraApp dibuat untuk menjawab masalah umum UMKM, yaitu pencatatan manual yang tertinggal dari kondisi fisik barang dan uang, sehingga pemilik usaha baru sadar saat stok habis atau kas bermasalah. Proposal yang ada menegaskan masalah ini sebagai akar dari defisit kas, *stock out*, dan keputusan berbasis asumsi.

<a id="2.2-tujuan-sistem"></a>
### 2.2 Tujuan Sistem

* Mencatat data operasional dengan cepat.  
* Memproyeksikan kondisi ke depan.  
* Menampilkan simulasi perubahan.  
* Memberi peringatan dini yang jelas.  
* Siap dikembangkan ke arsitektur layanan terpisah dan Kubernetes.


<a id="2.3-karakteristik-pengguna"></a>
### 2.3 Karakteristik Pengguna

1. **Pemilik UMKM**  
   Menggunakan *dashboard* untuk mengambil keputusan.  
2. **Admin / Operasional**  
   Memasukkan data pemasukan, pengeluaran, dan stok.  
3. **Tim Internal / QA**  
   Menguji akurasi kalkulasi, kecepatan *rendering*, dan konsistensi data.  
   

<a id="2.4-asumsi-sistem"></a>
### 2.4 Asumsi Sistem

* Pengguna MVP memasukkan data manual.  
* *Forecast* MVP memakai kalkulasi linier, bukan ML penuh.  
* *Alert* MVP bersifat visual, bukan otomasi tindakan lanjut.  
* Backend utama menggunakan TypeScript \+ Hono.  
* ML service di tahap lanjutan memakai Python.  
* Seluruh *service* dijalankan dalam container dan dikelola di Kubernetes.

<a id="bab-iii"></a>
# BAB III

<a id="kebutuhan-fungsional"></a>
## KEBUTUHAN FUNGSIONAL

<a id="3.1-manajemen-data-operasional"></a>
### 3.1 Manajemen Data Operasional

* FR-01 — Input data keuangan: Sistem harus memungkinkan pengguna menambah data pemasukan dan pengeluaran harian.  
* FR-02 — Input data stok: Sistem harus memungkinkan pengguna menambah data stok barang, jumlah stok, dan rata-rata penjualan per hari.  
* FR-03 — CRUD data operasional: Sistem harus mendukung tambah, lihat, ubah, dan hapus data transaksi serta stok.  
* FR-04 — Validasi input: Sistem harus menolak input kosong, format angka tidak valid, dan tanggal tidak valid.

Fitur ini sesuai dengan scope MVP yang menyebut modul input data sebagai komponen wajib.

<a id="3.2-forecasting-/-proyeksi"></a>
### 3.2 Forecasting / Proyeksi

* FR-05 — Proyeksi kas 30 hari: Sistem harus menghitung proyeksi kas untuk 30 hari ke depan berdasarkan data historis.  
* FR-06 — Estimasi stok habis: Sistem harus menghitung estimasi sisa hari sebelum stok habis berdasarkan rata-rata penjualan harian.  
* FR-07 — Pembaruan proyeksi otomatis: Setiap perubahan data harus memicu perhitungan ulang proyeksi.

Fungsionalitas ini adalah inti *dashboard digital twin* yang didefinisikan.

<a id="3.3-dashboard-visualisasi"></a>
### 3.3 Dashboard Visualisasi

* FR-08 — Grafik kas: Sistem harus menampilkan grafik garis untuk proyeksi kas.  
* FR-09 — Grafik stok: Sistem harus menampilkan grafik batang atau indikator visual untuk sisa hari stok.  
* FR-10 — Status ringkas: Sistem harus menampilkan status aman / waspada / kritis secara visual.

Target visualisasi dan responsivitas ini selaras dengan metrik rendering di proposal.

<a id="3.4-simulasi-what-if"></a>
### 3.4 Simulasi What-If

* FR-11 — Slider simulasi: Sistem harus menyediakan slider minimal untuk 1–2 variabel simulasi.  
* FR-12 — Simulasi kenaikan biaya: Sistem harus bisa mensimulasikan perubahan seperti kenaikan pengeluaran X%.  
* FR-13 — Update real-time: Saat *slider* digeser, grafik dan angka proyeksi harus diperbarui tanpa *reload* halaman.  
* FR-14 — Reset simulasi: Sistem harus menyediakan tombol untuk mengembalikan nilai simulasi ke kondisi awal.

Ini sesuai dengan dokumen fitur yang menempatkan *what-if simulation* sebagai inovasi utama, namun tetap berbasis logika linier pada MVP.

<a id="3.5-alert-&-rekomendasi"></a>
### 3.5 Alert & Rekomendasi

* FR-15 — *Alert* stok kritis: Jika stok diprediksi habis dalam kurang dari 3 hari, sistem harus menampilkan *alert* merah.  
* FR-16 — *Alert* kas kritis: Jika kas diproyeksikan negatif dalam 7 hari, sistem harus menampilkan *alert* merah.  
* FR-17 — *Alert* peringatan sedang: Jika kondisi belum kritis tetapi mendekati batas, sistem harus menampilkan *alert* kuning.  
* FR-18 — Rekomendasi singkat: Sistem harus memberikan teks rekomendasi singkat yang relevan dengan kondisi *alert*.

Ambang batas *alert* ini adalah bagian eksplisit dari scope MVP.

<a id="3.6-riwayat-&-export"></a>
### 3.6 Riwayat & Export

* FR-19 — Riwayat simulasi: Sistem sebaiknya menyimpan riwayat simulasi *what-if*.  
* FR-20 — *Export* laporan: Sistem dapat mengekspor hasil *forecast* atau simulasi ke PDF/Excel jika waktu pengerjaan memungkinkan.

Keduanya bersifat opsional dalam fase MVP, tetapi penting untuk roadmap berikutnya.

<a id="3.7-user-management"></a>
### 3.7 User Management

* FR-21 — *Login* dan *register*: Sistem dapat menyediakan autentikasi pengguna.  
* FR-22 — Multi-profil usaha: Sistem dapat mendukung lebih dari satu profil bisnis per akun.

Fitur ini tercantum sebagai opsional dalam daftar fitur.

<a id="bab-iv"></a>
# BAB IV

<a id="kebutuhan-nonfungsional"></a>
## KEBUTUHAN NONFUNGSIONAL

<a id="4.1-kinerja"></a>
### 4.1 Kinerja

* NFR-01: Pembaruan grafik pada *dashboard* harus terjadi dalam waktu kurang dari 1 detik saat parameter simulasi berubah.  
* NFR-02: Kalkulasi *backend* untuk logika linier MVP harus stabil dan presisi. Proposal menargetkan akurasi kalkulasi *backend* 100% untuk fungsi matematis MVP.


<a id="4.2-usability"></a>
### 4.2 Usability

* NFR-03: Alur utama harus bisa diselesaikan tanpa panduan teknis yang rumit.  
* NFR-04: Tingkat keberhasilan tugas minimal 90%.  
* NFR-05: Waktu penyelesaian alur utama maksimal 2 menit.


<a id="4.3-keandalan"></a>
### 4.3 Keandalan

* NFR-06: *Alert* harus muncul tepat saat kondisi kritis terpenuhi.  
* NFR-07: Sistem tidak boleh menampilkan *alert* palsu secara berulang.


<a id="4.4-maintainability"></a>
### 4.4 Maintainability

* NFR-08: Struktur kode harus dipisahkan antara frontend, backend, dan ML service.  
* NFR-09: Penamaan *file*, *router*, *service*, model, dan tabel harus konsisten. *Naming convention* referensi yang ditetapkan memakai snake\_case untuk backend dan database, serta PascalCase untuk komponen frontend.


<a id="4.5-skalabilitas"></a>
### 4.5 Skalabilitas

* NFR-10: Arsitektur harus siap berkembang dari MVP monolitik ringan ke arsitektur layanan terpisah di Kubernetes.  
* NFR-11: *Service* masa depan seperti *email worker, export worker*, dan ML *worker* harus bisa di-*scale* terpisah.


<a id="4.6-security"></a>
### 4.6 Security

* NFR-12: Data pengguna harus dibatasi sesuai profil usaha.  
* NFR-13: *Secret*, kredensial, dan token tidak boleh disimpan di *image container* atau repo.  
* NFR-14: Komunikasi antar *service* harus melalui API atau *message broker* yang tervalidasi.

<a id="bab-v"></a>
# BAB V

<a id="arsitektur-sistem"></a>
## ARSITEKTUR SISTEM

<a id="5.1-arsitektur-logis"></a>
### 5.1 Arsitektur Logis

KasandraApp disarankan memakai pola berikut.

* Frontend: TypeScript web app  
* Backend: TypeScript \+ Hono  
* ML service: Python *service* terpisah  
* Database: PostgreSQL  
* Containerization: Docker  
* Orchestration: Kubernetes

Untuk MVP, perhitungan *alert* dapat dilakukan langsung di *backend* tanpa RabbitMQ. RabbitMQ menjadi relevan ketika ada proses *async* seperti *email, export* PDF, *job* ML berat, atau notifikasi lanjutan. Ini sejalan dengan scope MVP yang masih menekankan logika linier dan *alert* visual, bukan otomasi penuh.

<a id="5.2-arsitektur-deployment"></a>
### 5.2 Arsitektur Deployment

1. **Lingkungan Lokal**  
   Docker Compose untuk *development* dan demo cepat.  
2. **Lingkungan *Staging* / *Production***  
* Kubernetes Deployment untuk tiap *service*.  
* Kubernetes Service untuk *networking* internal.  
* Ingress untuk akses publik.  
* ConfigMap untuk konfigurasi non-rahasia.  
* Secret untuk kredensial.  
* PersistentVolumeClaim untuk *database*.  
* HorizontalPodAutoscaler untuk *service* yang perlu *autoscaling*.


<a id="5.3-komponen-kubernetes-minimum"></a>
### 5.3 Komponen Kubernetes Minimum

1. **Wajib**  
* frontend-deployment  
* backend-deployment  
* ml-deployment  
* postgres-statefulset atau postgres-deployment \+ PVC  
* ingress  
* configmap  
* secret  
2. **Opsional / Fase Lanjutan**  
* rabbitmq-deployment  
* redis-deployment  
* worker-deployment  
* monitoring stack

Karena menggunakan Kubernetes, SRS ini menganggap aplikasi memang harus *container-native* sejak awal.

<a id="bab-vi"></a>
# BAB VI

<a id="kebutuhan-antarmuka"></a>
## KEBUTUHAN ANTARMUKA

<a id="6.1-antarmuka-pengguna"></a>
### 6.1 Antarmuka Pengguna

Frontend harus memiliki:

* Halaman *Dashboard* Utama  
* Halaman Input Data Keuangan  
* Halaman Input Stok  
* Panel Simulasi *What-If*  
* Panel *Alert*  
* Halaman Riwayat atau Laporan Jika Diaktifkan


<a id="6.2-antarmuka-api"></a>
### 6.2 Antarmuka API

Backend harus menyediakan API minimal untuk:

* *Auth*  
* *Cash Transactions*  
* *Inventory Items*  
* *Forecast*  
* *What-If Simulation*  
* *Alerts*  
* *Export*


<a id="6.3-antarmuka-layanan-internal"></a>
### 6.3 Antarmuka Layanan Internal

Jika ML service diaktifkan:

* Backend memanggil *service* Python melalui HTTP internal atau jaringan *cluster*.  
* *Service* ML mengembalikan hasil prediksi.  
* Hasil disimpan di *database* atau *cache*.

<a id="bab-vii"></a>
# BAB VII

<a id="kebutuhan-data"></a>
## KEBUTUHAN DATA

<a id="7.1-entitas-inti"></a>
### 7.1 Entitas Inti

* users  
* business\_profiles  
* cash\_transactions  
* inventory\_items  
* inventory\_movements  
* forecast\_runs  
* what\_if\_scenarios  
* alerts  
* export\_logs


<a id="7.2-aturan-data"></a>
### 7.2 Aturan Data

* Seluruh tabel memakai snake\_case.  
* *Foreign key* harus jelas antar entitas.  
* Setiap data *forecast* harus dapat ditelusuri ke data input asal.  
* Data simulasi harus memiliki penanda apakah hasilnya aktual atau *what-if*.


<a id="7.3-retensi-data"></a>
### 7.3 Retensi Data

* Histori transaksi dan histori simulasi disimpan untuk analisis lanjutan,  
* Data *alert* minimal disimpan untuk audit dan perbandingan proyeksi vs realita.

<a id="bab-viii"></a>
# BAB VIII

<a id="kebutuhan-proses-bisnis"></a>
## KEBUTUHAN PROSES BISNIS

<a id="8.1-alur-input"></a>
### 8.1 Alur Input

* *User login* atau masuk ke mode bisnis aktif.  
* *User* menambah pemasukan / pengeluaran.  
* *User* menambah atau memperbarui stok.  
* *Backend* menyimpan data.  
* *Backend* menghitung ulang proyeksi.  
* *Dashboard* menampilkan hasil terbaru.


<a id="8.2-alur-what-if"></a>
### 8.2 Alur What-If

* *User* membuka panel simulasi.  
* *User* menggeser *slider*.  
* Sistem menghitung ulang dampak parameter.  
* Grafik dan angka proyeksi berubah *real-time*.  
* *User* membandingkan skenario dasar dan skenario simulasi.

<a id="8.3-alur-alert"></a>
### 8.3 Alur Alert

* *Forecast* dihitung.  
* Sistem membandingkan hasil dengan *threshold*.  
* Jika melampaui batas kritis, *alert* dibuat.  
* *Banner* merah/kuning tampil di *dashboard*.  
* Status *alert* tersimpan.

<a id="bab-ix"></a>
# BAB IX

<a id="kebutuhan-pengujian"></a>
## KEBUTUHAN PENGUJIAN

<a id="9.1-unit-test"></a>
### 9.1 Unit Test

- [ ] Validasi input.  
- [ ] Fungsi kalkulasi linier.  
- [ ] Fungsi *threshold alert*.

<a id="9.2-integration-test"></a>
### 9.2 Integration Test

- [ ] Frontend ke backend.  
- [ ] Backend ke database.  
- [ ] Backend ke ML service.

<a id="9.3-end-to-end-test"></a>
### 9.3 End-to-End Test

Input data → *forecast* → *what-if* → *alert*.

<a id="9.4-performance-test"></a>
### 9.4 Performance Test

- [ ] Respons grafik.  
- [ ] Waktu *response* API.  
- [ ] Stabilitas *dashboard* saat data bertambah.

Pengujian penting karena proposal menargetkan akurasi kalkulasi dan *render* yang cepat sebagai indikator keberhasilan sistem.

<a id="bab-x"></a>
# BAB X

<a id="kebutuhan-deployment-&-operasional"></a>
## KEBUTUHAN DEPLOYMENT & OPERASIONAL

<a id="10.1-containerization"></a>
### 10.1 Containerization

Setiap *service* harus punya Dockerfile sendiri, yaitu di frontend, backend, dan ML service.

<a id="10.2-orkestrasi-kubernetes"></a>
### 10.2 Orkestrasi Kubernetes

Kubernetes dipakai untuk isolasi *service*, *deployment* konsisten, *scaling*, *update* tanpa *downtime* besar, memudahkan pemisahan *workload* backend dan ML.

<a id="10.3-environment"></a>
### 10.3 Environment

Minimal *environment*:

* *Development*  
* *Staging*  
* *Production*

<a id="10.4-konfigurasi-rahasia"></a>
### 10.4 Konfigurasi Rahasia

Rahasia seperti:

* DB *password*,  
* JWT *secret*,  
* API key,  
* *service token*

harus disimpan di Kubernetes *Secret* atau sistem *secret manager*, bukan di kode.

<a id="bab-xi"></a>
# BAB XI

<a id="batasan-sistem"></a>
## BATASAN SISTEM

<a id="11.1-mvp"></a>
### 11.1 MVP

* Input data operasional  
* *Dashboard* visual  
* Simulasi *what-if*  
* *Alert* visual  
* Kalkulasi linier  
* *Deployment containerized*


<a id="11.2-non-mvp"></a>
### 11.2 Non-MVP

* Integrasi POS  
* Integrasi rekening bank  
* ML *time-series* penuh  
* *Anomaly detection*  
* Otomatisasi *supplier*  
* Draft PO otomatis  
* *Push notification*  
* *Hardware integration* seperti scanner atau IoT


<a id="11.3-kriteria-penerimaan"></a>
### 11.3 Kriteria Penerimaan

Sistem dianggap memenuhi SRS jika:

* *User* dapat memasukkan data kas dan stok.  
* *Dashboard* menampilkan *forecast* 30 hari.  
* *Slider what-if* mengubah hasil secara *real-time*.  
* *Alert* muncul pada kondisi kritis sesuai *threshold*.  
* Sistem berjalan stabil di *container*.  
* Service dapat di-*deploy* ke Kubernetes.  
* Hasil kalkulasi konsisten dengan logika linier MVP.  
* Struktur repo dan penamaan mengikuti konvensi proyek.


<a id="11.4-prioritas-implementasi"></a>
### 11.4 Prioritas Implementasi

1. **Prioritas Tinggi**  
- [ ] CRUD data keuangan  
- [ ] CRUD stok  
- [ ] *Forecast engine*  
- [ ] *Dashboard*  
- [ ] *What-if*  
- [ ] *Alert engine*  
- [ ] Kubernetes deployment backend, frontend, dan database  
2. **Prioritas Menengah**  
- [ ] *Export* laporan  
- [ ] *History* simulasi  
- [ ] *Login/register*  
- [ ] Multi-profil usaha  
3. **Prioritas Rendah / Roadmap**  
- [ ] RabbitMQ  
- [ ] *Email notification*  
- [ ] ML *service* penuh  
- [ ] POS *integration*  
- [ ] Bank sync  
- [ ] *Push notification*  
- [ ] *Automated* PO

<a id="bab-xii"></a>
# BAB XII

<a id="kesimpulan"></a>
## KESIMPULAN

KasandraApp pada fase ini paling tepat didefinisikan sebagai platform web prediktif untuk UMKM yang fokus pada empat inti: input data, proyeksi, simulasi, dan *alert*. Dengan memakai Kubernetes, desain sistem sebaiknya langsung dibangun sebagai arsitektur *container-native* yang memisahkan frontend, backend, dan ML service sejak awal. Itu membuat MVP tetap realistis, tetapi tetap siap naik kelas ke fase 100% tanpa bongkar total arsitektur.