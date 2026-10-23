# Feature Specifications (FEATURES.md)
## Kopi Corat-Coret – Self-Order Web App ("Sketchbook Kafe")

- **Version:** 1.0.0
- **Status:** Approved for Implementation Planning
- **Source Document:** [`PRD.md`](file:///d:/Projects/stud-web/PRD.md) (v2.0.0)
- **Review Report:** [`PRD-REVIEW.md`](file:///d:/Projects/stud-web/PRD-REVIEW.md)
- **Design Reference:** [`desain-web/sketchbook_kafe/DESIGN.md`](file:///d:/Projects/stud-web/desain-web/sketchbook_kafe/DESIGN.md)

---

## 1. Product Overview
**Kopi Corat-Coret Self-Order Web App** adalah aplikasi web pemesanan mandiri berbasis mobile-first untuk kafe bertema "Sketchbook Kafe". Pelanggan dapat memesan makanan dan minuman langsung dari smartphone mereka tanpa perlu memasang aplikasi native. Sistem mengenali nomor meja secara otomatis melalui URL QR Code (`?table=XX`) untuk pelanggan Dine-In, serta menyediakan formulir khusus untuk pesanan Takeaway (bawa pulang). Seluruh transaksi, keranjang, kustomisasi rasa, struk kasir robek, pembayaran (QRIS/Kasir), dan pelacakan status pesanan real-time dikelola secara mandiri menggunakan browser client-side storage (`localStorage`).

---

## 2. Feature Summary & Metrics

### Rekapitulasi Berdasarkan Prioritas MoSCoW
| Prioritas | Jumlah Fitur | Persentase | Deskripsi |
|---|:---:|:---:|---|
| **Must Have** | 19 | 63.3% | Fondasi kritis minimum viable product (MVP) |
| **Should Have** | 6 | 20.0% | Fitur penting penyempurna pengalaman pengguna |
| **Could Have** | 1 | 3.3% | Fitur kemudahan pelengkap bila waktu memungkinkan |
| **Won't Have** | 4 | 13.3% | Di luar cakupan rilis MVP (direncanakan untuk fase berikutnya) |
| **Total** | **30** | **100%** | Seluruh requirement PRD terpetakan 100% |

### Rekapitulasi Berdasarkan Kategori
| Kategori | Jumlah Fitur | Rentang ID |
|---|:---:|:---:|
| 1. Sesi & Routing Meja | 4 | F1 - F4 |
| 2. Penjelajahan Menu & Pencarian | 3 | F5 - F7 |
| 3. Kustomisasi Menu & Add-on | 4 | F8 - F11 |
| 4. Keranjang Belanja & Struk Kasir | 4 | F12 - F15 |
| 5. Checkout & Pembayaran | 4 | F16 - F19 |
| 6. Pelacakan Pesanan Real-Time | 3 | F20 - F22 |
| 7. Autentikasi & Akun Member | 2 | F23 - F24 |
| 8. Fondasi UI & LocalStorage | 2 | F25 - F26 |
| 9. Di Luar Cakupan (Out of Scope) | 4 | F27 - F30 |

---

## 3. Feature Tables by Category

### Kategori 1: Sesi & Routing Meja (Session & Routing)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F1 | Deteksi Meja Otomatis via QR Code | Must | FR-1 | Low | 1. URL dengan query `?table=12` otomatis mendeteksi dan mengunci nomor meja.<br>2. Halaman pembuka menampilkan lencana "MEJA 12" dengan pin doodle.<br>3. Nomor meja tersimpan persisten di sesi pengguna. |
| F2 | Inisialisasi Pesanan Mode Takeaway | Must | FR-2, FR-28 | Low | 1. URL tanpa parameter meja otomatis mengarahkan ke mode Takeaway.<br>2. Form meminta input Nama (min 3 karakter), No. WhatsApp valid (`08...`), dan Estimasi Jam Ambil (min 10 menit ke depan).<br>3. Validasi error bergaya coretan muncul jika input tidak sesuai. |
| F3 | Widget Informasi Wi-Fi & Kupon Promo | Should | FR-3 | Low | 1. Kartu memo pembuka menampilkan SSID `CoratCoret_Guest` dan sandi `ngopiyuk123`.<br>2. Banner promo menampilkan voucher `SKETCHKOPI` (diskon 10%). |
| F4 | Fitur Satu-Ketukan Salin Sandi Wi-Fi | Could | FR-29 | Low | 1. Mengetuk area sandi Wi-Fi otomatis menyalin `ngopiyuk123` ke clipboard.<br>2. Menampilkan feedback visual "Tersalin!" bergaya stempel. |

### Kategori 2: Penjelajahan Menu & Pencarian (Menu Browsing & Search)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F5 | Katalog Menu Berdasarkan Kategori | Must | FR-6, FR-8 | Medium | 1. Menampilkan tab kategori: Semua, Kopi Susu, Manual Brew, Makanan Berat, Camilan, Non-Kopi.<br>2. Setiap kartu menu memuat foto doodle polaroid, nama, harga (Rp), badge promo, dan tombol "Tambah".<br>3. Filter kategori merespons seketika saat tab diklik. |
| F6 | Pencarian Menu Instan Real-Time | Must | FR-7 | Low | 1. Input pencarian memfilter daftar menu saat pengguna mengetik.<br>2. Pencarian mencakup pencocokan nama menu dan deskripsi bahan. |
| F7 | Tampilan Empty State Pencarian Menu | Should | FR-27 | Low | 1. Bila kata kunci pencarian tidak ditemukan, tampil ilustrasi doodle cangkir sedih.<br>2. Menampilkan pesan ramah "Menu tidak ditemukan, coba cari kudapan lain!". |

### Kategori 3: Kustomisasi Menu & Add-on (Item Modifiers)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F8 | Modal Drawer Kustomisasi Minuman | Must | FR-9, FR-10 | Medium | 1. Mengklik menu minuman membuka drawer modal dari bawah.<br>2. Opsi suhu: Dingin (Ice) / Panas (Hot).<br>3. Opsi gula: Tanpa Gula (0%), Less Sugar (50%), Normal (100%), Extra Sweet (120%).<br>4. Opsi susu: Fresh Milk (Gratis), Oat Milk (+Rp 6.000), Almond Milk (+Rp 7.000), Soy Milk (+Rp 5.000) dengan pembaruan harga live. |
| F9 | Tambahan Ekstra / Topping Berbayar | Must | FR-25 | Low | 1. Mendukung pemilihan multi-select: Ekstra Espresso Shot (+Rp 5.000), Grass Jelly Cincau (+Rp 4.000).<br>2. Subtotal pada drawer kustomisasi otomatis bertambah sesuai add-on terpilih. |
| F10 | Kustomisasi Menu Makanan | Should | FR-11 | Low | 1. Menu makanan berat menyediakan pilihan level pedas (Level 0 - Level 3) dan tingkat kematangan telur (½ Matang / Matang). |
| F11 | Catatan Barista & Stepper Jumlah Item | Must | FR-12, FR-13 | Low | 1. Field teks catatan khusus (misal: "jangan terlalu manis").<br>2. Stepper kuantitas (+ / -) menambah atau mengurangi jumlah porsi.<br>3. Tombol "Tambah ke Keranjang" memuat harga total varian yang telah dihitung. |

### Kategori 4: Keranjang Belanja & Struk Kasir (Cart & Bill Calculation)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F12 | Ringkasan Keranjang & Modifikasi Item | Must | FR-14 | Medium | 1. Menampilkan daftar item, kuantitas, rincian varian/add-on, dan tombol hapus.<br>2. Tombol ubah varian membuka kembali drawer kustomisasi.<br>3. Kuantitas dapat disesuaikan langsung di dalam keranjang. |
| F13 | Input & Validasi Kupon Diskon Promo | Must | FR-15 | Low | 1. Pengguna dapat memasukkan kode kupon promo.<br>2. Kode `SKETCHKOPI` memotong 10% dari subtotal belanja.<br>3. Menampilkan label diskon hemat dan tombol ganti/hapus kupon. |
| F14 | Perhitungan Pajak PB1 & Total Nota Robek | Must | FR-16, FR-17 | Low | 1. Rincian nota: Subtotal, Diskon Kupon, PB1 Restoran (10%), dan Total Bayar.<br>2. Desain mengikuti struk kasir bergaris perforasi zigzag di bagian bawah nota sesuai mock-up [04_keranjang_struk](file:///d:/Projects/stud-web/desain-web/04_keranjang_struk). |
| F15 | Tampilan Empty State Keranjang Belanja | Should | FR-27 | Low | 1. Saat keranjang bernilai 0 item, tampil pesan doodle "Keranjangmu masih kosong nih!".<br>2. Terdapat tombol CTA "+ Mulai Pilih Menu". |

### Kategori 5: Checkout & Pembayaran (Checkout & Payment)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F16 | Pemilihan Metode Pembayaran | Must | FR-18 | Low | 1. Radio selector untuk 3 metode: QRIS Instan, E-Wallet Langsung, dan Bayar di Kasir.<br>2. Opsi aktif memiliki border tegas dan doodle checkmark. |
| F17 | Layar Pembayaran QRIS Dinamis & Timer | Must | FR-19 | Medium | 1. Menampilkan barcode QRIS dinamis berlogo kafe.<br>2. Timer hitung mundur 15 menit berjalan mundur detik demi detik.<br>3. Tombol simpan/unduh QR code ke galeri smartphone. |
| F18 | Penanganan QRIS Kedaluwarsa & Regenerasi | Must | FR-26 | Low | 1. Ketika timer mencapai 00:00, QR ditutup overlay "QR Kedaluwarsa".<br>2. Tombol "Buat QRIS Baru" me-reset timer dan membuat sesi pembayaran baru. |
| F19 | Alur Pembayaran di Kasir | Must | FR-20 | Low | 1. Memilih bayar di kasir membuat pesanan berstatus "Menunggu Pembayaran di Kasir".<br>2. Layar memberikan instruksi jelas untuk mendatangi meja kasir membawa nomor pesanan. |

### Kategori 6: Pelacakan Pesanan Real-Time (Order Tracking)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F20 | Halaman Pelacak Pesanan & Ringkasan | Must | FR-21, FR-24 | Medium | 1. Pengalihan otomatis setelah checkout ke halaman pelacak pesanan.<br>2. Menampilkan nomor pesanan, nomor meja (atau badge Takeaway), ringkasan item, dan tombol "Panggil Pelayan". |
| F21 | Stepper Visual Status Perjalanan Pesanan | Must | FR-22 | Medium | 1. Indikator tahapan: (Menunggu Kasir bila pilih kasir) -> Pesanan Diterima -> Sedang Diracik -> Siap Diambil/Diantar.<br>2. Ikon tahapan aktif menyala dengan mikro-animasi denyut (pulse). |
| F22 | Tombol Simulasi Kontrol Progres Pesanan | Should | FR-23 | Low | 1. Khusus mode demo/testing, disediakan tombol kontrol untuk memajukan status pesanan secara manual guna memverifikasi perubahan tampilan UI. |

### Kategori 7: Autentikasi & Akun Member (User Accounts)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F23 | Alur Pemesanan Cepat Guest Checkout | Must | FR-4 | Low | 1. Pelanggan dapat memesan secara instan tanpa perlu registrasi atau login password.<br>2. Data sesi tamu tersimpan secara transparan di perangkat. |
| F24 | Registrasi, Login & Riwayat Member | Should | FR-5 | Medium | 1. Modal pendaftaran & login member sederhana (Nama, No. WhatsApp, PIN).<br>2. Member dapat melihat riwayat struk pesanan terdahulu yang tersimpan di `localStorage`. |

### Kategori 8: Fondasi UI & LocalStorage (UI Foundation & LocalStorage)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F25 | Sistem Desain Tactile Sketchbook Kafe | Must | NFR-1, NFR-2 | High | 1. Variabel CSS warna, Epilogue & Nunito Sans, hard shadow `3px 3px 0px #4A2C17`.<br>2. Washi tape, divider gerigi struk, dan sudut asimetris organik sesuai [DESIGN.md](file:///d:/Projects/stud-web/desain-web/sketchbook_kafe/DESIGN.md).<br>3. Waktu respon klik < 100ms dengan efek bouncer tactile. |
| F26 | Persistensi State LocalStorage & Form | Must | NFR-3, NFR-4, NFR-5, NFR-6 | Medium | 1. Kunci data terstruktur (`kopi_cart`, `kopi_orders`, `kopi_member_session`, `kopi_active_order_id`).<br>2. Penanganan try-catch saat storage gagal.<br>3. Responsive layout mobile portrait (320px - 430px) hingga tablet. |

### Kategori 9: Di Luar Cakupan (Out of Scope / Won't Have)
| ID | Feature | Priority | Source | Complexity | Acceptance Criteria |
|---|---|:---:|:---:|:---:|---|
| F27 | Integrasi Live Payment Gateway & Bank Webhook | Won't | Out of Scope | High | Menggunakan simulasi QRIS & pembayaran kasir internal tanpa integrasi webhook bank pihak ketiga pada rilis awal. |
| F28 | Notifikasi Pesan Gateway WhatsApp Business API | Won't | Out of Scope | Medium | Pelanggan memantau status pesanan langsung dari layar web tracker tanpa pengiriman notifikasi WA otomatis berbayar. |
| F29 | Tablet Khusus Kitchen Display System (KDS) | Won't | Out of Scope | High | Fokus utama MVP adalah antarmuka pelanggan; antarmuka dapur terpisah ditunda untuk fase berikutnya. |
| F30 | Input Nomor Meja Manual untuk Dine-In Tanpa QR | Won't | Out of Scope | Low | Dine-In wajib melalui pemindaian QR meja; akses tanpa QR otomatis dialihkan ke Takeaway demi mencegah salah input meja. |

---

## 4. Requirement Traceability Matrix (PRD to Features)

| PRD Requirement ID | Feature ID Terkait | Status Cakupan |
|---|---|:---:|
| **FR-1** | F1 | Covered (Must) |
| **FR-2** | F2 | Covered (Must) |
| **FR-3** | F3 | Covered (Should) |
| **FR-4** | F23 | Covered (Must) |
| **FR-5** | F24 | Covered (Should) |
| **FR-6** | F5 | Covered (Must) |
| **FR-7** | F6 | Covered (Must) |
| **FR-8** | F5 | Covered (Must) |
| **FR-9** | F8 | Covered (Must) |
| **FR-10** | F8 | Covered (Must) |
| **FR-11** | F10 | Covered (Should) |
| **FR-12** | F11 | Covered (Must) |
| **FR-13** | F11 | Covered (Must) |
| **FR-14** | F12 | Covered (Must) |
| **FR-15** | F13 | Covered (Must) |
| **FR-16** | F14 | Covered (Must) |
| **FR-17** | F14 | Covered (Must) |
| **FR-18** | F16 | Covered (Must) |
| **FR-19** | F17 | Covered (Must) |
| **FR-20** | F19 | Covered (Must) |
| **FR-21** | F20 | Covered (Must) |
| **FR-22** | F21 | Covered (Must) |
| **FR-23** | F22 | Covered (Should) |
| **FR-24** | F20 | Covered (Must) |
| **FR-25** | F9 | Covered (Must) |
| **FR-26** | F18 | Covered (Must) |
| **FR-27** | F7, F15 | Covered (Should) |
| **FR-28** | F2 | Covered (Must) |
| **FR-29** | F4 | Covered (Could) |
| **NFR-1** | F25 | Covered (Must) |
| **NFR-2** | F25 | Covered (Must) |
| **NFR-3** | F26 | Covered (Must) |
| **NFR-4** | F26 | Covered (Must) |
| **NFR-5** | F26 | Covered (Must) |
| **NFR-6** | F26 | Covered (Must) |
| **Out-of-Scope (Payment Gateway API)** | F27 | Covered (Won't) |
| **Out-of-Scope (WhatsApp Gateway API)** | F28 | Covered (Won't) |
| **Out-of-Scope (KDS Tablet Back-Office)** | F29 | Covered (Won't) |
| **Out-of-Scope (Manual Table Input)** | F30 | Covered (Won't) |
