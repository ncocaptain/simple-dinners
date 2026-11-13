# Deals domain (Phases 1–4)

The purchase and comparison foundations have no persistence, provider networking,
entitlement, or database behavior. Phase 3 adds an isolated development-only UI.

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


## Comparison math (Phase 2)

`packageComparability.ts` normalizes supported US customary and metric measures
into grams, millilitres, or each. Mass ounces and fluid ounces remain separate.
Exact US factors are used before reusing `solveRetailerPackageCandidate` with
base units, avoiding its rounded conversion constants. Existing fulfillment code
is unchanged. `assessRetailerRequirement` identifies container requirements;
only an explicit simple size such as `15 oz` can supply their contents. Unknown
containers, yields, density and count-to-weight conversions remain unsupported.
The solver's existing absolute 1e-9 base-unit ceiling tolerance is retained.

Single packs require a known size; multipacks require both a positive integer
pack count and known inner contents. Net, drained and count bases must agree.
Package comparisons also require the same nonempty product-form equivalence key.
This key and `compatibility: verified` are caller-supplied evidence against the
ShoppingNeed's original constraints, not conclusions of this math layer or of a
registry hit. Future callers must establish that evidence before making claims.

`savings.ts` takes explicit clock, store, retailer, channel and currency context.
Money is nonnegative integer minor units, with safe-integer overflow checks.
Null prices stay absent; a real zero price is supported. Regular and sale prices
are fields of one observation sharing product, store, channel and selling basis;
they must not be assembled from unrelated quotes. A missing regular price cannot
establish sale savings. An equal/higher sale price falls back to regular pricing
and produces no positive sale savings.

Unresolved/ineligible membership or coupons and unsupported promotions suppress
an observation, rather than quietly assuming eligibility. The one supported
promotion is an explicitly stated per-package sale price with an integer minimum
package count. It is NOT a bundle price, BOGO, tiered price, or coupon stack.
Requirement cost compares the minimum covering count at its eligible price with
the known sale-threshold count and picks the lower cost; ties prefer fewer packs.
`minimumPackagesNeeded`, `packagesNeeded`, `promotionExtraPackages`, and excess
contents make any cheaper promotion-driven overbuy explicit. No list is edited.

Best-price output separates observed package price, comparable unit price, and
requirement-covering purchase cost. Unit prices retain integer money per known
measure as a rational rate, without rounding before ranking. Observed package
and unit prices use the offer eligible for one pack; quantity-conditioned offers
may therefore win requirement cost without winning either of those comparisons.
Measured cross-dimension offers cannot win. Unquantified needs can still have
observed prices but cannot produce requirement costs. Mixed weight/volume unit
rates have no unit-price winner. Unknown fixed-package sizes cannot win price
comparisons. Variable-weight products support a known price/weight rate, but no
package price or requirement total without actual package-weight evidence.

`basketComparison.ts` compares an explicit common set of targets. Pass unresolved
snapshot holds explicitly as unique heldNeedIds, e.g. `hold:rowId`; omitting them
would incorrectly narrow the requested basket. Review/unquantified/unpriced needs
and holds remain missing items. Every selected store must have a complete basket
before a cheapest-store claim is returned. Empty, duplicate or mixed-channel
basket scopes are invalid. Ties are retained. Totals are merchandise subtotals:
tax, travel and unknown fees are neither inferred nor represented as all-in cost.
Availability must be in-stock, quotes current, and context applicable. An entirely
unpriced subtotal is null; a legitimately free complete basket may total zero.

Static scenarios, including three different best-price winners, can be run with:

```sh
node scripts/deals-comparison-test.cjs
```

The synthetic fixtures live in `scripts/fixtures/deals-comparison.cjs`. They use
Phase 1 snapshots and real fulfillment helpers without any provider calls.


## Development-only workspace (Phase 3)

In `import.meta.env.DEV` only, the Shopping List header offers Find Deals. The
independent `/shopping-deals` route uses normal onboarding, with no Plus/Kroger
gate. Production builds omit the entry and redirect that route to Shopping List.
The existing grocery-preview route and Walmart/Kroger handoffs are unchanged.

