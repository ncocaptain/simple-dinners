# Deals domain (Phases 1–5E)

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

## Owned Price Network foundation (Phase 5A)

`providers/simpleDinnersPriceProvider.ts` is an opt-in, read-only Phase 4 adapter.
Inject the existing `src/lib/supabase.ts` publishable-key client into
`createSimpleDinnersPriceProvider`, explicitly register it in
`DealsProviderRegistry`, and run it through `DealsCoordinator`. Nothing registers
it in the application or exposes it through the Phase 3 preview. The preview is
unchanged so development does not depend on applying a production migration.
No UI imports database row shapes.

The owned Price Network is intentionally designed to operate inside the existing
Simple Dinners Supabase subscription, with no new paid external provider or new
recurring service. It introduces no scraping, retailer API, bucket, image/raw
receipt storage, schedule, Edge Function, or duplicate Shopping List snapshot.
This is a bounded initial design, not a promise of free operation forever;
retained history, reads and egress must be monitored before scaling coverage.

The repository migration is
`supabase/migrations/20261114143631_deals_owned_price_network.sql`.
It proposes three shared curated tables: `price_network_stores`,
`price_network_products`, and append-only `price_network_observations`.
Products reuse existing registry IDs and Deals package/form concepts; there is
no new ingredient registry. A product ID identifies one immutable package/form
specification, including brand/GTIN when known. Create a new product ID for
corrections or size/form changes. Store timestamps update through a small invoker
trigger. Observation timestamps record source observation time separately from
insertion time; history cannot be updated/deleted through ordinary DML, even by
an administrator. Future administrative correction/retention work needs an
explicit reviewed procedure. No contributor identity or private receipt data
belongs in these public tables.

The three extra indexes are canonical ingredient lookup, store/product/currency/
channel/newest observation lookup (also handles several product IDs), and the
product foreign key/reverse ingredient-to-observation path. UUID primary-key
indexes are automatic. FKs restrict deletes. Checks reject negative/unsafe money,
invalid timestamp ranges, invalid source/basis/channel/currency values, nonfinite
package sizes, and inconsistent selling/package fields. Both prices may be null;
a genuine zero price remains distinct. Conditions are bounded JSON (4 KiB), with
only Phase 2's allowlisted condition shapes accepted by the adapter. Never put
raw feed payloads in this field. There are no views or privileged RPCs.

All tables enable RLS. Explicit revokes remove inherited public/anon/authenticated
table grants; clients receive SELECT only, with no write policies. Active stores,
products, and observations at active stores are shared catalog reads for both
anon and authenticated roles. This is intentionally public grocery data rather
than household-owned data. Trigger functions use invoker security, an empty
search path, and revoked public execution. Future sources are enum-like text
values only: manual, receipt-confirmed, user-contributed, approved-feed. This phase
implements no ingestion, receipt scanning or contribution endpoint. Only reviewed
administrator SQL may eventually populate the tables.

Matching requires a canonical ID and exact grocery search wording. Each original
constraint is parsed with the existing ingredient parser; its retained product
wording must exactly match the curated search name, and the curated form must be
verified. Otherwise candidates remain unverified; name mismatches yield no result.
The coordinator independently checks the explicit form key and requirement basis.
Phase 2 enforces dimensions and package coverage: no fresh/canned, raw/cooked,
bone-in/boneless, net/drained, mass/volume or count/weight equivalence is inferred.
The retailer context identifier in v1 is the exact curated retailer name; store
identifiers are stable UUIDs. There is no retailer discovery UI in this phase.

Price reads isolate product/store/channel/currency and choose the newest valid
observation, deterministically breaking timestamp ties by UUID. Future, expired
and older-than-24-hour observations are excluded, including observations without
an explicit expiry. Expired sales fall back to regular prices from the same row;
active sale expiry also bounds cache lifetime. Missing latest prices do not revive
an older known price. Latest unverified or malformed evidence fails closed.
Availability and offer eligibility still pass through Phase 2. Source type,
confidence and observation timestamp are retained in Phase 4 attribution, while
price timestamps remain explicit. There is no background refresh.

Reads are bounded to 20 queries/products per request and 100 rows per lookup.
A lookup hitting its row cap reports unavailable and contributes no invented
coverage. One indexed history request per product prevents global-limit starvation;
partial results remain partial baskets, and Phase 2 alone determines winners.
Only canonical IDs, product IDs and store/currency/channel/time filters are sent
to Supabase. Search wording and original constraints are evaluated locally;
request IDs, eligibility keys and snapshot signatures are never queried or stored.

No safe seed mechanism exists in this repository, so no database seed was added.
Fictional in-memory fixtures in `scripts/deals-price-network-test.cjs` cover regular,
sale, multi-store, package sizes, stale/missing/unverified data, and partial/complete
baskets. Run that test alongside the four existing Deals test scripts. The SQL
assertions in `supabase/tests/deals_price_network.sql` run inside a rolled-back
transaction against a disposable local Postgres database with `anon` and
`authenticated` roles, after applying the proposal locally. They verify actual
RLS visibility, grants, constraints, immutable package specs and retained history.
Do not run this test or apply this migration against production.

Storage grows linearly with observations. Typical rows should occupy a few hundred
bytes plus three B-tree entries (primary key and two secondary indexes), usually
well under 1 KiB per observation for empty/small conditions. A rough planning
range is 40–100 MiB for 100,000 typical observations including indexes; this is
an estimate, not a measured quota guarantee. Conditions may add up to 4 KiB per
row. No payload blobs or media are stored, and historical rows are not overwritten.

