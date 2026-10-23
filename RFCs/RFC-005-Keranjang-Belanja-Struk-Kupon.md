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

- [ ] Keranjang menampilkan seluruh item yang ditambahkan dari katalog dengan varian lengkap.
- [ ] Menambah atau mengurangi kuantitas item langsung memperbarui subtotal.
- [ ] Tombol hapus menghapus item dari keranjang dengan animasi visual.
- [ ] Kode kupon `SKETCHKOPI` memotong 10% subtotal belanja.
- [ ] Pajak PB1 dihitung tepat 10% dari nominal setelah diskon.
- [ ] Total bayar akhir adalah penjumlahan subtotal setelah diskon ditambah PB1 (tanpa salah desimal).
- [ ] Tampilan nota memiliki batas bawah gerigi zigzag sesuai desain mockup.
- [ ] Jika keranjang kosong, tampil doodle "Keranjangmu masih kosong nih!" dan tombol CTA menu.
