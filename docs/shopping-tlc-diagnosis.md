# Shopping List TLC diagnostic — 56581e6

Diagnostic branch: `diagnostic/shopping-list-tlc`, created from exact current-main
baseline `56581e6`. No production implementation or service changes were made.

## Main finding

**The reproduced problems are not all stale rows.** Intact pre-PR #49 recipe
rows already refresh through the current page and render equivalently to fresh
current-main rows. Current page reparsing can itself generate bad names, lose
product distinctions, or split aliases. Separately, losing original source text
can allow an old Dolly oil row to survive. Manual edits have a related stale
metadata path that needs protection before any broader refresh mechanism.

The physical Pixel records were not supplied. Their exact provenance cannot be
inferred from truncated labels. The findings below distinguish real built-in
sources, authentic old-generator records, and explicitly synthetic controls.

## A. Fresh state

Used disposable in-memory localStorage and the real `addIngredientsToList` path
for all 348 recipes, English and Spanish source blocks. This yielded **7,275 raw
ShoppingItems**. Executed the actual `ShoppingListPage.tsx` grouping callback,
its production helpers, and its Pantry/section selectors. No copied grouping
algorithm was used.

Also generated a seven-day plan through production `generatePlan`, with three
locked built-ins chosen to reproduce the relevant classes and four normally
generated days. Added all seven recipes through production shopping generation,
starting with empty Shopping state. The captured browser plan was:

- Monday: Dolly-Inspired Country-Fried Crispy Chicken
- Tuesday: Chicken Alfredo
- Wednesday: Wild West Shrimp
- Thursday: Kid-Friendly Spaghetti & Meatballs
- Friday: Southwest Chicken Salad
- Saturday: Creamy Mushroom Stroganoff
- Sunday: Build-Your-Own Pizza Night

It produced **70 saved raw records and 47 final rows**. Raw record values and the
real rendered application were inspected in Chromium at 412 CSS px. Other
independent diagnostic reruns generate different unlocked days; their captured
plans are retained in the full audit rather than treated as the same fixture.

## B. Legacy state

Loaded the actual pre-PR #49 generator and its original dependencies from a
clean `643fa15` source archive. Re-generated the same built-in ingredient blocks
using that old implementation, retaining its saved-record fields, IDs and
`recipeIngredientText`. This produced **7,277 old raw records** across both
languages. Current final-page results had **zero fresh-versus-legacy label
differences for matching source ingredients**. The two additional old Dolly
process records were both excluded by current page logic.

For the exact captured seven-day browser plan, the old generator produced
**71 raw records and the same 47 final rows** in current main. A separate
comparison asserted equality of final merge keys, labels, Pantry keys,
quantities, units and package sizes between the fresh and old versions.

The current page refresh is an in-memory projection, not a storage migration:

1. `loadRawShoppingList()` only parses saved records.
2. A nonempty `sourceRecipe` selects the recipe path.
3. Preserved `recipeIngredientText` is reparsed; when it yields a name,
   `shouldRefreshFromRecipeText` replaces obsolete cached name/unit/quantity
   choices in the projection.
4. Final grouping/display and Pantry coverage are recomputed.
5. Raw records remain unchanged. Both object immutability and storage-byte
   stability were asserted by the diagnostic.

A control with cached `Garlics`, `obsolete garlics`, quantity 999, a jar unit and
99 oz package still displayed `Garlic` from preserved `2 cloves garlic, minced`.
An old cached field therefore does not by itself prove that the final row is
stale. Removing source text changes the available evidence and fallback path.

## Reproducible sources and classifications