The entry calls `createDealsRouteSnapshot` with the page's existing raw rows,
combined rows, coverage and Buy Anyway IDs. This delegates to Phase 1 and sends
only needs, named holds and exclusion counts through router navigation state.
Raw rows and the signature are omitted. Direct navigation without that payload
shows a return-to-list prompt; it does not reconstruct Pantry eligibility or
read a saved deals session. Router history carries navigation state, with no new
localStorage/sessionStorage writes, cache, background refresh or persistence API.

`fixturePreview.ts` contains explicit synthetic specifications for a small catalog
(chicken breast, rice, milk, black beans and eggs) at two sample stores. Missing
catalog coverage stays unmatched. Only strict, matched canonical identities can
receive fixture candidates; ambiguous choices remain unresolved. Product sizes
are explicit sample specifications, never registry-derived package assumptions.
All comparisons and basket winners come from Phase 2. Sample prices use a fixed
synthetic clock; the scenario selector can expire them or make them inapplicable.
These prices are not assertions about actual stores, availability or current costs.

Accept/reject choices live in React component state and reset when the workspace
is remounted. Reject removes eligibility for comparisons; accept can confirm a
compatible sample candidate, but does not supply unknown contents, a missing
quantity, or valid price evidence. A mismatched product form cannot be accepted.
No choice writes to the list, Pantry, registry, cloud or retailer. Reopen from the
Shopping List to take another snapshot; live invalidation belongs to Phase 4.
The Shopping List's existing transient state follows its normal route-unmount
lifecycle, while saved rows, checked state, amounts and Pantry data are untouched.

The responsive UI has English/Spanish copy, two-column store cards on desktop,
one column on phones, native details/summary controls, labeled buttons and visible
keyboard focus. Measurements and package calculations stay within Deals details.
Merchandise subtotals show priced counts/missing needs and never imply tax, fees,
travel or checkout totals. Unresolved holds participate in basket completeness.

```sh
node scripts/deals-ui-test.cjs
```

These tests render the actual React page and exercise fixture calculations,
review decisions and navigation payloads without a browser or network service.


## Provider/session foundation (Phase 4)

The visible Phase 3 workspace is intentionally unchanged. Its fixed, development-
only fixtures remain separate from this reusable orchestration layer so lifecycle
work cannot change the validated preview UX or existing fulfillment paths. Nothing
in application code registers or calls the new fake provider or hook.

`provider.ts` defines an injected retailer-neutral interface, six explicit
capabilities, normalized store/search/price requests and results, per-item failures,
source scope, pricing audience (public/personalized/unknown), attribution,
pagination cursor and retry metadata. No provider SDK,
credentials or transport is included. `providerRegistry.ts` accepts explicit
instances; there is no automatic live registration. Failure codes are unsupported,
unauthorized, unavailable, rate-limited, invalid-request, malformed-response and
cancelled. Future transports must normalize their responses to these contracts.

Runtime Zod validation strips unknown fields before provider values reach results
or the cache. Invalid envelopes are rejected; invalid individual records become
failures while valid siblings may continue. Store-local quote scope, selected
retailer/store/channel, currency, product IDs and validity windows are checked.
Catalog-only discovery is usable descriptive metadata, but catalog prices cannot
substantiate a local basket. Unsupported providers fail without being called.
Pagination metadata is exposed and partial pages are marked partial; this phase
does not automatically walk pages or claim a market-wide optimum.

`DealsCoordinator.run` takes the immutable Phase 1 snapshot, selected provider/store
contexts, explicit Phase 2 comparison basis and cache privacy context. Comparison
basis is never inferred from registry package defaults or supplied by a provider.
Only canonical identities already marked matched and requirements not held for
review enter provider discovery. Held/unresolved/unquantified needs remain in
basket completeness as appropriate. Providers see opaque query IDs, search terms,
canonical identity, original product constraints and requested store/channel—not
raw shopping rows, source IDs, recipe titles, or the private snapshot signature.

