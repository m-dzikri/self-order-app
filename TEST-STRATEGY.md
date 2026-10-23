# Comprehensive Test Strategy & Plan (TEST-STRATEGY.md)
## Kopi Corat-Coret – Self-Order Web App ("Sketchbook Kafe")

- **Version:** 1.0.0
- **Status:** Approved / Pre-Implementation Baseline
- **Source Documents:** [`PRD.md`](file:///d:/Projects/stud-web/PRD.md) (v3.0.0), [`FEATURES.md`](file:///d:/Projects/stud-web/FEATURES.md) (v2.0.0), [`RULES.md`](file:///d:/Projects/stud-web/RULES.md) (v2.0.0), [`RFCS.md`](file:///d:/Projects/stud-web/RFCS.md)
- **Change Request Record:** [`changes/CHANGE-REQUEST-001.md`](file:///d:/Projects/stud-web/changes/CHANGE-REQUEST-001.md)

---

## 1. Test Baseline & Environment

### Existing Test Suite Baseline
- **Existing Test Files:** 0
- **Existing Tests Executed:** 0 tests (Passing: 0, Failing: 0)
- **Baseline Assessment:** Repositori saat ini berada pada tahap perencanaan pra-implementasi (*pre-implementation*). Belum ada kode program atau berkas pengujian yang ditulis sebelumnya.
- **Status Indikator:** Seluruh kasus uji (*test cases*) yang tercantum dalam dokumen ini berstatus **PROPOSED** dan akan diotomasi seiring implementasi masing-masing RFC.

---

## 2. Product Type & Quality Scope

- **Product Type:** `web app` (Fullstack Web Application: Laravel Backend + Inertia React Frontend + Filament Admin)

### Applicable Quality Checks Probed:
- **Auth & Session Testing:** Pengujian sesi ganda (*Guest Session* via session token vs *Member Account* via Laravel Auth), serta otentikasi aman guard Filament Admin.
- **Authorization per Resource:** Verifikasi hak akses; pelanggan hanya dapat melihat status pesanan miliknya, sedangkan staf kasir/admin mengelola pesanan via panel Filament terproteksi.
- **Database & Migration Testing:** Uji integritas skema SQLite/MySQL, constraints foreign key, dan seeder menu awal.
- **Accessibility (a11y):** Kontras warna teks espresso `#4A2C17` terhadap latar kertas `#FFF9EF`, target sentuh minimal 44x44px.
- **Responsive Layout Testing:** Pengujian rendering mobile portrait (360px - 430px) pada sisi pelanggan, dan responsivitas tablet/desktop pada panel Filament Admin.
- **Browser Compatibility:** Verifikasi lintas peramban (Chrome Android, Safari iOS, WebView in-app).
- **Page-Load Performance:** Waktu muat awal di bawah 2 detik dengan Vite asset compilation.

### Skipped Quality Checks (with Justification):
- `binary size`: Diabaikan karena aplikasi dijalankan langsung via browser web tanpa paket instalasi binary native (APK/IPA).
- `offline sync`: Diabaikan karena pemesanan dan pelacakan status pesanan secara esensial memerlukan koneksi internet aktif ke kafe.

---

## 3. Test Layers & Architecture

### A. Unit Testing
- Pengujian fungsi murni JavaScript:
  - `formatRupiah(amount)`: Memastikan format Rupiah Indonesia selalu tepat tanpa desimal.
  - Perhitungan keranjang: Kalkulasi subtotal, diskon kupon 10%, dan PB1 restoran 10% tanpa galat floating point.
- Pengujian model Eloquent Laravel:
  - Relasi `Category` -> `Menu` -> `MenuModifier`.
  - Mutasi status pesanan pada model `Order`.

### B. Integration Testing
- Controller Inertia & Response:
  - `GET /` (Welcome): Membaca query `table` dan mengoper props sesi yang tepat.
  - `GET /menu`: Mengoper data kategori dan katalog menu aktif dari database.
  - `POST /order/checkout`: Menerima pesanan, memvalidasi kupon & harga, menyimpan ke database dalam transaksi `DB::transaction`.
- Filament Admin CRUD:
  - Penambahan dan penyuntingan menu beserta kustomisasi varian.
  - Tombol aksi kasir "Konfirmasi Lunas" yang mengubah status pesanan.

### C. End-to-End (E2E) Testing
- **User Journey 1 (Dine-In):** Scan QR meja `?table=12` ➔ Pilih Kopi Susu Less Sugar + Oat Milk ➔ Pasang Kupon `SKETCHKOPI` ➔ Bayar QRIS ➔ Pantau status hingga "Siap Diantar".
- **User Journey 2 (Takeaway):** Akses tanpa QR ➔ Isi form nama & WhatsApp ➔ Checkout Bayar di Kasir ➔ Kasir konfirmasi via Filament ➔ Status berubah real-time.

### D. Security & Form Validation
- Sanitasi input XSS pada nama pemesan dan catatan barista.
- Validasi regex nomor WhatsApp Indonesia (`/^08[0-9]{8,11}$/`).
- Proteksi CSRF pada rute mutasi Inertia.
- Proteksi otentikasi pada rute `/admin` Filament.

---

## 4. Test Plans by RFC

## RFC-001: Fondasi Proyek Laravel 11, Inertia React, dan Desain Sketchbook Kafe

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-001-1** | Rendering Root Template Inertia | Must | Integration | **Langkah:** Buka rute root `/`.<br>**Ekspektasi:** Server me-render `resources/views/app.blade.php` dengan tag `#app` Inertia dan asset Vite tanpa error 500. |
| **TC-001-2** | Format Mata Uang `formatRupiah` | Must | Unit | **Langkah:** Panggil `formatRupiah(28000)`, `formatRupiah(0)`, `formatRupiah('5000')`.<br>**Ekspektasi:** Menghasilkan persis `Rp 28.000`, `Rp 0`, dan `Rp 5.000`. |
| **TC-001-3** | Token CSS & Font Loading | Must | Visual | **Langkah:** Periksa computed style peramban.<br>**Ekspektasi:** Background adalah `#FFF9EF`, teks menggunakan `Nunito Sans`, judul menggunakan `Epilogue`, tombol memiliki hard shadow `3px 3px 0px #4A2C17`. |

---

## RFC-002: Dashboard Admin Filament – Manajemen Menu, Kategori, Varian & Stok

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-002-1** | CRUD Kategori Menu Filament | Must | Integration | **Langkah:** Login ke `/admin`, buka menu Kategori, buat kategori baru "Manual Brew".<br>**Ekspektasi:** Kategori tersimpan di tabel `categories` dan tampil pada tabel data Filament. |
| **TC-002-2** | CRUD Menu dengan Varian Modifiers | Must | Integration | **Langkah:** Buat menu "Es Kopi Corat-Coret", tambahkan modifier Susu Oat (+Rp 6.000) dan Topping Espresso Shot (+Rp 5.000).<br>**Ekspektasi:** Record menu dan modifier tersimpan dengan relasi foreign key yang benar. |
| **TC-002-3** | Toggle Ketersediaan Stok | Must | Integration | **Langkah:** Ubah toggle `is_in_stock` menu menjadi false.<br>**Ekspektasi:** Status stok berubah seketika dan menu ditandai "Habis" pada katalog publik. |

---

## RFC-003: Alur Sesi, Deteksi Meja QR, dan Formulir Takeaway

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-003-1** | Deteksi Meja Otomatis via QR Code | Must | E2E | **Langkah:** Buka URL `/?table=12`.<br>**Ekspektasi:** Halaman pembuka menampilkan stiker "MEJA 12", sesi tersimpan sebagai Dine-In. |
| **TC-003-2** | Inisialisasi Mode Takeaway | Must | E2E | **Langkah:** Buka URL `/` tanpa query meja.<br>**Ekspektasi:** Aplikasi membuka formulir Takeaway untuk input data pemesan. |
| **TC-003-3** | Validasi Input Form Takeaway | Must | Unit/E2E | **Langkah:** Input nama 2 karakter dan nomor WA `12345`.<br>**Ekspektasi:** Form menolak submit dan memunculkan pesan error coretan yang jelas. |
| **TC-003-4** | Salin Sandi Wi-Fi Satu-Ketukan | Could | E2E | **Langkah:** Ketuk teks sandi Wi-Fi `ngopiyuk123`.<br>**Ekspektasi:** Teks tersalin ke clipboard dan badge "Tersalin! ✨" muncul. |

---

## RFC-004: Penjelajahan Katalog Menu & Drawer Kustomisasi Minuman/Makanan

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-004-1** | Filter Kategori Katalog Menu | Must | E2E | **Langkah:** Klik tab kategori "Makanan Berat".<br>**Ekspektasi:** Daftar menu seketika hanya menampilkan item dengan kategori Makanan Berat. |
| **TC-004-2** | Pencarian Menu & Empty State | Must | E2E | **Langkah:** Ketik "xyz123" pada kolom pencarian.<br>**Ekspektasi:** Tampil ilustrasi doodle cangkir sedih dengan pesan "Menu tidak ditemukan!". |
| **TC-004-3** | Drawer Kustomisasi Minuman & Add-on | Must | E2E | **Langkah:** Klik menu kopi, pilih Dingin, Less Sugar (50%), Oat Milk (+6k), Ekstra Shot (+5k).<br>**Ekspektasi:** Subtotal harga di drawer bertambah Rp 11.000 dari harga dasar kopi. |
| **TC-004-4** | Stepper Kuantitas Item | Must | Unit/E2E | **Langkah:** Klik tombol (+) hingga kuantitas 3 porsi.<br>**Ekspektasi:** Harga total di tombol "Tambah" terkalikan 3 secara presisi. |

---

## RFC-005: Keranjang Belanja, Kupon Promo & Nota Struk Kasir Robek

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-005-1** | Manipulasi Item Keranjang | Must | E2E | **Langkah:** Ubah kuantitas item di keranjang atau klik tombol hapus.<br>**Ekspektasi:** Item terhapus dan subtotal keranjang langsung disesuaikan. |
| **TC-005-2** | Validasi Kupon Diskon `SKETCHKOPI` | Must | Integration | **Langkah:** Masukkan kupon `SKETCHKOPI` pada subtotal Rp 50.000.<br>**Ekspektasi:** Diskon bernilai persis Rp 5.000 (10%) dan badge hijau hemat muncul. |
| **TC-005-3** | Kalkulasi Pajak PB1 & Total Nota | Must | Unit | **Langkah:** Subtotal Rp 50.000 - Diskon Rp 5.000 = Rp 45.000.<br>**Ekspektasi:** PB1 10% adalah Rp 4.500, dan Total Akhir adalah Rp 49.500. |
| **TC-005-4** | Empty State Keranjang Belanja | Should | Visual | **Langkah:** Buka keranjang saat kosong.<br>**Ekspektasi:** Tampil doodle "Keranjangmu masih kosong nih!" dan tombol CTA menu. |

---

## RFC-006: Alur Pembayaran (QRIS Dinamis 15 Menit & Bayar di Kasir)

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-006-1** | Pemilihan Metode Pembayaran | Must | E2E | **Langkah:** Pilih radio button "Bayar di Kasir".<br>**Ekspektasi:** Tombol checkout beralih ke aksi "Pesan & Bayar di Kasir". |
| **TC-006-2** | Render QRIS & Hitung Mundur 15 Menit | Must | E2E | **Langkah:** Pilih QRIS dan tekan bayar.<br>**Ekspektasi:** Modal menampilkan barcode QRIS dan timer mundur dari 15:00 per detik. |
| **TC-006-3** | Regenerasi QRIS Kedaluwarsa | Must | E2E | **Langkah:** Simulasikan timer mencapai 00:00.<br>**Ekspektasi:** Overlay kedaluwarsa muncul, tombol "Buat QRIS Baru" mereset timer ke 15:00. |
| **TC-006-4** | Pembuatan Pesanan Bayar di Kasir | Must | Integration | **Langkah:** Kirim checkout dengan metode `kasir`.<br>**Ekspektasi:** Pesanan tersimpan di database dengan status awal `unpaid_cashier`. |

---

## RFC-007: Operasional Kasir Filament & Pelacakan Pesanan Real-Time Pelanggan

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-007-1** | Konfirmasi Lunas Kasir di Filament | Must | Integration | **Langkah:** Kasir membuka `/admin/orders`, klik tombol "Konfirmasi Lunas" pada pesanan meja 12.<br>**Ekspektasi:** Status pesanan di database berubah dari `unpaid_cashier` menjadi `confirmed`. |
| **TC-007-2** | Pelacak Status Real-Time Pelanggan | Must | E2E | **Langkah:** Pelanggan membuka `/order/track/{id}` saat pesanan berstatus `confirmed`.<br>**Ekspektasi:** Stepper visual menunjukkan tahapan "Pesanan Diterima" dengan ikon berdenyut. |
| **TC-007-3** | Pembaruan Status ke Sedang Diracik & Siap | Must | E2E | **Langkah:** Kasir memajukan status ke `in_progress` lalu `ready`.<br>**Ekspektasi:** Layar pelanggan otomatis menampilkan status "Sedang Diracik" lalu "Siap Diambil/Diantar". |
| **TC-007-4** | Kontrol Simulasi Progres (Mode Demo) | Should | E2E | **Langkah:** Klik tombol "Simulasi Status" pada layar pelacak demo.<br>**Ekspektasi:** Status berpindah seketika untuk mempermudah evaluasi tampilan UI. |

---

## RFC-008: Autentikasi Akun Member, Polish UI & Pengujian E2E

| Test ID | Test Case | Priority | Tipe | Langkah Pengujian & Kriteria Penerimaan |
|---|---|:---:|:---:|---|
| **TC-008-1** | Registrasi & Login Member | Should | Integration | **Langkah:** Daftarkan akun baru dengan Nama "Budi", No WA `08123456789`, PIN `123456`.<br>**Ekspektasi:** Akun tersimpan di tabel `users` dan sesi login aktif. |
| **TC-008-2** | Riwayat Pesanan Member | Should | E2E | **Langkah:** Buka modal riwayat pesanan member.<br>**Ekspektasi:** Menampilkan daftar struk pesanan yang pernah dibuat oleh akun tersebut. |
| **TC-008-3** | Animasi Konfeti Perayaan | Must | Visual | **Langkah:** Selesaikan checkout pesanan.<br>**Ekspektasi:** Efek konfeti `canvas-confetti` muncul meriah di layar. |
| **TC-008-4** | Audit Responsivitas & Zero Overflow | Must | Visual/E2E | **Langkah:** Jalankan pengujian pada viewport 360px, 375px, 414px, dan 768px.<br>**Ekspektasi:** Tidak ada horizontal scrollbar overflow pada antarmuka pelanggan. |

---

## 5. Test Data Strategy (Seeders & Fixtures)

- **Database Test Environment:** Menggunakan SQLite in-memory (`:memory:`) untuk eksekusi unit/feature test cepat di Laravel.
- **Data Seeders:**
  - `CategorySeeder`: 5 kategori utama kafe (*Kopi Susu, Manual Brew, Makanan Berat, Camilan, Non-Kopi*).
  - `MenuSeeder`: 12 menu lengkap dengan foto polaroid dan varian modifiers (susu, gula, topping).
  - `CouponSeeder`: Kupon aktif `SKETCHKOPI` (10% potongan).
  - `AdminUserSeeder`: Akun kasir/admin bawaan untuk pengujian panel Filament.
- **Pembersihan Data:** Setiap pengujian database menggunakan trait `RefreshDatabase` Laravel untuk mereset kondisi data ke keadaan bersih sebelum pengujian berikutnya berjalan.
