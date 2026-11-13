# Deals purchase foundation (Phase 1)

This domain is not wired into the app. It has no UI, persistence, provider,
network, pricing, entitlement, or database behavior.

`buildShoppingPurchaseSnapshot` accepts raw saved ShoppingItems, the existing
ShoppingListPage combined rows (including sourceIds and calculated Pantry
coverage), and its Buy Anyway IDs. It delegates selection to
`buildGroceryHandoffFromShopping` and grouping/review to
`summarizeGroceryRequirements`.

The caller must supply the page's existing decisions. In particular, the page
already expresses forceBuy as uncovered Pantry coverage; the adapter does not
reinterpret or override contradictory coverage. Restock priority, checked-item
exclusions, partial-Pantry holds, missing/duplicate-source holds, and ambiguous
choices retain the handoff's behavior.

Measured groups become ShoppingNeeds with all contributing raw sourceIds and
handoff lines. Search-only items retain null requirement quantities; reviews
retain their source amounts and reason. Holds remain separate and retain their
sourceIds. The snapshot also preserves every raw row and combined row, including
excluded/held rows. Original saved text is retained in rawItems; handoff wording,
search terms, recipe provenance, choice options and individual amounts remain in
need.lines. Nothing writes back to ShoppingItem.

Canonical identity is optional and independent of requirement readiness.
`deriveIngredientIdentity` requires agreement among exact registry lookups for
shopping/search names and parsed original product wording. It also checks saved
text when recipe wording is absent. It does not remove unrecognized product
constraints or use fuzzy matching. Unknown modifiers can therefore withhold an
otherwise plausible identity; this is intentional. No registry quantity or
package defaults are copied. A measured need is not a verified product match.

Inputs are cloned, then outputs are recursively frozen and typed deeply readonly.
The versioned signature is deterministic for the supplied ordered rows, sorted
Buy Anyway set, and derived handoff/identity results. Object key insertion order
is ignored; array order is retained because handoff ordering affects duplicate
selection. Rebuild from current inputs and compare signature/version to detect
staleness. Need IDs are snapshot-local and must not be persisted as shopping IDs.

The signature is a local serialized equality token containing source data, not a
hash or anonymization boundary. Do not put it in URLs, logs, analytics, or provider
requests. It is not a durable cross-version interchange format. Future semantic
changes must bump the relevant version.

Run focused tests from the repo root:

```sh
node scripts/deals-foundation-test.cjs
```

The test loads real TypeScript modules and exercises generated recipe, side and
restock rows using in-memory storage, without calling providers or cloud services.
