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
