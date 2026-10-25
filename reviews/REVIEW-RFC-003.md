# Review RFC-003 — Alur Sesi, Deteksi Meja QR, dan Formulir Takeaway

## Round 1 — 2026-10-24

**Reviewer:** independent code reviewer (fresh context, no memory of implementation)
**Scope:** RFC-003 (F1, F2, F3, F4, F23, F26) — backend `OrderSessionController`/`CatalogController`/`routes/web.php`, frontend Welcome/Catalog pages + 4 new components + 2 utils, and the new test files.
**Predecessor check:** `RFCS.md` line 26 → RFC-001 = *Reviewed* ✅ (RFC-003 depends on RFC-001 only). Status table shows RFC-003 = *Implemented*.
**Method:** static read of the RFC (incl. all 11 Implementation Notes), RULES.md, FEATURES.md, TEST-STRATEGY.md, PRD.md (Product Type section), the design prototype `desain-web/01_welcome_meja_12/code.html` and `DESIGN.md`; full read of every listed implementation and test file; **live execution** of the test suite, JS tests, production build, built-CSS inspection and Pint; source-level inspection of `@inertiajs/react`/`@inertiajs/core` v3 internals (to verify CSRF wiring, remount and error-propagation behaviour); WCAG contrast computation on the actual token values. Git state verified clean (`git status --porcelain` empty; HEAD = `2af29ba`), so the working tree is exactly the RFC-003 commit — no uncommitted drift.

---

## STEP 0 — Command output (ACTUAL)

### 1. `php artisan test`

```
   PASS  Tests\Unit\BadgeEnumTest
  ✓ badge labels match rfc specification                                                                         0.02s
  ✓ badge values are stable for database storage

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.75s
  ✓ admin can create category                                                                                    0.66s
  ✓ category form rejects empty name                                                                             0.32s
  ✓ admin can update category sort order                                                                         0.37s
  ✓ category seeder populates all categories                                                                     0.04s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                         1.37s
  ✓ menu form rejects negative price                                                                             1.02s
  ✓ menu form rejects empty name                                                                                 1.23s
  ✓ menu list renders with badge menu                                                                            0.61s
  ✓ edit menu form hydrates badge state                                                                          0.29s
  ✓ menu seeder populates full catalog                                                                           0.09s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.65s
  ✓ stock toggle can be restored                                                                                 0.73s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.19s

   PASS  Tests\Feature\TakeawaySessionTest
  ✓ valid takeaway submission stores session                                                                     0.11s
  ✓ short name is rejected                                                                                       0.08s
  ✓ invalid whatsapp numbers are rejected                                                                        0.09s
  ✓ pickup within ten minutes is rejected                                                                        0.08s
  ✓ missing fields are rejected                                                                                  0.07s
  ✓ html in name is stripped before storing                                                                      0.09s
  ✓ takeaway submission does not overwrite dine in session                                                       0.10s
  ✓ stored session is exposed back to welcome page                                                               0.12s

   PASS  Tests\Feature\TokenCssVisualTest
  ✓ root page loads epilogue and nunito sans fonts                                                               0.13s
  ✓ built stylesheet contains design tokens                                                                      0.07s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.09s
  ✓ root route returns app blade shell                                                                           0.07s

   PASS  Tests\Feature\WelcomeSessionTest
  ✓ table qr locks dine in mode with table number                                                                0.07s
  ✓ missing table param starts takeaway mode                                                                     0.10s
  ✓ non numeric table param is ignored                                                                           0.12s
  ✓ overlong table param is ignored                                                                              0.16s
  ✓ stored session persists across requests                                                                      0.08s
  ✓ catalog placeholder route renders                                                                            0.06s

  Tests:    34 passed (207 assertions)
  Duration: 10.40s
```

**RESULT: 34 tests / 207 assertions PASSED** — matches the RFC "Bukti Verifikasi" claim exactly.

### 2. `npm test`

```
> test
> node --test "tests/JS/**/*.test.js"

▶ copyToClipboard
  ✔ copies the text and resolves true on success (3.7842ms)
  ✔ resolves false when the clipboard API rejects (e.g. permission) (0.2148ms)
  ✔ resolves false when the clipboard API is unavailable (1.7286ms)
✔ copyToClipboard (7.017ms)
▶ formatRupiah
  ✔ formats 28000 as "Rp 28.000" (58.0725ms)
  ✔ formats 0 as "Rp 0" (0.2676ms)
  ✔ coerces numeric strings (CODE-2) (0.2867ms)
  ✔ formats large amounts with thousand separators (0.2057ms)
  ✔ falls back to "Rp 0" for invalid input (0.3493ms)
✔ formatRupiah (61.073ms)
▶ validateTakeaway
  ▶ validateName
    ✔ accepts names with 3 or more characters (0.6396ms)
    ✔ rejects empty and too-short names (0.1527ms)
  ✔ validateName (1.527ms)
  ▶ validatePhone
    ✔ accepts Indonesian 08 numbers of 10-13 digits (0.4169ms)
    ✔ rejects numbers that do not match the SEC-2 pattern (0.1409ms)
  ✔ validatePhone (0.6411ms)
  ▶ validatePickupAt
    ✔ accepts times at least 10 minutes ahead (0.8471ms)
    ✔ rejects times within the closure window (0.2298ms)
    ✔ rolls past-midnight times over to the next day (0.1643ms)
    ✔ rejects malformed time strings (0.1519ms)
  ✔ validatePickupAt (1.6918ms)
  ▶ aggregate
    ✔ accepts a fully valid payload (1.1958ms)
    ✔ collects every field error at once (0.2673ms)
  ✔ aggregate (1.8701ms)
✔ validateTakeaway (7.1432ms)
ℹ tests 18
ℹ suites 7
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 167.6762
```

**RESULT: 18 tests PASSED, 0 failed** — matches the claim.

### 3. `npm run build`

```
> build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 632 modules transformed.
rendering chunks...
computing gzip size...
public/build/manifest.json                   1.18 kB │ gzip:   0.33 kB
public/build/assets/app-D4UC0v8J.css        15.62 kB │ gzip:   3.93 kB
public/build/assets/AppLayout-SZG22q-e.js    0.18 kB │ gzip:   0.16 kB
public/build/assets/Catalog-CNPXNSag.js      1.30 kB │ gzip:   0.62 kB
public/build/assets/Welcome-BM7ntvFn.js     13.93 kB │ gzip:   3.97 kB
public/build/assets/app-BH7hTe-f.js        347.40 kB │ gzip: 108.67 kB

✓ built in 487ms
```

**RESULT: build SUCCESS.** Sizes match the RFC claim (Welcome 13.93 kB vs claimed 13.9 kB; Catalog 1.30 kB ✓). Stylesheet 15.62 kB vs claimed 15.4 kB — trivial variance (rounding/environment), not a defect.

### 3b. Built stylesheet greps (`public/build/assets/app-D4UC0v8J.css`)

