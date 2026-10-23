# Change Request 001 (CR-001)
## Migrasi Arsitektur ke Laravel, Inertia.js + React, dan Filament Admin

- **ID:** CR-001
- **Tanggal Pengajuan:** 2026-10-23
- **Status:** APPROVED & INTEGRATED
- **Pengaju:** Pengguna (User)
- **Tipe Perubahan:** Technical & Scope Change (Large)
- **Prioritas:** Must Have
- **Dokumen Terdampak:** [`PRD.md`](file:///d:/Projects/stud-web/PRD.md), [`FEATURES.md`](file:///d:/Projects/stud-web/FEATURES.md), [`RULES.md`](file:///d:/Projects/stud-web/RULES.md)

---

## 1. Deskripsi Perubahan
Pengguna meminta perubahan menyeluruh pada arsitektur teknis dan ruang lingkup sistem:
1. **Backend:** Menggunakan **Laravel (PHP 8.2+)** dengan database relasional (SQLite / MySQL) menggantikan mock `localStorage` statis.
2. **Frontend Pelanggan:** Menggunakan **Inertia.js + React** menggantikan Vanilla JS SPA, dengan tetap mempertahankan 100% sistem desain tactile "Sketchbook Kafe" ([`DESIGN.md`](file:///d:/Projects/stud-web/desain-web/sketchbook_kafe/DESIGN.md)).
3. **Panel Admin & Kasir:** Menambahkan modul **Filament Admin** untuk pengelolaan menu, kategori, verifikasi pembayaran kasir, dan pengubahan status pesanan secara terpusat.

---

## 2. Impact & Conflict Analysis

### A. Conflict Check (Pemeriksaan Konflik Dokumen Sebelumnya)
1. **Konflik Aturan (`RULES.md`):**
   - Aturan `ARCH-1` dan `ARCH-2` sebelumnya menetapkan arsitektur SPA klien tanpa server eksternal dan ketergantungan murni pada `localStorage`.
   - *Resolusi:* `ARCH-1` dan `ARCH-2` ditandai sebagai `[REMOVED]` dan digantikan oleh `ARCH-5` (Arsitektur Laravel + Inertia + React), `ARCH-6` (Database Eloquent & Filament), dan `ARCH-7` (Konvensi direktori Laravel).
2. **Pembalikan Keputusan (`PRD.md` Section 11):**
   - *Keputusan Lama:* "Penyimpanan Data MVP menggunakan Browser localStorage + JSON mock data" demi verifikasi cepat tanpa dependensi backend.
   - *Status Baru:* Dibalikkan (*reversed*). Kebutuhan panel admin terpadu untuk kasir/owner menuntut adanya database relasional yang andal.
3. **Pembalikan Batasan Ruang Lingkup (`FEATURES.md`):**
   - Fitur `F29` (*Tablet Khusus Kitchen Display / Back-Office*) yang awalnya berstatus *Won't Have*, kini diakomodasi melalui **Filament Admin** sebagai fitur resmi (*Must Have*).

### B. Dampak terhadap User Experience & Desain
- **Desain Tetap Terjaga:** Identitas visual "Sketchbook Kafe" ([`DESIGN.md`](file:///d:/Projects/stud-web/desain-web/sketchbook_kafe/DESIGN.md)) tetap menjadi standar wajib 100% untuk komponen React di sisi pelanggan.
- **Kenyamanan Admin/Kasir:** Staf kafe kini memiliki antarmuka back-office Filament yang sangat kuat untuk mengelola menu, promo, dan verifikasi antrean pesanan kasir secara real-time.

---

## 3. Rincian Perubahan Artefak Dokumen

### 1. `PRD.md` (Diperbarui ke v3.0.0)
- Menambahkan kapabilitas Backend Laravel, Inertia React, dan Filament Admin pada bab *Overview* dan *Scope*.
- Menambahkan functional requirement baru (append-only):
  - **FR-30**: Dashboard Admin Filament untuk manajemen katalog menu, varian, dan stok.
  - **FR-31**: Dashboard Admin Filament untuk pemantauan pesanan kasir dan pengubahan status pesanan.
  - **FR-32**: Integrasi backend Laravel & Inertia.js untuk sinkronisasi data pesanan.
- Mencatat pembalikan keputusan teknis pada tabel *Decisions & Rationale*.

### 2. `FEATURES.md` (Diperbarui ke v2.0.0)
- Menambahkan fitur permanen baru (append-only):
  - **F31**: Dashboard Admin Filament – Manajemen Menu & Kategori (*Must Have*, FR-30).
  - **F32**: Dashboard Admin Filament – Operasional Kasir & Status Pesanan (*Must Have*, FR-31).
  - **F33**: Backend Laravel & Protokol Inertia React (*Must Have*, FR-32).
- Menyesuaikan metrik MoSCoW: Must Have bertambah menjadi 22 fitur.

### 3. `RULES.md` (Diperbarui ke v2.0.0)
- Memperbarui tabel dependensi terverifikasi: PHP 8.2+, Laravel 11/12, Inertia React, React 19, Filament v3, Tailwind CSS, Vite.
- Menandai aturan usang sebagai `[REMOVED]` dan menambahkan aturan permanen baru: `ARCH-5`, `ARCH-6`, `ARCH-7`, `API-1`, `SEC-4`.

---

## 4. Analisis Risiko & Kesiapan Lingkungan (Prerequisites)

| Risiko | Tingkat | Mitigasi |
|---|:---:|---|
| **Kesiapan Runtime Lokal (PHP & Composer)** | Sedang | Perangkat lokal saat ini belum memiliki `php` dan `composer` di PATH sistem. Pengguna perlu menginstal PHP (>= 8.2) dan Composer (misal via Laragon, XAMPP, atau installer resmi) agar proyek Laravel dapat dijalankan. |
| **Kompleksitas State Inertia** | Rendah | Menggunakan state lokal React untuk interaksi UI cepat (kustomisasi modal, stepper), dan Inertia router untuk transaksi checkout ke Laravel. |
| **Kustomisasi Tema Filament** | Rendah | Menggunakan styling standar Filament v3 yang bersih untuk back-office, sehingga fokus styling sketchbook maksimal di sisi pelanggan (React). |