Before any later production application: review public catalog access, curated
form evidence/registry IDs, freshness policy, GTIN/package specifications, source
provenance, Data API exposure/grants, query plans and expected observation volume.
Verify the real Supabase/PostgREST read path in a local or separately authorized
environment; this phase validates Postgres plus injected transport independently.
No migration was applied to the existing Supabase project.

Rollback/reversal (review separately; never run automatically): first remove any
future adapter registration, export history if it must be retained, then drop
`public.price_network_observations`, `public.price_network_products`, and
`public.price_network_stores` in that order. Drop the three no-argument functions
`public.price_network_preserve_history`, `public.price_network_guard_product`,
and `public.price_network_touch_store`. Table drops remove their indexes, RLS
policies and triggers. Use a new reversal migration after review rather than
editing an already applied migration. This removes all Price Network records;
existing household, Pantry and retailer tables are unaffected.

### Phase 5A validation record

Validated against main `6cff52f` on November 14, 2026:

- `npm install`, `npm run build`, `npm run lint`, `npm run validate:recipes`,
  `npm run audit:shopping`, and `npm run test:plus` passed. Lint retains the seven
  documented hook warnings and zero errors; the build reports its existing large
  chunk advisory. Generated image and dependency-lock output left no changes.
- Phase 1 foundation, Phase 2 (26 scenarios), Phase 3 (13 scenarios), Phase 4
  (34 scenarios), and the new Price Network (13 grouped scenarios) passed.
- Disposable Postgres 17 migration application and
  `supabase/tests/deals_price_network.sql` passed. Test rows were rolled back.
  No remote Supabase command or production migration application was performed.
- Shopping realtime/household sync, Pantry tomato, apple variety, countable and
  search-only requirements, requirement summary, retailer match, package solver,
  delivery parser, Kroger cart plan/server security, Shopping List ingredient
  headers, and Little Chefs shopping tests passed. Phase 3 also verifies the
  unchanged Walmart search handoff.
- Five existing scripts failed identically on an untouched detached checkout of
  current main: `grocery-delivery-provider-test.cjs` (1 vs 0),
  `grocery-handoff-selection-test.cjs` (4 vs 5),
  `instacart-shopping-list-test.cjs` (test loader rejects groceryRetailerMatch.js),
  `kroger-catalog-test.cjs` (unexpected packageCount: 1), and
  `kroger-release-regression-test.cjs` (production feature-flag assertion).
  `kroger-package-match-smoke-test.mjs` also fails identically because Kroger
  credentials are unavailable. These unrelated tests/code were not changed.

Live PostgREST/Supabase reads, production query plans, real retailer handoffs,
native devices and receipt contribution were not exercised. No app/store version,
environment values, keys, native project or production UI was changed. No push,
merge, deployment or publication occurred. Production application and Phase 5B
remain separate future work.

## Development Price Network integration (Phase 5B)

The development-only `/shopping-deals` workspace now defaults to **Synthetic
Preview** and offers **Simple Dinners Price Network** as a separate mode. Fixture
behavior and its fixed clock are unchanged. Switching modes unmounts the previous
workspace, cancels in-flight work, and discards its session; Price Network never
fills gaps with sample prices. English and Spanish strings have matching keys.
No Shopping List, Pantry, retailer handoff, entitlement, or native behavior changes.

`ShoppingDealsPage.tsx` gates its lazy Price Network import with
`import.meta.env.DEV` and independently redirects in production. The existing
App route and Find Deals entry guards remain intact. The existing
`src/lib/supabase.ts` publishable-key client is imported only within the lazy
workspace. No credentials or environment values were added. No provider is
instantiated on the production preview route or in fixture mode.

`priceNetworkPreview.ts` loads only active readable stores with an explicit
SELECT, active filter, runtime validation and a 100-store ceiling (a 101st row
reports unavailable instead of silently hiding coverage). Store labels include
retailer, store name/number and city/state when present. Users select one or more
stores; price comparisons run only on **Compare recent observations**. An empty
catalog says “No Price Network stores have been added yet.” Store-loading errors
and an unconfigured client have separate messages and no synthetic fallback.
There is no geolocation, store mutation or admin interface.

The navigation-safe Phase 1 projection is retained: raw rows and the original
private signature never enter router history. `priceNetworkSessionInput` supplies
that projection's existing needs, holds and exclusion counts to Phase 4, with
empty unused raw-source collections and a deterministic, local-only projection
equality token. It does not rebuild Shopping List eligibility or Pantry coverage.
Neither equality token, recipe wording nor snapshot data is sent in Supabase
queries. The existing provider continues to send only canonical/product IDs and
store/channel/currency/time filters. The preview uses USD and in-store context.

The connected workspace creates an explicit provider registry and coordinator,
then uses `useDealsSession`/`DealsSession` for input invalidation, refresh,
cancellation and current results. Only the provider reads observation rows; the
UI consumes normalized offers, issues, comparisons and baskets. All price and
basket eligibility decisions come from Phase 2 through the coordinator.

Phase 4 requires explicit comparison form/basis evidence. This preview therefore
first exposes the returned product form and net/drained/count basis for review.
Select **Confirm product form and content basis** for each applicable need, then
compare again. The selection is an explicit confirmation that those properties
match the ingredient; a canonical ID/name hit is never treated as that evidence.
There is no automatic form/basis inference and no accept override for an
unverified product. Unknown dimensions, unquantified requirements and incompatible
forms still cannot produce basket totals. Confirmation is session-local, survives
store selection changes, and is discarded when leaving Price Network mode.