| Visible class | Exact source / control | Fresh current-main result | Legacy result / classification |
|---|---|---|---|
| `Very Flour Tortillas` | No matching built-in ingredient or resulting built-in label found | Does not reproduce from this built-in catalog | Synthetic current import `8 very large flour tortillas` produces it because `large` is stripped while `very` remains. A source-less saved row also preserves it. Not proven legacy-only; Pixel source remains unknown. |
| Chicken wording | Dolly-Inspired Country-Fried Crispy Chicken — `3 lb bone-in, skin-on chicken pieces` | Preview/storage identity `chicken pieces`; page reparsing yields `Bone in` | Same failure with authentic old source. If original source is deliberately removed from that old record, the fallback label is `Chicken Pieces`. Current parser issue plus degraded-source fallback; generic pieces must not be guessed to mean breast/thigh. |
| Chicken wording | Homemade Fried Chicken — `3 lb bone-in chicken pieces (legs, thighs, breasts, wings)` | `Bone in Chicken Pieces` | Same with authentic legacy. Valid broad purchased cut description, not sufficient evidence of malformed wording or a merge with breast/thigh. |
| `Bone in` | Grilled BBQ Chicken Thighs — `6 bone-in, skin-on chicken thighs` | `Bone in` | Same with authentic legacy; comma/preparation cleanup loses the product head. |
| `Bone in` | Baked Chicken Thighs — `6 bone-in, skin-on chicken thighs` | `Bone in` | Same with authentic legacy; same parser cause. |
| Shaved/Parmesan wording | No built-in shaved-Parmesan ingredient found | All selected built-in Parmesan rows normalize to `Parmesan Cheese`, including Chicken Alfredo — `1 cup freshly grated Parmesan cheese` | Synthetic `1/4 cup shaved Parmesan cheese` yields `Shaved Parmesan Cheese`. Shaved is a meaningful form; do not remove it to force a merge. Pixel full wording/source remains unknown. |
| Frying oil | Wild West Shrimp — `frying oil (enough for about 2 inches deep)` | `Frying Oil` | Same with authentic legacy. This is purchased oil: instructions explicitly heat oil and fry the shrimp. Keep it. |
| Reserved frying oil | Dolly-Inspired Country-Fried Crispy Chicken — `1/4 cup reserved frying oil or chicken drippings` | No saved new row and no displayed row | Authentic old row with source is excluded. Deliberately dropping only `recipeIngredientText` leaves stored preview `1/4 cup Frying Oil or Chicken Drippings`, which survives as `Frying Oil or Chicken Drippings`. This is a demonstrated degraded-legacy risk, not proof of the Pixel record's provenance. |
| Spanish mozzarella range | Portobellos rellenos estilo caprese — `5 a 6 bolitas de mozzarella fresca, rebanadas` | `A 6 Bolitas de Mozzarella Fresca` | Same with authentic legacy. Spanish range parsing leaves the `a 6` tail in the name. |
| Lost parenthetical alternative | Seared Ahi Tuna — `1 Tbsp sesame oil (or olive oil)` | `Sesame Oil` | Same with authentic legacy. Parenthetical cleanup hides the alternative in the main identity even though source text retains it. Do not merge this blindly with plain sesame oil. |
| Lost parenthetical alternative | Vegan Crunchwrap Supreme — `1/2 cup vegan sour cream (or dairy-free yogurt)` | `Vegan Sour Cream` | Same with authentic legacy. Parenthetical alternative is omitted from the label; keep this separate from ordinary sour cream. |

These are the reproducible malformed/semantic-loss cases within the requested
classes. Valid forms and unresolved screenshot prefixes are not classified as
parser errors merely because their labels are long.

## End-to-end trace examples

[Machine-readable evidence](shopping-tlc-evidence.json) records each selected
pipeline as: original recipe ingredient → current preview → complete stored raw
ShoppingItem → preserved source text → page parse/refresh decision → normalized
name → canonical registry match and product identity → merge key → Pantry key →
final label. A null canonical/product match is recorded as null, not guessed.

Representative checkpoints:

- Dolly chicken: source `3 lb bone-in, skin-on chicken pieces` → preview/stored
  `chicken pieces` → preserved full source → page `cleanIngredientName` splits
  at the comma → normalized `bone in` → merge
  `recipe::Other::bone in::lb::` → Pantry `bone in skin on chicken` → `Bone in`.
  Thus a clean preview does not fix this final-page result.
- Degraded Dolly oil: old source is known in the test, but removed from the
  saved row → cached text lacks `reserved` → exact source-line exclusion fails
  → `frying oil or chicken drippings` → Pantry
  `frying oil or chicken dripping` → `Frying Oil or Chicken Drippings`.
- Quiche mozzarella: Spinach Mushroom Feta Crustless Quiche,
  `1/2 cup shredded mozzarella` → stored `shredded mozzarella` → page
  `mozzarella` → `recipe::Dairy / Eggs::mozzarella::cup::` → Pantry
  `mozzarella cheese` → `Mozzarella`.
- Chicken Green Bean Mushroom Bake, `1/2 cup shredded mozzarella cheese` →
  stored `shredded mozzarella cheese` → page `mozzarella cheese` →
  `recipe::Dairy / Eggs::mozzarella cheese::cup::` → the same Pantry
  `mozzarella cheese` → `Mozzarella Cheese`. Same shredded product, same cup unit,
  no package difference, but a different grouping key.

The full 2.5 MB pipeline audit is retained locally at
`/workspace/shared/shopping-tlc/full-pipeline-audit.json`; the smaller repository
candidate evidence file contains the focused source and compatibility traces.
Nothing has been committed.

