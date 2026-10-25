# Review RFC-002 — Round 1 (2026-10-24)

**Reviewer:** independent code reviewer (fresh context)
**Scope:** RFC-002 Dashboard Admin Filament – Manajemen Menu, Kategori, Varian & Stok (F31)
**Predecessor check:** `RFCS.md` line 26–27 → RFC-001 = *Implemented*, RFC-002 = *Implemented*, RFC-003 = *Not started*. Predecessor satisfied ✅
**Method:** static read of the RFC, RULES.md, FEATURES.md, TEST-STRATEGY.md, PRD.md, all listed implementation files, the mock prototypes, plus live execution (tests, style check, build, migration/seeding) and *runtime probing* of the real `/admin` routes.

---

## STEP 0 — Command output (ACTUAL)

### 1. `php artisan test`

```
   WARN  Metadata found in doc-comment for method Tests\Unit\FormatRupiahTest::formats_numbers_correctly(). Metadata in doc-comments is deprecated and will no longer be supported in PHPUnit 12. Update your test code to use attributes instead.

   WARN  Metadata found in doc-comment for method Tests\Feature\RootPageTest::root_page_renders_inertia_app(). Metadata in doc-comments is deprecated and will no longer be supported in PHPUnit 12. Update your test code to use attributes instead.

   PASS  Tests\Unit\FormatRupiahTest
  ✓ formats numbers correctly                                                                                  0.40s

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.21s
  ✓ admin can create category                                                                                    0.39s
  ✓ category form rejects empty name                                                                             0.29s
  ✓ admin can update category sort order                                                                         0.30s
  ✓ category seeder populates all categories                                                                     0.03s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                         0.56s
  ✓ menu form rejects negative price                                                                             0.48s
  ✓ menu form rejects empty name                                                                                 0.50s
  ✓ menu seeder populates full catalog                                                                           0.03s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.34s
  ✓ stock toggle can be restored                                                                                 0.26s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.05s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.03s
  ✓ root route returns app blade shell                                                                           0.03s

  Tests:    15 passed (68 assertions)
  Duration: 4.10s
```

> Output captured verbatim from the runner (padding whitespace of the progress columns preserved approximately).
> Result: **15 tests / 68 assertions PASSED** — matches the claim in RFC §5 "Bukti Verifikasi".

### 2. `vendor\bin\pint --test`

```
{"tool":"pint","result":"fail","files":[{"path":"bootstrap\\providers.php","fixers":["fully_qualified_strict_types","line_ending","single_line_after_imports"]}]}
Exited with code 1
```

**RESULT: FAIL (exit 1).** Byte inspection of `bootstrap\providers.php` confirms the root cause: **mixed line endings — 2 CRLF + 4 LF** in a 125-byte file, plus fully-qualified class references (`App\Providers\AppServiceProvider::class`, `App\Providers\Filament\AdminPanelPanelProvider::class`) that Pint wants imported (`fully_qualified_strict_types`).

Scoped re-run matching what the RFC actually claimed (`vendor/bin/pint app database tests config`):

```
{"tool":"pint","result":"passed"}exit=0
```

→ The RFC's narrower claim is true, but the **project-wide** `pint --test` (the command in this review's step 0) fails.

### 3. `npm run build`

```
> build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 626 modules transformed.
rendering chunks...
computing gzip size...
public/build/manifest.json                 0.68 kB │ gzip:   0.25 kB
public/build/assets/app-Iu_HwSKZ.css       1.52 kB │ gzip:   0.56 kB
public/build/assets/Welcome-nD6ESB39.js    1.91 kB │ gzip:   0.82 kB
public/build/assets/app-CCh3XKrs.js      347.09 kB │ gzip: 108.49 kB

✓ built in 532ms
```

**RESULT: PASS** (626 modules, Vite 8.3.5 — matches RFC §5).

### 4. `php artisan migrate:fresh --seed --force`

```
  Dropping all tables .................................................................................... 9.58ms DONE

   INFO  Preparing database.

  Creating migration table .............................................................................. 10.59ms DONE

   INFO  Running migrations.

  0001_01_01_000000_create_users_table .................................................................. 23.15ms DONE
  0001_01_01_000001_create_cache_table .................................................................. 13.71ms DONE
  0001_01_01_000002_create_jobs_table ................................................................... 20.72ms DONE
  2026_10_23_000001_create_categories_table .............................................................. 6.77ms DONE
  2026_10_24_000002_create_menus_table ................................................................... 4.17ms DONE
  2026_10_24_000003_create_menu_modifiers_table .......................................................... 5.64ms DONE

   INFO  Seeding database.

  Database\Seeders\AdminUserSeeder ........................................................................... RUNNING
  Database\Seeders\AdminUserSeeder ......................................................................... 258 ms DONE
  Database\Seeders\CategorySeeder ............................................................................ RUNNING
  Database\Seeders\CategorySeeder ......................................................................... 27 ms DONE
  Database\Seeders\MenuSeeder ................................................................................ RUNNING
  Database\Seeders\MenuSeeder ................................................................................ 79 ms DONE
```

**RESULT: PASS** — clean migration + seed (TEST-2). Row counts verified afterwards:

```
categories=5 menus=6 modifiers=11 users=1
```

(matches RFC §5: "5 kategori + 6 menu + 11 modifier").

### Extra runtime evidence gathered for this review

```
php artisan route:list --path=admin
  GET|HEAD   admin ...................... filament.admin.pages.dashboard
  GET|HEAD   admin/categories ........... App\Filament\Resources\CategoryResource\Pages\ListCategories
  GET|HEAD   admin/categories/create ....
  GET|HEAD   admin/categories/{record}/edit
  GET|HEAD   admin/login ................ filament.auth.login
  POST       admin/logout ...............
  GET|HEAD   admin/menus ................ App\Filament\Resources\MenuResource\Pages\ListMenus
  GET|HEAD   admin/menus/create .........
  GET|HEAD   admin/menus/{record}/edit ..
  (9 routes)
```

HTTP probes against the *seeded* database (guest vs. authenticated):