Normalized prices now carry optional allowlisted `sourceType` provenance through
the existing price schema. Optional `ProviderFailure.reason` distinguishes
`no-observation` and `stale-observation` within the existing unavailable failure
code; old providers/contracts remain compatible. If the normal recent-history
read returns no rows, the provider performs one additional indexed, context-
scoped SELECT of only the newest observation timestamp. This distinguishes old
history from absent history without fetching stale amounts into current results.
No data-model or schema changes were needed.

Current eligible results use **Recent observed price**, with observed date/time,
source type, store and valid regular/sale fields. Source expiry and the existing
24-hour ceiling still apply; expired sales fall back to regular prices from the
same observation. Missing prices remain null. No products means **No reliable
match**; absent observations, stale observations and other price unavailability
have separate messages. A display-only expiry timer prompts the session to remove
expired results and winners while the page remains open. It performs no network
request or background refresh. Changing stores or comparison evidence immediately
clears results until the next explicit comparison. No complete-basket winner is
shown while any selected store lacks coverage.

The already-applied live schema was not modified or queried during implementation.
There are no new migrations, seed rows, database writes, scheduled work, uploads,
receipt features, paid services or contribution flows. The Phase 5A schema files
are unchanged. Before later use, manually review readable store labels, realistic
form/basis confirmations, existing-client connectivity and empty/populated behavior
in the development route. Real project data and real-device behavior are separate
manual checks; automated tests use mocked Supabase responses only.

Run the new integration scenarios with:

```sh
node scripts/deals-live-preview-test.cjs
```

They exercise the actual page, provider, coordinator and session with mock SELECTs,
including mode isolation, cancellation, back navigation, timer-driven expiry and
complete/partial store baskets. The Phase 3 test loader now substitutes the DEV
constant and locates its existing scenario selector independently of the new
provider selector. No fixture expectations or fulfillment behavior were changed.

### Phase 5B validation record

Validated on November 14, 2026 against current main `75234b7`:

- `npm install`, `npm run build`, `npm run lint`, `npm run validate:recipes`,
  `npm run audit:shopping`, and `npm run test:plus` passed. Lint has zero errors
  and the same seven documented hook warnings. Build retains its large-chunk
  advisory. Generated images and the dependency lockfile have no final changes.
- Phase 1, Phase 2 (26), Phase 3 (13), Phase 4 (34), Phase 5A (13), and the new
  Phase 5B (13 grouped scenarios) passed. Phase 5B drives the real components and
  coordinator/session with mocked Supabase responses. A fake display timer also
  verifies expiry clears prices/winners without new queries.
- The unchanged Phase 5A SQL security/constraint suite also passed after applying
  the existing migration only to a disposable, network-isolated local Postgres 17
  container. Test rows were rolled back and the container was removed. No remote
  Supabase migration or query was run.
- Production JS artifact inspection found no `price_network_stores`,
  `price_network_observations`, provider identity, or Price Network workspace
  chunk. Common translation dictionaries retain the labels; the guarded route
  cannot display or instantiate the feature in production.
- Shopping realtime/household sync, Pantry tomato, apple variety, countable and
  search-only requirements, requirement summary, retailer matching, package
  solver, delivery parser, Kroger cart plan/server security, ingredient headers,
  and Little Chefs shopping tests passed. Phase 3 still verifies Walmart handoff.
- Five unrelated regressions reproduced with identical output and exit status
  in an untouched detached checkout of current main: grocery delivery provider
  (1 vs 0), grocery handoff selection (4 vs 5), Instacart shopping test loader
  (groceryRetailerMatch.js dependency), Kroger catalog (packageCount: 1), and
  Kroger release regression (production feature-flag assertion). The Kroger
  package-match smoke check also fails identically due to missing credentials.
  None of those unrelated files were changed.

Changed files: `src/pages/ShoppingDealsPage.tsx`,
`src/components/deals/PriceNetworkWorkspace.tsx`, `src/deals/priceNetworkPreview.ts`,
`src/deals/providers/simpleDinnersPriceProvider.ts`, `src/deals/provider.ts`,
`src/deals/types.ts`, `src/i18n/en.ts`, `src/i18n/es.ts`,
`scripts/deals-live-preview-test.cjs`, `scripts/deals-ui-test.cjs`, and this README.
The feature branch is `feat/deals-live-price-network-preview`.

Manual review remains: use the development route with the app's existing client,
check empty and populated store labels, confirm product form/content basis before
comparing, inspect observation/source labels and partial baskets, then navigate
back and confirm the Shopping List is unchanged. Automated tests did not access
the live project; browser/device operation against that project remains unverified.
No versions, environment values or secrets changed; no migrations, production
writes, pushes, merges, deployment, publication or receipt/contribution work.

## Session-local store membership (Phase 5C)

Branch: `feat/deals-membership-eligibility`, based on current main `7122a12`.
The development Price Network workspace now shows **Store card / membership** next
to each selected store. Its options are **Yes, I have it**, **No**, and **Not sure**;
the default is always **Not sure** (`unknown`). Selecting a store never implies
membership. This control is absent from Synthetic Preview and all production UI.
English and Spanish translations have matching keys.

