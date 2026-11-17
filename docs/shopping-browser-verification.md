# Rendered Shopping List verification

Verified 2026-11-17 using the existing uncommitted changes on
`fix/shopping-generation-review`, HEAD `643fa15`.

**Recommendation: commit the focused shopping-generation changes.** The rendered
checks found no new functional or layout regression. Physical-device testing
remains pending; this is browser verification, not a native-device result.
No additional production-code changes were made during this verification.

## Browser and method

- Shared, visible **Chromium 156.0.8078.79**, Debian GNU/Linux 13.
- Current app: local Vite server, port 5173. Clean baseline: `git archive
  643fa15` source checkout in `/tmp/shopping-ui-baseline`, separate Vite server
  on port 5174. Baseline uses the same installed dependencies and public assets.
- Actual full application and `ShoppingListPage.tsx` rendered in same-origin
  frames with **320 × 740, 390 × 740, and 430 × 740 CSS-pixel viewports**.
  These are responsive browser widths, without mobile user-agent, touch, native
  WebView, keyboard, or device safe-area emulation.
- Browser automation connection failed and managed Chromium disallowed
  DevTools. Native desktop clicks, typing and scrolling were used instead.
  A temporary local test page supplied fixtures and displayed read-only DOM
  audits next to the real app. No rendered row was substituted or mocked.
- Fixture generation used production `generatePlan`, `addIngredientsToList`,
  and the actual built-in recipe catalog. A seven-day week was generated with
  Classic Meatloaf, Baked Potato Bar, and Sweet Potato and Black Bean Enchiladas
  locked into three days, then its recipe ingredients were added through the
  production shopping-generation function. The app's Week and Shopping List
  routes were inspected. This was production-function fixture generation, not
  a claim that every setup action was performed through the planner form.
- Manual entry, Buy anyway, recipe-source opening, and modal closing were
  exercised using the app's actual rendered controls.
- Only disposable browser-local data on the new local origins was populated.
  No account was signed in and no production-service mutation was performed.
- The temporary frame bootstrap installed listeners before app initialization
  for window errors, resource errors, unhandled rejections, and `console.error`.
  DOM audits measured document/body widths, read rendered edit labels and
  recipe badges, and displayed saved raw shopping records. Screenshots capture
  the visible audit results. No console/network panel was available; this is
  not a claim of a complete network trace.

The temporary test HTML files were removed from the repository after testing.
Their source and screenshot evidence are retained in
`/workspace/shared/shopping-ui-review/`. The current application was also opened
at its ordinary top-level `/shopping-list` route after frame testing.

## Requested checks and results

| # | Actual check | Result |
|---|---|---|
| 1 | Inspect generated week and final Shopping List, including a multi-recipe garlic row | **Pass:** `Garlic`, not `Garlics`; generated-week row showed `(3 recipes)` |
| 2 | Inspect potato and tortilla rows from built-in ingredients in final list | **Pass:** `Russet Potatoes` and `Corn Tortillas`; no doubled plurals |
| 3 | Two eggs from Classic Meatloaf and one additional egg; open actual source modal | **Pass:** main row `Eggs`, modal `2 Eggs` and `1 Egg` |
| 4 | One lemon, avocado and banana; also the one-egg source amount | **Pass:** `Lemon`, `Avocado`, `Banana`, `1 Egg` |
| 5 | Identical Pantry fixture on baseline and current; fresh versus canned tomato; click Buy anyway | **Pass:** garlic and diced tomatoes covered in both; fresh `Tomato` remains to buy; Buy anyway restores garlic in both |
| 6 | Garlic from two recipes and eggs from two sources; open source details | **Pass:** `(2 recipes)` visible; source modal lists both recipes with correct amounts |
| 7 | Type `2 Birthday Candles` into the actual shopping input and save, on both baseline and current | **Unchanged:** both show main-row `Birthday Candles`; see existing quantity omission below |
| 8 | Alternative tortilla phrase; dairy/plant milk; fresh garlic/powder; incompatible bean packages and broth units | **Pass:** alternative retained; milk/coconut milk and garlic/powder remain separate; two Black Beans rows and two Chicken Broth rows remain; package detail shows `1 can (15 oz)` |
| 9 | Add entire Dolly chicken ingredient block using production generation; inspect full rendered label audit | **Pass:** reserved frying-oil row absent in current, present in baseline; purchased `Vegetable or Canola Oil` remains in both |
| 10 | Scroll list and open source dialogs; inspect responsive layouts and runtime audit | **Pass for browser:** no horizontal overflow or captured runtime errors; no new overlap/layout regression; existing ellipsis at 320px noted below |

The distinct-package fixture uses `1 (15 oz) can black beans` and
`1 (28 oz) can black beans`. The distinct-unit fixture uses `1 cup chicken broth`
and `8 oz chicken broth`. They remain separate rows; visually identical labels
are not evidence that these requirements should merge.

## Measured viewport results

