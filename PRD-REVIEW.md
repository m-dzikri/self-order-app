# PRD Review & Verification Report
## Kopi Corat-Coret – Self-Order Web App ("Sketchbook Kafe")

- **Review Date:** 2026-10-23
- **Reviewed Document:** [`PRD.md`](file:///d:/Projects/stud-web/PRD.md)
- **Baseline Document:** [`PRD.v1.md`](file:///d:/Projects/stud-web/PRD.v1.md)
- **Reviewer:** Lead Product Architect / Verification Specialist
- **Status:** PASSED (Recommendations Incorporated into PRD v2.0.0)

---

## 1. Executive Summary & Overall Assessment
Dokumen `PRD.md` untuk Kopi Corat-Coret telah diaudit dan diverifikasi secara menyeluruh terhadap prototipe interaktif di [`desain-web`](file:///d:/Projects/stud-web/desain-web) dan sistem desain [`DESIGN.md`](file:///d:/Projects/stud-web/desain-web/sketchbook_kafe/DESIGN.md). Dokumen ini memiliki visi produk yang sangat terfokus dan kuat dengan konsep desain taktil yang unik. Seluruh celah kritis (*gaps*) mengenai kustomisasi add-on berbayar, kedaluwarsa QRIS, validasi takeaway, dan kompatibilitas heading telah berhasil diidentifikasi dan diintegrasikan langsung ke dalam **`PRD.md` v2.0.0**.

---

## 2. Summary of Findings (Gap Analysis)

### High Impact Findings
1. **GAP-1: Ketidaksesuaian Opsi Add-on / Topping Ekstra Berbayar**
   - *Temuan:* Pada prototipe layar [`03_kustomisasi_menu`](file:///d:/Projects/stud-web/desain-web/03_kustomisasi_menu/code.html), terdapat opsi multi-select *Tambahan Ekstra* (Ekstra Espresso Shot +Rp 5.000, Grass Jelly Cincau +Rp 4.000), namun pada PRD v1 hanya tercantum pilihan susu dan tingkat kemanisan.
   - *Dampak:* Mengakibatkan risiko hilangnya fitur monetisasi add-on dan kalkulasi subtotal yang tidak akurat pada keranjang.
   - *Solusi Terpasang:* Ditambahkan requirement baru **FR-25** (*Priority: Must*) untuk multi-select add-on dengan kalkulasi harga seketika.

2. **GAP-2: Alur Penanganan QRIS Kedaluwarsa Belum Didefinisikan**
   - *Temuan:* Pada prototipe [`05_pembayaran_qris`](file:///d:/Projects/stud-web/desain-web/05_pembayaran_qris/code.html), hitung mundur 15 menit berjalan, namun PRD v1 tidak menyatakan apa yang terjadi jika waktu habis.
   - *Dampak:* Pengguna dapat bingung jika membayar setelah barcode dinonaktifkan atau saat timer mencapai 00:00.
   - *Solusi Terpasang:* Ditambahkan requirement baru **FR-26** (*Priority: Must*) untuk status kedaluwarsa dan tombol regenerasi QRIS baru.

3. **GAP-3: Belum Adanya Tagging Prioritas MoSCoW**
   - *Temuan:* PRD v1 mengelompokkan fitur berdasarkan modul namun belum mencantumkan label MoSCoW (*Must, Should, Could, Won't*).
   - *Dampak:* Menyulitkan downstream phase (`/extract-features` dan `/generate-rfcs`) dalam menentukan jalur kritis (*critical path*).
   - *Solusi Terpasang:* Setiap requirement FR-1 s/d FR-29 dan NFR-1 s/d NFR-6 kini dilengkapi penanda prioritas resmi.

### Medium Impact Findings
4. **GAP-4: Ketiadaan Spesifikasi Empty State & Pesan Umpan Balik**
   - *Temuan:* Belum ada requirement formal untuk tampilan ketika keranjang masih kosong atau pencarian menu tidak menghasilkan item.
   - *Solusi Terpasang:* Ditambahkan **FR-27** (*Priority: Should*) dengan panduan ilustrasi doodle ramah khas kafe.

5. **GAP-5: Ketidaksesuaian Heading `Product Type` untuk Otomasi Skrip**
   - *Temuan:* Heading pada PRD v1 bertuliskan `## 2. Product Type & Audit Scope`. Skrip audit downstream ([`trace-check.py`](file:///d:/Projects/stud-web/.agents/skills/generate-rfcs/scripts/trace-check.py)) memeriksa substring `## Product Type` secara literal.
   - *Solusi Terpasang:* Diperbarui menjadi `## Product Type` tanpa prefiks nomor bab.

6. **GAP-6: Aturan Validasi Form Takeaway Belum Spesifik**
   - *Temuan:* Kolom Takeaway (Nama, WA, Waktu) belum memiliki batasan minimum karakter dan format.
   - *Solusi Terpasang:* Ditambahkan **FR-28** (*Priority: Must*) dengan validasi: Nama minimal 3 karakter, nomor WhatsApp valid format Indonesia (`08...`), dan waktu pengambilan minimal 10 menit ke depan.

### Low Impact Findings
7. **GAP-7: Interaksi Tap-to-Copy Password Wi-Fi**
   - *Temuan:* Prototipe [`01_welcome_meja_12`](file:///d:/Projects/stud-web/desain-web/01_welcome_meja_12/code.html) memiliki card Wi-Fi dengan teks password `ngopiyuk123` yang ramah sentuh.
   - *Solusi Terpasang:* Ditambahkan **FR-29** (*Priority: Could*) untuk aksi satu-ketukan menyalin ke clipboard.

8. **GAP-8: Struktur Skema & Error Handling LocalStorage**
   - *Temuan:* PRD v1 menyebutkan penyimpanan `localStorage` namun belum merinci penanganan bila kuota penuh atau private browsing memblokir penyimpanan.
   - *Solusi Terpasang:* Ditambahkan **NFR-6** (*Priority: Must*) yang mendefinisikan kunci spesifik (`kopi_cart`, `kopi_orders`, dll) dengan perlindungan `try-catch`.

---

## 3. Specific Recommendations Implemented in PRD v2.0.0

| ID Perubahan | Jenis | Deskripsi Singkat | Justifikasi |
|---|---|---|---|
| **Heading Product Type** | Format | Mengubah judul bab menjadi literal `## Product Type` | Menghindari peringatan pada eksekusi `trace-check.py`. |
| **FR-25** | Fungsional Baru | Multi-select topping & ekstra shot (+harga) | Sinkronisasi dengan layar [03_kustomisasi_menu](file:///d:/Projects/stud-web/desain-web/03_kustomisasi_menu). |
| **FR-26** | Fungsional Baru | Regenerasi QRIS saat hitung mundur kedaluwarsa | Menjamin integritas alur pembayaran online. |
| **FR-27** | Fungsional Baru | Tampilan *Empty State* keranjang & pencarian | Menjaga estetika ramah corat-coret saat data nihil. |
| **FR-28** | Fungsional Baru | Validasi form Nama, WA, dan Jam Takeaway | Mencegah pesanan takeaway tanpa data kontak yang valid. |
| **FR-29** | Fungsional Baru | Fitur satu ketukan salin sandi Wi-Fi kafe | Kenyamanan ekstra bagi pelanggan di tempat. |
| **NFR-6** | Non-Fungsional Baru| Skema kunci `localStorage` dan error handling | Keandalan persistensi sesi dan data belanja. |
| **MoSCoW Tagging** | Prioritisasi | Pemberian tag Must/Should/Could pada seluruh FR & NFR | Memudahkan pemecahan modul ke `FEATURES.md`. |
| **Decisions Table** | Tata Kelola | Pencatatan 3 keputusan baru hasil verifikasi audit | Dokumentasi alasan dan alternatif yang ditolak. |

---

## 4. Quality Assessment Score

| Parameter | Skor (1 - 10) | Catatan Evaluator |
|---|:---:|---|
| **Completeness (Kelengkapan)** | **9.6 / 10** | Mencakup seluruh alur pengguna (Dine-In, Takeaway, Guest, Member, QRIS, Kasir, Status Tracker) tanpa ada modul menggantung. |
| **Clarity (Kejelasan)** | **9.8 / 10** | Setiap requirement memiliki ID permanen yang tidak ambigu, batasan input terukur, dan prioritas jelas. |
| **Feasibility (Kelayakan Teknis)** | **9.5 / 10** | Menggunakan arsitektur front-end berbasis web standar dan `localStorage`, bebas dari dependensi backend yang rumit untuk fase MVP. |
| **User-Focus (Kesesuaian Pengguna)** | **9.9 / 10** | Sangat terintegrasi dengan kebutuhan nyata pelanggan kafe (kecepatan tanpa login, kejelasan meja, kenyamanan visual sketchbook). |
| **Total / Rata-rata** | **9.7 / 10** | **Grade: EXCELLENT (Siap Masuk Ekstraksi Fitur)** |

---

## 5. Traceability & Downstream Guidance
Semua temuan High-Impact (GAP-1, GAP-2, GAP-3) telah diterjemahkan menjadi **FR-25**, **FR-26**, dan pelabelan MoSCoW. Saat menjalankan perintah **`/extract-features`**:
- FR-1 s/d FR-29 akan dipetakan 1-ke-1 ke Feature ID permanen di `FEATURES.md`.
- NFR-1 s/d NFR-6 akan menjadi acuan dasar dalam penyusunan `RULES.md` dan `TEST-STRATEGY.md`.