`ProviderContext.membershipEligibility` is an optional, retailer-neutral
`eligible | ineligible | unknown` preference. Omission is normalized to unknown.
The preview keeps preferences in React component state keyed by the exact
`[retailer_name, store UUID]` pair. Individual stores have separate preferences,
even when their retailer is the same. A choice persists while toggling that store
within the same workspace, but resets when leaving Price Network mode, navigating
away or recreating the route session. There is no account setting, browser storage,
Supabase persistence, sign-in/linking, card number or retailer credential.

`priceNetworkSessionInput` adds the preference to each explicit selection. Phase
4 session equality already includes selections, so a preference change masks old
results immediately, cancels pending work and resets session decisions. Use
**Compare recent observations** again to obtain the comparison for the new choice.
The coordinator validates the preference, passes it in the neutral provider context
and includes it in cache partitioning. Price Network's database queries remain
unchanged; the preference is not a Supabase query parameter or persisted field.

`membership.ts` implements a pure `resolveMembershipConditions` function. After
validating a provider quote and caching its original normalized observation, the
coordinator creates an offer copy with only membership-condition eligibility
resolved from the current selection. It does this on both fresh and cached paths.
The stored observation owns the fact that membership is required; the session owns
whether this user says they have it. Original rows, cached observations, amounts,
source timestamps and non-membership conditions remain untouched. Existing public
cache restrictions on membership/coupon observations remain in place; private
cached raw observations stay unresolved until the current selection is applied.

An eligible membership allows Phase 2 to consider a conditioned offer, subject to
all its existing protections. Ineligible membership yields `ineligible-condition`;
unknown yields `unresolved-condition`. There is no generic membership override for
coupon eligibility, minimum quantities, unsupported promotions, availability,
freshness, currency, product form, package contents or net/drained/count basis.
The Phase 2 engine itself is unchanged and contains no retailer-specific logic.

A displayed membership-conditioned amount is labeled **With store card**. An
ineligible offer displays **Price unavailable** instead of the card amount. Unknown
eligibility retains the existing unresolved-condition explanation. Unknown regular
prices remain null, sale/card prices are never converted to regular prices, and
no savings are inferred without both valid regular and sale amounts. Partial or
unpriced baskets cannot claim a winner. Expired observations/sales still follow
the provider and session freshness rules. Variable-weight ground beef retains a
known unit rate when available, but unknown package weight cannot produce a
package price, requirement cost or complete basket.

Changed implementation files:

- `src/deals/provider.ts`: neutral eligibility type and optional context field.
- `src/deals/membership.ts`: immutable membership-only condition resolution.
- `src/deals/coordinator.ts`: validation, context propagation and offer-copy resolution.
- `src/deals/cache.ts`: eligibility partition in local cache keys.
- `src/deals/priceNetworkPreview.ts`: explicit retailer/store scope and selections.
- `src/components/deals/PriceNetworkWorkspace.tsx`: compact selected-store controls
  and card-price/unavailable labels.
- `src/i18n/en.ts`, `src/i18n/es.ts`: membership copy.
- `scripts/deals-membership-test.cjs`: new Phase 5C coverage.
- `scripts/fixtures/deals-preview-harness.cjs`, `scripts/deals-live-preview-test.cjs`:
  shared existing mock/React harness; all Phase 5B scenarios remain intact.
- This README: model, propagation, scope, behavior and validation notes.

Run the new scenarios with:

```sh
node scripts/deals-membership-test.cjs
```

The synthetic milk/egg-style observations use card-only 419/199 minor units and
null regular prices to reproduce the reported eligibility case. They are mocked
records, not assertions about current retail prices. Tests cover defaults,
eligible/ineligible/unknown outcomes, effective/package/requirement/basket math,
unknown regular-price savings suppression, source immutability, cache isolation,
retailer/store separation, local session resets, stale/expired/unavailable data,
coupon/quantity/promotion protections, form/package/dimension safeguards,
non-membership prices, unknown-weight beef and production routing isolation.

No live project data was accessed or modified. Existing pilot milk, eggs and beef
observations, their condition records and price values were not changed. There are
no new migrations, schema changes, persistent settings, dependencies, credentials,
paid services, version changes, native changes or receipt/contribution features.

### Phase 5C validation record

Validated on November 14, 2026 against current main `7122a12`:

- `npm install`, `npm run build`, `npm run lint`, `npm run validate:recipes`,
  `npm run audit:shopping`, and `npm run test:plus` passed. A final TypeScript/Vite
  rebuild also passed after narrowing unavailable-label handling to card offers.
  Lint remains at zero errors and seven known hook warnings; the build retains
  its existing large-chunk advisory. No generated images or lockfile changes remain.
- All Deals Phase 1–5B suites and 14 new Phase 5C scenarios passed. The unchanged
  Phase 5A SQL security/constraint suite passed in network-isolated disposable
  Postgres 17 using the repository migration locally only. Test rows were rolled
  back and the container was removed. No live Supabase migration/query was run.
- Shopping realtime/household sync, Pantry tomato, apple variety, countable and
  search-only requirements, requirement summary, retailer matching, package solver,
  delivery parsing, Kroger cart plan/server security, ingredient headers and
  Little Chefs shopping tests passed. Phase 3 continues to verify Walmart handoff.
- Five unrelated regressions reproduced with identical output/exit status on an
  untouched detached checkout of current main: grocery delivery provider (1 vs 0),
  grocery handoff selection (4 vs 5), Instacart test loader (groceryRetailerMatch.js),
  Kroger catalog (packageCount: 1), and Kroger release regression (feature-flag
  assertion). The Kroger package-match smoke check also fails identically because
  credentials are unavailable. Those unrelated files were not changed.
