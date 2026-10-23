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

- [ ] URL dengan `?table=12` otomatis menampilkan banner "MEJA 12" dan mengunci sesi Dine-In.
- [ ] Akses URL tanpa parameter meja otomatis membuka form inisialisasi Takeaway.
- [ ] Validasi error muncul jika nama < 3 karakter atau format WhatsApp tidak valid.
- [ ] Mengetuk sandi Wi-Fi pada kartu memo berhasil menyalin `ngopiyuk123` ke clipboard.
- [ ] Banner kupon menampilkan kode `SKETCHKOPI` (Diskon 10%).
- [ ] Tombol CTA "Mulai Pesan" mengarahkan pelanggan ke halaman katalog menu.
- [ ] Input teks disanitasi dari karakter berbahaya HTML sebelum dirender.
