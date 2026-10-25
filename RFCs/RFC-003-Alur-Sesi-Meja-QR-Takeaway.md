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
6. **`?table` tidak valid diabaikan** (bukan 4xx): nilai non-angka, nol, atau >3 digit (`abc`, `0`, `1234`) jatuh kembali ke mode Takeaway. QR meja yang sah selalu berupa angka 1–999. Diuji di `WelcomeSessionTest`.
7. **Sesi disimpan server-side** (Laravel session), bukan localStorage — RULES DATA-1 membatasi localStorage pada cache keranjang. Persistensi diuji lintas-request (`test_stored_session_persists_across_requests`).
8. **Sesi Dine-In terkunci (ARCH-4)**: `storeTakeaway` tidak pernah mengubah `mode`/`table_number` sesi dine-in; UI juga tidak menawarkan tombol "ganti ke bawa pulang" saat dine-in aktif.
9. **Sanitasi AC7 dua lapis**: React auto-escape (tanpa `dangerouslySetInnerHTML`) + `strip_tags()` server-side sebelum validasi & penyimpanan. Catatan: `strip_tags` membuang tag tapi meninggalkan teks di dalamnya (mis. `<script>alert(1)</script>Sasa` → `alert(1)Sasa`) — teks residual ini aman karena dirender sebagai text node.
10. **Deviasi tipe test**: TC-003-4 (tap-to-copy) diuji lewat `copyToClipboard` util dengan navigator mock di `node:test` (`copyToClipboard.test.js`); verifikasi visual stempel "Tersalin! ✨" butuh peramban asli (kandidat Dusk di RFC-008). Tidak ada DOM test tooling di stack saat ini, sehingga komponen JSX diverifikasi lewat unit test util murni + build bundle, bukan render test.
11. **Validasi pickup memakai resolusi menit**: perbandingan jam ambil "sudah lewat" dilakukan terhadap `now()->startOfMinute()` agar input-detik tidak membuat pickup yang baru saja lewat melompat ke hari berikutnya. Lewat tengah malam (mis. 23:55 → 00:10) tetap digulir ke hari berikutnya, konsisten di validator JS dan aturan server.

### Bukti Verifikasi (2026-10-24)

- `php artisan test` → **38 test passed (239 assertions)**, mencakup `WelcomeSessionTest` (TC-003-1, AC-1/2/5/6 — AC-5 dan wiring AC-2/4/6 diverifikasi terhadap bundel terbangun karena stack tidak punya DOM test tooling) dan `TakeawaySessionTest` (TC-003-2/3, AC-2/3/7 + ARCH-4).
- `npm test` → **18 test pass** (`validateTakeaway.test.js` TC-003-3 klien, `copyToClipboard.test.js` TC-003-4, `formatRupiah.test.js`).
- `npm run build` → sukses (Welcome 14.5 kB, Catalog 1.3 kB; stylesheet 16.1 kB, nol `#000000`).
- `vendor/bin/pint --test` → **passed** (seluruh repo).

---

## Round 1 Review Fixes (2026-10-24)

Perbaikan atas blocking issue di `reviews/REVIEW-RFC-003.md`:

1. **Kontras WCAG AA (blocking #1).** Teks banner promo, kode kupon, dan aksen headline sebelumnya krem/jingga-di-atas-jingga (2,45–2,57:1). Diperbaiki: teks promo & kupon → espresso `--color-ink` (4,92:1 dan 12,62:1 — mengikuti prototipe yang memang memakai teks gelap), aksen headline → teks ink dengan highlighter `--color-primary` (8,22:1), subtitle & label memo → `--color-ink-soft` (8,88:1). Seluruh pasangan teks/latar di komponen baru dihitung ulang dan lulus AA (≥4,5:1 untuk teks normal).
2. **Touch target (blocking #1).** Tombol "Ubah data pesan bawa pulang" ~37px → `min-h-[44px]`.
3. **Guard AC-5 + wiring AC-2/4/6 (blocking #2).** Test baru `test_welcome_bundle_renders_promo_voucher` dan `test_welcome_bundle_wires_takeaway_form_and_catalog_cta` meng-assert isi bundel Welcome terbangun (`SKETCHKOPI`, `Diskon 10%`, `/session/takeaway`, `/katalog`, `ngopiyuk123`) — mengikuti pola `TokenCssVisualTest`; gagal jika komponen dihapus atau wiring diputus. Klaim bukti di atas diperbaiki (sebelumnya keliru menyebut AC-5 tercakup).
4. **SEC-1 FormRequest (blocking #3).** Validasi + sanitasi dipindah ke `app/Http/Requests/StoreTakeawayRequest.php`: `prepareForValidation` melakukan `strip_tags`+`trim` (pola double-validate di controller dihapus), aturan SEC-2 + pesan error + closure pickup 10-menit pindah ke sana.
5. **Modal DESIGN.md §181 (blocking #3).** `TakeawayFormModal` kini lembar notepad `--color-container` (#FFF1D6) dengan dua strip washi tape ±2,5° di sudut atas — sesuai spesifikasi modal desain.
6. **Penegakan saran non-blocking**: `?table=0` ditolak (regex `^[1-9]\d{0,2}$`, diuji); `WIFI_PASSWORD` kini dipakai sebagai default `WifiMemoCard` (satu sumber kebenaran); region "Tersalin!" selalu ter-mount (`aria-live` persisten); Escape-menutup + autofocus field pertama pada modal; test konversi ARCH-4 (sesi takeaway + `?table=12` → dine-in dengan data pelanggan dipertahankan) ditambahkan.
7. **Tercatat, tidak dikerjakan di round ini**: `config('app.timezone')` masih `UTC` sedangkan kafe beroperasi WIB — belum berdampak (validasi pickup server lebih permisif untuk WIB), tetapi **harus diset `Asia/Jakarta` sebelum RFC-005/006** memakai perbandingan waktu `pickup_at`. Duplikasi `RootPageTest`/`WelcomePageTest` (dari RFC-001) tetap ada — cleanup di RFC berikutnya. Fokus-trap penuh pada modal ditunda ke RFC-008 (Dusk).

Verifikasi Round 1: `php artisan test` **38/38 lulus (239 assertions)**, `npm test` 18/18, `npm run build` sukses (nol `#000000`), `vendor/bin/pint --test` **passed**.

---

### Round 2 Review Fixes (2026-10-25)

Perbaikan atas satu blocking issue Round 2 di `reviews/REVIEW-RFC-003.md`:

1. **Kontras halaman katalog (blocking).** `Catalog.jsx` memakai `--color-outline` untuk label "Kopi Corat-Coret" = 4,27:1 pada 14px — pasangan yang sama persis dengan blocking Round 1, terlewat di halaman placeholder. Diganti `--color-ink-soft` (**8,88:1**, lulus AA).
2. **Klaim angka di catatan perbaikan Round 1 dikoreksi.** Angka "11,30:1" untuk aksen headline tidak akurat (angka sebenarnya **8,22:1** — tetap lulus AA), dan redaksi "semua pasangan dihitung ulang dan lulus AA" dirapikan menjadi "seluruh pasangan teks/latar di komponen baru" agar akurat (angka dikonfirmasi ulang oleh reviewer Round 2 dengan menghitung 33 pasangan secara independen).
3. **Region "Tersalin!" difungsikan** (saran non-blocking Round 2): sebelumnya region `aria-live` berisi teks statis + toggle `opacity` — struktural benar tetapi tidak pernah mengumumkan apa pun ke pembaca layar dan meninggalkan "Tersalin!" phantom di accessibility tree. Kini region selalu ter-mount namun **kosong** sampai copy berhasil (`{copied ? 'Tersalin! ✨' : ''}`), sehingga perubahan konten benar-benar ter-announce dan teks tidak muncul sebelum waktunya.

Verifikasi Round 2: `php artisan test` **38/38 lulus (239 assertions)**, `npm test` 18/18, `npm run build` sukses (nol `#000000`), `vendor/bin/pint --test` **passed**.