- Production artifact inspection found no Price Network workspace chunk, table
  identifiers, provider identity or `membershipEligibility` code. The existing
  DEV Find Deals entry and production redirect are unchanged. Common translation
  dictionaries retain labels, without exposing a production membership control.

Manual browser/device checks remain: open the DEV route with the existing app
client, select pilot stores, confirm form/content basis as required by Phase 5B,
and verify **Not sure / Yes / No** transitions for milk/egg card-only offers. Verify
**With store card**, no invented regular-price/savings display, unchanged beef
unknown-weight behavior, store isolation, expiry, and reset after leaving/reopening
the preview. Automated tests do not depend on pilot data and did not inspect the
live observations. No native code changed; real-device behavior was not exercised.

No push, merge, deployment, publication, production Supabase modification, version
change or persistent membership setting was performed.

## Source-aware observation freshness (Phase 5D)

Branch: `feat/deals-source-aware-freshness`, based on current main `791ae08`.
This section supersedes the blanket 24-hour Price Network freshness descriptions
in earlier phase notes. The existing migration/column comments are historical and
unchanged; no live schema or observation updates are needed for this code policy.

`src/deals/priceNetworkFreshness.ts` is the single source of Price Network validity
constants and calculation. All windows start at the original `observed_at`, never
at retrieval or cache access. Only verified observations admitted by the existing
provider can participate; an explicit timestamp does not upgrade source confidence.

| Source | No explicit expiration: fallback | Explicit expiration: maximum age |
| --- | --- | --- |
| manual | 7 days | 14 days |
| receipt-confirmed | 7 days | 7 days |
| user-contributed | 3 days | 3 days |
| approved-feed | 24 hours | 7 days |

The manual explicit ceiling allows a bounded two-week circular validity window;
the shorter seven-day fallback does not infer that any circular exists. Approved
verified feeds may use their explicit source date for up to seven days. Receipt
and contribution ceilings remain conservative. None of these rules depends on
retailer, store name or membership eligibility.

For an explicit observation expiration, validity ends at
`min(expires_at, observed_at + source maximum)`. The source date is never extended.
Without an explicit date, validity ends at `observed_at + source fallback`.
At the exact boundary the observation is stale. A derived maximum lookback covers
all source ceilings while retaining bounded indexed reads and the existing row
caps. Old history remains stored. The metadata-only history probe still separates
stale history from absent history; it never supplies old amounts as current prices.

Future observations are suppressed. Nonfinite dates or observation/sale expirations
at or before `observed_at` are malformed. A malformed newest row fails closed and
does not revive an older cheap quote. Unknown source types and unverified confidence
remain ineligible. The source policy does not change product identity, package
contents, selling basis, location/currency, availability or any eligibility rules.

Observation and sale validity remain separate. While a sale is active, the usable
quote ends at the earlier observation/sale boundary. When `sale_expires_at` passes,
a new provider read removes the sale and its sale-specific conditions; a known
regular price from that same still-valid observation may remain usable. If regular
price is null, it stays null and the price may be unavailable. Active membership
conditions continue through the Phase 5C scoped preference resolver unchanged.
No regular prices or savings are invented.

`getPrices` metadata now expires at the earliest usable quote expiry actually
returned, rather than starting from a one-minute limit or a 24-hour source cap.
Empty/search responses retain their existing short response-metadata expiry.
Normalized prices optionally carry `sourceExpiresAt`, the exact explicit source
observation timestamp; it is never populated from a fallback. Runtime validation
requires a normalized price not to outlive that explicit source timestamp.

Phase 4 now distinguishes source validity from cached-copy age. `price.expiresAt`
remains the source/active-sale boundary; response metadata `observedAt` denotes
when the normalized response was obtained/validated. Copy reuse is bounded by
storage/retrieval time plus cache TTL, the source boundary, and any stricter caller
ceiling. Reading a cache entry never renews those timestamps. The coordinator uses
response retrieval time when applying cache/availability ceilings, instead of
mistaking the original multi-day observation age for the age of the cached copy.

Default cache limits are unchanged: one hour for price copies and five minutes for
availability; the existing short product-response expiry may end a displayed
session sooner. A source valid for days therefore still needs fresh reads on the
normal cache/session schedule. Future metadata, expired copies, invalid context,
public-cache restrictions on membership/coupons, private-owner isolation and Phase
5C preference partitioning remain intact. Original provider rows are still cached
before membership resolution and never rewritten by the session.

The DEV UI retains **Recent observed price**, observation timestamp and source.
It adds **Valid through {date/time}** only when an explicit observation date governs
the current quote. It omits that label for fallback-only validity, a source date
beyond the policy maximum, or an earlier active-sale boundary. This avoids labeling
a policy cutoff as an advertised expiration or displaying a validity date later
than the current price can be used. The original explicit timestamp remains in the
normalized provenance. Existing expiry-driven display invalidation still removes
prices/winners without background queries. No “live price” claim is introduced.

Changed files:

- `src/deals/priceNetworkFreshness.ts`: centralized source policy and validation.
- `src/deals/providers/simpleDinnersPriceProvider.ts`: policy-derived read window,
  validity selection, malformed-range handling, explicit provenance and price metadata.
- `src/deals/provider.ts`, `src/deals/types.ts`: optional normalized explicit expiry
  and clarified response-retrieval timestamp contract.