## Duplicate / near-duplicate audit

| Comparison | Current result | Diagnosis / proposed boundary |
|---|---|---|
| `shredded mozzarella cheese` vs `mozzarella cheese, shredded`, same cup unit | Merge | Correct existing compatibility control |
| `shredded mozzarella` vs `shredded mozzarella cheese`, same cup unit | Separate `Mozzarella` and `Mozzarella Cheese`; identical Pantry key | Proven source-equivalent alias split; candidate for a narrow alias repair only after form guards |
| Fresh mozzarella pearls vs shredded mozzarella cheese | Separate | Preserve pearls as a form |
| Fresh mozzarella cheese vs shredded mozzarella cheese, both cups | Merge | Current meaningful-form loss; synthetic control, not a claim of a matched pair in the photographed week |
| Mozzarella or provolone cheese vs plain mozzarella cheese | Merge; combined Pantry key becomes empty | Synthetic alternative-loss control; do not broaden alias merging across choices |
| Ordinary sour cream in cup/Tbsp | One check-item | Existing explicit single-dairy policy; no new quantitative conversion was introduced |
| Sour cream vs vegan sour cream vs sour cream/Greek-yogurt alternative | Distinct identities | Preserve type and alternatives |
| Chicken breast vs thigh vs generic chicken | Separate in measured controls | Preserve cut distinctions; never fix `Chicken Pieces` by assuming breast |
| Toasted sesame oil vs sesame oil | Separate | Preserve flavor/form distinction |
| 15 oz vs 28 oz cans of black beans | Separate | Correct package distinction |
| Cup vs oz chicken broth | Separate | Do not assume weight oz means fluid oz or guess a conversion |

Six duplicate-label groups were found within individual catalog recipes: sesame
oil with different tsp/Tbsp requirements in Seared Ahi Tuna, Vegetable Lo Mein,
Vegetable Fried Rice and their applicable Spanish versions, plus Swiss Cheese
in Mushroom Swiss Sliders (`1/2 cup shredded Swiss cheese` versus `12 slices
Swiss cheese`). These are not automatic merge candidates. Known volume
conversions could be evaluated separately with source-choice guards; cheese
slices and shredded volume are not interchangeable requirements.

Spanish checks also expose alias/form gaps: Pasta caprese uses
`1/2 cup de perlas de mozzarella`, yielding `Perlas de Mozzarella` with Pantry key
`de perla de mozzarella`, while English `1/2 cup mozzarella pearls` yields
`Mozzarella Pearls` / `mozzarella pearl`. Preserve the pearls form when considering
a bilingual alias; do not map it to generic shredded mozzarella.

## Manual-entry protection finding

Clean manually entered rows bypass recipe reparsing and their stored values were
not modified by the diagnostic. However, the actual current pencil-edit handler
spreads the old recipe record and does not clear `grocerySearchName`, cached
`displayText`, or `recipeIngredientText` when setting `sourceRecipe: ""`.

Replaying exactly that saved-object shape for an edit from Classic Meatloaf's
`2 cloves garlic, minced` to `8 flour tortillas` yields final label `Garlic` and
Pantry key `garlic`: the manual path prioritizes the stale grocery-search name,
and the final Pantry-key path still reads the obsolete recipe ingredient.
This was a real final-callback test of the handler's object shape, not a claim
that a physical edit was clicked on the Pixel.

This is directly relevant stale-identity behavior, **separate from the already
known manual quantity omission**. A refresh that simply rewrites all records
would not safely solve it.

## Proposed fixes, in safe order

1. **Protect explicit manual edits.** On pencil save, clear recipe-derived
   `recipeIngredientText`, `grocerySearchName` and cached display fields as the
   row becomes manual. For existing edited records, make user-entered text the
   authority when `sourceRecipe` is empty and obsolete recipe provenance remains;
   do not let that old source create a Pantry key. Preserve intentional Smart
   Shopping approvals where provenance proves they were approved. Do not rewrite
   manual raw text, quantity, checked/restock state, or arbitrary manual history.
2. **Keep the existing intact-source projection.** No blanket storage migration
   is needed for intact recipe rows. Correct the actual final-page parser and
   grouping defects so both fresh and legacy source-bearing rows benefit.
   For chicken, port the preview's narrow descriptor-comma protection into page
   reparsing rather than wholesale name simplification. Preserve cut, bone/skin
   form, unit, package and original ingredient text.