```
guest  /admin/menus => 302 location=http://localhost/admin/login
guest  /admin       => 302 location=http://localhost/admin/login
auth   /admin                 => 200
auth   /admin/categories      => 200
auth   /admin/categories/{id}/edit => 200
auth   /admin/menus/create    => 200
auth   /admin/menus/{id}/edit => 200
auth   /admin/menus           => 500   <-- TypeError
```

Exact error body extracted from the 500 page:

```
# TypeError - Internal Server Error
App\Filament\Resources\MenuResource::{closure:App\Filament\Resources\MenuResource::table():144}():
Argument #1 ($state) must be of type ?string, App\Enums\BadgeEnum given,
called in vendor\filament\support\src\Concerns\EvaluatesClosures.php on line 35
PHP 8.5.12 / Laravel 12.70.1
0 - app\Filament\Resources\MenuResource.php:144
```

Isolated reproduction of the same code path with real Filament objects:

```
menu: Es Kopi Susu Aren
raw attr: App\Enums\BadgeEnum => \App\Enums\BadgeEnum::FAVORIT
column state type: App\Enums\BadgeEnum
THROWN: TypeError: ...(): Argument #1 ($state) must be of type ?string, App\Enums\BadgeEnum given
```

---

## 1. RFC Adherence — **NEEDS WORK** (1 blocking defect vs. AC-3/AC-4)