- `src/deals/cache.ts`, `src/deals/coordinator.ts`: cached-copy/source age separation.
- `src/components/deals/PriceNetworkWorkspace.tsx`, `src/i18n/en.ts`, `src/i18n/es.ts`:
  conditional explicit validity-date display.
- `scripts/deals-freshness-test.cjs`: new Phase 5D scenarios.
- `scripts/deals-price-network-test.cjs`, `scripts/deals-live-preview-test.cjs`,
  `scripts/deals-membership-test.cjs`: stale manual fixtures now exceed seven days,
  matching the intentionally changed policy; their other expectations are unchanged.
- This README: source policy, precedence, metadata/cache behavior and validation.

Run new scenarios with:

```sh
node scripts/deals-freshness-test.cjs
```

The sixteen grouped scenarios use mocked Price Network rows and fake clocks. They
cover all fallback TTLs, multi-day manual/circular validity, explicit caps and early
expiry, approved-feed confidence, future/expired/malformed dates, sale boundaries,
null regular prices, metadata minima, membership-conditioned weekly-style offers,
cache reuse without renewal, short availability ceilings, explicit-only UI dates
and production isolation. Existing Phase 4 cache tests retain their expectations.

No live project was queried or modified. Prices, conditions, store/product/package
records, migrations, schema, credentials, dependencies, versions and native files
are unchanged. This phase adds no scheduled work, uploads, receipt features or
Phase 5E behavior.

### Phase 5D validation record

Validated on November 14, 2026 against current main `791ae08`:

- `npm install`, `npm run build`, `npm run lint`, `npm run validate:recipes`,
  `npm run audit:shopping`, and `npm run test:plus` passed. Lint remains at zero
  errors and seven known hook warnings. The build retains its large-chunk advisory.
  Generated images, the dependency lockfile, app/store versions and native files
  have no changes.
- All Deals Phase 1–5C suites and sixteen new Phase 5D scenarios passed. The three
  existing stale manual examples were moved beyond seven days because a 24-hour
  example is no longer stale under the requested policy. Existing cache/session
  assertions passed without changing their expected ceilings or isolation behavior.
- Local SQL/security checks passed by applying only the unchanged repository
  migration in network-isolated disposable Postgres 17 and running the existing
  rolled-back SQL assertions. The container was removed. No production database
  migration or query was performed.
- Shopping realtime/household sync, Pantry tomato, apple variety, countable and
  search-only requirements, requirement summary, retailer matching, package solver,
  delivery parsing, Kroger cart plan/server security, ingredient headers and
  Little Chefs shopping tests passed. Phase 3 still checks Walmart handoff/routing.
- Five unrelated regressions reproduced with identical output and exit status in
  an untouched detached checkout of current main: grocery delivery provider (1 vs
  0), grocery handoff selection (4 vs 5), Instacart test loader (groceryRetailerMatch.js),
  Kroger catalog (packageCount: 1), and Kroger release regression (feature-flag
  assertion). The Kroger package-match smoke check also fails identically because
  credentials are unavailable. Those unrelated files were not changed.
- Production JS artifact inspection found no Price Network table identifiers,
  provider identity, membership preference code, explicit-source-expiry code or
  workspace chunk. The existing DEV entry/route guards remain unchanged. Common
  translation dictionaries retain labels without exposing production controls.

Manual browser/device review remains: in DEV with the existing app client, inspect
weekly-style observations older than 24 hours, their explicit validity dates and
source labels, confirm membership/form/basis as required by prior phases, and check
sale-expiry fallback and stale-session removal. Review the chosen manual 14-day
and approved-feed seven-day explicit ceilings before broadening pilot coverage.
Automated tests mock all Price Network data; they did not inspect current Food
City observations or exercise the connected pilot in a browser/native device.

No push, merge, deployment, publication, production Supabase modification, version
change or Phase 5E work was performed.

## Private batch Price Capture (Phase 5E)

Branch: `feat/deals-private-price-capture`, based on current main `6f30c02`.
The development-only `/shopping-deals/capture` route provides manual batch curation
for authorized maintainers. The existing Deals preview links to it only inside
its DEV guard. App lazily imports the page under `import.meta.env.DEV`; production
navigation omits it and direct navigation redirects to Shopping List. No capture
page/client-write code is eagerly included in the production client bundle.

### Write and authorization boundary

This phase uses the app's existing Vercel Node API mechanism, not an Edge Function
or new service. `api/deals-price-capture.ts` is disabled unless all server gates
hold: `NODE_ENV=development`, `VERCEL_ENV` is absent or `development`, and
`PRICE_CAPTURE_ENABLED=true`. Production and hosted preview environments return
404 before client creation, authorization calls or writes. The endpoint accepts
GET/POST only and returns `Cache-Control: no-store`.

Every request validates the existing app bearer token with Supabase
`auth.getUser(token)` and checks the returned user UUID against the explicit
server-only comma-separated `PRICE_CAPTURE_MAINTAINER_IDS` allowlist. Empty/missing
allowlists deny access. Client booleans, localStorage flags, query parameters,
user-editable metadata, household admin roles and Plus status confer no authority.
The browser uses its existing app session token; it never receives privileged keys
and does not insert, update, delete or invoke a database RPC directly.

Server client configuration reuses the existing project's `SUPABASE_URL` (or
existing public URL fallback) and `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`.
These are server-only values, never `VITE_` secrets. No environment values, keys,
project links or `.env` files were created/changed during this phase. Use existing
app sign-in before opening capture; this tool adds no sign-in or linking flow.

