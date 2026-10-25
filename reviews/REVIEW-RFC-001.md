# Review RFC-001 — Round 1 (2026-10-24)

**Reviewer:** Subagent code review (fresh context)
**Scope:** RFC-001 "Fondasi Proyek Laravel 11, Inertia React, dan Desain Sketchbook Kafe" (F25, F33)
**Repo state reviewed:** current working tree at `D:\Projects\stud-web` (clean `git status`; RFC-002 is also marked Implemented and its artifacts are present — noted where relevant)

---

## STEP 0 — Command Output (ACTUAL)

### 1. `php artisan test` — PASS (exit code 0)

```
   WARN  Metadata found in doc-comment for method Tests\Unit\FormatRupiahTest::formats_numbers_correctly(). Metadata in doc-comments is deprecated and will no longer be supported in PHPUnit 12. Update your test code to use attributes instead.

   WARN  Metadata found in doc-comment for method Tests\Feature\RootPageTest::root_page_renders_inertia_app(). Metadata in doc-comments is deprecated and will no longer be supported in PHPUnit 12. Update your test code to use attributes instead.

   PASS  Tests\Unit\FormatRupiahTest
  ✓ formats numbers correctly                                                                                    0.41s

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.26s
  ✓ admin can create category                                                                                    0.53s
  ✓ category form rejects empty name                                                                             0.29s
  ✓ admin can update category sort order                                                                         0.29s
  ✓ category seeder populates all categories                                                                     0.03s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                         0.62s
  ✓ menu form rejects negative price                                                                              0.49s
  ✓ menu form rejects empty name                                                                                 0.48s
  ✓ menu seeder populates full catalog                                                                            0.04s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.42s
  ✓ stock toggle can be restored                                                                                 0.26s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.05s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.03s
  ✓ root route returns app blade shell                                                                            0.03s

  Tests:    15 passed (68 assertions)
  Duration: 4.51s
```

### 2. `vendor\bin\pint --test` — FAIL (exit code 1)

```
{"tool":"pint","result":"fail","files":[{"path":"bootstrap\\providers.php","fixers":["fully_qualified_strict_types","line_ending","single_line_after_imports"]}]}
Exited with code 1
```

### 3. Bonus: `npm test` (TC-001-2's real JS test) — PASS (exit code 0)

```
> node --test "tests/JS/**/*.test.js"
▶ formatRupiah
  ✔ formats 28000 as "Rp 28.000" (46.3572ms)
  ✔ formats 0 as "Rp 0" (0.2622ms)
  ✔ coerces numeric strings (CODE-2) (0.26ms)
  ✔ formats large amounts with thousand separators (0.2074ms)
  ✔ falls back to "Rp 0" for invalid input (0.2542ms)
✔ formatRupiah (48.92156ms)
ℹ tests 5  ℹ pass 5  ℹ fail 0
```

### 4. `npm run build` — NOT RUN, DELEGATED (concurrent build process, per instructions).

Indirect evidence it has succeeded: `public/build/manifest.json` and compiled assets exist (`app-CCh3XKrs.js`, `app-Iu_HwSKZ.css`, `Welcome-nD6ESB39.js`). Compiled-CSS content was inspected via `Select-String` (read-only) — see AC findings below.

### PRD "Product Type" checks — applied vs skipped

- **Applied:** Data Model & Migrations (as far as RFC-001 scope: `categories` migration), Accessibility (44×44px touch target — *failed in practice, see UI finding*), Page-Load Budget (static assessment only; build delegated), SEO for Public Pages (checked — no OpenGraph tags yet, noted non-blocking).
- **Skipped:** *Auth/Sessions* and *Authorization per Resource* — no auth surface exists at RFC-001 stage (RFC-002/008); only verified the root route exposes nothing. *Full relational schema (menus/orders/coupons)* — out of RFC-001 scope (RFC-002+). *Browser Support* and live *Page-Load Budget* measurement — require real devices/timing, not possible in this static review. *binary size* and *offline sync* — skipped per PRD's own justification (PRD.md:41-43).

---

## 1. RFC Adherence — **NEEDS WORK**

All 7 acceptance criteria have real supporting code, and 5 of 7 have a regression-guarding test. However, the components that are supposed to *visualize* the tokens rely on Tailwind utility class names while **Tailwind is not installed or configured anywhere** — so large parts of the tactile styling never reach the browser.