3. **Handle demonstrated missing-source legacy cases narrowly.** Prefer
   read-time recovery over destructive cleanup. For the known old Dolly row,
   require the exact built-in source recipe identity and the old generated ID's
   complete normalized `1-4-cup-reserved-frying-oil-or-chicken-drippings` fingerprint
   before recovering its original line for the existing exclusion. The captured
   old row contains that fingerprint. Do not match only `frying oil`, category,
   or truncated text. Unproven source-less rows should be retained for review,
   not attributed to Dolly or rewritten. Never apply this to manual rows.
4. **Add form/choice guards before alias merging.** Derive meaningful form and
   alternative information from preserved source before prep/parenthesis cleanup.
   Then repair only proven aliases such as the two explicitly shredded mozzarella
   spellings with matching units/packages. Do not use Pantry-key equality alone
   as semantic/form proof. Keep unknown forms, fresh forms, pearls, blocks,
   slices, alternatives, toasted oil and cuts distinct.
5. **Targeted language cleanup.** Test and repair the exact Spanish range shape
   `5 a 6 ...`; add only form-preserving bilingual aliases supported by catalog
   occurrences. Preserve Spanish alternatives, not an arbitrary preferred choice.
6. **Leave unknown prefixes unresolved.** No built-in `Very Flour Tortillas` or
   shaved-Parmesan source was found. A narrowly scoped leading `very large`
   cleanup could be considered if an actual imported source confirms it; do not
   delete `very` globally or strip shaved cheese forms to reduce row count.
7. **Apply presentation cleanup only after the layout proposal is accepted.**
   Keep identity/grouping/Pantry logic independent of row layout.

## Mobile row proposal and measured evidence

At **412 CSS px**, a valid `Sour Cream or Greek Yogurt` stress row with
`(2 recipes)`, `Have some`, thumbnail, edit and delete leaves only **11.83 px**
for the item-name span. The screenshot shows `S.` despite a full 224px text width.
There is no horizontal document overflow: the name itself is squeezed out.

A temporary, clearly labeled DOM-only layout experiment moved metadata below
the name and replaced the two action slots with one 44px overflow slot. It gave
the name **193 px**, displaying the full phrase on two lines. At 320px it gave
approximately **124 px**, with no document overflow. This was not a production
component implementation and is not an accessibility or interaction sign-off.

Preferred design:

- Item name occupies primary width and may wrap to two lines.
- Recipe count and Pantry/restock status appear in a wrapping secondary line.
- Keep the existing source-details interaction and full accessible item name.
- Retain a 32px thumbnail and a clear purchase/check target.
- Move Edit/Delete into one 44px labeled More actions control; alternatively,
  expose them on a lower-priority footer line at the cost of taller rows.
- Use a portal/popover or existing bottom-sheet pattern outside clipped row
  containers. Stop menu and metadata clicks from bubbling into purchase/check;
  preserve keyboard focus, Escape, and focus return. The quick DOM prototype
  exposed bubbling/clipping risks, so it must not be shipped as implementation.

The review-only proposal at
`/workspace/shared/shopping-tlc/shopping-row-proposal.html` presents both More
actions and Actions below alternatives. It changes no app code. Captures in the
same folder include `current-measured-412.png`, `proposed-measured-412.png`,
`proposed-320.png`, `proposal-preview.png` and `proposal-menu-preview.png`.

## Validation

| Check | Result |
|---|---|
| New full-pipeline diagnostic | Passed immutability/parity assertions; records the existing defects above rather than claiming they are fixed |
| Existing real-page regression vs pre-49 page | Passed; 7,277 source occurrences, 142 PR #49 label corrections, two exclusions |
| Fresh generated-week test | Production generator/addition path; captured 70 raw → 47 rendered rows |
| Authentic legacy generated-week test | Old generator: 71 raw → same 47 rows in current page |
| Pantry/Already in Pantry parity | Fresh/old key and coverage controls match for English/Spanish garlic; covered/partial/none and jar incompatibility tested; manual-edit failure reported separately |
| Manual-entry protection | Raw objects/storage immutable; clean manual control protected; edited-recipe stale metadata control exposes existing failure |
| Unit/package/form controls | Run against actual grouping path; correct separations and existing false merge/split cases recorded above |
| English/Spanish | Both source catalogs plus en/es display-locale × English/Spanish Dolly-source permutations; intact-source outcomes agree; range/form-alias gaps remain |
| `npm run build` | Passed; existing large-chunk warning |
| `npm run lint` | Passed twice after adding diagnostic artifacts: 0 errors, seven existing warnings (configured TS/TSX scope); Node diagnostic executed successfully |
| Shopping regressions | Ingredient headings, Little Chefs, apple varieties, Spanish grocery/aliases, countable requirements, requirement summaries and local sync tests passed |
| Pantry regressions | `pantry-recipe-regression-test.cjs`, `pantry-mobile-regression-test.cjs`, `grocery-pantry-tomato-test.cjs` passed |
| Smart Week regressions | Existing Pantry/Smart Week regression passed locked planned/leftovers/freezer-night preservation and inventory/storage immutability; fresh production week generation also passed |
| `npm run validate:recipes` | Passed |
| `npm run audit:shopping` | Passed diagnostic audit |
| `npm run test:plus` | Passed |
| Browser | Actual current-main app, 412px fresh/authentic legacy/degraded controls; layout proposal at 412/320px; zero captured runtime errors in these scenarios |