GET loads up to 100 active stores and 500 product specifications through explicit
server SELECTs, after maintainer authorization. Exceeding either catalog ceiling
fails closed instead of silently omitting entries. Store name/number and city/state
come from the table; any active pilot store appears automatically without retailer
logic. Failed authorization/configuration keeps the editor locked.

### Atomic row writes and idempotency

The repository-only migration
`supabase/migrations/20261114184350_price_network_private_capture.sql` proposes one
`public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean)` RPC. It is
`SECURITY INVOKER`, has an empty search path, revokes EXECUTE from PUBLIC/anon/
authenticated and grants EXECUTE only to `service_role`. It adds only targeted
service-role SELECT/INSERT grants on the existing Price Network tables. It does
not change public read policies, enable app-client writes, add tables/indexes,
weaken append-only triggers or touch household/Kroger tables. No Edge Function was
created and the migration was not applied to the live project.

Each browser draft receives a random row UUID that becomes its permanent observation
ID. The RPC takes a transaction-scoped advisory lock on that UUID, checks for an
existing observation, and either returns an identical replay or rejects conflicting
content. JSON record normalization makes ISO/timezone formatting differences
compare by timestamp values. A second exact-identity lock serializes capture
product creation across different row IDs. The observation primary key is the
final duplicate boundary, not button disabling or process-local memory.

Each row is one atomic database transaction: check the active store, reuse/create
an immutable product, then insert the observation. A failed insert rolls back that
row's new product. Different rows intentionally have independent outcomes; the API
returns every selected row's status in order. Partial success is explicit, with
saved/replayed/invalid/failed statuses, created/reused product IDs and observation
IDs. Errors do not expose database payloads, credentials or raw infrastructure
messages.

After the first Save attempt, the reviewed payload is frozen in component state
and editor controls cannot change its content or row IDs. **Retry unchanged batch**
reconciles successful rows and safely retries failed rows. If time has since made
the request stale or its card-only sale expired, the server permits a replay-only
RPC: an identical already-saved row can be confirmed, but a missing expired row
cannot be created. Unknown write outcomes therefore do not justify a fresh ID.
**Capture another batch** explicitly resets rows and IDs. Re-entering facts with
new IDs is a new observation request; this is request idempotency, not global
semantic deduplication of all historical observations. Observation request IDs are
visible in review for later investigation. Closing/reloading discards the draft;
no batch contents or retry tokens are persisted by this workspace.

### Matching, parser and review

Existing-product suggestions are exact normalized-name candidates to inspect,
not automatic equivalence claims. Explicit selection copies the immutable stored
specification into the draft. Automatic reuse requires exact agreement across all
product identity fields, including brand/GTIN, canonical ID, search name, form and
verification flag, package kind/basis/quantity/unit/pack count. Any material change
creates a new immutable product; an explicitly selected ID with a conflicting spec
is rejected. No existing product or observation is updated.

Structured paste supports `name | price | availability`, including per-weight
wording such as `$2.99/lb`. It prefills a name, explicitly stated selling measure
and known availability. A bare price stays **unassigned** until the maintainer
chooses Regular or Sale. An explicit `regular:` or `sale:` prefix can fill that
field. It never infers canonical identity, package size, content basis or membership.
Malformed/extra wording stays flagged for review; paste never saves. Pasting into
an untouched initial blank row replaces only that blank starter, preserving edited
rows. Pasted data is bounded to 30,000 characters and 20 rows.

The editor supports active store; product/name, optional brand/GTIN, registry ID,
search name, form key/verification; package kind/basis/content and multipack count;
regular/sale price, currency, channel, selling basis/measure; observed/observation-
expiry/sale-expiry timestamps; availability, source/confidence and card requirement.
There is no suitable source-note column, so notes/source-reference input was omitted.
Dates require explicit ISO timestamps with timezone; missing facts remain absent.
Known registry IDs must be selected/entered explicitly; no alternate normalization
system or ingredient defaults are introduced.

Review lists each row's store, identity, package, regular/sale prices, selling basis,
card condition, availability, timestamps, source/confidence and reuse/create result.
Invalid fields are highlighted and Save stays disabled until every included row
is valid. Invalid rows may be excluded explicitly. Successful saves display row
outcomes and IDs without adding to Shopping List, running Deals or navigating away.
Capture input/textarea styling is scoped so existing Deals checkboxes are unchanged.

### Validation, money, membership and freshness

The same Zod/domain validation runs for review and again server-side. It enforces
UUIDs, bounded strings/batches, known canonical registry IDs, supported enum values,
finite package/selling quantities, consistent package/basis fields, valid ISO dates,
nonnegative safe integer minor-unit money and at least one current usable price.
Active stores and explicitly selected immutable product identity are checked again
inside the RPC. Batches are limited to 20 rows and normalized HTTP JSON payloads to 100,000 bytes.

Capture currently accepts the two-decimal currencies USD (default), CAD, EUR and
GBP. Dollar/decimal strings convert through integer arithmetic (`4.19` -> `419`),
never floating-point multiplication. Negative, NaN, exponent, extra-precision and
malformed prices are rejected; blank optional prices become null. Currencies with
different minor-unit conventions are not guessed. Measured selling prices require
a variable-weight product and supported weight unit; unknown package contents
may remain explicitly unknown and cannot gain comparison eligibility.