| # | Acceptance Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 | Panel Filament di `/admin` dengan autentikasi aman | **PASS** | `AdminPanelPanelProvider.php:27–29,54–56` (`id('admin')`, `path('admin')`, `login()`, `authMiddleware(Authenticate)`); guest probes → `302 /admin/login`; password via `Hash::make` (`AdminUserSeeder.php:26`); routes registered (see `route:list` above). |
| AC-2 | CRUD kategori (tambah, edit, hapus, urutkan) | **PASS** (impl) / partial tests | `CategoryResource.php:30–58` (form), `:90–93,99–100` (`EditAction`, `DeleteAction`, `reorderable('sort_order')`, `defaultSort`). Create/edit proven by tests; **delete and table display are untested** (see §5). Live probe: `/admin/categories` = 200. |
| AC-3 | CRUD menu + gambar polaroid, harga, badge promo | **FAIL (blocking)** | Form/create/edit work (`/admin/menus/create` = 200, `/admin/menus/{id}/edit` = 200, `MenuCrudTest::test_admin_can_create_menu_with_modifiers` passes), **but the menu list page returns HTTP 500 as soon as any menu row carries a badge** — and the seeder writes `badge = 'favorit'` on *Es Kopi Susu Aren*. `MenuResource.php:143–145` (and the `color` closure at `:146–152`) declare `?string $state`, while `Menu.php:25` casts `badge` to `BadgeEnum`, so Filament passes an enum into a `?string` parameter (`vendor/filament/support/src/Concerns/EvaluatesClosures.php:35`). Root path: `HasCellState::getState()` → `data_get($record,'badge')` → enum → `CanFormatState::formatState()` → TypeError. Result: after a normal `migrate:fresh --seed`, an admin **cannot open the menu list at all**, hence cannot reach edit/delete/stock UI. |
| AC-4 | Toggle stok berfungsi & tersimpan ke DB | **PASS** (mechanism) / **blocked in UI** | `MenuResource.php:154–155` (`ToggleColumn::make('is_in_stock')`); `MenuStockToggleTest` drives the real Livewire `updateTableColumnState` on `ListMenus`, and `vendor/filament/tables/src/Concerns/HasColumns.php:40–72` resolves the column from the live table (`getColumn()` → `Editable` → `updateState`), so **the test fails if the column is removed** — non-vacuous. However the very page that hosts the toggle is 500 in the seeded state (AC-3). |
| AC-5 | Seeder memuat kategori & menu sesuai mock | **PASS** | Against `desain-web\02_katalog_menu\code.html`: all 6 item names + prices match exactly (Es Kopi Susu Aren 22.000, Caffe Latte Sketsa 26.000, Mie Goreng Corat-Coret 28.000, Croissant Almond 24.000, Pisang Goreng Keju 20.000, V60 Flores Bajawa 30.000); **Croissant Almond = HABIS** in mock (`HABIS` rubber-stamp + disabled button) ⇔ `MenuSeeder.php:74` `is_in_stock => false` and asserted in `MenuCrudTest.php:141–145`. Against `03_kustomisasi_menu\code.html`: all 7 milk/topping options + prices match verbatim (Fresh Milk *Gratis*→0, Oat +6.000, Almond +7.000, Soy +5.000, Espresso Shot +5.000, Grass Jelly +4.000, Coffee Jelly +4.000) and `assertSame(7, …)` / Oat = 6000 are asserted (`MenuCrudTest.php:148–151`). Categories = the RFC §3 list (not the mock's chip labels `Kopi / Non-Kopi / Makanan / Dessert / Snack` — RFC-internal, RFC §3 names them explicitly, so not a defect). |
| AC-6 | Validasi form menolak harga minus / nama kosong | **PASS (non-vacuous)** | `MenuResource.php:45–49` (`numeric()->minValue(0)->required()`), `:30–33` (`required()`); tests assert `assertHasFormErrors(['price'=>'min'])` + `assertDatabaseCount('menus',0)` (`MenuCrudTest.php:99–101`) and `['name'=>'required']` + count 0 (`:124–126`). If validation were removed, `call('create')` would persist the row and both assertions fail → genuinely regression-sensitive. Same for category name (`CategoryCrudTest.php:61–63`). |

**Test criticality (read, not just counted):**
- *Non-vacuous:* AC-6 validation tests; both seeder tests (counts + specific rows + modifier FK/prices); both stock-toggle tests (column lookup enforced by Filament before `updateState`); auth test (`assertRedirect('/admin/login')` fails if `authMiddleware` is dropped).
- *Vacuous / missing:* **no test ever renders the `ListMenus` table with a non-null `badge`**, which is exactly why the 500 passed review. `MenuStockToggleTest` renders `ListMenus` but its fixture deliberately leaves `badge` null (`MenuStockToggleTest.php:26–33`). TC-002-1's literal expectation "*tampil pada tabel data Filament*" is never asserted (categories table is never rendered in any test).

**Unrecorded deviations (findings):**
1. **Migration filenames differ from RFC §2 file structure** — RFC lists `2026_10_23_000002/000003/000004_*`; actual files are `2026_10_23_000001_create_categories_table.php`, `2026_10_24_000002_create_menus_table.php`, `2026_10_24_000003_create_menu_modifiers_table.php`. Cosmetic, but unrecorded.
2. **`categories.is_active` column + `Toggle`/`TernaryFilter` are not in the RFC ERD** (RFC §2A Category = name/slug/sort_order only). Harmless extension, unrecorded.
3. **Seeder menu descriptions are new Indonesian copy**, not the prototype's text (`MenuSeeder.php:34` etc. vs. mock English descriptions) — unrecorded; RFC §3 says seeders fill data "dari prototipe".
4. **Panel provider class name is still `AdminPanelPanelProvider`** (double "Panel", `AdminPanelPanelProvider.php:21`) although Implementation Note 1 says the panel id/path were renamed to `admin`; the class rename was not recorded.
5. **Badge vocabulary vs. mock:** mock stamps read *Best Seller / Susu Pilihan / Pedas! / Cocok Bareng Kopi*; seeder assigns `favorit`/`spesial`. RFC §3 mandates *Favorit/Spesial*, so RFC wins — noted only as an observation, not a defect.

**Recorded deviations judged (§5 Implementation Notes):** Notes 1, 2, 3, 4, 5, 6, 8 all verified accurate against the code (`admin` path/id; `BadgeEnum::FAVORIT/SPESIAL + label()`; `TextInput` slug with regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` + `Str::slug` auto-fill only on `create` (`CategoryResource.php:35–46`) and `->description()` instead of v4 `helperText` (`MenuResource.php:116`); `image_path` null in seeder + `FileUpload` `disk('public')->directory('menu-images')->maxSize(2048)` (`MenuResource.php:60–66`) with `public/storage` junction present; `Env` import fixed + `DatabaseSeeder` calls the 3 seeders; Rupiah comments corrected (`create_menus_table.php:16`, `create_menu_modifiers_table.php:16`); auth-only authorization, no roles anywhere).
**Note 7 is inaccurate:** it states the seeder fills *"modifier susu & topping berbayar"*, yet `MenuSeeder.php:18` seeds `Susu Sapi Segar (Fresh Milk)` with `extra_price = 0` — a free option (correct vs. the mock's *Gratis*, wrong vs. its own wording). Either the note or the data should be aligned.
Note 4's claim that uploads work "penuh" is plausible from config but **untested** (no test exercises `FileUpload`).

---

## 2. Rules Compliance — **NEEDS WORK**

| Rule | Verdict | Finding |
|---|---|---|
| **CODE-1 (PSR-12 / Laravel conventions)** | **NEEDS WORK** | `vendor\bin\pint --test` **exits 1**: `bootstrap\providers.php` has mixed CRLF/LF line endings and fully-qualified class references (fixers `line_ending`, `fully_qualified_strict_types`, `single_line_after_imports`). Scoped run `pint app database tests config` passes, so all RFC-002 code itself is clean; the one failing file is the RFC-002 registration point (`bootstrap/providers.php:5`). |
| **CODE-3 (no dead code / stale comments)** | **NEEDS WORK (minor)** | (a) `AdminUserSeeder.php:27–28` — comment *"Filament uses `admin` role by default…"* sits above `email_verified_at` and describes no code (there is no role column): misleading/dead comment. (b) `create_menus_table.php:17` — `// relative path e.g. "menu_images/coffee.jpg"` contradicts the actual upload directory `menu-images` (`MenuResource.php:64`). (c) `Menu.php:25` — `// nullable enum casting` trailing comment is noise; more importantly the cast is the source of the AC-3 crash. (d) `Widgets\FilamentInfoWidget` (`AdminPanelPanelProvider.php:41`) is Filament's scaffold demo widget on the production dashboard. No `console.log`/TODO found. |
| **CODE-4 (naming, Eloquent SingularPascalCase)** | **PASS** | `Category`, `Menu`, `MenuModifier`, `BadgeEnum` all correct; resources/pages follow Filament conventions. `AdminPanelPanelProvider` (double "Panel") is ugly but outside CODE-4's enumerated scope — flagged as an improvement. |
| **ARCH-3 (directory conventions)** | **PASS** | `app/Filament/Resources/{Category,Menu}Resource.php` + `Pages/`, `app/Models/`, `database/migrations/`, `database/seeders/` all in the prescribed locations. `app/Filament/Pages` and `app/Filament/Widgets` do not exist — harmless (discover calls no-op), only the scaffold widget reference is odd (see CODE-3d). |
| **ARCH-5 / ARCH-6** | **PASS** | Laravel 12 + Filament v3 monolith; relational schema via migrations with FKs (`constrained()->cascadeOnDelete()` on both FKs). |
| **TEST-1 (F31 mechanically testable)** | **PASS** | F31 is exercised by 11 Filament feature tests (Livewire component-level), 15 total; all green. |
| **TEST-2 (`migrate:fresh` clean)** | **PASS** | Step 0 §4 — clean run, no FK errors, seeds idempotently (`updateOrCreate`). |
| **UI-1 … UI-6 (sketchbook design)** | **SKIPPED — visibly** | Skipped per `changes/CHANGE-REQUEST-001.md` (CR-001): Filament back-office uses stock Filament styling; the tactile design system applies to the customer-facing React pages (RFC-004). No UI-* rule was evaluated against these files. |
| **CODE-2 (central `formatRupiah`)** | **SKIPPED for verdict / noted as improvement** | RFC-002's `Rules:` header lists ARCH-3/5/6, SEC-4, CODE-1, CODE-4 — not CODE-2 — and `formatRupiah()` exists only in JS (`resources/js/Utils/formatRupiah.js`), so PHP cannot call it. The PHP side formats Rupiah inline in 3 places (`MenuResource.php:138`, `:110`, `:51`), all currently producing the correct `Rp 22.000` shape. |

**PRD "Product Type" checks applied / skipped:**
- Applied: *Auth and Sessions*, *Authorization per Resource*, *Data Model & Migrations*, *Page-Load Budget* (asset build), *Responsive Layout — desktop/tablet Filament half only*.
- Skipped: *Accessibility* (44px touch/WCAG tokens) and *mobile portrait 360–430px* → customer-facing UI only; *SEO for Public Pages*, *Browser Support (Mobile Safari/Android webview)* → public catalog pages (RFC-004), not the back-office. Also skipped from RULES §2: `binary size`, `offline sync` (pre-declared skips in PRD/RULES).

---

## 3. Security — **PASS (with one medium-hardening note)**

- **SEC-4 PASS.** `/admin` behind `Filament\Http\Middleware\Authenticate` (`AdminPanelPanelProvider.php:54–56`) + `login()` route; guests get `302 → /admin/login` for both `/admin` and `/admin/menus` (probed). Passwords hashed with `Hash::make` (bcrypt) in `AdminUserSeeder.php:26`. `AuthenticateSession` is enabled (`:47`) so password changes invalidate sessions. No admin route in `route:list` sits outside the panel.
- **Seeder env/password handling — NOTE (medium).** `AdminUserSeeder.php:18–19` reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` via `Env::get(...)` with fallback `'admin@example.com' / 'password'`. The current `.env` defines **no `ADMIN_*` keys**, so the running app seeds a **weak default credential**, and `.env.example` documents none. Suggest: require the env vars (fail fast when `APP_ENV=production`), move them to `config/*.php` (Laravel best practice: `Env` outside config), and document in `.env.example`. `.env` itself is correctly git-ignored (verified: `git ls-files` has no `.env`).
- **Form validation gaps — LOW.** Name/slug/price/description/extra_price all validated (`required`, `maxLength`, `regex`, `unique(ignoreRecord)`, `numeric`+`minValue(0)`). Missing: **no `unique` on `menus.name`** — duplicates are possible, and `MenuSeeder.php:91` keys on `name`, so a duplicate name silently breaks seeder idempotency (`updateOrCreate` would pick the first match). `menu_modifiers.type` is an unconstrained string at DB level (`create_menu_modifiers_table.php:14`) though the form offers a fixed option list — acceptable, note only.
- **File upload rules — PASS.** `FileUpload::make('image_path')->image()->disk('public')->directory('menu-images')->maxSize(2048)` (`MenuResource.php:60–66`) = image-type + 2 MB + explicit disk/directory (matches Note 4). `public/storage` junction exists, so serving works; files land outside webroot until the link.
- **Mass assignment — PASS.** All three models declare narrow `$fillable` (`Category.php:10–15`, `Menu.php:12–21`, `MenuModifier.php:10–15`); `id` not fillable. Repeater relationship saving goes through Filament's `->relationship()` with the same validated state (proven by `assertDatabaseHas('menu_modifiers', …)` incl. `menu_id` FK).
- **Guest exposure — PASS.** Probed: unauthenticated GETs to `/admin` and `/admin/menus` return `302` with no data. Livewire mutation endpoint requires a signed snapshot (framework-level), no custom bypass routes exist.
- Authorization model = authentication-only (Note 8) — consistent with SEC-4 as written; role split deferred to RFC-007. Not a defect.

---

## 4. Performance — **PASS**

- **No N+1:** `MenuResource.php:133` `category.name` is auto-eager-loaded by Filament (`vendor/filament/tables/src/Concerns/HasRecords.php:46` → `applyEagerLoading`) and sortable via a relation existence subquery (`InteractsWithTableQuery.php:121–178`, `getDefaultSortColumns()` returns `name` after the dot) — **sorting on `category.name` is safe, not raw SQL**. `menus_count` (`CategoryResource.php:76–78`) and `modifiers_count` (`MenuResource.php:158–161`) use `withCount` once per table query (`HasRecords.php:40`), not per-row `->count()`.
- **Repeater:** `Repeater::make('modifiers')->defaultItems(0)` (`MenuResource.php:77–116`) is unbounded but scoped to one menu's modifiers (≤ ~7 rows in seed data) — no measurable risk. `Select … ->preload()` on `category_id` (`:38`) avoids per-row option queries.
- **Seeder:** 6 + 5 `updateOrCreate` calls and one `firstOrFail` per menu; modifiers rebuilt with a single `delete()` + batch `create()` (`MenuSeeder.php:103–107`); whole seed ≈ 400 ms. No issue.
- **Table defaults:** `defaultSort('name')` / `defaultSort('sort_order')` are indexed enough at this scale; `since()` on `updated_at` is cheap.

---

## 5. Maintainability — **NEEDS WORK**

**Coverage vs. TEST-STRATEGY (§ RFC-002):**

| Planned test | Exists? | Verdict |
|---|---|---|
| **TC-002-1** CRUD Kategori | `CategoryCrudTest.php` (5 tests) | **Partial** — persistence asserted, but the expectation "*tampil pada tabel data Filament*" is **never asserted**: no test renders `ListCategories`/table rows. Delete (AC-2 "hapus") untested. |
| **TC-002-2** CRUD Menu + modifier FK | `MenuCrudTest.php::test_admin_can_create_menu_with_modifiers` | **PASS** — asserts record, category FK and both modifier rows with `menu_id`. |
| **TC-002-3** Toggle stok | `MenuStockToggleTest.php` (2 tests) | **PASS** for the panel half — drives the real `updateTableColumnState` and fails if the `ToggleColumn` is removed. The second half of TC-002-3, "*menu ditandai Habis pada katalog publik*", is **not testable yet** (public catalog = RFC-004) — correctly deferred, but should be tracked, and no `ListMenus` render test exists. |

**Other maintainability findings:**
- **Missing render smoke test for the menu table** — the single biggest coverage hole; one `Livewire::test(ListMenus::class)->assertSee('Es Kopi Susu Aren')` after seeding would have caught the blocking 500.
- No test for `FileUpload` (image validation/2 MB/disk), no test for category/menu `DeleteAction`, no test for `reorderable`.
- `tests/Unit/FormatRupiahTest.php:7–14` defines `formatRupiah()` **inside the test** with a comment *"placeholder implementation for testing purposes"* — a vacuous test of its own fixture (RFC-001 legacy, not RFC-002's file, but it is the only PHP `formatRupiah` in the repo and undermines TEST-1 credibility). Also 2 PHPUnit `@test`-metadata deprecation warnings (`FormatRupiahTest`, `RootPageTest`).
- **Implementation Notes accuracy:** accurate except Note 7 (free Fresh Milk row, see §1) and the unrecorded items listed in §1. Verification claims in §5 all reproduced except that repo-wide Pint does **not** pass.
- Readability is otherwise good: consistent Filament idioms, Indonesian labels, sensible section grouping, no dead branches.

---

## Overall Risk Level

# 🔴 HIGH

## Summary

RFC-002 delivers the full Filament admin for categories and menus — schema, resources, seeders and tests are well structured, the seeder matches the mock catalogue and modifier pricing exactly, and the stock-toggle/validation tests are genuinely regression-sensitive — **but the primary menu screen is broken in the default seeded state**: `/admin/menus` returns HTTP 500 (`MenuResource.php:144` passes an enum-cast `badge` into a `?string` closure), so an admin cannot reach the menu list, and therefore cannot use the stock toggle, edit or delete menus that carry a badge. On top of that, the project-wide `vendor\bin\pint --test` fails (mixed line endings in `bootstrap/providers.php`) and the test suite has no render test for the menu table, which is why this shipped green.

## Blocking Issues (must fix before merge)

1. **`app/Filament/Resources/MenuResource.php:143–152` — menu list page 500 with any badge.** `formatStateUsing(fn (?string $state) …)` and `color(fn (?string $state) …)` receive `App\Enums\BadgeEnum` because `Menu.php:25` casts `badge`. Reproduced: authenticated `GET /admin/menus` → **500** on the seeded DB (`Es Kopi Susu Aren` has `badge='favorit'`), while `/admin`, `/admin/categories`, `/admin/menus/create`, `/admin/menus/{id}/edit` → 200. This breaks AC-3 and makes AC-4 unreachable through the UI. **Fix:** type the closures as `BadgeEnum|string|null` (normalize with `$state instanceof BadgeEnum ? $state : BadgeEnum::tryFrom((string) $state)`), *or* drop the `badge` enum cast and keep `BadgeEnum::tryFrom()` at the edges, *or* add `->getStateUsing()` returning the label. **Then add** a regression test that renders `ListMenus` with a badge-bearing menu (and ideally a seeded one).
2. **`bootstrap/providers.php` — `vendor\bin\pint --test` exits 1** (mixed CRLF/LF line endings + fully-qualified class names). Trivial: re-save with LF and add `use App\Providers\AppServiceProvider;` / `use App\Providers\Filament\AdminPanelPanelProvider;`.

## Improvement Suggestions (non-blocking)

1. **Tests:** add (a) `ListCategories`/`ListMenus` render assertions (literal TC-002-1 expectation "*tampil pada tabel data Filament*"), (b) `DeleteAction` coverage for both resources (AC-2 "hapus"), (c) an image-upload test (`FileUpload` image/2 MB/public disk) to back Implementation Note 4's "berfungsi penuh" claim, (d) a badge round-trip test (create with badge → appears in table).
2. **Security hardening:** remove the silent `'password'` fallback in `AdminUserSeeder.php:19` (or fail fast when `APP_ENV=production`), read credentials from `config()` instead of `Env::get()`, and document `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env.example`. Add `->unique()` to `MenuResource` name input to protect seeder idempotency.
3. **Naming/cleanup:** rename `AdminPanelPanelProvider` → `AdminPanelProvider` (update `bootstrap/providers.php:5`); drop the scaffold `FilamentInfoWidget`; fix the misplaced role comment in `AdminUserSeeder.php:27`; fix the `menu_images/…` example comment in `create_menus_table.php:17`.
4. **Docs:** correct RFC §5 Note 7 (free Fresh Milk row is seeded) and record the unrecorded deviations (migration filenames, `categories.is_active`, Indonesian descriptions, provider class name).
5. **Consistency:** introduce a small PHP `formatRupiah()` helper for the three inline Rupiah formatters in `MenuResource` (and replace the self-referential `tests/Unit/FormatRupiahTest.php` placeholder), so CODE-2 can eventually be enforced on the PHP side too.

---

*Review performed 2026-10-24. No repository files were modified by this review (scratch probes were written only to `C:\Users\dzikrimuhamad\AppData\Local\Temp\opencode\`).*

---

## Round 2 — 2026-10-24

**Reviewer:** independent code reviewer (fresh context, separate session from Round 1 and from the fix author)
**Scope:** Re-assessment of RFC-002 (F31) after Round 1 blocking fixes. Re-verification of Round 1 findings + full re-review across the same five dimensions.
**Method:** static read of RFC/RULES/TEST-STRATEGY/FEATURES/PRD and all implementation files; live execution of every STEP 0 command; **authenticated runtime probing** of the real Filament pages against the freshly seeded dev database (through the real HTTP kernel); and a **temporary-patch experiment** to prove the new regression test is non-vacuous (patch reverted with `git checkout --`, tree verified clean afterwards).

---

## STEP 0 — Command output (ACTUAL)

### 1. `php artisan test`

```
   PASS  Tests\Unit\BadgeEnumTest
  ✓ badge labels match rfc specification                                                                         0.01s
  ✓ badge values are stable for database storage

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.55s
  ✓ admin can create category                                                                                    0.36s
  ✓ category form rejects empty name                                                                             0.29s
  ✓ admin can update category sort order                                                                         0.29s
  ✓ category seeder populates all categories                                                                     0.03s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                         0.55s
  ✓ menu form rejects negative price                                                                             0.48s
  ✓ menu form rejects empty name                                                                                 0.50s
  ✓ menu list renders with badge menu                                                                            0.20s
  ✓ edit menu form hydrates badge state                                                                          0.11s
  ✓ menu seeder populates full catalog                                                                           0.03s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.26s
  ✓ stock toggle can be restored                                                                                 0.27s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.04s

   PASS  Tests\Feature\TokenCssVisualTest
  ✓ root page loads epilogue and nunito sans fonts                                                               0.03s
  ✓ built stylesheet contains design tokens                                                                      0.02s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.03s
  ✓ root route returns app blade shell                                                                           0.03s

  Tests:    20 passed (90 assertions)
  Duration: 4.29s
```

**RESULT: PASS — 20 tests / 90 assertions**, matching the RFC's Round 1 Fixes verification claim ("20/20 lulus (90 assertions)"). Suite re-run again after the temporary-patch experiment (see below): still **20 passed (90 assertions)** — tree left green.

### 2. `vendor\bin\pint --test` (NO directory limits — repo-wide)

```
{"tool":"pint","result":"passed"}EXITCODE=0
```

**RESULT: PASS (exit 0).** Round 1 blocking issue #2 is genuinely fixed: `bootstrap/providers.php` now uses imports (`use App\Providers\AppServiceProvider;` / `use App\Providers\Filament\AdminPanelPanelProvider;`, lines 3–4) and consistent line endings — the file Pint previously failed on now passes, and Pint was run with **no directory arguments**.

### 3. `php artisan migrate:fresh --seed --force`

```
  Dropping all tables ................................................................................... 16.86ms DONE

   INFO  Preparing database.

  Creating migration table ............................................................................... 9.29ms DONE

   INFO  Running migrations.

  0001_01_01_000000_create_users_table .................................................................. 20.55ms DONE
  0001_01_01_000001_create_cache_table .................................................................. 13.10ms DONE
  0001_01_01_000002_create_jobs_table ................................................................... 15.74ms DONE
  2026_10_23_000001_create_categories_table .............................................................. 6.34ms DONE
  2026_10_24_000002_create_menus_table ................................................................... 3.96ms DONE
  2026_10_24_000003_create_menu_modifiers_table .......................................................... 3.84ms DONE

   INFO  Seeding database.

  Database\Seeders\AdminUserSeeder ........................................................................... RUNNING
  Database\Seeders\AdminUserSeeder ....................................................................... 228 ms DONE
  Database\Seeders\CategorySeeder ............................................................................ RUNNING
  Database\Seeders\CategorySeeder ......................................................................... 19 ms DONE
  Database\Seeders\MenuSeeder ................................................................................ RUNNING
  Database\Seeders\MenuSeeder ................................................................................ 69 ms DONE
```

**RESULT: PASS** — clean migration + seed (TEST-2). Live DB afterwards: **6 menus, 3 of which carry a badge** (favorit ×2, spesial ×1) — i.e. the exact state that triggered the Round 1 500.

### 4. `npm run build`

```
vite v8.3.5 building client environment for production...
transforming...
✓ 626 modules transformed.
rendering chunks...
computing gzip size...
public/build/manifest.json                 0.68 kB │ gzip:   0.25 kB
public/build/assets/app-P4Vhn28N.css       8.69 kB │ gzip:   2.60 kB
public/build/assets/Welcome-C_hdwSTd.js    1.89 kB │ gzip:   0.82 kB
public/build/assets/app-DTT7i3xQ.js      347.09 kB │ gzip: 108.49 kB

✓ built in 406ms
```

**RESULT: PASS** (626 modules, Vite 8.3.5 — consistent with the RFC).

### Extra: `npm test` (RFC Round 1 Fixes claim "npm test 5/5")

```
✔ formatRupiah (48.3724ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

**RESULT: PASS 5/5** — the RFC's extra claim is accurate.

---

## Round 1 Blocking Issues — re-verification

### Blocking #1 — `/admin/menus` HTTP 500 with badge: **GENUINELY FIXED ✅**

**(a) Static check.** `app/Filament/Resources/MenuResource.php:143–159` — both closures are now typed `BadgeEnum|string|null` and normalize via `match`/`tryFrom`:

```php
->formatStateUsing(
    fn (BadgeEnum|string|null $state): ?string => match (true) {
        $state instanceof BadgeEnum => $state->label(),
        is_string($state) => BadgeEnum::tryFrom($state)?->label(),
        default => null,
    }
)
->color(
    fn (BadgeEnum|string|null $state): string => match (
        $state instanceof BadgeEnum ? $state->value : $state
    ) { ... }
)
```

The `Menu.php:25` enum cast stays (a legitimate modeling choice), and the column now meets it correctly. All enum/string/null input shapes are covered.

**(b) Empirical runtime check against the SEEDED database.** Filament v3's login is a Livewire component (there is no `POST admin/login` route — confirmed via `php artisan route:list --path=admin`, only `GET|HEAD admin/login` exists), so a plain curl login is impossible. Probe was therefore run through the **real HTTP kernel** with a genuine session token (the exact `login_web_*` key `SessionGuard` looks for + `password_hash_web`), against the dev DB freshly built by `migrate:fresh --seed`:

```
admin user: admin@example.com (id 1)
menus with badge: 3 / 6
/admin                       => HTTP 200 (67231 bytes)
/admin/categories            => HTTP 200 (229709 bytes)
/admin/menus                 => HTTP 200 (290142 bytes)
/admin/menus/create          => HTTP 200 (104134 bytes)
/admin/categories/1/edit     => HTTP 200 (73238 bytes)
--- /admin/menus content checks (HTTP 200) ---
contains 'Es Kopi Susu Aren'  : YES
contains 'Croissant Almond'   : YES
contains 'V60 Flores Bajawa'  : YES
contains 'Favorit'            : YES
contains 'Spesial'            : YES
```

Guest probe (separate session, no cookies): `GET /admin/menus => 302 location=/admin/login` — auth wall intact. The page that was **500 in Round 1 is now a 200 full-page render** with badge labels ("Favorit"/"Spesial") actually present in the HTML. *(Probe artifacts written only to the approved temp directory; the `artisan serve` instance used for the guest probe was terminated afterwards.)*

**(c) Is the new regression test non-vacuous? YES — proven by temporary patch.** I reverted the two closures to the Round 1 broken `?string` signature (temporary local edit), ran the test, and restored with `git checkout -- app/Filament/Resources/MenuResource.php`:

```
FAIL  Tests\Feature\Filament\MenuCrudTest > menu list renders with badge menu    ViewException
App\Filament\Resources\MenuResource::{closure:...table():145}(): Argument #1 ($state)
must be of type ?string, App\Enums\BadgeEnum given, called in
vendor\filament\support\src\Concerns\EvaluatesClosures.php on line 35
at app\Filament\Resources\MenuResource.php:145
Tests:  1 failed (0 assertions)
```

That is **byte-for-byte the Round 1 failure mode**. After restore: `git status --porcelain` → empty, full suite → 20/20 green. `test_menu_list_renders_with_badge_menu` (`MenuCrudTest.php:131–156`) genuinely guards the fix: it creates a badge-bearing menu, renders the real `ListMenus` Livewire component and asserts `assertSuccessful()` + `assertCanSeeTableRecords()` — the failure happens inside table render, so it cannot pass with the old closure.

### Blocking #2 — repo-wide `pint --test`: **FIXED ✅** (see STEP 0 §2: exit 0 with no directory limits).

### Critical judgment of the two new tests

- `test_menu_list_renders_with_badge_menu` — **sound and non-vacuous** (proven above). *Minor:* it asserts record visibility, not the badge label text; an `assertSee('Favorit')` would also pin the `formatStateUsing` output. The kernel probe confirms the labels render today.
- `test_edit_menu_form_hydrates_badge_state` (`MenuCrudTest.php:158–184`) — asserts `assertFormSet(['badge' => 'spesial'])` on the edit form; it fails if enum→string hydration breaks. **However the RFC's wording overstates it slightly**: it "membuktikan alur edit-save badge aman" — the test covers the **read/hydrate** direction only. No test asserts the **save** direction for badge (the create test fills `badge => 'favorit'` but its `assertDatabaseHas` checks never include `badge`; the seeder test asserts DB badge via the seeder path, not the form). Non-blocking; noted below.
- **Still absent (were non-blocking in Round 1, honestly recorded as deferred in the RFC fix notes):** any `DeleteAction` test (menu and category), any `FileUpload`/image-upload test, any `ListCategories` render test — so **TC-002-1 remains partial** ("tampil pada tabel data Filament" for categories is still never asserted, and AC-2 "hapus" remains untested). Acceptable for this round since the blocking hole is closed and the deferral is explicitly recorded in the RFC.

### Previously unrecorded deviations — now recorded? **YES ✅**

RFC §"Round 1 Review Fixes" item 4 records: (a) actual migration filenames vs §2B — verified accurate against `database/migrations/` (`2026_10_23_000001_create_categories_table.php`, `2026_10_24_000002_create_menus_table.php`, `2026_10_24_000003_create_menu_modifiers_table.php`); the stated reasoning holds (lexicographic timestamp prefixes remain ascending, so execution order and schema are unaffected — confirmed by the clean `migrate:fresh`). (b) `categories.is_active` not in the §2A ERD — verified: migration line 16, `Category.php:14` `$fillable` + `:18` boolean cast, consumed by `Toggle`/`TernaryFilter` in `CategoryResource.php:53–55,79–80,87–88`; the recorded reasoning ("diperlukan untuk toggle status kategori") holds. (c) It also explicitly records which Round 1 non-blocking suggestions were **not** done this round (provider rename, delete/upload tests, `unique` on menu name, admin-credential hardening) — honest and accurate. *Residual:* RFC §5 **Note 7 still claims the seeder fills only *paid* modifiers**, yet `MenuSeeder.php:18` seeds Fresh Milk at `extra_price = 0` (correct vs. the mock, wrong vs. the note) — Round 1 docs suggestion, correctly tracked as deferred, still open.

---

## 1. RFC Adherence — **PASS**

| # | Acceptance Criterion | Round 2 verdict | Evidence |
|---|---|---|---|
| AC-1 | Panel `/admin` dengan autentikasi aman | **PASS** | `AdminPanelPanelProvider.php:27–29,54–56`; guest probe → `302 /admin/login`; seeded admin login works (authenticated kernel probes → 200). |
| AC-2 | CRUD kategori (tambah, edit, hapus, urutkan) | **PASS (impl) / partial tests** | Form + `EditAction`/`DeleteAction`/`reorderable('sort_order')` (`CategoryResource.php:30–58,90–100`); create/edit/sort asserted by tests; `/admin/categories` = 200 live. Delete & category-table render still untested (deferred, recorded). |
| AC-3 | CRUD menu + gambar polaroid, harga, badge promo | **PASS (was FAIL)** | Empirically **HTTP 200** on `/admin/menus` with 3 badge-bearing seeded rows, badge labels rendered (see Blocking #1 evidence). Form/create/edit 200 + tested. |
| AC-4 | Toggle stok berfungsi & tersimpan ke DB | **PASS** | `ToggleColumn` (`MenuResource.php:161–162`); `MenuStockToggleTest` drives real `updateTableColumnState`; the hosting page is no longer 500. |
| AC-5 | Seeder sesuai mock | **PASS** | Unchanged from Round 1 (names/prices/HABIS state/modifier prices verified in Round 1); re-verified counts via `migrate:fresh` (6 menus / 3 badges) and `MenuSeeder` re-read. |
| AC-6 | Validasi form menolak harga minus / nama kosong | **PASS (non-vacuous)** | Unchanged; tests still assert errors + zero persisted rows. |

## 2. Rules Compliance — **PASS**

| Rule | Round 2 verdict | Finding |
|---|---|---|
| **CODE-1 (PSR-12)** | **PASS** | `vendor\bin\pint --test` repo-wide exit 0 (the exact Round 1 failure condition, `bootstrap/providers.php`, is fixed with imports + consistent endings). |
| **CODE-3 (no dead code / stale comments)** | **PASS with carried-over minors (non-blocking, recorded as deferred)** | Still present: `create_menus_table.php:17` stale `menu_images/…` comment vs actual `menu-images` dir (`MenuResource.php:64`); misleading role comment `AdminUserSeeder.php:27`; noise comment `Menu.php:25` (`// nullable enum casting`); scaffold `FilamentInfoWidget` on the production dashboard (`AdminPanelPanelProvider.php:41`). All were Round 1 improvement suggestion #3, explicitly deferred in the RFC fix notes. No `console.log`/TODO found. |
| **CODE-4 / ARCH-3 / ARCH-5 / ARCH-6** | **PASS** | Unchanged from Round 1 (all PASS there); directory layout, singular PascalCase models, migrations+FKs all conform. |
| **TEST-1 / TEST-2** | **PASS** | F31 now exercised by 13 Filament feature tests (20 total, 90 assertions); `migrate:fresh` clean (STEP 0 §3). |
| **UI-1 … UI-6** | **SKIPPED — visibly** | Per CR-001: Filament back-office uses stock styling; the tactile design system applies to the customer-facing React app (RFC-004). Not evaluated. |

PRD "Product Type" scope applied as in Round 1 (Auth & Sessions, Authorization per Resource, Data Model, Page-Load Budget, desktop/tablet half of Responsive Layout); Accessibility/mobile-portrait/SEO/Browser-Support remain customer-facing-only skips.

## 3. Security — **PASS** (carried-over hardening notes, unchanged)

- **SEC-4 re-verified live:** guest → `302 /admin/login`; all admin pages require the authenticated session; `AuthenticateSession` enabled; bcrypt hashing in `AdminUserSeeder.php:26`.
- **Carried over from Round 1 (non-blocking, recorded as deferred):** weak default admin credential fallback (`AdminUserSeeder.php:18–19`, and `.env` still defines no `ADMIN_*` keys → live DB seeded `admin@example.com`/`password`); no `unique` on `menus.name` (also seeder-idempotency risk via `MenuSeeder.php:91`); `FileUpload` rules themselves remain correct (`image()`, `disk('public')`, 2 MB). Mass assignment, guest exposure, validation coverage: unchanged PASS.

## 4. Performance — **PASS**

Unchanged from Round 1 and consistent with the runtime probe: no N+1 (`category.name` auto-eager-loaded + relation-sortable; `menus_count`/`modifiers_count` via `withCount`), full `/admin/menus` page (290 KB HTML incl. 6 rows + badges) rendered without measurable cost; seeder ≈ 320 ms total.

## 5. Maintainability — **PASS**

- The single biggest Round 1 hole — no render test for the menu table — is closed by a **proven non-vacuous** regression test, and the RFC now documents the failure mode and fix explicitly.
- TC status: **TC-002-2 PASS, TC-002-3 PASS** (public-catalog half still correctly deferred to RFC-004); **TC-002-1 partial** (create/edit/sort asserted; delete + category-table render unasserted — deferred, recorded).
- RFC claims all re-verified accurate this round, including "npm test 5/5" (actually run: 5/5). Two wording nits: Note 7 (free Fresh Milk row) still inaccurate; "edit-save badge aman" overstates the hydrate-only test (see test judgment above).
- PHP 8.5 emits deprecation warnings from **Filament v3 vendor code** during renders (null array offsets in compiled views, `HasTabs.php:67`, `HasFormComponentActions.php:207`) — framework/runtime-compat noise, **not RFC-002 code**, not blocking; worth monitoring on the next Filament/PHP upgrade.

---

## Overall Risk Level

# 🟢 LOW

## Summary

Both Round 1 blocking issues are **genuinely fixed and empirically proven**: the badge-column closures now accept `BadgeEnum|string|null`, and `/admin/menus` returns a full HTTP 200 render (badge labels included) against the freshly seeded database where 3 of 6 menus carry a badge; the new regression test was demonstrated to fail with the exact original TypeError when the fix is reverted, so this bug class cannot silently return. Repo-wide `pint --test` is green with no directory limits, the full suite is 20/20 (90 assertions), migrations/seeding and the asset build are clean, and the previously unrecorded deviations are now recorded with reasoning that holds. Remaining items are all non-blocking and were explicitly recorded as deferred in the RFC.

## Blocking Issues

**None.**

## Improvement Suggestions (non-blocking — mostly carried over, all previously recorded as deferred)

1. **Tests:** add `DeleteAction` coverage for menu and category (AC-2 "hapus"), a `ListCategories` render assertion (literal TC-002-1 expectation), a badge **save-direction** assertion (`assertDatabaseHas(['badge' => …'])` after a form save), and an image-upload test (`FileUpload` image/2 MB/public disk) to back Implementation Note 4's "berfungsi penuh" claim. Optionally strengthen `test_menu_list_renders_with_badge_menu` with `assertSee('Favorit')`.
2. **Security hardening:** remove/document the `'password'` fallback in `AdminUserSeeder.php:19`, prefer `config()` over `Env::get()`, add `ADMIN_*` to `.env.example`; add `->unique()` to the menu name input.
3. **Cleanup:** rename `AdminPanelPanelProvider` → `AdminPanelProvider`; drop the scaffold `FilamentInfoWidget`; fix the stale `menu_images/` comment (`create_menus_table.php:17`) and the misplaced role comment (`AdminUserSeeder.php:27`); drop the noise comment on `Menu.php:25`.
4. **Docs:** correct RFC §5 Note 7 (free Fresh Milk row) and soften the Round 1 Fixes wording for `test_edit_menu_form_hydrates_badge_state` (hydration/read direction only).

---

*Round 2 review performed 2026-10-24. One temporary experiment (patching `MenuResource.php` to the old broken closure) was made and fully reverted via `git checkout --`; `git status --porcelain` verified clean before and after. All probe artifacts were written only to `C:\Users\dzikrimuhamad\AppData\Local\Temp\opencode\`. The only repository file modified by this review is this file.*