Three unrelated failures reproduce with identical errors using a clean
**current-main `56581e6`** source/scripts checkout and the same installed runtime:

- `grocery-delivery-provider-test.cjs:37`: `1 !== 0`.
- `grocery-handoff-selection-test.cjs:148`: `4 !== 5`.
- `instacart-shopping-list-test.cjs:19`: unexpected dependency
  `./groceryRetailerMatch.js`.

Logs are in `/tmp/shopping-tlc/logs/`. No new physical Pixel/device testing was
performed. The browser uses representative CSS widths, not the user's physical
font scale, OS settings or exact Pixel model.

## Files that would change for implementation

- `src/pages/ShoppingListPage.tsx`: manual provenance handling, narrow page parse
  correction, form/choice-aware grouping guards and accepted row layout.
- `src/shoppingList.ts`: only if a shared source-resolution helper or guarded
  legacy recovery is introduced; preserve raw/manual storage semantics.
- Potential small pure helper such as `src/core/shoppingRecipeIdentity.ts`:
  provenance/form/choice classification shared by parser and final page.
- `src/core/spanishIngredients.ts` or `src/core/ingredientParser.ts`: only for
  evidenced Spanish range/form aliases after targeted tests.
- `scripts/shopping-page-grouping-regression-test.cjs` and new focused fixtures:
  source-bearing, source-less, edited-manual, form/choice and layout coverage.
- Review/evidence documents.

No Supabase schema, service, sync transport, version or native configuration
changes are proposed. Layout can be a separate small follow-up from identity
repairs to make its behavior reviewable independently.

## Regression coverage needed before fixes are accepted

- New/old Dolly rows with source; exact ID-gated lost-source recovery; different
  recipe/title, nonmatching ID and arbitrary/manual oil must remain untouched.
- Poisoned cached name, display, quantity and unit with intact original source.
- Manual pencil edit from recipe to a different product, including Pantry
  mismatch and retained obsolete metadata; intentional Smart Shopping approval
  and clean manual entries must retain their intended semantics.
- Fresh/legacy descriptor-comma chicken inputs; counts/weights/packages,
  breast/thigh/generic/pieces forms and alternatives must not collapse.
- Shredded mozzarella alias pair, fresh vs shredded, pearls/balls/cubes/slices,
  English/Spanish forms, same/different packages and units, all choices.
- Spanish `a` ranges and en/es locale parity without choosing alternatives.
- Existing Pantry selectors: none/partial/covered, checked, restock, Buy anyway,
  source keys and quantity compatibility. Layout-only changes must be identical.
- Rendered layout at 320/360/393/412/430px, enlarged font, pictures on/off, long
  Spanish names, multiple metadata badges and large recipe counts; no overlap.
- More actions/menu: no accidental checking, no clipping near viewport edges,
  keyboard/assistive labels, Escape/focus return, and Edit/Delete/source actions.
- Re-run build/lint, Shopping/Pantry/Smart Week/Plus and recipe validations;
  compare unrelated failures against clean main again if implementation changes.

## Scope intentionally left unchanged

No automatic manual quantity fix, broad 320px redesign, blanket `reserved` filter,
recipe-data rewrite, guessed Pixel attribution, broad canonical merge or storage
migration was implemented. The known `Bone in` artifact was traced because it
is directly related to the requested Chicken Pieces class, but remains unfixed.
The state/source boundary and form/choice risks warrant review before coding.

Actual new repository files in this diagnostic are only:

- `scripts/shopping-tlc-diagnostic.cjs`
- `docs/shopping-tlc-evidence.json`
- `docs/shopping-tlc-diagnosis.md`

Temporary browser fixtures were archived outside the repository and removed.
No commit, push, merge, deployment, Supabase/service change or version bump.