Card choices are **No membership condition** or **Membership required — eligibility
unknown**. The only stored condition is `membership: unknown`; the maintainer's
own Phase 5C membership preference is never read or stored as source eligibility.
Card-only prices keep regular price null. Form/source verification remains explicit;
unverified identity/source is warned and remains suppressed by the existing provider.

Phase 5D's central freshness helper validates source windows and rejects future
observations (zero positive clock skew), expired/unusable new rows, invalid ranges
and nonfinite dates. A long explicit expiration remains the original source fact,
with a warning and separate provider-usable-until cutoff when the source maximum
will cap it. Sale expiry remains independent, and no fallback date is portrayed as
an advertised expiration. Neither capture nor replay extends source freshness.

### Local validation and later manual setup

Run `node scripts/deals-capture-test.cjs` for mocked API/auth/catalog/RPC and actual
React editor/review/save tests. In disposable LOCAL Postgres with anon,
authenticated and BYPASSRLS service_role roles, apply Phase 5A and the proposed
capture migration locally, then run `supabase/tests/deals_price_network.sql` and
`supabase/tests/deals_capture.sql` with `psql -v ON_ERROR_STOP=1`. SQL tests roll back
all test rows and cover actual role grants, duplicate replay, expired replay-only,
exact reuse, different package creation, active stores and transaction rollback.
No deployment is needed for those meaningful local checks.

For later browser/server review, first separately review/apply the migration only
in an approved environment, then configure the local server's existing project
credentials, explicit enable flag and trusted maintainer UUID allowlist. Use the
existing `npm run dev:serverless` API workflow in development, and point the Vite
frontend at that local API through its existing `VITE_API_PROXY_TARGET` support.
Do not enable a hosted production/preview server or run a pilot Save without the
separate approval required for modifying live Price Network data. No such setup,
production application, credential change or live Save was performed here.

Reversal guidance: disable the local server flag first, then use a separately
reviewed reversal migration to drop only
`public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean)`. Normal RLS
and append-only protections remain intact. Do not delete captured history as part
of reversal; any later data correction needs a separate reviewed procedure.

Changed files: `src/App.tsx`, `src/pages/ShoppingDealsPage.tsx`,
`src/pages/PriceCapturePage.tsx`, `src/components/deals/PriceCapture.css`,
`src/deals/capture/model.ts`, `src/deals/capture/draft.ts`,
`src/deals/capture/client.ts`, `api/_priceCaptureServer.ts`,
`api/deals-price-capture.ts`, `scripts/deals-capture-test.cjs`, the capture migration,
`supabase/tests/deals_capture.sql`, and this README.

### Phase 5E validation record

Validated on November 14, 2026 against current main `6f30c02`:

- `npm install`, `npm run build`, `npm run lint`, `npm run validate:recipes`,
  `npm run audit:shopping`, and `npm run test:plus` passed. Lint remains at zero
  errors and seven known hook warnings; the build retains its large-chunk advisory.
  Final TypeScript/Vite rebuilds passed after isolating the capture input styling.
  The API entry and transitive shared modules also passed a separate strict
  TypeScript check; targeted server/model/page lint passed after final bounds.
- All existing Deals Phase 1–5D suites passed. The final capture suite passed 14
  grouped scenarios, including API authorization, model/parser/money validation,
  bounded payloads, partial statuses, card-only conditions, cap warnings, production
  routing and the actual editor/review/save/retry/reset flow with mocked Auth/RPC.
- Both SQL/security suites passed in a network-isolated disposable Postgres 17
  container after local application of the unchanged Phase 5A migration and the
  proposed capture migration. Tests verify actual invoker/role grants, immutable
  history, product reuse/separation, inactive-store rejection, duplicate replay,
  replay-only refusal of unsaved expired rows and atomic rollback without orphans.
  Test rows were rolled back and the container removed. No project migration was
  applied and no live Auth/catalog/price data was queried for testing.
- Production client artifact inspection found no capture page chunk, editor title,
  endpoint string, maintainer allowlist, privileged key variable or RPC name, and
  no private capture CSS. Direct production page/endpoint guards were also tested.
- Shopping realtime/household sync, Pantry tomato, apple variety, countable and
  search-only requirements, requirement summary, retailer matching, package solver,
  delivery parsing, Kroger cart plan/server security, ingredient headers and
  Little Chefs shopping tests passed. Phase 3 still verifies Walmart handoff.
- Five unrelated regressions reproduced with identical output/exit status on an
  untouched detached checkout of current main: grocery delivery provider (1 vs 0),
  grocery handoff selection (4 vs 5), Instacart loader (groceryRetailerMatch.js),
  Kroger catalog (packageCount: 1), and Kroger release regression (feature-flag
  assertion). The Kroger package-match smoke check also fails identically because
  credentials are unavailable. Those unrelated files were not changed.

Meaningful local testing was completed without deployment. The split local tests
exercise server authorization with mocked Supabase Auth, actual RPC SQL in Postgres,
and the React request/review flow with a mocked transport. A connected Supabase/
Vercel local-server round trip, real maintainer JWT, responsive browser/keyboard
layout and native device interaction remain manual checks. Review the service-only
RPC migration, existing server credential configuration and explicit maintainer IDs
before any later activation; verify authorized, unauthorized, retry and partial-save
paths against an approved target without casually creating pilot observations.

There were no new paid services, dependencies, account settings, versions, native
files, `.env`/certificate changes, production writes, pushes, merges, deployment,
publication, production migration application or OCR/receipt/screenshot automation.
