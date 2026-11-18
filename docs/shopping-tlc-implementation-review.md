# Shopping List TLC implementation review

Baseline: `56581e6`. Branch: `fix/shopping-list-tlc`. Review only: no commit, push, merge, deployment, service/Supabase changes, dependency/version bumps, or storage migration.

The approved source diagnosis remains in `shopping-tlc-diagnosis.md` and `shopping-tlc-evidence.json`. Machine-readable implementation results, every catalog difference, source lines, and browser measurements are in `shopping-tlc-implementation-evidence.json`. Screenshots, browser harness, and command logs are archived at `/workspace/shared/shopping-tlc-implementation`.

## Root causes and changes

| Problem / exact source | Before on clean main | After |
| --- | --- | --- |
| Dolly-Inspired Country-Fried Crispy Chicken: `3 lb bone-in, skin-on chicken pieces` | Final-page comma cleanup produced `Bone in` despite the better stored preview | `Bone-in Skin-on Chicken Pieces`, 3 lb |
| Grilled BBQ Chicken Thighs and Baked Chicken Thighs: `6 bone-in, skin-on chicken thighs` | `Bone in` | `Bone-in Skin-on Chicken Thighs`, count 6 |
| Portobellos rellenos estilo caprese: `5 a 6 bolitas de mozzarella fresca, rebanadas` | `A 6 Bolitas de Mozzarella Fresca` | `Fresh Mozzarella Balls`, range requirement 6; English source identity matches |
| Quiche: `1/2 cup shredded mozzarella`; Chicken Green Bean Mushroom Bake: `1/2 cup shredded mozzarella cheese` | Separate merge identities despite matching Pantry keys and form/units | One `Shredded Mozzarella Cheese` group, 1 cup, 2 recipes |
| Recipe pencil edit Garlic → `8 flour tortillas` | Spread retained recipe/search metadata; page and Pantry could still use garlic; merged source rows each received the entered quantity | One manual need, text authoritative, normalized `flour tortillas`, quantity 8; old source/search/display/unit/package/Smart intent removed |
| Dolly legacy oil row with missing source text | Exact-source exclusion could not see original reserved line | Read-only exclusion requires exact recipe title, cached text, and complete known generated-ID pattern, in EN/ES |

Descriptor comma protection recognizes only the existing known meat descriptor vocabulary. The explicit source-head restoration recognizes bone-in skin-on chicken pieces/thighs. The Spanish range change is restricted to the evidenced fresh mozzarella balls phrase. Source-aware mozzarella normalization preserves buying forms and alternatives, and does not change the caller's unit/package compatibility checks.

Manual conversion whitelists manual fields, retains the opaque record ID/added time, preserves checked state only if every source was checked, and replaces the entire selected group with one manual need. A retained opaque ID is not used as a product identity. Product-specific force-buy/restock intent is reset because the product changed. Source-free Smart Shopping approvals retain their existing path. Previously pencil-edited manual rows retaining recipeIngredientText are interpreted from typed text at read time, without rewriting storage. New manual edits remove stale metadata at save time.

Recipe rows with intact source are reparsed through the real page. Dolly recovery with missing source is deliberately stricter: no substring name matching or broad reserved-ingredient filter. Wrong IDs, titles, changed cached text, manual rows, normal frying oil, and reserved pan juices are protected. Raw legacy records remain stored; the view excludes the narrowly proven process row.

## Identity and Pantry boundaries

Unchanged product identities retain Pantry keys, quantities, compatibility and Already in Pantry classification in English/Spanish. The shredded alias pair already had the same Pantry key; only its source-backed merge identity changes. Fresh/sliced/balls/pearls/cubes, choice phrases, incompatible units/packages, breast/thigh/generic chicken, toasted sesame oil, broth variants, and unrelated products have separation controls. The Spanish balls correction intentionally replaces its malformed identity with the matching English product; this is a parser correction, not a claim that all Pantry keys are unchanged.

