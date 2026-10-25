# RFC-005: Keranjang Belanja, Kupon Promo & Nota Struk Kasir Robek

**Features**: F12, F13, F14, F15
**Depends on**: RFC-004
**Rules**: UI-1, UI-4, UI-5, DATA-1, DATA-3, CODE-2, TEST-3
**Complexity**: Medium

---

## 1. Summary
RFC ini mengimplementasikan halaman keranjang belanja pelanggan dengan visual khas nota kasir robek perforasi, mencakup:
1. Ringkasan item belanja dengan rincian varian, tombol ubah varian, hapus item, dan stepper kuantitas.
2. Form input kupon diskon promo (`SKETCHKOPI` memotong 10% subtotal).
3. Kalkulasi matematis: Subtotal, Diskon Kupon, Pajak Restoran PB1 (10%), dan Total Akhir Bayar.
4. Tampilan empty state keranjang belanja bila belum ada item yang dipilih.

---

## 2. Technical Approach & Architecture

### A. Mathematical Calculation Rules
```javascript
function calculateCartTotals(items, coupon) {
  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  let discount = 0;
  if (coupon && coupon.code === 'SKETCHKOPI' && coupon.isValid) {
    discount = Math.round(subtotal * 0.10);
  }
  const taxableAmount = Math.max(0, subtotal - discount);
  const pb1Tax = Math.round(taxableAmount * 0.10);
  const total = taxableAmount + pb1Tax;

  return { subtotal, discount, pb1Tax, total };
}
```

### B. File Structure
```
resources/
├── js/
│   ├── Components/
│   │   ├── CartItemCard.jsx
│   │   ├── CouponInputBox.jsx
│   │   ├── ReceiptDocket.jsx
│   │   └── EmptyCartState.jsx
│   └── Pages/
│       └── Cart.jsx
```

---

## 3. Implementation Details

- Mengadaptasi layout visual dari [`04_keranjang_struk/code.html`](file:///d:/Projects/stud-web/desain-web/04_keranjang_struk/code.html).
- **Nota Struk Robek (`ReceiptDocket.jsx`)**:
  - Header nota bertuliskan "NOTA SEMENTARA" berlatar kertas putih-krem (`#FFF1D6`).
  - Garis pemisah perforasi doodle `~ - ~ - ~ - ~ - ~`.
  - Garis bawah nota berpotongan gerigi zigzag SVG (`viewBox="0 0 120 12"`).
  - Nominal total bayar disorot latar stabilo kuning ceria (`#FFC93C`).
- **Kupon Promo (`CouponInputBox.jsx`)**:
  - Input teks dengan tombol "Pasang".
  - Kupon valid menampilkan badge hijau "Asyik! Kamu hemat Rp X.XXX dari kupon ini!".
  - Tersedia tombol ganti atau batalkan kupon.

---

## 4. Acceptance Criteria

- [x] Keranjang menampilkan seluruh item yang ditambahkan dari katalog dengan varian lengkap.
- [x] Menambah atau mengurangi kuantitas item langsung memperbarui subtotal.
- [x] Tombol hapus menghapus item dari keranjang dengan animasi visual.
- [x] Kode kupon `SKETCHKOPI` memotong 10% subtotal belanja.
- [x] Pajak PB1 dihitung tepat 10% dari nominal setelah diskon.
- [x] Total bayar akhir adalah penjumlahan subtotal setelah diskon ditambah PB1 (tanpa salah desimal).
- [x] Tampilan nota memiliki batas bawah gerigi zigzag sesuai desain mockup.
- [x] Jika keranjang kosong, tampil doodle "Keranjangmu masih kosong nih!" dan tombol CTA menu.

---

## 5. Implementation Notes

- **Modul Perhitungan Murni (`calculateCartTotals.js`):** Aturan kalkulasi keranjang diekstraksi ke berkas utilitas murni dan diuji dengan 7 test case unit Node.js, termasuk pengujian TC-005-2, TC-005-3, dan pencocokan nominal persis terhadap mockup visual `04_keranjang_struk/code.html` (Subtotal Rp 54.000, Diskon 10% Rp 5.400, PB1 10% Rp 4.860, Total Bayar Rp 53.460).
- **Edit Varian Interaktif (F12):** Komponen `CustomizerDrawer.jsx` diperluas agar menerima prop `initialPayload`. Ketika tombol pensil/stylus ditekan pada kartu item keranjang, drawer terbuka dalam keadaan terhidrasi dengan opsi varian item tersebut dan tombol aksi berubah menjadi "Simpan Perubahan", lalu memperbarui item di `localStorage['sketchbook_cart']`.
- **Dukungan Code-Splitting Vite pada Pengujian:** Karena `CustomizerDrawer` diimpor oleh `Catalog.jsx` dan `Cart.jsx`, bundler Vite secara otomatis memisahkan komponen tersebut menjadi chunk bersama (`CustomizerDrawer-*.js`). Pengujian `CatalogPageTest` disesuaikan agar memeriksa konten bundle utama beserta chunk yang diimpor.
