# RFC-003: Alur Sesi, Deteksi Meja QR, dan Formulir Takeaway

**Features**: F1, F2, F3, F4, F23, F26
**Depends on**: RFC-001
**Rules**: ARCH-4, UI-1, UI-4, UI-5, UI-6, SEC-1, SEC-2, CODE-1
**Complexity**: Medium

---

## 1. Summary
RFC ini mengimplementasikan titik masuk utama pelanggan ke aplikasi web:
1. Membaca parameter query URL `?table=XX` untuk mengunci mode **Dine-In (Makan di Tempat)** dengan nomor meja otomatis.
2. Mengalihkan akses langsung tanpa parameter meja ke formulir pesanan **Takeaway (Bawa Pulang)** dengan validasi input ramah corat-coret.
3. Menyediakan kartu memo informasi koneksi Wi-Fi kafe dengan fitur salin sandi satu-ketukan (*tap-to-copy*).
4. Menampilkan banner kupon promo pembuka `SKETCHKOPI` (diskon 10%).

---

## 2. Technical Approach & Architecture

### A. Routing Logic Pseudocode
```javascript
function resolveOrderSession(searchParams) {
  const tableParam = searchParams.get('table');
  if (tableParam) {
    return {
      type: 'dine_in',
      tableNumber: tableParam,
      locked: true
    };
  }
  return {
    type: 'takeaway',
    tableNumber: null,
    locked: false
  };
}
```

### B. File Structure
```
app/
├── Http/
│   └── Controllers/
│       └── OrderSessionController.php
resources/
├── js/
│   ├── Components/
│   │   ├── TableBadge.jsx
│   │   ├── WifiMemoCard.jsx
│   │   ├── PromoBanner.jsx
│   │   └── TakeawayFormModal.jsx
│   └── Pages/
│       └── Welcome.jsx
routes/
└── web.php
```

---

## 3. Implementation Details

