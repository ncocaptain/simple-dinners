# Shopping generation review

Prepared 2026-11-17 on `fix/shopping-generation-review` from exact baseline
`643fa1590a0d50ac400fd8849841c0f1d3c0e96d`. Changes are uncommitted, for review.

## Result and scope

The final recipe-row presentation in `ShoppingListPage.tsx` appended `s` to
unknown names even when they were already plural or invariant. The main-row
product-only override could reintroduce malformed names after earlier formatting
had produced a correct result. The fallback now inflects only explicitly known
countable nouns, preserves unknown/mass nouns and alternatives, and handles known
plural heads in qualified phrases. Quantity-one source wording remains unchanged.
The recipe breakdown uses the same conservative formatter rather than stripping
arbitrary `s`/`es` endings from a whole phrase.

No grouping identity, canonical registry, stored identity, unit conversion,
package grouping rule, Pantry comparison key, or coverage policy was changed to
achieve the display fixes. No new duplicate merges were introduced. Similar
labels are not sufficient evidence for merging products.

The built-in Dolly country-fried chicken recipe buys 4 cups of vegetable/canola
oil, then explicitly instructs the cook to reserve 1/4 cup of the frying oil or
drippings in the skillet for gravy. A shared predicate matches that recipe's
English/Spanish title and exact English/Spanish secondary ingredient line.
New recipe additions omit that supplied process ingredient; final page grouping
also omits legacy saved instances. Legacy raw storage is not migrated/deleted.
The purchased frying oil remains. Preview alone remains context-free and can
still return that line; exclusion requires recipe context.

## Evidence matrix

| Requirement | Implementation / evidence | Result |
|---|---|---|
| 1. Final grouping/display path | Harness extracts and executes the actual page `combinedItems` callback and top-level production helpers | Verified beyond preview |
| 2. Presentation separate from identity | Formatter returns a label; stored inputs and grouping/Pantry/quantity/category/thumbnail metadata compared with baseline | Unchanged identity and metadata for display fixes |
| 3. Conservative pluralization | Known noun table and known head-word inflection; no arbitrary trailing `s`; mass nouns and alternatives preserved | Reproduced malformed labels fixed |
| 4. Semantic identity plus unit/package compatibility | Eight duplicate controls below; no new merge rules | Compatible rows merge as before; meaningful distinctions retained |
| 5. Reserved frying oil | Real ingredient and instruction evidence; exact recipe + full-line predicate in generation and page grouping; English and Spanish | Supplied ingredient omitted, purchased oil retained |
| 6. Screenshot-only rows | Original screenshots and their row/source list were not available in this session | **Unknown**; no attribution or parser fixes invented |
| 7. Real-path regressions | AST harness executes final main-row override, recipe breakdown and actual Pantry/section selector callbacks | Covered by new regression script |
| 8. Pantry parity | Keys, coverage and row IDs compared; covered/partial/none, jar incompatibility, force-buy, checked, restock and Buy Anyway controls | Already in Pantry and pickup selection preserved |
| 9. Provider baseline failure | Clean `643fa15` test and dependency copied to isolated temporary directory and rerun | Same failure before and after; separate from this work |

## Before / after with built-in sources

| Built-in recipe / ingredient | Baseline label | New label |
|---|---|---|
| Classic Meatloaf — 2 cloves garlic, minced | Garlics | Garlic |
| Zuppa Toscana Soup — 5 yellow potatoes, cut into 1-inch pieces | Yellow Potatoess | Yellow Potatoes |
| Chicken Parmesan Melts — 4 sandwich rolls (hoagie or sub rolls) | Sandwich Rollss | Sandwich Rolls |
| Pork Street Tacos — 8 small corn or flour tortillas | Corn or Flour Tortillass | Corn or Flour Tortillas |
| Lamb and Beef Gateway Burgers — 4 brioche burger buns | Brioche Burger Bunss | Brioche Burger Buns |
| Baked Potato Bar — 6 large russet potatoes | Russet Potatoess | Russet Potatoes |
| Smash Burger Tacos — 4 street taco-sized flour tortillas | Street Taco Sized Flour Tortillass | Street Taco Sized Flour Tortillas |
| Summer Pool Day Chicken Caesar Wraps — 6 large flour tortillas | Flour Tortillass | Flour Tortillas |
| Graduation Party Baked Sandwiches — 12 Hawaiian rolls or slider buns | Hawaiian Rolls or Slider Bunss | Hawaiian Rolls or Slider Buns |
| Dolly-Inspired Country-Fried Crispy Chicken — 1/4 cup reserved frying oil or chicken drippings | Reserved Frying Oil or Chicken Drippings | No separate shopping row |

The catalog comparison checked **7,277 ingredient occurrences**, including
English and Spanish, with **142 label changes** and **two process-row
exclusions** (one per language). For every other occurrence, final grouping,
Pantry, quantity, category and thumbnail metadata matched baseline. The comparison
excludes presentation text and recipe-breakdown wording; these are intentionally
formatted differently. Each catalog ingredient is tested individually; cross-row
behavior is exercised by the duplicate and Pantry controls, not claimed as an
exhaustive enumeration of every possible multi-recipe cart.

[Machine-readable evidence](shopping-generation-evidence.json) contains the nine
explicit label fixtures with Pantry results and all 142 changed catalog labels,
including recipe title, slug, original ingredient, before/after and Pantry key.
Source presence is asserted against the actual built-in catalog for the explicit
fixtures. No screenshot is treated as a reproducible source.

## Duplicate controls