| # | Acceptance Criterion | Verdict | Evidence |
|---|---|---|---|
| AC1 | Laravel 11+ initialized with `database.sqlite` | PASS | Laravel **12.12.2** (documented deviation, allowed by RULES §3 `^11.0 (atau ^12.0)`); `database/database.sqlite` exists (untracked via standard `database/.gitignore`); migration `database/migrations/2026_10_23_000001_create_categories_table.php:11-18` |
| AC2 | `@inertiajs/react` + React render root `app.blade.php` | PASS | `resources/js/app.jsx:7-17` (`createInertiaApp` + `createRoot`), `resources/views/app.blade.php:17-21` (`@vite`, `@inertia`, `@inertiaHead`), `app/Http/Middleware/HandleInertiaRequests.php:13` (`$rootView = 'app'`), registered at `bootstrap/app.php:15`. Guarded by `tests/Feature/WelcomePageTest.php:20-37` (asserts component `Welcome`, `appName`, and the `id="app"` shell) — **would fail on regression** |
| AC3 | Epilogue + Nunito Sans loaded | PASS (impl) / **no test** | `resources/views/app.blade.php:10-15` (preconnect + `display=swap`, weights 600/700/800 per UI-3), `resources/css/tokens.css:31-32`, `resources/css/app.css:5-23`. Planned mechanical test **TC-001-3 does not exist** (see §5) |
| AC4 | Hard shadow `3px 3px 0px #4A2C17` + press `translate(2px,2px)` | PASS (partial in practice) | `resources/css/tactile.css:18-26` (`.btn-tactile` = `--shadow-tactile-md` = `3px 3px 0px var(--color-ink)`; `:active` → `translate(2px,2px)` + `1px 1px`), tokens at `tokens.css:35-39`; `Button.jsx:7` applies `btn-tactile`. Verified present in compiled CSS (`3px 3px 0` ×1, `translate(2px` ×1). **But** the rest of the button's styling (fill `#FFC93C`, border, 44px target) is dead Tailwind — see below |
| AC5 | `formatRupiah(28000) === "Rp 28.000"` | PASS (JS) / FAIL-quality (PHP) | `resources/js/Utils/formatRupiah.js:8-17` — correct `Intl` id-ID usage with NBSP (U+00A0) normalization (a genuinely necessary fix; the RFC's literal snippet would emit `Rp\u00A028.000`). Guarded by `tests/JS/formatRupiah.test.js:7-26` which **imports the real module** and covers all TC-001-2 cases — **would fail on regression**. However `tests/Unit/FormatRupiahTest.php:7-14` defines its *own placeholder* `formatRupiah()` inside the test file and asserts against that — it tests nothing in the app |
| AC6 | No `#000000` in customer-facing styling | PASS | Grep of `resources/**`: only occurrence is the *comment forbidding it* at `tokens.css:4`; compiled CSS contains 0 occurrences of `#000000` |
| AC7 | Vite pipeline builds without error | PASS (not re-run; delegated) | `vite.config.js:5-12` (laravel + react plugins, both inputs); `public/build/manifest.json` + hashed assets exist from a previous successful build |

### Central finding: Tailwind utility class names are dead code

`package.json` contains **no `tailwindcss`** (deps: react, @inertiajs/react, react-dom; dev: vite, plugins — `package.json:10-21`), there is **no `tailwind.config.*` or `postcss.config.*`**, and `resources/css/app.css` has no Tailwind import. The RFC's own Implementation Note 3 confirms Tailwind was removed. Yet the components are written entirely in Tailwind utility syntax:

- `resources/js/Components/Button.jsx:6-13` — `inline-flex min-h-[44px] min-w-[44px] ... rounded-xl border-2 border-[var(--color-ink)] px-5 py-2 ... bg-[var(--color-primary)]`
- `resources/js/Components/Card.jsx:7` — `rounded-xl border-2 border-[var(--color-ink)] bg-[...] shadow-[var(--shadow-tactile-md)]`
- `resources/js/Layouts/AppLayout.jsx:6` — `min-h-screen px-4 py-6`
- `resources/js/Pages/Welcome.jsx:14-28` — `text-sm font-bold uppercase ... mb-6 p-5 text-[26px]` etc.
- `resources/views/app.blade.php:20` — `<body class="bg-surface font-body">` (classes don't exist)

Empirical confirmation from the compiled bundle `public/build/assets/app-Iu_HwSKZ.css`:

```
btn-tactile => 2        rounded-xl => 0      min-h- => 0
sketchbook-container => 1
```

Consequences in a real browser: the "Mulai Pesan" button renders with only the tactile shadow — **no yellow fill, no border, no padding, and no 44px touch target** (PRD accessibility NFR); `Card` renders with **no border and no hard shadow** (UI-4 requires cards to carry it); the layout has **no horizontal padding**. AC4 is literally satisfied for shadow+press but the design system (F25) does not actually render. Every downstream RFC that copies these components will inherit the defect.

**Fix options:** (a) replace the utility strings with plain CSS classes defined in `tactile.css`/`app.css` using the existing tokens (matches RFC §2B structure), or (b) re-add and configure Tailwind (contradicts Implementation Note 3 and RFC file structure). Either way, verify via computed styles (TC-001-3), not just compiled-CSS grep.

---

## 2. Rules Compliance — **NEEDS WORK**

| Rule | Verdict | Finding |
|---|---|---|
| ARCH-3 (directory structure) | PASS | `resources/js/{Components,Layouts,Pages,Utils}`, `resources/css/{tokens,tactile,app}.css`, `app/Http/Controllers`, `database/migrations` all present per convention |
| ARCH-5 (Laravel 11+/Inertia React/Filament) | PASS | Laravel 12 allowed by RULES §3; Inertia React in place; Filament correctly deferred to RFC-002 (and indeed present now) |
| ARCH-7 (.jsx components / .js utils) | PASS | `Button.jsx`, `Card.jsx`, `AppLayout.jsx`, `Welcome.jsx`, `formatRupiah.js` |
| API-1 (Inertia protocol) | PASS | Single root route via invokable `WelcomeController` (`routes/web.php:6`, `app/Http/Controllers/WelcomeController.php:14-19`); no manual REST |
| UI-1 (100% design system) | **FAIL** | Dead Tailwind class names — components do not visually realize DESIGN.md (see §1). DESIGN.md:177-178/194 specs confirmed to match the CSS tokens, but the component layer can't apply them |
| UI-2 (no `#000000`) | PASS | Zero occurrences in `resources/**` and compiled CSS |
| UI-3 (Epilogue headings / Nunito Sans body) | PASS | `tokens.css:30-32`, `app.css:5-23` (h1–h6 → Epilogue 700); font weights 600/700/800 loaded |
| UI-4 (hard shadow + press) | PASS (CSS) / **FAIL (Card)** | `.shadow-tactile-*` and `.btn-tactile:active` correct (`tactile.css:6-26`). But `Card.jsx`'s shadow is a dead Tailwind arbitrary value — the card shows **no shadow** in-browser |
| UI-5 (washi tape / squiggles / zigzag) | N/A (deferred) | Not required by RFC-001 ACs; belongs to later RFCs. Flagging for traceability: F25's acceptance point 2 (FEATURES.md:105) is not yet covered anywhere — ensure a later RFC owns it |
| UI-6 (mobile 320–430px, 480px container) | PASS (partial) | `.sketchbook-container` (`app.css:26-30`) correct; but `AppLayout`'s `px-4 py-6` padding is dead → content sits edge-to-edge |
| CODE-1 (PSR-12) | **FAIL** | `pint --test` exits 1 on `bootstrap/providers.php` (fixers: `fully_qualified_strict_types`, `line_ending`, `single_line_after_imports`). Likely introduced by RFC-002's panel registration, but the repo-wide gate is red and must be green before any merge |
| CODE-2 (centralized `formatRupiah`) | PASS (JS) | Single JS implementation, correct output; no PHP-side formatter exists (see §5) |
| CODE-3 (no debug/dead code) | NEEDS WORK | No `console.log`/TODO found, but dead Tailwind class strings and the fake PHP test qualify as dead/misleading code |
| CODE-4 (naming) | PASS | camelCase functions, PascalCase components |
| TEST-1 (Must features mechanically testable) | **NEEDS WORK** | F33 covered (WelcomePageTest). F25 **not mechanically tested** — TC-001-3 (tokens/font/shadow, Must priority) has no test artifact at all |

---

## 3. Security — **PASS**

- Root surface is minimal: `WelcomeController` exposes only `config('app.name')` as an Inertia prop (`WelcomeController.php:16-18`) plus shared `appName` (`HandleInertiaRequests.php:30`). No data, no user input, no query parameters consumed (ARCH-4 `?table` handling is RFC-003 scope).
- `resources/views/app.blade.php:6` emits a CSRF token meta — correct baseline for future Inertia mutations.
- `database/database.sqlite` is excluded from version control via the standard `database/.gitignore` — no credential/db leakage.
- No auth routes exist yet; `/admin` Filament protection is verified by RFC-002's `CategoryCrudTest` ("admin panel requires authentication") — out of scope here but present and passing.
- Note for RFC-003+: the root route currently ignores `?table=`; when implemented, table ID must be validated server-side (noted, not a current defect).

---

## 4. Performance — **PASS**

- Vite pipeline is lean: two inputs (`app.css`, `app.jsx`), content-hashed assets, React 19, no unnecessary runtime deps (`vite.config.js:5-12`, `package.json`).
- Fonts: `preconnect` to both `fonts.googleapis.com` and `fonts.gstatic.com` with `crossorigin`, `display=swap`, and only 6 weights requested (`app.blade.php:10-15`) — good for the <2s budget on mobile.
- Non-blocking suggestions: Google Fonts stylesheet is render-blocking in `<head>`; self-hosting the two woff2 files (later RFC) would remove an external round-trip and a third-party dependency on cafe Wi-Fi. `app.jsx` imports CSS before Inertia — fine.
- `vite.config.js:13-17` ignores `storage/framework/views/**` from the watcher — sensible, avoids HMR loop noise.

---

## 5. Maintainability — **NEEDS WORK**

**Blocking-quality issues:**

1. **Fake PHP test — `tests/Unit/FormatRupiahTest.php:7-14`.** The file defines its own global placeholder `formatRupiah()` (`// Simple placeholder implementation for testing purposes`) and then asserts against it (lines 21-23). It would pass identically if `resources/js/Utils/formatRupiah.js` were deleted or broken. It tests a copy of the logic, not the application. Worse, the `function_exists` guard means that if a *real* PHP helper is added later, this test may silently keep testing the wrong implementation. The genuine TC-001-2 coverage lives in `tests/JS/formatRupiah.test.js` (which correctly imports the real module). **Delete the PHP test, or implement a real PHP `formatRupiah` helper (e.g., `app/Support/`) and have the test target it.**

2. **Duplicate root-page tests.** `tests/Feature/RootPageTest.php:11-18` and `tests/Feature/WelcomePageTest.php:20-29` assert the same thing (`component('Welcome')` + `has('appName')`). Additionally, `RootPageTest` does **not** call `withoutVite()` — it currently passes only because `public/build/manifest.json` exists on this machine; on a fresh CI clone before `npm run build` it would throw `ViteManifestNotFoundException` and fail. Consolidate into `WelcomePageTest` (which does it right) and delete `RootPageTest`.

3. **Deprecated PHPUnit metadata.** Both `/** @test */` annotations (`RootPageTest.php:10`, `FormatRupiahTest.php:18`) produce PHPUnit 12 deprecation warnings in the test output. Use `#[Test]` attributes or `test_` prefixes (WelcomePageTest's style) — important since `composer.json:22` pins `phpunit ^11.5` with an upgrade path ahead.

4. **Planned test TC-001-3 does not exist.** TEST-STRATEGY.md:79 specifies a Must-priority visual test (computed background `#FFF9EF`, Nunito Sans body, Epilogue headings, button hard shadow). Nothing implements it — and the dead-Tailwind defect is exactly the class of regression it would have caught. Suggested minimal mechanical version: a Dusk test (dusk is already in `composer.json:23`) asserting computed styles on `/`, or at minimum a feature test asserting the compiled CSS/blade contains the token values.

**Positive notes:** no `console.log`, no TODOs, no unused imports found; every RFC-001 component/util is actually used by `Welcome.jsx`; the JS `formatRupiah` has good defensive coercion and a clear docblock explaining the NBSP normalization rationale; `WelcomeController` is properly invokable with a docblock stating RFC-003 deferral.

---

## Overall Risk Level: **High**

## Summary

The backend foundation is genuinely solid — Laravel 12 + Inertia wired correctly, root page fully integration-tested, the JS `formatRupiah` correct (with a well-reasoned NBSP fix) and guarded by a real unit test, zero `#000000`, and a clean security posture. However, the tactile design system — the entire point of RFC-001/F25 — does not actually render: `Button`, `Card`, `AppLayout` and `Welcome` are written in Tailwind utility syntax while Tailwind was deliberately removed from the project, so buttons lose their yellow fill/border/44px touch target and cards lose their hard shadow in real browsers. Combined with a red `pint --test` gate, a fake PHP test that tests its own placeholder, and the missing TC-001-3, the "Implemented" status overstates what is verifiably true.

## Blocking Issues (must fix before merge)

1. **Dead Tailwind styling in components** — `resources/js/Components/Button.jsx:6-13`, `Card.jsx:7`, `Layouts/AppLayout.jsx:6`, `Pages/Welcome.jsx:14-28`, `resources/views/app.blade.php:20`. Verified empirically: compiled CSS contains 0 Tailwind utilities. Either restore Tailwind properly or (preferred, per RFC §2B) rewrite with plain CSS classes built on `tokens.css`/`tactile.css`. Then verify with computed styles, not just compiled-CSS grep.
2. **`vendor\bin\pint --test` fails** on `bootstrap/providers.php` (CODE-1 gate red; `line_ending` + import fixers). Run `vendor\bin\pint` to autofix.
3. **Fake/misleading test** `tests/Unit/FormatRupiahTest.php:7-14` tests a placeholder defined inside the test file — delete it or wire it to a real PHP helper.
4. **Missing planned Must test TC-001-3** (tokens/fonts/shadow) — TEST-1 requires F25 to be mechanically testable; add at least a minimal Dusk or compiled-asset assertion.

## Improvement Suggestions (non-blocking)

- Delete `tests/Feature/RootPageTest.php` (duplicates `WelcomePageTest` and is environment-dependent via the Vite manifest).
- Replace `/** @test */` annotations with `#[Test]` attributes / `test_` prefixes to clear PHPUnit 12 deprecation warnings.
- Self-host Epilogue/Nunito Sans woff2 later in the program to cut a render-blocking third-party request (relevant to the <2s budget on cafe Wi-Fi).
- Add basic OpenGraph meta tags to `app.blade.php` when RFC-003/004 landing pages exist (PRD "SEO for Public Pages").
- Track the F25 acceptance point for washi tape / squiggly dividers / zigzag receipt cut (FEATURES.md:105, point 2) in a later RFC so it is not lost — RFC-001 intentionally scoped only tokens/shadows.
- When `?table=` detection lands (RFC-003), validate the parameter server-side and add a test asserting non-numeric values are rejected.
- `laravel/dusk` (`composer.json:23`) is installed but unused; either add the TC-001-3 Dusk test above or defer the dependency to RFC-008.

---

## Round 2 — 2026-10-24

**Reviewer:** Subagent code review (fresh context, Round 2)
**Scope:** Re-verification of Round 1 blocking issues + full re-assessment of RFC-001 after fix commit `70969e3` ("review-rfc: fix Round 1 blockers - reinstall Tailwind v4 for RFC-001 design tokens, fix badge enum 500 on /admin/menus, add TC-001-3 and regression tests")
**Repo state reviewed:** clean working tree at `70969e3` (HEAD). `npm run build` not re-run per instructions; the existing build (`public/build/manifest.json` → `assets/app-P4Vhn28N.css`) was inspected directly.

---

## STEP 0 — Command Output (ACTUAL)

### 1. `php artisan test` — PASS (exit code 0)

```
   PASS  Tests\Unit\BadgeEnumTest
  ✓ badge labels match rfc specification                                                                         0.01s
  ✓ badge values are stable for database storage

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.57s
  ✓ admin can create category                                                                                    0.35s
  ✓ category form rejects empty name                                                                             0.30s
  ✓ admin can update category sort order                                                                         0.32s
  ✓ category seeder populates all categories                                                                     0.04s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                          0.60s
  ✓ menu form rejects negative price                                                                              0.50s
  ✓ menu form rejects empty name                                                                                  0.50s
  ✓ menu list renders with badge menu                                                                             0.24s
  ✓ edit menu form hydrates badge state                                                                           0.12s
  ✓ menu seeder populates full catalog                                                                            0.04s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.32s
  ✓ stock toggle can be restored                                                                                  0.29s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.06s

   PASS  Tests\Feature\TokenCssVisualTest
  ✓ root page loads epilogue and nunito sans fonts                                                               0.04s
  ✓ built stylesheet contains design tokens                                                                      0.03s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.04s
  ✓ root route returns app blade shell                                                                            0.03s

  Tests:    20 passed (90 assertions)
  Duration: 4.62s
```

No PHPUnit 12 deprecation warnings this round (both `/** @test */` doc-comment warnings from Round 1 are gone). Matches the claim in the RFC's "Round 1 Review Fixes" section (20/20, 90 assertions).

### 2. `vendor\bin\pint --test` — PASS (exit code 0), run WITHOUT directory limits

```
{"tool":"pint","result":"passed"}
```

`bootstrap/providers.php` (Round 1 failure: `fully_qualified_strict_types`, `line_ending`, `single_line_after_imports`) is fixed via commit diff: imports added and classes referenced by alias.

### 3. `npm test` — PASS (exit code 0)

```
> test
> node --test "tests/JS/**/*.test.js"

▶ formatRupiah
  ✔ formats 28000 as "Rp 28.000" (16.0129ms)
  ✔ formats 0 as "Rp 0" (0.2615ms)
  ✔ coerces numeric strings (CODE-2) (0.2614ms)
  ✔ formats large amounts with thousand separators (0.1942ms)
  ✔ falls back to "Rp 0" for invalid input (0.2354ms)
✔ formatRupiah (18.7649ms)
ℹ tests 5
ℹ suites 1
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 110.9275
```

### 4. Registry verification of the RULES.md §3 Tailwind row

```
npm view tailwindcss version        -> 4.3.3
npm view @tailwindcss/vite version  -> 4.3.3
npm ls tailwindcss @tailwindcss/vite
├─┬ @tailwindcss/vite@4.3.3
│ └── tailwindcss@4.3.3 deduped
└── tailwindcss@4.3.3
```

The claim `4.3.3` in RULES.md:51 is **verified correct** against the npm registry, and the installed tree matches.

### 5. Compiled CSS audit (`public/build/assets/app-P4Vhn28N.css`, 8 691 bytes ≈ 8.7 kB as claimed)

```
file = app-P4Vhn28N.css bytes=8691
rounded-xl{ count = 1
min-h-[44px]{ count = 1            (CSS-escaped selector .min-h-\[44px\]{)
focus-visible:outline-2 count = 1
btn-tactile count = 2
3px 3px 0 count = 1
translate(2px count = 1
000000 any-case count = 0
default shadow utility classes count = 0   (.shadow-sm{ .shadow-md{ .shadow-lg{ .shadow-xl{ .shadow-2xl{ .shadow-inner{)
0000001a alpha count = 0
```

All arbitrary-value utilities used by the JSX are compiled (checked with CSS-escaped selectors): `text-[26px]`, `leading-[34px]`, `bg-[var(--color-primary)]`, `text-[var(--color-surface)]`, `focus-visible:outline-[var(--color-ink)]`, `min-h-[44px]`, `min-w-[44px]`, `text-[18px]`, `border-[var(--color-ink)]`, `text-[var(--color-ink)]`, `bg-[var(--color-surface-container-lowest)]`, `bg-[var(--color-promo)]`, `text-[var(--color-outline)]`, `leading-[24px]`, `text-[16px]` — each count = 1, plus `marker-shadow-md` (1), `inline-flex`, `min-h-screen`, `px-4`, `px-5`, `py-6`, `rounded-xl`, `uppercase`, `tracking-wide`, `font-extrabold`, `font-semibold`, `border-2`, `items-center`, `justify-center`, `mb-6`, `p-5`, `text-sm` — all present.

`000000` in the built JS bundle (`app-DTT7i3xQ.js:1`) was inspected: it is the UUID-v4 template string `` `10000000-1000-4000-8000-100000000000` `` inside the React/Inertia runtime — **not a color**, not customer-facing styling. In `resources/**` the only `000000` remains the comment *forbidding* it (`tokens.css:4`).

### PRD "Product Type" checks — same scoping as Round 1

Applied: Data Model & Migrations (categories migration in scope), Accessibility (44×44 target now genuinely rendered — `min-h-[44px]`/`min-w-[44px]` are compiled), Page-Load Budget (static; CSS bundle 8.7 kB), SEO (no OpenGraph yet — carried over as non-blocking). Skipped (with same justification as Round 1): Auth/Sessions and per-resource Authorization (no RFC-001 auth surface; `/admin` guard covered by RFC-002 tests, all passing), full relational schema (RFC-002+), live Browser Support / timing measurement.

---

## Verification of Round 1 Blocking Issues

### 1. Dead Tailwind styling — ✅ **GENUINELY FIXED**

- **Installed:** `package.json:11,16` — `tailwindcss@^4.3.3` + `@tailwindcss/vite@^4.3.3`; installed tree resolves to exactly 4.3.3; RULES.md §3 registry row added (RULES.md:51) and its version claim verified against `npm view`.
- **Configured:** `vite.config.js:4,13` (plugin registered); `resources/css/app.css:1-6` — `@import 'tailwindcss' source(none);` + `@source '../js';` + `@source '../views';` + `@theme { --shadow-*: initial; }`. `source(none)` + narrow `@source` correctly prevents scanning of Filament's compiled views in `storage/framework/views/` and the `desain-web/` prototypes (bundle is 8.7 kB, not the claimed 42 kB full scan).
- **Actually compiled:** the built stylesheet contains real rules for `.rounded-xl{`, `.min-h-\[44px\]{`, `.focus-visible\:outline-2`, and every other utility/variant the four JSX components and the blade shell use (full list in STEP 0 §5). The exact empirical signature Round 1 used to prove the defect (`rounded-xl => 0`) is now `=> 1`.
- **UI-2 black defaults really removed:** `@theme { --shadow-*: initial; }` works — built CSS has **0** occurrences of `000000` (case-insensitive), **0** of the alpha form `0000001a`, and **0** compiled default `.shadow-sm/md/lg/xl/2xl/inner{` utilities. `Card.jsx:7` moved from arbitrary `shadow-[var(--shadow-tactile-md)]` to the `marker-shadow-md` class from `tactile.css:10-12`, which is compiled into the bundle (count 1).
- Dead `<body class="bg-surface font-body">` classes removed (`app.blade.php:20` is now bare `<body>`); `app.css:11-18` styles the body from tokens instead.

### 2. `pint --test` repo-wide green — ✅ **FIXED**

`{"tool":"pint","result":"passed"}` on the full repo, no directory limits. `bootstrap/providers.php` diff shows proper `use` imports.

### 3. Fake `tests/Unit/FormatRupiahTest.php` — ✅ **FIXED**

- File deleted (confirmed: `tests/Unit/` contains only `BadgeEnumTest.php`; commit stat shows `tests/Unit/FormatRupiahTest.php | 25 -`).
- Replacement `tests/Unit/BadgeEnumTest.php:10-22` is a **real** unit test — imports `App\Enums\BadgeEnum` and asserts labels/values/`tryFrom` behavior; it would fail if the enum changed.
- Real TC-001-2 coverage confirmed by reading `tests/JS/formatRupiah.test.js:3` — it imports **the real module** (`../../resources/js/Utils/formatRupiah.js`) and line 8 asserts `formatRupiah(28000) === 'Rp 28.000'`; it runs via `npm test` (5/5 pass, STEP 0 §3). The util under test (`resources/js/Utils/formatRupiah.js:8-17`) is the app's actual implementation.

### 4. TC-001-3 exists — `tests/Feature/TokenCssVisualTest.php` — ✅ **FIXED (adequate regression guard)**

Read critically:

- **Would it fail on a Round 1-style regression?** Yes. `test_built_stylesheet_contains_design_tokens():51-78` asserts the exact failure signatures: regex `/\.rounded-xl\s*\{/` (line 73 — the dead-utility class of regression), `btn-tactile` presence (line 74), tokens `#FFF9EF`/`#4A2C17`, hard shadow `3px 3px 0`, press `1px 1px 0`, Epilogue/Nunito Sans, and `assertStringNotContainsStringIgnoringCase('#000000')` (line 77). Removing Tailwind from the pipeline or reverting `Card.jsx` to a dead arbitrary shadow would fail this test on the next build. `test_root_page_loads_epilogue_and_nunito_sans_fonts():36-45` runs unconditionally (`withoutVite()`) and guards the font links.
- **Skip-guard on missing build (lines 17-30, 55-57):** acceptable. `/public/build` is gitignored (`.gitignore:16`), so on a fresh clone the token test *skips* rather than fails. This is the right behavior for a dev machine before the first build, **but** it means the guard is only active if CI/dev pipelines run `npm run build` before `php artisan test`. Carried as a non-blocking process note, not a defect — the alternative (hard-fail on fresh clones) would break the standard Laravel test workflow, and the test correctly resolves the stylesheet path from the manifest rather than hard-coding a hash.
- **Recorded test-type deviation** (compiled stylesheet + HTML response instead of browser computed style, Dusk deferred to RFC-008): reasonable and correctly recorded in the RFC's Round 1 Fixes note 6; Dusk E2E remains the stronger check for RFC-008.

### RootPageTest fixes — ✅ **FIXED**

`tests/Feature/RootPageTest.php:10-12` now uses `test_root_page_renders_inertia_app` (no `/** @test */` doc-comment — the PHPUnit 12 warning is gone from output) and calls `withoutVite()`, so it no longer depends on a local build manifest. It still duplicates `WelcomePageTest` (Round 1 non-blocking suggestion to consolidate was not taken) — still non-blocking.

### New issues introduced by the fix commit — none blocking

Full diff of `70969e3` inspected (`git show 70969e3 --stat`, plus per-file diffs for `Button.jsx`, `Card.jsx`, `app.blade.php`, `tactile.css`, `bootstrap/providers.php`, `app.css`, `package.json`, `RULES.md`):

- `tactile.css` classes renamed `.shadow-tactile-*` → `.marker-shadow-*` (lines 6-16) to avoid colliding with Tailwind's `shadow-*` utility namespace. Visual result identical; the only remaining reference is `Card.jsx:7` (updated). **Minor doc drift:** RFC §3A's CSS snippet still shows the old `.shadow-tactile-*` names — cosmetic, non-blocking.
- `Button.jsx` change is comment-only; `app.blade.php` change removes the dead body classes; `MenuResource.php`/`MenuCrudTest.php`/`BadgeEnum` changes are RFC-002 scope (out of this review) but their tests pass.
- No `console.log`, `TODO`, or `FIXME` in `resources/js` (grep: none).

---

## 1. RFC Adherence — **PASS**

| # | AC | Round 2 Verdict | Evidence |
|---|---|---|---|
| AC1 | Laravel 11+ + `database.sqlite` | PASS | Unchanged from Round 1 (Laravel 12.12.2, documented deviation allowed by RULES §3) |
| AC2 | Inertia React root render | PASS | Unchanged; `WelcomePageTest` + `RootPageTest` green |
| AC3 | Fonts load | PASS | `app.blade.php:10-15`; now guarded by `TokenCssVisualTest:36-45` |
| AC4 | Hard shadow + press | PASS (now fully in practice) | `tactile.css:18-26` compiled; button fill/border/44px target now live utilities (STEP 0 §5); `.btn-tactile` count 2, `3px 3px 0` ×1, `translate(2px` ×1 in built CSS |
| AC5 | `formatRupiah(28000)==='Rp 28.000'` | PASS | Real util + real JS test (5/5); fake PHP test removed |
| AC6 | No `#000000` in customer-facing styling | PASS (now test-enforced) | Built CSS: 0 × `000000`, 0 × `0000001a`, 0 × default shadow utilities; assertion at `TokenCssVisualTest:77` |
| AC7 | Vite build clean | PASS | Manifest + hashed assets consistent (`app-P4Vhn28N.css` referenced by manifest and present); build delegated per instructions |

The Round 1 central finding (dead Tailwind utilities → design system not rendering) is empirically disproven for the current build: every utility class in `Button.jsx`, `Card.jsx`, `AppLayout.jsx`, `Welcome.jsx` has a compiled rule.

## 2. Rules Compliance — **PASS**

| Rule | Round 2 Verdict | Finding |
|---|---|---|
| ARCH-3/5/7, API-1 | PASS | Unchanged from Round 1 |
| UI-1 (100% design system) | **PASS** (was FAIL) | Components now actually realize DESIGN.md: utilities compile, tokens drive colors/typography, 44px touch target live |
| UI-2 (no `#000000`) | PASS | Zero in built CSS including Tailwind's `#0000001a` shadow fallback (`--shadow-*: initial` verified working); enforced by test |
| UI-3 | PASS | `tokens.css:30-32`, `app.css:20-29`; asserted in test |
| UI-4 | **PASS** (Card shadow now renders) | `marker-shadow-md` compiled; `.btn-tactile:active` press verified |
| UI-5 | N/A (deferred, carryover) | Still owned by no RFC — F25 acceptance point 2 (FEATURES.md:105) traceability flag stands |
| UI-6 | PASS | `.sketchbook-container` + now-live `px-4 py-6` |
| CODE-1 | **PASS** (was FAIL) | `pint --test` passed repo-wide |
| CODE-2 | PASS | Real JS test on real module |
| CODE-3 | **PASS** (was NEEDS WORK) | Fake test deleted; no dead class strings; no debug code |
| CODE-4 | PASS | Unchanged |
| TEST-1 | **PASS** (was NEEDS WORK) | F33: `WelcomePageTest`; F25: `TokenCssVisualTest` (tokens/fonts/shadow/black) + compiled-utility regression guard |

## 3. Security — **PASS**

Unchanged posture from Round 1 (minimal root surface, CSRF meta at `app.blade.php:6`, sqlite gitignored, Filament auth covered by RFC-002 tests — all 5 Category/Menu CRUD tests green this round). New dependencies are build-time devDependencies (Tailwind), not runtime attack surface.

## 4. Performance — **PASS**

- Customer CSS bundle: **8 691 bytes** with Tailwind properly tree-shaken via `source(none)` + `@source '../js'`/`'../views'` — validates the author's bloat-avoidance claim (42 kB → 8.7 kB).
- No runtime cost from the fix; `@theme` reset is compile-time. Fonts/preconnect posture unchanged.

## 5. Maintainability — **PASS**

Positive: the Round 1 "would-pass-if-the-app-were-broken" test was deleted and replaced with a genuine unit test; TC-001-3 now pins the exact regression class that motivated Round 1; PHPUnit 12 deprecation warnings eliminated; the RFC's Implementation Notes + Round 1 Fixes section document the conflict and resolution transparently (including superseding note 3).

Non-blocking carryovers (all previously flagged, none regressed):
1. `RootPageTest` still duplicates `WelcomePageTest` (consolidation suggested in Round 1, not taken).
2. `TokenCssVisualTest` token assertions skip on fresh clones without a build — CI must run `npm run build` before `php artisan test` for the guard to be active.
3. `laravel/dusk` still installed but unused (RFC-008 deferral).
4. RFC §3A CSS snippet still names `.shadow-tactile-*` while `tactile.css` uses `.marker-shadow-*` — cosmetic doc drift inside the RFC.
5. RULES.md:51 wording says `@source resources/**` while the actual config is narrower (`../js` + `../views`) — the implementation is stricter than the rule text; harmless, but the row could say so precisely.
6. F25 acceptance point 2 (washi tape / zigzag) remains unowned by any RFC.

---

## Judgment on the Recorded Deviation / Conflict Resolution (Tailwind reinstalled vs. pure-CSS rewrite)

**The reasoning HOLDS — the deviation is properly recorded and justified.**

1. **Authority chain is correct.** The RFC's original note 3 ("Tailwind dihapus") was itself an *undeclared* deviation from the governing artifacts: CR-001 (changes/CHANGE-REQUEST-001.md:58) explicitly lists **Tailwind CSS** in the updated registry-verified dependency table ("Memperbarui tabel dependensi terverifikasi: … Filament v3, Tailwind CSS, Vite"). At Round 1 time the row was missing from RULES.md — the RFC note was working around a documentation drift instead of following CR-001. Reinstalling Tailwind *restores* consistency with CR-001, and the fix commit simultaneously repairs the RULES.md drift with a registry-verified row (version `4.3.3` independently re-confirmed via `npm view` in STEP 0 §4).
2. **RFC contract preserved.** RFC §2B's file structure listed no Tailwind config because Tailwind v4 is configured inline in `app.css` — no new files were needed, the three-CSS-file structure (`tokens.css`, `tactile.css`, `app.css`) still holds, and the design tokens remain pure CSS custom properties consumed by both Tailwind arbitrary values and the tactile classes. RFC §3A's token/shadow specs are implemented verbatim (modulo the cosmetic class rename).
3. **Option parity.** Round 1 explicitly offered both fix paths ((a) plain CSS classes, (b) re-add Tailwind properly). Option (b) is now fully executed: installed, configured, source-restricted, UI-2-safe, and regression-tested. DESIGN.md imposes no styling-methodology constraint (grep: no Tailwind mention — no conflict either way).
4. **Downstream coherence.** RFCs 004–008 build many React screens; a consistent utility pattern with a tested config is a defensible architectural choice, and the RFC documents it as superseding note 3 rather than silently contradicting it — which is exactly what the change-management workflow requires.

Residual nit (non-blocking): RFC §3A snippet class names (item 4 in carryovers) should be updated in a future docs pass so the RFC body matches `tactile.css`.

---

## Overall Risk Level: **Low** (was High in Round 1)

## Summary

All four Round 1 blocking issues are genuinely, empirically fixed: the design system now actually renders (every JSX utility class has a compiled rule in the 8.7 kB built stylesheet, verified class-by-class), `@theme { --shadow-*: initial; }` verifiably eliminates Tailwind's `#000000`/`#0000001a` shadow defaults (0 occurrences), `pint --test` is green repo-wide, the fake PHP test is deleted with real coverage preserved in `tests/JS/formatRupiah.test.js` (real module, `formatRupiah(28000)==='Rp 28.000'`), and `TokenCssVisualTest` provides a genuine regression guard for the exact defect class Round 1 caught. The test suite grew to 20/20 (90 assertions) with zero PHPUnit deprecation warnings. The Tailwind-vs-pure-CSS conflict resolution is sound: it follows CR-001's verified dependency table (with the RULES.md drift repaired and the `4.3.3` claim independently verified against npm), keeps the RFC's file structure and token architecture intact, and is transparently recorded as superseding the earlier deviation note. Remaining items are non-blocking carryovers (duplicate root test, build-required-for-token-test CI ordering, unused Dusk, minor RFC doc drift, unowned F25 point 2).

## Blocking Issues (Round 2)

**None.**

## Improvement Suggestions (non-blocking)

1. Ensure CI (or the pre-merge checklist) runs `npm run build` before `php artisan test` so `TokenCssVisualTest`'s stylesheet assertions are active rather than skipped on fresh clones.
2. Consolidate `RootPageTest` into `WelcomePageTest` (or give RootPageTest a distinct purpose, e.g. `?table=` behavior in RFC-003) to remove the duplication Round 1 flagged.
3. Update RFC-001 §3A's CSS snippet from `.shadow-tactile-*` to `.marker-shadow-*` so the RFC body matches `tactile.css:6-16`.
4. Tighten the RULES.md:51 row wording to name the actual directives (`source(none)` + `@source ../js` + `@source ../views`) instead of the vaguer `@source resources/**`.
5. Defer or adopt `laravel/dusk` deliberately at RFC-008 (still unused).
6. Assign F25 acceptance point 2 (washi tape / squiggly dividers / zigzag receipt cut, FEATURES.md:105) to an explicit RFC so it is not lost.
7. Carry forward Round 1's suggestions: self-host fonts later (third-party render-blocking request), OpenGraph tags when landing pages exist (RFC-003/004), server-side validation of `?table=` with a rejection test.
