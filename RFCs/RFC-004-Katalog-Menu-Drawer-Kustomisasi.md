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

- [x] Katalog menu menampilkan seluruh kategori dari database dengan filter instan.
- [x] Pencarian teks memfilter nama dan deskripsi menu secara langsung tanpa reload.
- [x] Bila pencarian tidak cocok, tampil ilustrasi empty state dengan teks ramah.
- [x] Mengklik kartu menu membuka drawer kustomisasi dari bawah layar.
- [x] Pilihan susu, opsi suhu, dan tingkat kemanisan dapat dipilih sesuai spesifikasi.
- [x] Memilih add-on topping (shot/grass jelly) otomatis menambahkan subtotal harga item.
- [x] Input catatan barista tersimpan dalam payload item keranjang.
- [x] Tombol "Tambah ke Keranjang" memicu animasi tactile dan memperbarui state keranjang belanja.

---

## 5. Implementation Notes

Implementasi diselesaikan pada 2026-10-25 di branch `feature/rfc-004-katalog-menu`:

1. **Komponen Modular Frontend:**
   - [SearchBar.jsx](file:///d:/Projects/stud-web/resources/js/Components/SearchBar.jsx): Input pencarian teks real-time dengan tombol reset instan dan shadow taktil.
   - [CategoryTabs.jsx](file:///d:/Projects/stud-web/resources/js/Components/CategoryTabs.jsx): Tab filter horizontal berkategori dengan chip "Semua" dan rotasi miring aktif.
   - [MenuCard.jsx](file:///d:/Projects/stud-web/resources/js/Components/MenuCard.jsx): Kartu bingkai polaroid, badge promo washi tape (*Favorit*, *Spesial*), harga stabilo kuning (`#FFC93C`), overlay status stok habis (*Habis*), dan tombol aksi "Tambah".
   - [EmptyMenuState.jsx](file:///d:/Projects/stud-web/resources/js/Components/EmptyMenuState.jsx): Ilustrasi doodle cangkir sedih dengan feedback kata kunci pencarian dan tombol reset.
   - [CustomizerDrawer.jsx](file:///d:/Projects/stud-web/resources/js/Components/CustomizerDrawer.jsx): Bottom sheet modal dengan pilihan suhu (Dingin/Panas), kemanisan (0%, 50%, 100%, 120%), jenis susu (Fresh Milk gratis, Oat Milk, Almond Milk), kustomisasi makanan (Level Pedas 0-3, Pematangan Telur), multi-select topping (Espresso Shot, Grass Jelly), catatan barista sticky-note, stepper kuantitas (1-20), dan live calculation total harga item.
   - [calculateItemTotal.js](file:///d:/Projects/stud-web/resources/js/Utils/calculateItemTotal.js): Utilitas matematis presisi untuk `(basePrice + modifiers + addons) * quantity`.
   - [Catalog.jsx](file:///d:/Projects/stud-web/resources/js/Pages/Catalog.jsx): Halaman utama katalog yang menghubungkan pencarian, filter, modal kustomisasi, badge sesi meja/takeaway, dan penyimpanan keranjang lokal (`localStorage` key `sketchbook_cart` per DATA-1 dan format key deterministik per DATA-3).

2. **Backend Controller:**
   - [CatalogController.php](file:///d:/Projects/stud-web/app/Http/Controllers/CatalogController.php): Mengambil kategori aktif dan menu aktif beserta relasi `modifiers`, serta mem-passing informasi sesi meja/takeaway ke Inertia props.

3. **Bukti Verifikasi (2026-10-25):**
   - `php artisan test` ➔ **45 passed (305 assertions)**, termasuk `CatalogPageTest` (4 test baru: render katalog + data, proteksi menu non-aktif, deteksi sesi meja, dan integritas bundel kompilasi).
   - `npm test` ➔ **23 passed (7 suites)**, termasuk 5 test kasus matematis untuk `calculateItemTotal.test.js`.
   - `vendor/bin/pint --test` ➔ **passed** (100% PSR-12 bersih).
   - `npm run build` ➔ **sukses terkompilasi** (Vite 8.3.5, 638 modul, Catalog-BwT5WoEu.js).