| Inputs | Identity / compatibility evidence | Result, baseline and current |
|---|---|---|
| 2 eggs + 1 egg | Same egg identity, individual counts | 1 row, quantity 3 |
| 1 cup chicken broth + 2 cups chicken broth | Same product and cup units | 1 row |
| 1 cup chicken broth + 8 oz chicken broth | Same product, different units without conversion proof | 2 rows |
| 1 (15 oz) can black beans + 2 (15 oz) cans black beans | Same product, can unit, same package size | 1 row |
| 15 oz can black beans + 28 oz can black beans | Different package sizes | 2 rows |
| Fresh tomato + canned diced tomatoes | Distinct product forms | 2 rows |
| Garlic powder + fresh garlic cloves | Distinct product forms | 2 rows |
| Swiss cheese in cups + slices | Different units/forms despite identical main-row labels | 2 rows |

The prior plan's specific duplicate-group and screenshot inventory was not
provided in this session. No unidentified screenshot duplicate group is claimed
fixed. These controls establish the compatibility boundary for the implemented
changes, rather than inventing a merge list.

## Validation

| Command | Result |
|---|---|
| `npm install --ignore-scripts --no-audit --no-fund` | Passed; incidental npm lockfile metadata changes removed |
| `npm run build` | Passed; final formatter change also checked with `npx tsc -b` and `npx vite build`; Vite large-chunk warning remains |
| `npm run lint` | Passed: 0 errors, existing 7 hook warnings |
| `npm run validate:recipes` | Passed: 526 ingredient blocks |
| `npm run audit:shopping` | Passed: 348 recipes / 3,682 lines; no recipe-noise, registry/category mismatch or category-conflict warnings |
| `npm run test:plus` | Passed |
| New grouping regression command below | Passed: final page grouping, Pantry selectors, duplicate controls, supplied-process rule, catalog comparison |
| `node scripts/spanish-alias-followup-regression-test.cjs` | Passed |
| `node scripts/spanish-grocery-regression-test.cjs` | Passed |
| `node scripts/test-shopping-ingredient-headers.mjs` | Passed |
| `node scripts/test-little-chefs-shopping.mjs` | Passed |
| `node scripts/apple-variety-shopping-test.cjs` | Passed |
| `node scripts/grocery-countable-requirement-test.cjs` | Passed |
| `node scripts/grocery-requirement-summary-test.cjs` | Passed |
| `node scripts/grocery-pantry-tomato-test.cjs` | Passed |
| `node scripts/shopping-sync-realtime-test.cjs` | Passed locally; no service changes |
| `npx cap sync android` / `npx cap sync ios` | Passed; unrelated generated biometric dependency wiring removed from review diff |
| `git -c core.whitespace=cr-at-eol diff --check` | Passed; preserves existing mixed/CRLF source endings |

The shopping audit is diagnostic and primarily covers preview/storage behavior;
it is not the evidence used to claim final page labels are corrected. Its existing
Other-category/coverage statistics were not used to broaden scope.

Reproduce the real-path regression comparison:

```sh
git show 643fa15:src/pages/ShoppingListPage.tsx > /tmp/shopping-page-baseline.tsx
node scripts/shopping-page-grouping-regression-test.cjs /tmp/shopping-page-baseline.tsx
```

The catalog runs use English display locale with both English and Spanish source
ingredients; localized UI wording still needs manual review.

The Node harness uses TypeScript AST extraction to execute unchanged production
helper definitions and the actual page callbacks, with real local dependencies
and isolated in-memory localStorage. It avoids mounting native/cloud UI effects.
The clean page baseline shares the unchanged pure dependencies with current
code; the changed `addIngredientsToList` path is tested separately for new saves.
It does not assert a mounted DOM or actual device behavior.

## Independent baseline failures

All three were rerun against clean `643fa15` copies of their scripts and required
source files in `/tmp/shopping-review/provider-clean`, using the same installed
TypeScript runtime. Their affected production and test files are unchanged.

| Test | Clean baseline | Working changes | Finding |
|---|---|---|---|
| `grocery-delivery-provider-test.cjs:37` | `1 !== 0` | `1 !== 0` | Test expects no available provider; baseline configuration already marks Kroger available |
| `grocery-handoff-selection-test.cjs:148` | `4 !== 5` | `4 !== 5` | Existing `requiresAttention` expectation mismatch |
| `instacart-shopping-list-test.cjs:19` | Unexpected dependency `./groceryRetailerMatch.js` | Same dependency error | Existing test loader does not accept current module import spelling |

These failures were not repaired or attributed to the shopping presentation fix.
Raw validation logs are in `/tmp/shopping-review/` in this workspace.

## Files and remaining checks

Production files: `src/pages/ShoppingListPage.tsx`, `src/shoppingList.ts`, and new
`src/core/shoppingProcessIngredients.ts`. Regression files:
`scripts/lib/load-shopping-page-grouping.cjs` and
`scripts/shopping-page-grouping-regression-test.cjs`. Review artifacts: this file,
`docs/shopping-generation-evidence.json`, and
`docs/shopping-browser-verification.md`.

Rendered browser verification is now complete; see
[the browser verification report](shopping-browser-verification.md) for exact
checks, screenshots, baseline comparisons and existing findings. Physical-device
validation, Android/iOS native compilation and live retailer roundtrips remain
pending. The exact recipe-title/full-line process rule intentionally stops matching if those source
strings change; its source assertions make that limitation visible. Other
reserved ingredients (including pan juices and noodle water) are outside this
narrow rule and remain unchanged.

No commits, pushes, merges, deployments, version bumps, Supabase/service changes,
or native configuration changes are included. The work remains review-only.