Actual save-edit and final-page tests prove garlic stock cannot cover the newly edited tortillas, while tortilla stock can. The browser confirmed Flour Tortillas under Already in Pantry after the edit. Layout changes do not modify data shape, matching, row checking, source details, or Shopping behavior.

## Rendered mobile verification

Actual React App in Chromium on a disposable local origin; real local storage, production generator payloads and current ShoppingListPage. CSS-width frames provide the requested mobile-width checks. Browser zoom was unchanged. Physical Pixel/native-device testing remains pending.

Stress row: `Sour Cream or Greek Yogurt`, two recipes, partial Pantry. Pictures enabled. More actions and name/source buttons retain at least 44px touch height. Name permits two lines, metadata wraps beneath it, pictures are 32px, and the two old action buttons are replaced by one 44×44px trigger.

| CSS viewport | Document width | Name width | Name height | Horizontal overflow |
| --- | --- | --- | --- | --- |
| 320 | 320 | 132 | 48 | No |
| 390 | 375 | 187 | 48 | No |
| 412 | 397 | 209 | 48 | No |
| 430 | 415 | 227 | 24 | No |

Clean-main measured name width at 412px was **11.828125px** for this same metadata stress case; it is now **209px**. Other before-width measurements were not recorded. Scrollbar space accounts for the 15px document/viewport difference where present. Full stress-case name remained readable at each width; at 320px the secondary metadata wraps to another line. This does not promise arbitrary long names will never truncate.

Rendered checks completed:

- Fresh generated week and authentic pre-PR49 generator week opened in current app: corrected chicken labels and Garlic; raw records inspected alongside rendered text.
- Intact-source legacy refresh and exact English/Spanish missing-source Dolly recovery; process records remain in raw storage but have no rendered rows.
- Focused Spanish balls, corrected three chicken sources, compatible shredded alias group with 2 recipes, and separate fresh/sliced/alternative controls.
- Actual More → Edit → Save Garlic to `8 flour tortillas`: one manual raw record, old identity/source/measurements absent, correct rendered product and Pantry placement.
- Portal dialog escapes row clipping, initial Edit focus, Shift+Tab wraps to Done, Tab wraps to Edit, Escape closes and returns focus to More. Explicit Delete removes the selected group. Opening actions does not toggle or delete a row.
- English/Spanish action labels; 44×44 triggers; 2 recipes and Have some secondary metadata.
- No captured window/resource/rejection/console errors and no horizontal overflow in audited scenarios. Desktop click/keyboard exercised; touch-event isolation also has component regressions, but physical touch is pending.

Screenshots: `layout-320.png`, `layout-390.png`, `layout-412.png`, `layout-430.png`, `manual-edit.png`, `edited-pantry.png`, `fresh-week.png`, `legacy-week.png`, `missing-source.png`, `spanish-actions.png` in the shared artifact directory.

## Regression coverage

`shopping-tlc-regression-test.cjs` executes the actual page useMemo, selectors and save handler, loaded through AST extraction without copying grouping logic. It compares against clean `56581e6` dependencies and uses `643fa15`'s authentic generator for legacy records. It covers all implemented systemic rules, source guards, legacy intact/missing source, manual conversion and old manual metadata, Smart approvals, Pantry full/partial/unit mismatch/Buy anyway, forms/packages/units, raw immutability and English/Spanish. Three deterministic Smart Week scenarios compare complete plans with clean main: locked meals, vegetarian, and constrained/favorites/history/Pantry planning, then feed generated meals to final grouping.

The full bilingual catalog checks **7,275 newly generated records**, with **59 record-level differences** restricted to descriptor chicken and mozzarella source classes. Those are not 59 newly discovered defects: the count includes form-preserving identity/merge changes even when labels match. The full per-source matrix is retained in the implementation evidence JSON. Original PR49 regression assertions remain; their broad metadata equality guard defers deliberately changed TLC source classes to the stricter clean-main TLC matrix. The Spanish evidence fixture adds the exact Caprese line for the new alias. Component tests cover English/Spanish explicit action dispatch, Escape, and parent click/touch isolation.

