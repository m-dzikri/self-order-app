# RFC-004: Penjelajahan Katalog Menu & Drawer Kustomisasi Minuman/Makanan

**Features**: F5, F6, F7, F8, F9, F10, F11
**Depends on**: RFC-001, RFC-002, RFC-003
**Rules**: UI-1, UI-2, UI-3, UI-4, DATA-3, CODE-1, CODE-4
**Complexity**: High

---

## 1. Summary
RFC ini membangun antarmuka utama penjelajahan katalog menu pelanggan di React, mencakup:
1. Filter kategori (*Kopi Susu, Manual Brew, Makanan Berat, Camilan, Non-Kopi*) dengan tampilan tab robek miring.
2. Pencarian menu real-time dan ilustrasi empty state bergaya doodle cangkir sedih jika hasil pencarian nihil.
3. Modal drawer kustomisasi varian minuman (suhu, kemanisan, pilihan susu) dan makanan (level pedas, telur).
4. Pemilihan multi-select add-on ekstra (Espresso Shot +Rp 5k, Grass Jelly +Rp 4k) dengan kalkulasi live total harga item.
5. Catatan khusus untuk barista dan stepper kuantitas item.

---

## 2. Technical Approach & Architecture

### A. Component Hierarchy
```
CatalogPage (resources/js/Pages/Catalog.jsx)
├── SearchBar
├── CategoryTabs (Sticky Tabs)
├── MenuGrid
│   └── MenuCard (Doodle Polaroid, Promo Badge, Add Button)
├── EmptySearchState
└── CustomizerDrawer (Bottom Sheet Modal)
    ├── ModifierGroup (Temperature, Sugar, Milk)
    ├── AddonMultiSelect (Extra Shot, Grass Jelly)
    ├── BaristaNotesInput
    └── DrawerFooter (QuantityStepper & AddToCartButton)
```

### B. Price Calculation Pseudocode
```javascript
function calculateItemTotal(basePrice, selectedModifiers, selectedAddons, quantity) {
  let unitPrice = basePrice;
  // Tambahan biaya susu atau modifier
  for (const mod of selectedModifiers) {
    unitPrice += (mod.extraPrice || 0);
  }
  // Tambahan biaya topping / add-on
  for (const addon of selectedAddons) {
    unitPrice += (addon.extraPrice || 0);
  }
  return unitPrice * quantity;
}
```

---

## 3. Implementation Details

- Mengadaptasi layout visual dari [`02_katalog_menu/code.html`](file:///d:/Projects/stud-web/desain-web/02_katalog_menu/code.html) dan [`03_kustomisasi_menu/code.html`](file:///d:/Projects/stud-web/desain-web/03_kustomisasi_menu/code.html).
- **Tab Kategori**: Menggunakan hard shadow `2px 2px 0px #4A2C17` dan rotasi `-1.5deg` saat aktif.
- **Kartu Menu**: Bingkai polaroid, harga bergaris stabilo kuning (`#FFC93C`), tombol "Tambah" bouncer tactile.
- **Drawer Kustomisasi**:
  - Suhu: Dingin (Ice) vs Panas (Hot).
  - Gula: Tanpa Gula (0%), Less Sugar (50%), Normal (100%), Extra Sweet (120%).
  - Susu: Fresh Milk (Gratis), Oat Milk (+Rp 6.000), Almond Milk (+Rp 7.000), Soy Milk (+Rp 5.000).
  - Add-on: Ekstra Espresso Shot (+Rp 5.000), Grass Jelly Cincau (+Rp 4.000).
  - Stepper (+ / -) dengan batasan min 1 dan max 20 porsi.

---

## 4. Acceptance Criteria

- [ ] Katalog menu menampilkan seluruh kategori dari database dengan filter instan.
- [ ] Pencarian teks memfilter nama dan deskripsi menu secara langsung tanpa reload.
- [ ] Bila pencarian tidak cocok, tampil ilustrasi empty state dengan teks ramah.
- [ ] Mengklik kartu menu membuka drawer kustomisasi dari bawah layar.
- [ ] Pilihan susu, opsi suhu, dan tingkat kemanisan dapat dipilih sesuai spesifikasi.
- [ ] Memilih add-on topping (shot/grass jelly) otomatis menambahkan subtotal harga item.
- [ ] Input catatan barista tersimpan dalam payload item keranjang.
- [ ] Tombol "Tambah ke Keranjang" memicu animasi tactile dan memperbarui state keranjang belanja.