- **Halaman Welcome (`resources/js/Pages/Welcome.jsx`)**: Mengadaptasi layout visual dari [`01_welcome_meja_12/code.html`](file:///d:/Projects/stud-web/desain-web/01_welcome_meja_12/code.html):
  - Strip dekorasi washi-tape di bagian atas.
  - Lencana stiker nomor meja miring `-1.5deg` berbayang solid `3px 3px 0px #4A2C17`.
  - Maskot "Si Corat ☕" dalam bingkai polaroid.
  - Banner kupon diskon `SKETCHKOPI`.
- **Fitur Tap-to-Copy Wi-Fi (`WifiMemoCard.jsx`)**:
  - Mengklik teks sandi `ngopiyuk123` menyalin teks ke `navigator.clipboard` dan menampilkan animasi stempel "Tersalin! ✨".
- **Formulir Takeaway (`TakeawayFormModal.jsx`)**:
  - Validasi Nama minimal 3 karakter.
  - Validasi No. WhatsApp format Indonesia (`/^08[0-9]{8,11}$/`).
  - Validasi jam pengambilan minimal 10 menit ke depan.

---

## 4. Acceptance Criteria

- [x] URL dengan `?table=12` otomatis menampilkan banner "MEJA 12" dan mengunci sesi Dine-In.
- [x] Akses URL tanpa parameter meja otomatis membuka form inisialisasi Takeaway.
- [x] Validasi error muncul jika nama < 3 karakter atau format WhatsApp tidak valid.
- [x] Mengetuk sandi Wi-Fi pada kartu memo berhasil menyalin `ngopiyuk123` ke clipboard.
- [x] Banner kupon menampilkan kode `SKETCHKOPI` (Diskon 10%).
- [x] Tombol CTA "Mulai Pesan" mengarahkan pelanggan ke halaman katalog menu.
- [x] Input teks disanitasi dari karakter berbahaya HTML sebelum dirender.

---

## Implementation Notes

Implementasi selesai (2026-10-24). Catatan deviasi dari isi RFC:

1. **`WelcomeController` diganti `OrderSessionController`** (§2B sudah menyebut nama ini; file lama dihapus via `git rm`). Rute: `GET /` (`welcome`), `POST /session/takeaway` (`session.takeaway`), `GET /katalog` (`catalog`).
2. **AC-6 "CTA → halaman katalog" dipenuhi dengan placeholder.** RFC-004 (katalog nyata) belum dimulai, sehingga dibuat `CatalogController` + `resources/js/Pages/Catalog.jsx` sebagai tujuan CTA. Katalog sesungguhnya (kategori, item, drawer kustomisasi) tetap scope RFC-004.
3. **Maskot "Si Corat" dirender sebagai SVG doodle inline** di `Welcome.jsx`, bukan gambar eksternal. Prototipe `01_welcome_meja_12/code.html` memakai URL `lh3.googleusercontent.com` yang tidak tersedia lokal; SVG inline deterministik, offline, dan sesuai bahasa doodle UI-5.
4. **Warna prototipe di luar palet UI-2 dipetakan ke token resmi**: `tertiary-container`/`secondary-fixed` prototipe → `--color-promo` (#FF7A59) untuk banner promo, `--color-primary` (#FFC93C) untuk lencana meja & washi tape, `--color-container` (#FFF1D6) untuk highlight headline, `--color-error` (#BA1A1A) untuk validasi.
5. **Gaya error "coretan"**: teks `--color-error` + garis wavy SVG di bawah field invalid (`SquiggleError` di `TakeawayFormModal.jsx`). DESIGN.md tidak menspesifikasikan state error khusus; mengikuti kosakata `doodle-squiggly` (UI-5).
6. **`?table` tidak valid diabaikan** (bukan 4xx): nilai non-angka atau >3 digit (`abc`, `1234`) jatuh kembali ke mode Takeaway. QR meja yang sah selalu berupa angka 1–3 digit. Diuji di `WelcomeSessionTest`.
7. **Sesi disimpan server-side** (Laravel session), bukan localStorage — RULES DATA-1 membatasi localStorage pada cache keranjang. Persistensi diuji lintas-request (`test_stored_session_persists_across_requests`).
8. **Sesi Dine-In terkunci (ARCH-4)**: `storeTakeaway` tidak pernah mengubah `mode`/`table_number` sesi dine-in; UI juga tidak menawarkan tombol "ganti ke bawa pulang" saat dine-in aktif.
9. **Sanitasi AC7 dua lapis**: React auto-escape (tanpa `dangerouslySetInnerHTML`) + `strip_tags()` server-side sebelum validasi & penyimpanan. Catatan: `strip_tags` membuang tag tapi meninggalkan teks di dalamnya (mis. `<script>alert(1)</script>Sasa` → `alert(1)Sasa`) — teks residual ini aman karena dirender sebagai text node.
10. **Deviasi tipe test**: TC-003-4 (tap-to-copy) diuji lewat `copyToClipboard` util dengan navigator mock di `node:test` (`copyToClipboard.test.js`); verifikasi visual stempel "Tersalin! ✨" butuh peramban asli (kandidat Dusk di RFC-008). Tidak ada DOM test tooling di stack saat ini, sehingga komponen JSX diverifikasi lewat unit test util murni + build bundle, bukan render test.
11. **Validasi pickup memakai resolusi menit**: perbandingan jam ambil "sudah lewat" dilakukan terhadap `now()->startOfMinute()` agar input-detik tidak membuat pickup yang baru saja lewat melompat ke hari berikutnya. Lewat tengah malam (mis. 23:55 → 00:10) tetap digulir ke hari berikutnya, konsisten di validator JS dan aturan server.

### Bukti Verifikasi (2026-10-24)

- `php artisan test` → **34 test passed (207 assertions)**, mencakup `WelcomeSessionTest` (TC-003-1, AC-1/2/5/6) dan `TakeawaySessionTest` (TC-003-2/3, AC-2/3/7 + ARCH-4).
- `npm test` → **18 test pass** (`validateTakeaway.test.js` TC-003-3 klien, `copyToClipboard.test.js` TC-003-4, `formatRupiah.test.js`).
- `npm run build` → sukses (Welcome 13.9 kB, Catalog 1.3 kB; stylesheet 15.4 kB, nol `#000000`).
- `vendor/bin/pint --test` → **passed** (seluruh repo).