| Current scenario | Viewport | Document width | Body width | Horizontal overflow | Captured errors |
|---|---|---|---|---|---|
| Generated week Shopping List | 390 × 740 | 375 | 375 | false | 0 |
| Counts/singulars/manual entry | 320 × 740 | 320 | 320 | false | 0 |
| Counts/singulars/manual entry | 390 × 740 | 375 | 375 | false | 0 |
| Counts/singulars/manual entry | 430 × 740 | 415 | 415 | false | 0 |
| Pantry covered / Buy anyway | 390 × 740 | 375 | 375 | false | 0 |
| Alternatives and protected distinctions | 390 × 740 | 375 | 375 | false | 0 |
| Package-source and egg-source modals | 390 × 740 | 375 | 375 | false | 0 |
| Full Dolly chicken list | 390 × 740 | 375 | 375 | false | 0 |

The audit defines horizontal overflow as `documentElement.scrollWidth >
window.innerWidth`. Smaller document widths reflect the browser's vertical
scrollbar. Measurements do not assert that every label is fully expanded.

## Rendered before / after

| Case | Clean `643fa15` | Current changes |
|---|---|---|
| Garlic in count fixture | `Garlics (2 recipes)` | `Garlic (2 recipes)` |
| Six russet potatoes | `Russet Potatoess` | `Russet Potatoes` |
| Eight corn tortillas | `Corn Tortillass` | `Corn Tortillas` |
| Singular fruit | `Lemon`, `Avocado`, `Banana` | Same |
| Pantry coverage | `Garlics` and `Diced Tomatoes` covered | `Garlic` and `Diced Tomatoes` covered |
| Buy anyway | Garlic row restored, badge retained | Same behavior, corrected wording |
| Manual `2 Birthday Candles` | `Birthday Candles` | Same |
| Dolly gravy process ingredient | `Reserved Frying Oil or Chicken Drippings` row present | Row absent |
| Purchased frying oil | `Vegetable or Canola Oil` | Same |

## Existing findings, kept outside this fix

1. **Manual quantity omission:** saving `2 Birthday Candles` displays
   `Birthday Candles` without `2` in both the clean baseline and current UI.
   Manual behavior is unchanged by this work, but the browser check does not
   support a claim that all manually entered quantities are correctly shown.
   A separate manual-quantity task would be appropriate.
2. **320px text truncation:** thumbnail, recipe badge and edit/delete controls
   leave little room for some labels; e.g. `Eggs` can appear as `E...`. The same
   truncation appears in clean `643fa15`. No horizontal overflow or new overlap
   was observed. A dedicated narrow-screen layout improvement could address it.
3. **Existing Dolly parser artifact:** `Bone in` appears as an extra shopping
   label in both baseline and current full-list audits. The reserved-oil fix
   does not address that unrelated parsing issue.
4. The three previously documented provider/handoff test failures remain
   baseline findings. No provider or service changes were made here.

## Screenshot evidence

All files below are in `/workspace/shared/shopping-ui-review/` and were captured
from the visible shared desktop:

| File | Evidence |
|---|---|
| `generated-week.png` | Actual Week page with generated plan |
| `week-labels.png` | Generated-week `Garlic (3 recipes)` and `Russet Potatoes` |
| `counts-singulars-manual.png` | Corrected labels, singular fruit, `(2 recipes)` |
| `egg-singular-plural-breakdown.png` | Actual source modal with `2 Eggs` and `1 Egg` |
| `manual-and-tortillas.png` | Current corn tortillas and manual row |
| `baseline-labels.png` | Baseline `Garlics` and `Russet Potatoess` |
| `baseline-manual-tortillas.png` | Baseline `Corn Tortillass` and same manual row |
| `mobile-320.png`, `mobile-430.png` | Current width audits and rendered rows |
| `baseline-320.png` | Existing narrow-label truncation, no overflow |
| `pantry-covered.png`, `pantry-buy-anyway.png` | Current Pantry coverage and restored garlic |
| `baseline-pantry.png`, `baseline-buy-anyway.png` | Same baseline placement/interaction |
| `distinctions.png`, `package-source-details.png` | Retained alternative, separate packages/units, 15 oz detail |
| `dolly-shopping.png`, `baseline-dolly.png` | Full rendered label audits showing process-row removal |
| `source-modal-audit.png` | Open dialog with zero captured errors and no overflow |
| `current-shopping-desktop.png` | Ordinary top-level app route after frame checks |

## Validation and pending work

The existing code validation results remain as documented in
[the implementation review](shopping-generation-review.md): successful build,
0 lint errors / 7 existing warnings, focused regressions, recipe validation,
shopping audit, Plus tests and local native sync. This turn changed review
artifacts only; production files were not edited, so those code checks were
not repeated unnecessarily. Browser results are additional evidence.

**Physical iOS/Android devices, native WebView behavior, touch interactions,
software keyboard and native compilation remain unverified.** No connected
physical-device interface or installed `adb`/`xcrun` was available in this cloud
session. The browser checks do not substitute for those checks.

## Exact files changed from baseline

Production:

- `src/pages/ShoppingListPage.tsx`
- `src/shoppingList.ts`
- `src/core/shoppingProcessIngredients.ts` (new)

Regression coverage:

- `scripts/lib/load-shopping-page-grouping.cjs` (new)
- `scripts/shopping-page-grouping-regression-test.cjs` (new)

Review artifacts:

- `docs/shopping-generation-review.md` (new; updated with browser status)
- `docs/shopping-generation-evidence.json` (new)
- `docs/shopping-browser-verification.md` (new)

No commits, pushes, merges, deployments, Supabase/service changes, version bumps,
or native configuration changes were performed.