The default concurrency bound is three jobs (overrideable from 1–20). Each job
searches one need at a store and retrieves prices in bounded batches. This does
not require a provider to support batch search. Partial progress can be observed.
No new winner/savings math exists here: all comparisons and basket winners still
come from the Phase 2 functions. Source attribution and sanitized errors are
retained. Accept/reject choices are local and cannot override hard mismatches,
unknown package contents, stale/inapplicable prices or quantity uncertainty.

Cancellation races the transport promise with AbortSignal. Superseding runs abort
old work and increment a generation; late responses cannot publish or populate the
cache. Non-cooperative transports may physically finish after cancellation, but
their results are discarded. The concurrency bound applies to current jobs; a
transport must honor cancellation to stop its underlying activity. Rate-limit
retry windows are retained and respected on subsequent explicit requests; there
are no automatic retries, background refresh, polling or notification tasks.

`session.ts` provides a framework-independent state model. `useDealsSession.ts`
subscribes through React's useSyncExternalStore. Input identity covers snapshot
version/signature, provider/store/channel/currency, eligibility, comparison basis
and privacy context. Changed inputs cancel pending work, clear comparisons and
reset decisions. The hook masks results from old inputs immediately, before its
effect performs cancellation. Unmount cancels work. Privacy-owner changes also
clear the local cache. Each session requires its own coordinator instance.

Nothing fetches on hook mount or input change. Call `refresh(false)` explicitly to
allow cache reuse; `refresh()` bypasses cache but still respects retry windows.
Loading, refresh, partial/error, cancelled and stale states are exposed. Expiry is
checked on session reads/renders, not by a background timer. Once expired, the
stored result and its winner claims are removed; freshness is also rechecked at
every comparison and cache read. Future UI consumers must read current state before
using a result, rather than retaining an old result object indefinitely. Snapshot
and input equality tokens are private local data and must never enter logs,
analytics, URLs, provider payloads or shared/external cache keys.

### Local cache

`cache.ts` uses only an injectable synchronous storage interface and an in-memory
implementation (256 entries by default, FIFO eviction, overrideable). No browser,
cloud or database persistence is added. Storage failures degrade to misses/fresh
work, and clear() is safe even when storage is unavailable. Cache values are
validated normalized records, copied on read/write; arbitrary provider payloads
and credentials are not stored.

Keys include kind, provider/environment, retailer/store/channel, currency, search
and product constraints, requested products, pagination/store-discovery query,
eligibility, personalization and privacy owner. The raw snapshot signature is not
accepted as a cache key. These are local keys that may contain shopping/location
text; do not export or log them. Store-directory entries require postal-code query
context. Personalized, unknown-audience, coupon and loyalty prices cannot enter public
entries (including prices with no explicit membership condition), and
private entries require an owner key and are isolated by owner and eligibility.

Initial maximum-age defaults (overrideable for stricter provider terms):

| Kind | Default |
| --- | --- |
| Store directory | 7 days |
| Product metadata | 24 hours |
| Price observations | 1 hour |
| Availability | 5 minutes |
| Negative search | 5 minutes |

Every entry is also capped by source expiry and observation age. Stricter policies
are rechecked on cache reads, including entries written under an older policy. Current comparisons require both a
fresh price and fresh availability record. Cached hits never renew their TTL.
Session result expiry is capped by product metadata, quotes, configured maximum
ages and remaining availability freshness. Zero TTL disables storage without
inventing a new quote-validity window. Failed/partial searches are not treated as definitive negative results.
Explicit refresh bypasses both positive and negative caches. This is not a remote
cache design or approval to retain a future provider's data under these defaults.

### Deterministic verification

`testing/fakeProvider.ts` is explicitly test/development-only and is not imported
by the application. It supports successful/empty/partial results, rate limits,
unavailability, malformed envelopes, store/channel mismatch, cancellation and
manually gated delayed/non-cooperative replies. Tests supply fake clocks and
manual gates instead of waiting on real timers. No request performs networking.

```sh
node scripts/deals-session-test.cjs
```

Tests exercise the real snapshot builder, comparison engine, cache, coordinator,
session and React hook. Phase 1–3 contracts and all existing UI remain unchanged.
Before a real provider or UI is connected, review licensing/retention overrides,
product-constraint verification, eligibility/owner identity, timeout handling in
the eventual transport, and localization of future provider/error presentation.