- `(?i)#000000` → **0 matches (UI-2 PASS)**. (The `0 0 #0000` values inside the Tailwind preflight layer are Tailwind's own *transparent* shadow placeholders, not pure black, and are not a UI-2 violation.)
- Spot-checks that the new utilities actually compiled (accounting for the minifier lowercasing hex, stripping leading zeros in degrees, and escaping selector chars):

```
.-rotate-\[1\.5deg\]{rotate:-1.5deg}
.-rotate-\[0\.8deg\]{rotate:-.8deg}
.rotate-\[1deg\]{rotate:1deg}
.rotate-\[-8deg\]{rotate:-8deg}
.rotate-\[0\.4deg\]{rotate:.4deg}
.rotate-\[0\.5deg\]{rotate:.5deg}
.bg-\[var\(--color-primary\)\]{background-color:var(--color-primary)}
.bg-\[var\(--color-ink\)\]\/40{background-color:color-mix(in oklab, var(--color-ink) 40%, transparent)}
.shadow-\[var\(--shadow-tactile-md\)\]{--tw-shadow:var(--shadow-tactile-md);box-shadow:...}
.shadow-\[var\(--shadow-tactile-lg\)\]{--tw-shadow:var(--shadow-tactile-lg);box-shadow:...}
.btn-tactile => present
.marker-shadow-md => present
.min-h-\[44px\] => present
.--color-error => present
```

All requested utilities confirmed present. **UI-1/UI-2/UI-4 utilities verified in the shipped artifact.**

### 4. `vendor\bin\pint --test` (whole repo, no directory limits)

```
{"tool":"pint","result":"passed"}
```

**RESULT: PASSED.** (CODE-1 / PSR-12 compliant.)

---

## STEP 1 — RFC Adherence

### Pre-recorded deviations (11) — judgement of each one's reasoning

| # | Deviation | Verdict | Notes |
|---|---|---|---|
| 1 | `WelcomeController` → `OrderSessionController` | **Sound** | Confirmed `app/Http/Controllers/WelcomeController.php` is truly deleted (glob + grep: only historical docs reference it). Routes match RFC §2B. |
| 2 | AC-6 served by placeholder `CatalogController`/`Catalog.jsx` | **Sound** | Clearly scoped as placeholder; RFC-004 owns the real catalog. Reasoning holds. |
| 3 | Inline SVG mascot instead of external image | **Sound** | Prototype's `lh3.googleusercontent.com` URL is offline-dependent; inline SVG is deterministic and matches UI-5. |
| 4 | Prototype colors mapped to official UI-2 tokens | **Sound in intent** | All colors resolve to `tokens.css` variables; no stray hex in JSX (grep for hex literals in `resources/js` → 0). **However the mapping choice for the promo banner regresses contrast — see Rules Compliance below.** |
| 5 | Error "coretan" style (wavy SVG) | **Sound** | Uses `doodle-squiggly` vocabulary; error color token `#BA1A1A`. |
| 6 | Invalid `?table` ignored (no 4xx) | **Sound, tested** | `preg_match('/^\d{1,3}$/')` (`OrderSessionController.php:22`); non-numeric and overlong both tested. Minor edge: `?table=0` / `?table=007` still lock dine-in and render "MEJA 0" — RFC says "angka 1–3 digit", so `0` arguably isn't a valid QR table. Low severity, untested. |
| 7 | Server-side session, not localStorage | **Sound, compliant** | DATA-1 restricts localStorage to cart caching; server session is the stricter choice. Grep of `resources/js` for `localStorage` → 0 hits. |
| 8 | Dine-in lock in `storeTakeaway` | **Sound, tested** | Guard at `OrderSessionController.php:102-105`; test asserts `mode`/`table_number` unchanged. (Note: takeaway `name/phone/pickup_at` **do** get written into a dine-in session — the test asserts this explicitly as intended. The UI offers no path to trigger it; harmless but worth knowing.) |
| 9 | Two-layer sanitization; `strip_tags` residual text | **Sound** | Residual inner text (`alert(1)Sasa`) is rendered as a React text node — safe. No `dangerouslySetInnerHTML` anywhere in `resources/js` (grep → 0). |
| 10 | TC-003-4 tested via util, not DOM; no DOM tooling in stack | **Honest** | Accurate statement of the stack limitation. Downgrade from "E2E" to util-level is disclosed. |
| 11 | Minute-resolution pickup comparison + midnight rollover | **Sound, tested** | Server (`OrderSessionController.php:80-88`) and client (`validateTakeaway.js:59-78`) use identical thresholds; rollover tested on both sides. |

### UNRECORDED deviations (findings)

1. **SEC-1 letter not followed: no Laravel FormRequest.** SEC-1 requires user text input to be validated "via Laravel Form Request". `storeTakeaway` uses inline `$request->validate()` twice in the controller (`OrderSessionController.php:49-94`) instead of a class under `app/Http/Requests/`. Functionally equivalent, but RFC-003 lists SEC-1 among its governing rules and this deviation is not in the Implementation Notes. Either extract a `StoreTakeawayRequest` or record the deviation.
2. **Modal does not follow the DESIGN.md modal spec, not recorded.** `DESIGN.md:181`: "Modals and checkout drawers appear as stacked notepad sheets (`#FFF1D6`) secured with semi-translucent washi-tape rects angled at ±2.5deg across corners." `TakeawayFormModal.jsx:67-73` renders a plain un-rotated sheet in `--color-surface` (#FFF9EF) with no washi-tape corners. UI-1 demands 100% DESIGN.md adherence; deviation #5 covers the *error* style but not the modal container itself.
3. **RFC evidence claim overstates AC-5 coverage.** "Bukti Verifikasi" says `WelcomeSessionTest` covers "AC-1/2/5/6". AC-5 (promo banner shows SKETCHKOPI 10%) is **not asserted anywhere** in that file (or any test). Only AC-1/2/6 have server-side assertions. See AC matrix below.

---

## STEP 2 — Acceptance Criteria verification (would the test FAIL on regression?)

| AC | Guarding test | Would it genuinely fail on regression? | Honest verdict |
|---|---|---|---|
| **1** `?table=12` → badge + locked dine-in | `WelcomeSessionTest::test_table_qr_locks_dine_in_mode_with_table_number` | **Yes.** Asserts Inertia props (`mode=dine_in`, `tableNumber=12` as int) *and* `assertSame(['mode'=>'dine_in','table_number'=>12], session('order_session'))` — the strict whole-array match also catches accidental extra writes. Persistence covered by `test_stored_session_persists_across_requests`. | **Genuinely guarded** (server layer). The *badge rendering* ("MEJA 12" in `TableBadge.jsx:24-26`) is code-read only — no DOM test tooling (deviation #10). |
| **2** No table → takeaway form opens | `test_missing_table_param_starts_takeaway_mode` (props only) + `TakeawaySessionTest` | **Partially.** The mode resolution is guarded; the *auto-opening of the form* (`Welcome.jsx:21`, `TakeawayFormModal`) is **not mechanically guarded** — it is verified by code reading only. TC-003-2 was planned as E2E; the delivered guard is a downgraded integration test. Covered by the general tooling-gap deviation #10, but say it plainly: **AC-2's "form opens" half is code-read only.** |
| **3** Validation errors for short name / bad WA | Server: `TakeawaySessionTest::test_short_name_is_rejected`, `test_invalid_whatsapp_numbers_are_rejected`, `test_missing_fields_are_rejected`, `test_pickup_within_ten_minutes_is_rejected`. Client: `validateTakeaway.test.js` (name/phone/pickup + aggregate) | **Yes, on both layers.** I read every assertion: messages are asserted (`assertSessionHasErrors` + exact JS message strings), negative cases are non-empty, the phone test iterates 4 distinct invalid shapes, the pickup test covers "now" and "+5 min", JS covers rollover and malformed input. | **Genuinely guarded — strongest AC.** |
| **4** Tap Wi-Fi password copies `ngopiyuk123` | `copyToClipboard.test.js` (3 cases incl. writeText payload) | **Partially.** The util is guarded (asserts the exact text is written). The *wiring* — `WifiMemoCard` calling it with the right default and the tap target triggering it — is **code-read only**; the component could pass any string and the suite stays green. Deviation #10 records this honestly. | **Util guarded; component behavior code-read only (disclosed).** |
| **5** Promo banner shows SKETCHKOPI 10% | **NONE** | No test asserts the banner or the code string at all. Not even a weak server-side check. The RFC's claim that `WelcomeSessionTest` covers AC-5 is **inaccurate**. | **Code-read only, and mis-claimed as covered.** Finding (see Blocking). |
| **6** CTA routes to catalog | `WelcomeSessionTest::test_catalog_placeholder_route_renders` | **Partially.** The *destination* (`GET /katalog` → `Catalog` component) is guarded; the *CTA→destination wiring* (`Welcome.jsx:109` `href="/katalog"`) is code-read only. | **Destination guarded; wiring code-read only.** |
| **7** Dangerous HTML sanitized before rendering | `TakeawaySessionTest::test_html_in_name_is_stripped_before_storing` | **Yes (server side).** Asserts `<b>Sasa</b> Putri` → `Sasa Putri` stored and no `<` remains. Client side, React's default escaping is a framework invariant (verified: zero `dangerouslySetInnerHTML` in the app). | **Genuinely guarded (server) + framework-guaranteed (client).** |

**Summary:** ACs 1, 3, 7 are genuinely test-guarded. ACs 2, 4, 6 are **partially guarded** — the analyzable half is tested, the React wiring/visual half is code-read only (disclosed via deviation #10, acceptable given no DOM tooling; recommend Dusk coverage in RFC-008 as the note suggests). **AC 5 is not guarded at all and the RFC wrongly claims it is.**

---

## STEP 3 — Specific probes (verified independently)

### Session locking (ARCH-4)
- **Takeaway POST overwriting dine-in?** No. Guard `OrderSessionController.php:102-105` + dedicated test `test_takeaway_submission_does_not_overwrite_dine_in_session`. Mode/table preserved. ✅
- **`?table=X` changing an existing takeaway session?** It *converts* the session to dine-in (`array_merge` at `OrderSessionController.php:23-27` keeps `name/phone/pickup_at` while setting `mode/table_number`). Per ARCH-4's literal rule ("keberadaan parameter table mengunci mode ke Dine-In") this is intended behavior and there is no UI/data loss — but it is **untested**. Worth one small test. Side effect: a dine-in session carrying takeaway data would render the "Ambil sekitar pukul …" card (pickup is meaningless for dine-in). Cosmetic, no UI path to reach it.
- **Table param validation:** 1–3 ASCII digits only (`/^\d{1,3}$/`, no `u` modifier, so Unicode digits are rejected). Non-numeric/overlong/absent/array (`?table[]=1` → not a string) all fall back to takeaway. Tested for `abc` and `1234`. `(int)` cast (CODE-2) is safe post-regex. Edge: `0`/`00` accepted as "MEJA 0" (minor).

### Validation parity (client `validateTakeaway.js` vs server `storeTakeaway`)
- **Name min 3:** both trim first. Divergence: client `String.length` counts UTF-16 units, Laravel `min:3` counts multibyte chars — e.g. `"🙂🙂"` passes the client (length 4) and fails the server (`mb_strlen` = 2). The user *would* see the server error (see below — state and errors survive the redirect), so it's an annoyance, not a silent failure. Minor.
- **Phone `^08[0-9]{8,11}$`:** byte-identical regex on both sides, both trim. ✅ Parity clean. (Inner spaces, e.g. "0812 3456 7890", fail on both sides identically — consistent, if unfriendly.)
- **Pickup ≥ 10 min + midnight rollover:** thresholds identical (`>= startOfMinute + 10 min` passes; `< now → addDay`). JS test pins `now` explicitly; PHP test relies on `now()+30min` which is rollover-safe. ✅
  - Format: server requires `date_format:H:i` (strict `00`–`23` two-digit hour); client regex `^\d{1,2}:\d{2}$` is looser (`9:30`, `24:30` pass the client). **Unreachable in practice** because `<input type="time">` (step=60) always emits zero-padded `HH:mm`, and the client rejects `HH:mm:ss` too — so seconds-vs-minutes resolution is consistent on both sides. Noted, not blocking.
  - **Time zone:** `config/app.php:68` is `timezone => 'UTC'` while the kafe and its customers are WIB (UTC+7). The client validates against the *device* clock, the server against *UTC*. For WIB customers the server check is strictly *more permissive* (the addDay branch dominates), so it cannot lock out a legitimate customer — but it is a **latent correctness issue for RFC-005+** if anything ever compares `pickup_at` to server time (e.g. "overdue pickup" logic) before the timezone is set to `Asia/Jakarta`.

### Double-validate pattern
Correct. First pass (`:49-57`) enforces shape (`required|string|max:60`), then `strip_tags`+`trim` (`:60-61`), then `$request->merge` (`:64`) so the second pass (`:66-94`) validates **the sanitized values**, and `$validated['name']`/`$validated['phone']` are those sanitized values — what gets stored in the session is the clean value (proven by `test_html_in_name_is_stripped_before_storing`). Nit: `max:60` runs *before* stripping, so a ≤60-char name padded with tags to >60 raw chars gets a generic "max" rejection it arguably doesn't deserve. Cosmetic.

### Error display after server rejection (I verified the Inertia v3 internals, not just the happy path)
`router.post()` defaults to `preserveState: true` (confirmed in `@inertiajs/core` dist), the validation-error redirect keeps the same React tree (component key preserved), `onError` runs on the live form instance (`clearErrors(); setError(errors)`), and `TakeawayFormModal.jsx:52` surfaces `errors[field]`. So server-side messages **do** display with input intact — the earlier hypothesis that the reset-on-open effect would wipe them is false (the effect only fires on the `open` prop changing, which it doesn't on an error redirect). The reset-on-open effect (`:42-48`) also correctly clears stale `clientErrors` on reopen. No stale-error bug found. Minor: `errors[field]` is a Laravel array; multiple messages would concatenate without a separator in `SquiggleError` — only cosmetic if it ever happens.

### XSS / SEC-1
No `dangerouslySetInnerHTML` and no `innerHTML` anywhere in `resources/js` (grep → 0). Name is `strip_tags`-ed server-side; phone digits-only (regex-validated); `pickup_at` `H:i`-validated; table number int-cast post-regex. `strip_tags` residual inner text is safe as a React text node (recorded deviation #9 — reasoning verified). Rendered session props on `Welcome.jsx:82-86` are plain interpolations → escaped by React. **PASS.**

### CSRF
`bootstrap/app.php` keeps the default `web` group (VerifyCsrfToken included; only `HandleInertiaRequests` appended). Inertia v3's HTTP client reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN` by default (verified in `@inertiajs/core` dist, `XhrHttpClient` xsrf handling) — matches Laravel's defaults, no extra axios config needed. `app.blade.php:6` also publishes a csrf-token meta. **Wired correctly.** Caveat: no automated test exercises CSRF (Laravel feature tests skip it) — consistent with TEST-STRATEGY §D, which lists it as a probed check; acceptable but worth a Dusk check in RFC-008.

### DATA-1
`localStorage` grep across `resources/js` → 0 hits. Session data lives in the Laravel session only. ✅

### Modal behavior / accessibility
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` present (`TakeawayFormModal.jsx:67-73`); error messages carry `role="alert"`; copy feedback uses `role="status"` + `aria-live` (`WifiMemoCard.jsx:58-66`) — though a live region inserted *after* the action may not be announced by all screen readers; prefer a permanently mounted region.
- **No Escape-key close, no focus trap, no initial focus on the first field, no focus restore on close.** The backdrop has no click-to-dismiss; only the "Nanti Dulu" button closes. Missing accessibility affordances for a `role="dialog"` (improvement, not AC-blocking).
- Touch targets: modal buttons use `Button` (`min-h-[44px] min-w-[44px]`) ✅; Wi-Fi copy chip ≈ 49px high ✅; **"Ubah data pesan bawa pulang" (`Welcome.jsx:124`) is `px-3 py-2` + 14px text ≈ 37px tall — below the RULES 44×44px minimum.**
- Once `sessionComplete`, the "Ubah data" link is hidden (`Welcome.jsx:121`) and no edit path remains — a customer who mistyped their name is stuck with it for the session. F2 doesn't require editing; flag as UX improvement.
- Contrast (computed WCAG ratios from the actual tokens): promo banner body `#FFF9EF` on `#FF7A59` = **2.45:1** (needs 4.5:1); SKETCHKOPI code `#FF7A59` on `#FFFFFF` = **2.57:1**; Welcome headline accent `#FF7A59` on paper = **2.45:1** (needs 3:1 even as large text); subtitle `--color-outline #817661` on paper = **4.27:1** (marginal fail for 16px body). Passes: ink-on-paper 12.05:1, CTA ink-on-primary 8.22:1, Wi-Fi password `#715500`/`#FFC93C` 4.55:1, error `#BA1A1A` 6.17:1. The *prototype* solved the banner with dark-red text on light orange — the token mapping (deviation #4) chose light-on-orange and regressed legibility. Honest scoping: the literal RULES sentence scopes "WCAG AA" to the espresso/paper pair, so this is a UI-1 spirit/a11y-probe failure rather than a literal UI-2 violation — but for an outdoor-readable kiosk it's a real defect and cheap to fix.

### Dead code / unused exports
- `validateTakeaway.js:6` exports `WIFI_PASSWORD` — **never imported anywhere** (grep: 1 hit = its own definition). Meanwhile `WifiMemoCard.jsx:9` hardcodes the password as a default prop → two sources of truth for `ngopiyuk123`, one of them dead. Remove or use it.
- `formatRupiah` is **not** imported in `Welcome.jsx` (premise of the probe — confirmed clean; no unused import).
- `MIN_PICKUP_MINUTES` is used by the tests ✅. No `console.log`, no TODOs, no leftover debug code (CODE-3 ✅).

### Route/model hygiene
- Backend uses named routes (`route('welcome')` in the redirect, `:109`); frontend hardcodes `/katalog`, `/session/takeaway`, `/` — the stack has **no Ziggy** (composer/package.json checked), so hardcoded paths are the norm here; the paths match the named routes in `routes/web.php`. Consistent enough; note only.
- `WelcomeController.php` confirmed deleted; no dangling references in code.
- **No DB reads at all** in this RFC's controllers → no N+1, no transaction concerns (DATA-2 N/A). Performance is trivially fine.

### Test quality
- All new tests are non-vacuous (read bodies): exact message strings, exact session arrays, 4 distinct bad-phone shapes, deterministic rollover cases with a pinned `now` in JS.
- No test asserts the wrong thing. One flakiness check passed: `validPickupAt()` (+30 min) and the "now/+5 min" cases are midnight-rollover-safe.
- Pre-existing (not RFC-003's doing, noted): `RootPageTest` is fully subsumed by `WelcomePageTest` — duplicate coverage from RFC-001; consider collapsing in a later cleanup.

---

## STEP 4 — Review dimensions

### 1. RFC Adherence — **NEEDS WORK**
- `RFCs/RFC-003-...md` §4 ACs: 5/7 implemented with genuine guards; AC-5 untested and mis-claimed as covered (RFC "Bukti Verifikasi" vs `WelcomeSessionTest` contents — no promo assertion exists).
- All 11 recorded deviations individually re-verified; reasoning holds for all of them.
- 3 unrecorded deviations: no FormRequest despite SEC-1 (`OrderSessionController.php:49-94`); modal container ignores `DESIGN.md:181` notepad-sheet spec (`TakeawayFormModal.jsx:67-73`); AC-5 evidence claim.
- Minor: `?table=0` locks "MEJA 0" (`OrderSessionController.php:22`).

### 2. Rules Compliance — **NEEDS WORK**
- **PASS:** ARCH-4 (implemented + tested both directions), DATA-1 (zero localStorage), SEC-2 (rules identical both layers), CODE-1 (Pint passed repo-wide), CODE-2 (safe cast post-regex), CODE-3 (no debug/dead blocks except the export below), UI-2 (built CSS: zero `#000000`; all JSX uses tokens, zero hex literals), UI-4 (hard shadows only, pressed state in `tactile.css`), UI-5 (washi tape ×2, squiggle error, pin doodle), UI-6 (480px container).
- **FAIL/NEEDS WORK:**
  - Touch target below 44px: "Ubah data pesan bawa pulang" ≈ 37px (`Welcome.jsx:124`) — literal RULES violation.
  - WCAG AA contrast regressions (a11y probe): PromoBanner 2.45:1 / 2.57:1, headline accent 2.45:1, outline subtitle 4.27:1 (`PromoBanner.jsx:18-27`, `Welcome.jsx:64`, `Welcome.jsx:73`).
  - SEC-1 "via Laravel Form Request" not followed, unrecorded.
  - CODE-3-adjacent dead export `WIFI_PASSWORD` + duplicated password literal (`validateTakeaway.js:6`, `WifiMemoCard.jsx:9`).

### 3. Security — **PASS**
- Two-layer sanitization verified end-to-end; no dangerous HTML sinks; CSRF wired via Inertia v3 XSRF defaults; session server-side; `?table` regex-bound; validation failure cannot corrupt a dine-in lock. Residual `strip_tags` text verified safe (recorded deviation #9 holds). No findings at severity ≥ minor.

### 4. Performance — **PASS** (N/A-heavy)
- Static props, zero DB queries, zero N+1, Welcome page 13.93 kB / CSS 15.62 kB — well inside the <2s load budget. Nothing to fix.

### 5. Maintainability — **PASS (with nits)**
- Clean invokable controllers with honest docblocks, pure framework-free validators (nicely testable), small focused components, consistent token usage, ARCH-7 extensions respected (`.jsx` components / `.js` utils).
- Nits: dead `WIFI_PASSWORD` export + password duplication; hardcoded frontend URLs (acceptable without Ziggy); duplicate `RootPageTest`/`WelcomePageTest` (pre-existing); modal a11y affordances (Escape/focus trap/autofocus) to add with the RFC-008 polish pass.

---

## Overall Risk Level: **LOW**

The security-critical and architecture-critical behavior (ARCH-4 session locking, SEC-2 validation parity, SEC-1 sanitization, CSRF, DATA-1) is implemented correctly and — except for the visual/wiring halves — genuinely test-guarded; nothing here can corrupt data, escalate, or strand a customer. The defects found are accessibility/contrast regressions, documentation accuracy (AC-5), and small hygiene items — none breaks an AC's mainline behavior.

## Summary

RFC-003 is a solid, honest implementation: the 11 recorded deviations were re-verified and all reasoning holds, the double-validate sanitization pattern stores genuinely clean values, and the client/server validators match including the tricky midnight-rollover and minute-resolution rules. The weak spots are (a) AC-5 having no guard while the RFC claims it does, (b) contrast/touch-target accessibility regressions against the probed WCAG checks (the prototype solved the promo banner better than the token mapping did), and (c) three small unrecorded deviations (FormRequest letter of SEC-1, DESIGN.md modal spec, evidence claim). All are cheap to fix; none requires re-architecture.

## Blocking Issues (must fix before "Reviewed")

1. **Promo banner / headline accent contrast below WCAG AA** (`PromoBanner.jsx:18-27`, `Welcome.jsx:64`): 2.45–2.57:1 for 12–14px text. Use ink/espresso-family text on the orange surfaces (as the prototype did) or darken the promo token for text use; also nudge the `--color-outline` subtitle (4.27:1) to `--color-ink-soft`. Bundle: fix the <44px "Ubah data" button (`Welcome.jsx:124`) — literal RULES touch-target violation.
2. **Correct the RFC-003 evidence claim**: "WelcomeSessionTest (TC-003-1, AC-1/2/**5**/6)" — AC-5 has no test. Either add a guard or amend the claim to state AC-5 is code-read verified (a planned-test-that-doesn't-exist must be stated per the workflow).
3. **Record or refactor the unrecorded deviations**: SEC-1 FormRequest (`app/Http/Requests/StoreTakeawayRequest` or a note), and the DESIGN.md modal-sheet spec (washi-taped `#FFF1D6` notepad sheet) for `TakeawayFormModal` (implement or record).

## Improvement Suggestions (non-blocking)

1. Add one small feature test: an existing takeaway session visited with `/?table=12` converts to dine-in while keeping name/phone (locks the intended ARCH-4 conversion behavior).
2. Use the exported `WIFI_PASSWORD` constant in `WifiMemoCard` (or delete it) — single source of truth for the password.
3. Validate `?table` as `1–999` (reject `0`) to avoid a "MEJA 0" lock.
4. Modal a11y: Escape-to-close, autofocus first field, focus trap/restore; mount the "Tersalin!" `role="status"` region permanently so screen readers announce it.
5. Set `config('app.timezone')` to `Asia/Jakarta` (or document the UTC assumption) before RFC-005/006 build pickup-time comparisons on `pickup_at`.
6. Offer an edit path for a completed takeaway session (the "Ubah data" button disappears once `sessionComplete`).
7. Collapse the duplicated `RootPageTest` into `WelcomePageTest` in a future cleanup, and cover AC-2/4/5's React wiring with Dusk in RFC-008 as deviation #10 anticipates.

---

## Round 2 — 2026-10-24

**Reviewer:** independent code reviewer (fresh context, no memory of implementation)
**Scope:** Re-review of RFC-003 after the Round 1 fix commit `6a977f9` ("RFC-003 Round 1 review fixes — WCAG AA contrast, 44px touch target, AC-5 bundle guard, StoreTakeawayRequest (SEC-1), notepad-sheet modal"). Verdict on whether the three Round 1 blocking issues genuinely hold, plus re-assessment of the RFC as a whole.
**Method:** full re-read of the Round 1 review, RFC-003 (incl. the new `## Round 1 Review Fixes (2026-10-24)` section — every claim verified against code), RFCS.md, RULES.md, FEATURES.md (F1/F2/F3/F4/F23/F26), TEST-STRATEGY.md (TC-003-1..4), DESIGN.md; full read of `StoreTakeawayRequest.php`, the refactored `OrderSessionController.php`, all frontend components/utils and all four test files; **live execution** of the test suite, JS tests, production build, built-artifact inspection (CSS + Welcome bundle + manifest), Pint; **independent WCAG relative-luminance recomputation of 33 text/background pairs** from the literal `tokens.css` values; `git show 6a977f9` diff review of every changed file; tree-shaking reasoning on the bundle tests. Git state verified clean (`git status --porcelain` empty; HEAD = `6a977f9`), so the tree is exactly the fix commit.

---

## STEP 0 — Command output (ACTUAL)

### 1. `php artisan test`

```
   PASS  Tests\Unit\BadgeEnumTest
  ✓ badge labels match rfc specification                                                                         0.01s
  ✓ badge values are stable for database storage

   PASS  Tests\Feature\Filament\CategoryCrudTest
  ✓ admin panel requires authentication                                                                          0.68s
  ✓ admin can create category                                                                                    0.57s
  ✓ category form rejects empty name                                                                             0.28s
  ✓ admin can update category sort order                                                                         0.31s
  ✓ category seeder populates all categories                                                                     0.04s

   PASS  Tests\Feature\Filament\MenuCrudTest
  ✓ admin can create menu with modifiers                                                                         0.56s
  ✓ menu form rejects negative price                                                                             1.23s
  ✓ menu form rejects empty name                                                                                 1.65s
  ✓ menu list renders with badge menu                                                                            0.82s
  ✓ edit menu form hydrates badge state                                                                          0.32s
  ✓ menu seeder populates full catalog                                                                           0.12s

   PASS  Tests\Feature\Filament\MenuStockToggleTest
  ✓ stock toggle persists to database                                                                            0.96s
  ✓ stock toggle can be restored                                                                                 0.82s

   PASS  Tests\Feature\RootPageTest
  ✓ root page renders inertia app                                                                                0.17s

   PASS  Tests\Feature\TakeawaySessionTest
  ✓ valid takeaway submission stores session                                                                     0.08s
  ✓ short name is rejected                                                                                       0.08s
  ✓ invalid whatsapp numbers are rejected                                                                        0.11s
  ✓ pickup within ten minutes is rejected                                                                        0.14s
  ✓ missing fields are rejected                                                                                  0.11s
  ✓ html in name is stripped before storing                                                                      0.07s
  ✓ takeaway submission does not overwrite dine in session                                                       0.13s
  ✓ stored session is exposed back to welcome page                                                               0.11s

   PASS  Tests\Feature\TokenCssVisualTest
  ✓ root page loads epilogue and nunito sans fonts                                                               0.13s
  ✓ built stylesheet contains design tokens                                                                      0.12s

   PASS  Tests\Feature\WelcomePageTest
  ✓ root route renders inertia welcome page                                                                      0.12s
  ✓ root route returns app blade shell                                                                           0.09s

   PASS  Tests\Feature\WelcomeSessionTest
  ✓ table qr locks dine in mode with table number                                                                0.12s
  ✓ missing table param starts takeaway mode                                                                     0.13s
  ✓ non numeric table param is ignored                                                                           0.09s
  ✓ zero table param is ignored                                                                                  0.10s
  ✓ takeaway session converts to dine in keeping customer data                                                   0.09s
  ✓ overlong table param is ignored                                                                              0.06s
  ✓ stored session persists across requests                                                                      0.07s
  ✓ catalog placeholder route renders                                                                            0.10s
  ✓ welcome bundle renders promo voucher                                                                         0.10s
  ✓ welcome bundle wires takeaway form and catalog cta                                                           0.06s

  Tests:    38 passed (239 assertions)
  Duration: 11.06s
```

**RESULT: 38 tests / 239 assertions PASSED** — matches the RFC's updated "Bukti Verifikasi" claim exactly. Crucially the two new bundle tests **ran (not skipped)**, i.e. they read a real built artifact in this environment.

### 2. `npm test`

```
> test
> node --test "tests/JS/**/*.test.js"

▶ copyToClipboard
  ✔ copies the text and resolves true on success (3.3004ms)
  ✔ resolves false when the clipboard API rejects (e.g. permission) (0.2392ms)
  ✔ resolves false when the clipboard API is unavailable (1.4823ms)
✔ copyToClipboard (6.2675ms)
▶ formatRupiah
  ✔ formats 28000 as "Rp 28.000" (57.4914ms)
  ✔ formats 0 as "Rp 0" (0.2894ms)
  ✔ coerces numeric strings (CODE-2) (0.3698ms)
  ✔ formats large amounts with thousand separators (0.2105ms)
  ✔ falls back to "Rp 0" for invalid input (0.2753ms)
✔ formatRupiah (60.517ms)
▶ validateTakeaway
  ▶ validateName
    ✔ accepts names with 3 or more characters (0.6961ms)
    ✔ rejects empty and too-short names (0.1541ms)
  ✔ validateName (1.7111ms)
  ▶ validatePhone
    ✔ accepts Indonesian 08 numbers of 10-13 digits (0.3097ms)
    ✔ rejects numbers that do not match the SEC-2 pattern (0.2106ms)
  ✔ validatePhone (0.6811ms)
  ▶ validatePickupAt
    ✔ accepts times at least 10 minutes ahead (0.4011ms)
    ✔ rejects times within the closure window (0.1699ms)
    ✔ rolls past-midnight times over to the next day (0.1507ms)
    ✔ rejects malformed time strings (0.1439ms)
  ✔ validatePickupAt (1.1873ms)
  ▶ aggregate
    ✔ accepts a fully valid payload (1.0787ms)
    ✔ collects every field error at once (0.2767ms)
  ✔ aggregate (1.5061ms)
✔ validateTakeaway (6.7379ms)
ℹ tests 18
ℹ suites 7
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 177.8406
```

**RESULT: 18 tests PASSED, 0 failed.**

### 3. `npm run build`

```
> build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 632 modules transformed.
rendering chunks...
computing gzip size...
public/build/manifest.json                   1.18 kB │ gzip:   0.33 kB
public/build/assets/app-VZnvzLN0.css        16.12 kB │ gzip:   4.05 kB
public/build/assets/AppLayout-Cb3r7POW.js    0.18 kB │ gzip:   0.17 kB
public/build/assets/Catalog-BIK1I9kG.js      1.30 kB │ gzip:   0.62 kB
public/build/assets/Welcome-Cbbfu4wu.js     14.51 kB │ gzip:   4.13 kB
public/build/assets/app-D1pA-LQV.js        347.40 kB │ gzip: 108.68 kB

✓ built in 499ms
```

**RESULT: build SUCCESS.** Matches the RFC claim (Welcome 14.51 vs claimed 14.5 kB, Catalog 1.30 kB, stylesheet 16.12 vs claimed 16.1 kB).

### 3b. Built-artifact inspection (accounting for minifier: lowercase hex, stripped leading zeros, escaped selectors)

`public/build/assets/app-VZnvzLN0.css`:
- `(?i)#000000` → **0 matches (UI-2 PASS)**.
- `.min-h-\[44px\]{min-height:44px}` → present (touch-target fix compiled).
- `-rotate-\[2\.5deg\]{rotate:-2.5deg}` and `.rotate-\[2\.5deg\]{rotate:2.5deg}` → both present (modal washi-tape corners ±2.5°).

`public/build/assets/Welcome-Cbbfu4wu.js` (14,513 bytes; read via the manifest key `resources/js/Pages/Welcome.jsx` → `assets/Welcome-Cbbfu4wu.js`):
- `SKETCHKOPI` ×1, `Diskon 10%` ×1, `/session/takeaway` ×1, `/katalog` ×1, `ngopiyuk123` ×1, `Tersalin` ×1, `min-h-[44px]` ×2 (Button base + "Ubah data" button), `MEJA ` ×1.

All strings the new bundle tests assert are in the real Welcome entry chunk.

### 4. `vendor\bin\pint --test` (whole repo, no directory limits)

```
{"tool":"pint","result":"passed"}
```

**RESULT: PASSED.** (CODE-1.)

---

## STEP 1 — Round 1 blocking issues: verification of the fixes

### Blocking #1 — WCAG AA contrast + touch target — **GENUINELY FIXED (one residual pair, see New Findings)**

I recomputed every pair from the literal `tokens.css` values with the WCAG 2.x relative-luminance formula (33 pairs; full list in the table below). Verdicts against the **actual classes in the actual components**, not the RFC's claims:

| Pair (component, class) | Computed | Need | Verdict |
|---|---|---|---|
| PromoBanner body/label 12–14px: `text-[var(--color-ink)]` on `--color-promo` (`PromoBanner.jsx:20-27`) | **4.92:1** | 4.5 | PASS (claim "4,92:1" verified exactly) |
| SKETCHKOPI chip: ink on `--color-surface-container-lowest` #FFFFFF (`PromoBanner.jsx:28`) | **12.62:1** | 4.5 | PASS (claim "12,62:1" verified exactly) |
| Headline accent: ink over `--color-primary` highlighter (`Welcome.jsx:64-68`) | **8.22:1** (ink-on-primary; rest of text 12.05:1 on paper) | 3.0 (26px extrabold) | PASS — **but the RFC's cited ratio "11,30:1" is wrong** (8.22 is the real ink-on-primary figure; 11.30 is ink-on-container). Outcome passes anyway; documentation nit only. |
| Welcome subtitle 16px: `--color-ink-soft` on paper (`Welcome.jsx:73`) | **8.88:1** | 4.5 | PASS (claim verified exactly) |
| Modal subtitle 14px: ink-soft on `--color-container` (`TakeawayFormModal.jsx:101`) | 8.33:1 | 4.5 | PASS |
| Modal labels 14px bold: ink on container (`TakeawayFormModal.jsx:107,125,143`) | 11.30:1 | 4.5 | PASS |
| Input text 16px: ink on white (`TakeawayFormModal.jsx:110`) | 12.62:1 | 4.5 | PASS |
| Error text 13px: `--color-error` on container / on white input | 5.79:1 / 6.46:1 | 4.5 | PASS |
| Wi-Fi password chip: `--color-on-primary` on `--color-surface-container-high` (`WifiMemoCard.jsx:53,50`) | **5.70:1** | 4.5 | PASS (improved vs Round 1's 4.55 marginal) |
| Wi-Fi "Sandi" label 12px: ink-soft on high | 7.57:1 | 4.5 | PASS |
| Stamp "Tersalin!": ink on `--color-surface` (`WifiMemoCard.jsx:65`) | 12.05:1 | 4.5 | PASS |
| Footer help bar 14px: ink-soft on `--color-surface-container` (`Welcome.jsx:134`) | 8.33:1 | 4.5 | PASS |
| CTA 18px: ink on primary (`Welcome.jsx:108`) | 8.22:1 | 3.0 | PASS |
| TableBadge 28px: ink (body default, `app.css:14`) on primary | 8.22:1 | 3.0 | PASS |
| Session/dashed cards, mascot caption, buttons, "Ubah data" (all ink/ink-soft on paper-family surfaces) | 8.33–12.62:1 | 4.5 | PASS |
| **Catalog page label 14px uppercase: `--color-outline` on paper (`Catalog.jsx:13`)** | **4.27:1** | 4.5 | **FAIL — residual, see New Findings #1** |

Non-text pairs checked for completeness: `--color-outline-variant` borders (1.63:1) and the promo-colored `redeem` icon on white (2.57:1) are **decorative** (aria-hidden; interactive elements are identifiable by distinct background + text), so WCAG 1.4.11 is not engaged. Ink borders: 12.05:1 PASS.

**Touch target:** `Welcome.jsx:124` now carries `min-h-[44px]`; the utility compiled (`min-height:44px` in the built stylesheet) and is referenced twice in the built Welcome bundle. Verified in the shipped artifact. ✅

### Blocking #2 — AC-5 guard — **GENUINELY FIXED (guard is real; one environment caveat)**

`WelcomeSessionTest.php:121-177`:
- `builtWelcomeBundlePath()` reads `public/build/manifest.json`, resolves the key `resources/js/Pages/Welcome.jsx` → `file` → reads that exact chunk. I confirmed the manifest (pasted above) maps that key to `Welcome-Cbbfu4wu.js`, the dynamic entry containing Welcome + all four RFC-003 components. **It reads the real built Welcome entry.**
- Would `test_welcome_bundle_renders_promo_voucher` fail if PromoBanner were removed from Welcome.jsx? Yes: an unrendered component's literals are tree-shaken by Rollup out of the Welcome chunk (unused ESM imports are dropped), so `SKETCHKOPI`/`Diskon 10%` would vanish → `assertStringContainsString` fails. Same reasoning for `/katalog` (only source in the chunk is the CTA href at `Welcome.jsx:109`), `/session/takeaway` (only the modal's `post()`), and `ngopiyuk123` (only reachable via `WifiMemoCard`'s default prop — if WifiMemoCard were dropped, `WIFI_PASSWORD` becomes an unreferenced export of `validateTakeaway.js` and is tree-shaken too). **All five asserted strings are genuine wiring guards**, modulo the inherent weakness of string-presence checks (they can't distinguish "rendered" from "present-but-dead" — acceptable given the recorded no-DOM-tooling deviation #10).
- **Skip-guard:** `markTestSkipped` when the manifest is missing. `public/build` is **not git-tracked** (verified: 0 tracked files), so on a fresh clone without `npm run build` these two tests skip silently and `php artisan test` still reports green. This is the exact pattern of the already-Reviewed RFC-001 `TokenCssVisualTest:51-57` (consistent, and the skip message is explicit), and in this review the tests demonstrably ran against a real build. **Acceptable**, but see Improvement #1 (CI ordering).
- **RFC evidence claim:** now reads "38 test passed (239 assertions) … AC-5 dan wiring AC-2/4/6 diverifikasi terhadap bundel terbangun" — I reproduced 38/239 exactly. **Claim is now accurate.** Blocking #2 resolved.

### Blocking #3 — SEC-1 FormRequest + DESIGN.md modal spec — **GENUINELY FIXED**

**FormRequest** (`app/Http/Requests/StoreTakeawayRequest.php`):
- `prepareForValidation()` (lines 19-25) runs `trim(strip_tags())` on `name` and `trim()` on `phone` **before** `rules()` execute — this is the framework's documented hook order (it fires ahead of validation), so sanitization genuinely precedes validation. The `is_string()` guards correctly replicate the old first-pass `string` rule (array input `name[]=x` survives `prepareForValidation` untouched and fails the `string` rule — same behavior as the old code, no crash).
- Rules match SEC-2 exactly: `min:3` (line 36), `regex:/^08[0-9]{8,11}$/` (line 37), pickup closure (lines 42-58) byte-identical to the old controller code including `startOfMinute()` resolution + `addDay()` midnight rollover + the same Indonesian failure message.
- `authorize(): true` with a docblock justifying F23 guest checkout. Custom closure signature `(string $attribute, mixed $value, $fail): void` is valid.
- **Double-validate pattern is gone:** `OrderSessionController::storeTakeaway` (lines 48-66) now takes the typed request and calls `validated()` once.
- **Behavior change vs old code:** `max:60` now applies *after* stripping (old code applied it to raw input) — this *fixes* the cosmetic nit Round 1 noted; no message regression (the old code also had no custom `name.max`/`date_format` messages, so the default-message surface is unchanged). Message set is identical to the old second pass (verified via `git show 6a977f9` diff).
- `test_html_in_name_is_stripped_before_storing` passes and genuinely exercises `prepareForValidation` (posts through the route, so the FormRequest is resolved; asserts the stored session value is `'Sasa Putri'` with no `<`). ✅ SEC-1 letter now followed; the unrecorded deviation is resolved by refactoring.

**Modal spec** (`TakeawayFormModal.jsx:81-96`): sheet background is `bg-[var(--color-container)]` = **#FFF1D6** — the literal DESIGN.md:181 color ✓. Two semi-translucent washi-tape rects across the top corners at **`-rotate-[2.5deg]` and `rotate-[2.5deg]`** (both confirmed compiled in the shipped CSS) with `opacity-80`/`opacity-70` — matching "semi-translucent washi-tape rects … angled at ±2.5deg across corners" ✓. Two residual literal deviations: the sheet is **not "stacked"** (single sheet, no layered second sheet behind — DESIGN.md:181 says "stacked notepad sheets"), and the right strip uses promo-orange rather than the spec's `rgba(255,201,60,0.85)`/mint options. Both are cosmetic within the doodle vocabulary; the RFC's fix note ("lembar notepad #FFF1D6 dengan dua strip washi tape ±2,5°") describes what was built and doesn't overclaim "stacked". Minor, recorded-by-implication; not blocking.

---

## STEP 2 — Recorded follow-ups (fix note 6/7) — verification

| Claim | Verdict | Evidence |
|---|---|---|
| `?table=0` rejected (regex `^[1-9]\d{0,2}$` + test) | **True** | `OrderSessionController.php:22` uses `/^[1-9]\d{0,2}$/` (also kills the old `007` edge); `test_zero_table_param_is_ignored` (`WelcomeSessionTest.php:50-59`) asserts fallback to takeaway. ✅ |
| `WIFI_PASSWORD` single source | **True** | Defined once (`validateTakeaway.js:6`), used as `WifiMemoCard` default (`WifiMemoCard.jsx:11`), imported there; the Round 1 dead-export/duplication finding is gone. (Location nit: a Wi-Fi password living in the *validators* file is odd — Improvement #4.) ✅ |
| "Tersalin!" region permanently mounted with `aria-live` | **Code true, functionally NOT achieved** | `WifiMemoCard.jsx:61-71`: `<p aria-live="polite" role="status">` is always mounted and only its CSS class/opacity toggles. Live regions announce **content mutations**; the text "Tersalin! ✨" is static, so **nothing will be announced on copy** (opacity is not an accessibility-tree change). Symmetrically, the "Tersalin! ✨" text sits in the accessibility tree at `opacity-0` at all times — a screen-reader user exploring the card can encounter a phantom "copied" state before ever copying. The *right* pattern is an always-mounted region whose **text content** changes (empty → "Tersalin! ✨"). Round 1 suggestion #4 is structurally done but does not deliver the announcement. Improvement (was non-blocking in R1). |
| Escape-to-close + autofocus | **True, no leaks** | `TakeawayFormModal.jsx:44-62`. The keydown listener is registered only while `open`, removed in the effect cleanup (deps `[open, onClose]`; `onClose` identity churn re-subscribes but never accumulates — no leak). Autofocus via `nameRef.current?.focus()` in the open-effect works because the modal mounts on open. Escape does fire while focus is in an input — that is standard `role="dialog"` behavior (APG), though typed text is lost because `reset()` runs on reopen (minor UX note, Improvement #6). ✅ |
| ARCH-4 conversion test | **True** | `test_takeaway_session_converts_to_dine_in_keeping_customer_data` (`WelcomeSessionTest.php:61-84`): takeaway session + `?table=12` → `mode=dine_in`, `table_number=12`, customer name preserved, props + session both asserted. ✅ |
| Item 7 "not done": timezone stays UTC; duplicates stay | **Recording acceptable; see timezone analysis below** | `config/app.php` timezone untouched; `RootPageTest`/`WelcomePageTest` duplication pre-exists from RFC-001. Both honestly recorded with a hard gate ("harus diset Asia/Jakarta sebelum RFC-005/006"). |

**Timezone analysis (worked through concretely, as required):** the pickup value is a wall-clock `H:i` string. A WIB user at **14:00 WIB (07:00 UTC)** picks **14:10 WIB**: the client compares 14:10 against device time 14:00 → exactly 10 min → passes. The server sees `now()` = 07:00 UTC and pickup = "14:10" → 7 h in the future → passes without rollover. The server rule is therefore **strictly looser, never stricter**, for WIB users on the same calendar day (the `addDay` branch dominates for early-morning WIB times too: e.g. 00:05 WIB / 17:05 UTC picking "00:15" rolls to "tomorrow" server-side and passes). **No customer can be wrongly rejected by the UTC clock in this RFC** — the flaw is latent semantics ("overdue pickup", expiry) for RFC-005/006, exactly as the author recorded. Recording it is acceptable; **not blocking for RFC-003**, but it must be a hard gate before any server-side time *comparison* feature (noted in Improvement #2).

---

## STEP 3 — New findings introduced (or left behind) by the fix commit

Fix commit scope (`6a977f9 --stat`, 9 files: RFC doc, controller, new FormRequest, 3 components, Welcome page, review file, WelcomeSessionTest) — **scope matches the claims; nothing unrelated touched; working tree clean at HEAD.**

1. **Residual AA contrast pair — `Catalog.jsx:13`:** `text-[var(--color-outline)]` (#817661) on paper = **4.27:1** at 14px uppercase-bold — the *same failing pair Round 1 blocking #1 ordered fixed for the Welcome subtitle*, left in RFC-003's own new (placeholder) Catalog page. It makes the RFC fix-note claim "Semua pasangan dihitung ulang dan lulus AA (≥4,5:1)" **inaccurate**. One-line fix (`--color-ink-soft`, as was done on Welcome) — listed as the single blocking item below, mainly for claim-integrity consistency with Round 1's standard.
2. **RFC fix-note ratio inaccuracy:** headline accent claimed "11,30:1"; the real ink-on-primary ratio is **8.22:1** (11.30:1 is ink-on-container). Passes AA regardless; fix the number.
3. **Aria-live follow-up is cosmetic only** (detailed in Step 2 table): the always-mounted region with static text will not announce the copy, and exposes a phantom "Tersalin!" to assistive tech. The RFC's fix note 6 ("region 'Tersalin!' selalu ter-mount (`aria-live` persisten)") overstates the outcome.
4. **Bundle tests skip on fresh checkout** (`public/build` untracked): acceptable (established `TokenCssVisualTest` pattern, explicit skip message, demonstrably ran here), but see Improvement #1 so the AC-5/AC-6 guard can't silently vanish in CI.
5. Modal "stacked sheets" literal aspect not implemented (single sheet) — cosmetic, see Step 1 blocking #3.

**Regression re-check (Round 1 items re-verified, all clean):** ARCH-4 both directions still guarded (`:59-61` controller + 2 tests); validation parity client/server unchanged (name UTF-16 vs `mb_strlen` nit still the only divergence — server stricter, user sees the error); DATA-1 — zero `localStorage` in `resources/js` (grep → 0); zero `dangerouslySetInnerHTML`/`innerHTML` (grep → 0); CSRF wiring untouched (default `web` group + Inertia v3 XSRF defaults + blade meta); no new XSS sinks (name stripped + React text nodes; phone regex-bound; `pickup_at` `H:i`-bound; table int-cast post-regex); no DB access, no perf change.

---

## STEP 4 — Acceptance Criteria matrix (Round 2)

| AC | Guard | Genuine-fail-on-regression? | Verdict |
|---|---|---|---|
| **1** `?table=12` → badge + locked dine-in | `test_table_qr_locks_dine_in_mode_with_table_number` (props + strict whole-session assert) | **Yes** (server layer) | Guarded; badge *rendering* still code-read only (disclosed deviation #10). |
| **2** No table → takeaway form opens | mode resolution guarded; form endpoint wiring now bundle-guarded (`/session/takeaway` in Welcome chunk) | **Yes** for mode + wiring; the *auto-open-on-arrival* behavior itself remains code-read only (no DOM tooling) | **Partially guarded — auto-open half still code-read** (disclosed). |
| **3** Validation errors | server tests + client unit tests (unchanged, re-read) | **Yes, both layers** | Fully guarded (strongest AC). |
| **4** Tap Wi-Fi copies `ngopiyuk123` | `copyToClipboard.test.js` + bundle guard (`ngopiyuk123` reachable only through WifiMemoCard) | **Yes** for util + presence-in-bundle; tap-trigger still code-read | Guarded modulo disclosed tooling gap. |
| **5** Banner shows SKETCHKOPI 10% | `test_welcome_bundle_renders_promo_voucher` — reads real built Welcome entry via manifest | **Yes** (tree-shaken on removal), given a build exists | **Now genuinely guarded** (R1 blocker resolved). |
| **6** CTA → catalog | route test + `/katalog` string in Welcome chunk (only source is the CTA href) | **Yes** | **Now genuinely wired-guarded.** |
| **7** HTML sanitized before render | `test_html_in_name_is_stripped_before_storing` (now exercising FormRequest) + React escaping invariant | **Yes** | Fully guarded. |

**Summary:** ACs 1, 3, 5, 6, 7 genuinely guarded; ACs 2 (auto-open) and 4 (tap-to-trigger) remain partially code-read — both disclosed by deviation #10 (no DOM tooling in stack; Dusk deferred to RFC-008). AC-5's mis-claim from Round 1 is repaired and the guard is real.

---

## STEP 5 — Review dimensions (Round 2)

### 1. RFC Adherence — **NEEDS WORK** (was NEEDS WORK)
- All 7 ACs implemented; 5 now genuinely test-guarded, 2 partially (disclosed). AC-5 evidence claim corrected and reproduced (38/239).
- All 11 original deviations re-confirmed sound (unchanged code paths re-read). The 3 formerly-unrecorded deviations are all resolved: SEC-1 by refactoring to `StoreTakeawayRequest`, modal spec by implementing DESIGN.md:181 (with a cosmetic "stacked" residue), AC-5 claim by adding real guards.
- Remaining: the RFC fix note's "all pairs pass AA" claim vs `Catalog.jsx:13` (4.27:1) and the "11,30:1" headline figure (actually 8.22:1) — documentation accuracy, plus the one contrast pair above.

### 2. Rules Compliance — **NEEDS WORK** (was NEEDS WORK)
- **PASS:** ARCH-4 (both directions, tested), SEC-1 (FormRequest letter now followed), SEC-2 (parity intact both layers), UI-2 (built CSS zero `#000000`; no hex literals in JSX), UI-4 (hard shadows/pressed state unchanged), UI-5 (tape, squiggle, pin, ±2.5° tape corners), UI-6 (480px container), CODE-1 (Pint repo-wide passed), CODE-2 (safe cast post-regex), CODE-3 (dead export eliminated; no debug code), DATA-1 (zero localStorage), 44px touch targets (Modal buttons, "Ubah data" — verified in shipped CSS/bundle).
- **NEEDS WORK:** `Catalog.jsx:13` outline-on-paper 4.27:1 at 14px — same AA defect class Round 1 blocked on, still present in an RFC-003 component.

### 3. Security — **PASS**
- Sanitize-before-validate now lives in one auditable place (`StoreTakeawayRequest::prepareForValidation`) with `is_string` guards; stored values are post-sanitization `validated()` output; no dangerous sinks (re-grepped); CSRF untouched; session writes still ARCH-4-guarded; `?table` regex tightened (no more `007`). No findings ≥ minor.

### 4. Performance — **PASS** (N/A-heavy)
- Still zero DB access; bundle grew 13.93 → 14.51 kB (+0.58 kB for a11y/form work) — trivial vs budget. No concerns.

### 5. Maintainability — **PASS**
- FormRequest extraction *improved* the structure (controller now 67 lines, single responsibility); single-source `WIFI_PASSWORD`; honest docblocks; bundle tests follow the established `TokenCssVisualTest` pattern. Nits: Wi-Fi constant's odd home in the validators file; `--color-container` and `--color-surface-container` remain duplicate #FFF1D6 tokens (pre-existing, RFC-001 cleanup).

---

## Overall Risk Level: **LOW**

All security- and architecture-critical behavior verified again from scratch and genuinely guarded. Every Round 1 blocking issue is substantively resolved; what remains is one marginal contrast pair on a transitional placeholder page, two documentation-accuracy nits in the RFC's fix notes, and one a11y follow-up that was implemented structurally but not functionally. Nothing can corrupt data or strand a customer.

## Summary

The fixes genuinely hold. The bundle tests read the real manifest-resolved Welcome chunk and would fail on removal of PromoBanner/CTA/wifi wiring (tree-shaking reasoning confirmed); the FormRequest really sanitizes before validating with identical SEC-2 rules and the double-validate pattern is gone; the modal now matches DESIGN.md:181's literal color and ±2.5° tape geometry; contrast was recomputed and the promo/chip/subtitle/touch-target claims all check out to the decimal — except the headline figure (8.22, not 11.30) and one pair the author missed (`Catalog.jsx` label). The `?table=0` rejection, `WIFI_PASSWORD` single-sourcing, Escape/autofocus and the ARCH-4 conversion test are all real and correct. Two honest caveats: the always-mounted `aria-live` region won't actually announce anything (static text + opacity toggle), and the bundle guards skip when the build is absent — both acceptable but worth carrying forward. The UTC-timezone deferral is correctly judged non-blocking for *this* RFC (the server rule is provably looser, never stricter, for WIB users) but must be enforced before RFC-005/006.

## Blocking Issues (must fix before "Reviewed")

1. **One residual WCAG AA contrast pair:** `resources/js/Pages/Catalog.jsx:13` uses `text-[var(--color-outline)]` (#817661) on paper = 4.27:1 at 14px uppercase-bold (needs 4.5:1) — the exact pair Round 1 blocking #1 ordered changed on the Welcome page. Change to `--color-ink-soft` (8.88:1), and correct the RFC fix-note claims ("Semua pasangan … lulus AA" and the headline "11,30:1" → 8.22:1) so the evidence text matches reality.

## Improvement Suggestions (non-blocking)

1. Ensure the CI/review pipeline runs `npm run build` **before** `php artisan test` so the AC-5/AC-6 bundle guards (and RFC-001's `TokenCssVisualTest`) can never silently skip on an untracked `public/build`.
2. Make the `Asia/Jakarta` timezone a hard gate in RFC-005's plan (any server-side *comparison* against `pickup_at` — overdue pickup, promo windows, QRIS expiry in RFC-006 — is 7 h off in UTC).
3. Fix the "Tersalin!" live region properly: keep the `<p role="status">` mounted but render its text only when copied (empty → "Tersalin! ✨"), which both announces the copy and removes the phantom opacity-0 "Tersalin!" from the accessibility tree.
4. Move `WIFI_PASSWORD` next to the Wi-Fi card (or a `constants.js`) rather than exporting it from `validateTakeaway.js`.
5. Modal: consider a second offset sheet behind the notepad for the literal "stacked" look of DESIGN.md:181; use the spec's mint washi variant for the second strip.
6. Escape-to-close currently discards in-progress input (reset on reopen) — either confirm intent or keep the draft until explicit dismissal.
7. Keep the recorded items visible in RFC-008: full focus trap/restore, Dusk coverage for AC-2/4 wiring, and collapsing the duplicate `RootPageTest`/`WelcomePageTest`.