## Validation results

Passed:

- Dependency install without package/lock changes; TypeScript build and Vite production build. Existing bundle-size advisory remains.
- `npm run lint`: 0 errors, existing 7 hook warnings.
- `node scripts/shopping-tlc-regression-test.cjs /tmp/shopping-tlc/clean-main /tmp/shopping-tlc/pre49`.
- `node scripts/shopping-page-grouping-regression-test.cjs /tmp/shopping-tlc/pre49-page.tsx`.
- `node scripts/shopping-item-actions-test.cjs`.
- Pantry recipe/mobile/tomato regressions; Spanish grocery and alias follow-up regressions; apple/countable/requirement-summary regressions; ingredient headers; Little Chefs; local Shopping sync regression.
- Smart Week parity scenarios within the TLC regression.
- `npm run validate:recipes`: 526 ingredient blocks; passed.
- `npm run audit:shopping`: 348 recipes, 3,682 English ingredient lines, 3,642 Shopping items, 40 ignored; no recipe-noise, registry/category mismatch or category-conflict warnings. Diagnostic Other-category rows remain.
- `npm run test:plus`.
- `npx cap sync android` and `npx cap sync ios`. Incidental generated biometric plugin wiring was inspected and restored to baseline; no native source/config differences are included. Native compilation/device execution was not performed.
- Actual browser checks above and whitespace diff validation respecting existing CRLF files.

Unrelated failures reproduced with clean `56581e6`, unchanged and out of scope:

| Command | Current and clean-main result |
| --- | --- |
| `node scripts/grocery-delivery-provider-test.cjs` | line 37, `1 !== 0` |
| `node scripts/grocery-handoff-selection-test.cjs` | line 148, `4 !== 5` |
| `node scripts/instacart-shopping-list-test.cjs` | line 19, unexpected dependency `./groceryRetailerMatch.js` in test loader |

## Exact review file scope

Implementation:

- `src/components/ShoppingItemActions.tsx` (new)
- `src/core/shoppingItemEdit.ts` (new)
- `src/core/shoppingRecipeIdentity.ts` (new)
- `src/core/shoppingProcessIngredients.ts`
- `src/core/spanishIngredients.ts`
- `src/pages/ShoppingListPage.tsx`
- `src/i18n/en.ts`
- `src/i18n/es.ts`

Regression and supporting audit:

- `scripts/lib/load-shopping-page-grouping.cjs`
- `scripts/shopping-page-grouping-regression-test.cjs`
- `scripts/shopping-tlc-regression-test.cjs` (new)
- `scripts/shopping-item-actions-test.cjs` (new)
- `scripts/fixtures/spanish-grocery-evidence.json`
- `scripts/shopping-tlc-diagnostic.cjs` (prior diagnostic artifact, preserved)
- `docs/shopping-tlc-diagnosis.md` (prior diagnostic artifact, preserved)
- `docs/shopping-tlc-evidence.json` (prior diagnostic artifact, preserved)
- `docs/shopping-tlc-implementation-review.md` (new)
- `docs/shopping-tlc-implementation-evidence.json` (new)

## Intentionally unresolved / recommendation

Manual quantity omission remains baseline behavior, as required by the current main-row UX; quantities are correctly stored and tested. Unknown `Very Flour Tortillas` Pixel provenance remains unknown. No arbitrary row is attributed to a recipe. No broad 320px redesign or migration was added. Long names can still exceed two lines, and native physical touch/device verification is pending. Unrelated retailer/handoff failures remain separate. No broad Parmesan/chicken/broth/oil merging was added.

Recommend committing this focused implementation after owner review. A physical Pixel smoke check is still recommended before release. Nothing has been committed or pushed.
