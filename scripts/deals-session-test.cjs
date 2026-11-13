"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const renderer = require("react-test-renderer");
const modules = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} }; modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)((name) => {
    if (["react", "zod"].includes(name)) return require(name);
    assert.ok(name.startsWith("."), `Unexpected dependency: ${name}`);
    return load(path.resolve(path.dirname(filename), name.replace(/\.js$/, "") + ".ts"));
  }, mod, mod.exports);
  return mod.exports;
}
const { buildShoppingPurchaseSnapshot } = load("src/deals/shoppingSnapshot.ts");
const { DealsProviderRegistry } = load("src/deals/providerRegistry.ts");
const { DealsCache, MemoryDealsCacheStorage, dealsCacheKey, DEFAULT_DEALS_TTLS } = load("src/deals/cache.ts");
const { DealsCoordinator } = load("src/deals/coordinator.ts");
const { DealsSession } = load("src/deals/session.ts");
const { useDealsSession } = load("src/deals/useDealsSession.ts");
const { createFakeDealsProvider, FakeProviderGate } = load("src/deals/testing/fakeProvider.ts");
const { parseProviderResult, candidateSchema } = load("src/deals/provider.ts");
const { compareStoreBaskets } = load("src/deals/basketComparison.ts");
const clone = (value) => structuredClone(value);
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
async function flush() { for (let i = 0; i < 30; i++) await Promise.resolve(); }
async function until(check) { for (let i = 0; i < 200; i++) { if (check()) return; await Promise.resolve(); } assert.fail("Condition did not settle without timers"); }
function snapshot(quantity = 20, coverage = "none", buyAnyway = false, second = false) {
  const raw = [{ id: "protein", text: "chicken breast", normalizedName: "chicken breast", grocerySearchName: "chicken breast",
    recipeIngredientText: `${quantity} oz chicken breast`, quantity, unit: "oz", checked: false, addedAt: 1, category: "Meat / Seafood" }];
  if (second) raw.push({ ...raw[0], id: "rice", text: "rice", normalizedName: "rice", grocerySearchName: "rice", recipeIngredientText: "16 oz rice", quantity: 16 });
  return buildShoppingPurchaseSnapshot({ rawItems: raw, combinedRows: raw.map((item) => ({ id: item.id, sourceIds: [item.id], checked: false,
    pantryCoverage: coverage, pantryKey: item.id, pantryRestock: false })), pantryBuyAnywayIds: new Set(buyAnyway ? ["protein"] : []) });
}
function setup(options = {}) {
  const clock = { time: 1000000 }; const now = () => clock.time;
  const fake = createFakeDealsProvider({ now, ...options });
  const cache = new DealsCache(options.storage, now, options.ttls);
  const registry = new DealsProviderRegistry([fake.provider, ...(options.extraProviders || [])]);
  const coordinator = new DealsCoordinator(registry, cache, now, options.concurrency || 2);
  const input = { snapshot: snapshot(), selections: [{ providerId: fake.provider.identity.id, environment: "test", retailerId: "retailer-a", storeId: "store-a",
    channel: "in-store", currency: "USD", eligibilityKey: "no-loyalty" }], currency: "USD",
    comparisonBasis: { "need-0": { productFormKey: "chicken-breast", requirementBasis: "net" } },
    cacheAccess: { visibility: "public", ownerKey: null, personalized: false } };
  return { clock, now, fake, cache, registry, coordinator, input };
}
const query = { requestId: "q", searchName: "chicken breast", canonicalIngredientId: "chicken-breast", productConstraints: ["20 oz chicken breast"] };
function cacheContext(input, extras = {}) {
  return { ...input.selections[0], ...input.cacheAccess, query: { searchName: query.searchName, canonicalIngredientId: query.canonicalIngredientId, productConstraints: query.productConstraints }, productIds: [], storeSearch: null, pageCursor: null, ...extras };
}

 test("provider capabilities and explicit registry reporting", async () => {
  const { fake, registry } = setup();
  assert.deepEqual(registry.list()[0].capabilities, { storeDiscovery: true, productSearch: true, localPrices: true, availability: true, promotions: true, batchSearch: true });
  assert.equal(new DealsProviderRegistry().list().length, 0);
  assert.throws(() => new DealsProviderRegistry([fake.provider, fake.provider]));
  const stores = await fake.provider.discoverStores({ postalCode: "00000" }, new AbortController().signal);
  assert.equal(stores.items[0].storeId, "sample-store");
 });
 test("fake successful search and Phase 2 purchase cost", async () => {
  const { coordinator, input, fake } = setup(); const result = await coordinator.run(input);
  assert.equal(result.offers.length, 2); assert.equal(result.basket.stores[0].merchandiseSubtotal.amountMinor, 350);
  assert.equal(result.basket.cheapestCompleteStores.length, 1);
  assert.equal(fake.requests.length, 2); assert.equal(result.sources[0].attribution, "Synthetic fixtures only");
 });
 test("no results are negative-cached and expire with a fake clock", async () => {
  const { coordinator, input, fake, clock } = setup({ scenario: () => "empty" });
  assert.equal((await coordinator.run(input)).offers.length, 0);
  await coordinator.run(input); assert.equal(fake.requests.length, 1);
  clock.time += 300001; await coordinator.run(input); assert.equal(fake.requests.length, 2);
 });
 test("partial per-item failures retain valid provider data safely", async () => {
  const { coordinator, input } = setup({ scenario: (stage) => stage === "prices" ? "partial" : "success" });
  const result = await coordinator.run(input); assert.equal(result.offers.length, 1);
  assert.equal(result.partial, true); assert.ok(result.errors.some((error) => error.failure.code === "unavailable"));
  assert.equal(result.basket.stores[0].merchandiseSubtotal.amountMinor, 400);
 });
 test("provider-wide failures do not create a complete basket or cached success", async () => {
  const { coordinator, input } = setup({ scenario: () => "unavailable" });
  const result = await coordinator.run(input); assert.equal(result.offers.length, 0);
  assert.equal(result.errors[0].failure.code, "unavailable"); assert.equal(result.basket.cheapestCompleteStores.length, 0);
 });
 test("rate-limit retry metadata is retained and respected without timers", async () => {
  let limited = true;
  const { coordinator, input, fake, clock } = setup({ scenario: () => limited ? "rate-limit" : "success" });
  const result = await coordinator.run(input); assert.equal(result.errors[0].failure.retryAfterMs, 2000);
  limited = false; await coordinator.run(input, { refresh: true }); assert.equal(fake.requests.length, 1);
  clock.time += 2001; assert.equal((await coordinator.run(input)).offers.length, 2);
 });
 test("cancellation before request starts calls no provider", async () => {
  const { coordinator, input, fake } = setup(); const abort = new AbortController(); abort.abort();
  const result = await coordinator.run(input, { signal: abort.signal });
  assert.equal(result.cancelled, true); assert.equal(fake.requests.length, 0);
 });
 test("cancellation during delayed request releases cooperative provider work", async () => {
  const gate = new FakeProviderGate();
  const { coordinator, input, fake } = setup({ wait: (stage, signal) => stage === "search" ? gate.wait(signal) : Promise.resolve() });
  const abort = new AbortController(); const pending = coordinator.run(input, { signal: abort.signal });
  await until(() => gate.size === 1); abort.abort(); const result = await pending; await flush();
  assert.equal(result.cancelled, true); assert.equal(result.offers.length, 0); assert.equal(gate.size, 0); assert.equal(fake.activeCount, 0);
 });
 for (const change of ["snapshot", "store", "provider"]) test(`late response ignored after ${change} change`, async () => {
  const gate = new FakeProviderGate(); let delayed = true;
  const clock = { time: 1000000 }; const second = createFakeDealsProvider({ id: "fake-two", now: () => clock.time });
  const { coordinator, input, now } = setup({ extraProviders: [second.provider], ignoreAbort: true,
    wait: (stage, signal) => delayed && stage === "search" ? gate.wait(signal, true) : Promise.resolve() });
  const session = new DealsSession(coordinator, now); session.setInput(input);
  const old = session.refresh(false); await until(() => gate.size === 1);
  const updated = clone(input);
  if (change === "snapshot") updated.snapshot = snapshot(40);
  if (change === "store") updated.selections[0].storeId = "store-b";
  if (change === "provider") updated.selections[0].providerId = "fake-two";
  delayed = false; session.setInput(updated); assert.equal(session.getState().result, null);
  await session.refresh(false); const newer = JSON.stringify(session.getState());
  gate.releaseAll(); await old; await flush(); assert.equal(JSON.stringify(session.getState()), newer);
  if (change === "snapshot") assert.equal(session.getState().result.basket.stores[0].merchandiseSubtotal.amountMinor, 700);
  if (change === "store") assert.equal(session.getState().result.offers[0].price.storeId, "store-b");
 });
 test("bounded concurrency and progressive results", async () => {
  const gate = new FakeProviderGate();
  const { coordinator, input, fake } = setup({ concurrency: 2, wait: (stage, signal) => stage === "search" ? gate.wait(signal) : Promise.resolve() });
  const many = clone(input); many.snapshot = snapshot(20, "none", false, true);
  many.comparisonBasis["need-1"] = { productFormKey: "rice", requirementBasis: "net" };
  many.selections.push({ ...many.selections[0], storeId: "store-b" });
  const progress = []; let done = false;
  const pending = coordinator.run(many, { onProgress: (result) => progress.push(result) }).then((result) => { done = true; return result; });
  await until(() => gate.size === 2);
  for (let i = 0; i < 20 && !done; i++) { gate.releaseNext(); await flush(); }
  const result = await pending; assert.ok(fake.maxActiveCount <= 2); assert.ok(progress.length >= 2);
  assert.equal(result.basket.stores.every((store) => store.complete), true);
  assert.ok(progress[0].basket.stores.some((store) => !store.complete));
 });
 test("valid cached results reused and expired prices never participate", async () => {
  let available = true;
  const { coordinator, input, fake, clock } = setup({ scenario: () => available ? "success" : "unavailable" });
  const first = await coordinator.run(input); const second = await coordinator.run(input);
  assert.equal(fake.requests.length, 2); assert.deepEqual(second.basket, first.basket);
  clock.time += 3600001; available = false;
  const expired = await coordinator.run(input); assert.equal(expired.offers.length, 0); assert.equal(expired.basket.cheapestCompleteStores.length, 0);
 });
 test("availability TTL caps reuse and session expiry even when price TTL is longer", async () => {
  const { coordinator, input, clock, fake, now } = setup(); const session = new DealsSession(coordinator, now);
  session.setInput(input); await session.refresh(false); const expiry = session.getState().result.expiresAt;
  clock.time += 200000; await session.refresh(false); assert.equal(fake.requests.length, 2);
  assert.equal(session.getState().result.expiresAt, expiry);
  clock.time = expiry; assert.equal(session.getState().status, "stale"); assert.equal(session.getState().result, null);
  await session.refresh(false); assert.equal(fake.requests.length, 3);
 });
 test("cache keys isolate provider/environment/store/channel/currency/search/eligibility", async () => {
  const { input } = setup(); const context = cacheContext(input); const key = dealsCacheKey("product-metadata", context);
  for (const change of [{ providerId: "other" }, { environment: "production" }, { retailerId: "other" }, { storeId: "other" },
    { channel: "delivery" }, { pageCursor: "page-2" }, { storeSearch: { postalCode: "10001", cursor: null } }, { currency: "CAD" }, { eligibilityKey: "member" },
    { query: { ...context.query, productConstraints: ["cooked chicken"] } }, { productIds: ["sku"] }]) {
    assert.notEqual(dealsCacheKey("product-metadata", { ...context, ...change }), key);
  }
  assert.equal(key.includes(input.snapshot.signature), false);
 });
 test("personalized prices are private, owner-isolated, and never shared as public", async () => {
  const { cache, fake, input } = setup(); const context = cacheContext(input);
  const raw = await fake.provider.getPrices({ context: input.selections[0], productIds: ["sku"] }, new AbortController().signal);
  raw.items[0].price.conditions = [{ kind: "membership", eligibility: "eligible" }];
  assert.equal(cache.set("price-observations", context, raw), false);
  const privateA = { ...context, visibility: "private", personalized: true, ownerKey: "owner-a" };
  assert.equal(cache.set("price-observations", privateA, raw), true);
  assert.equal(cache.get("price-observations", { ...privateA, ownerKey: "owner-b" }).status, "miss");
  assert.equal(cache.get("price-observations", privateA).status, "hit");
  assert.equal(cache.set("price-observations", { ...privateA, visibility: "public" }, raw), false);
 });
 test("distinct TTL defaults, stricter overrides and cache clearing", async () => {
  assert.deepEqual(DEFAULT_DEALS_TTLS, { "store-directory": 604800000, "product-metadata": 86400000, "price-observations": 3600000, availability: 300000, negative: 300000 });
  const { fake, input, clock, now } = setup(); const cache = new DealsCache(undefined, now, { negative: 10 }); const context = cacheContext(input);
  assert.equal(cache.set("negative", context, { empty: true }), true);
  clock.time += 10; assert.equal(cache.get("negative", context).status, "miss");
  const stores = await fake.provider.discoverStores({ postalCode: "00000" }, new AbortController().signal);
  const directoryContext = { ...context, storeSearch: { postalCode: "00000", cursor: null } };
  cache.set("store-directory", directoryContext, stores); assert.equal(cache.get("store-directory", directoryContext).status, "hit");
  assert.equal(cache.clear(), true); assert.equal(cache.get("store-directory", directoryContext).status, "miss");
 });
 test("storage unavailable fails safely and fresh provider work still succeeds", async () => {
  const broken = { get() { throw Error("private diagnostic"); }, set() { throw Error("private diagnostic"); }, delete() { throw Error("private diagnostic"); }, clear() { throw Error("private diagnostic"); } };
  const { coordinator, input, cache } = setup({ storage: broken }); const context = cacheContext(input);
  assert.equal(cache.get("negative", context).status, "unavailable"); assert.equal(cache.set("negative", context, { empty: true }), false);
  assert.equal(cache.clear(), false); assert.equal((await coordinator.run(input)).offers.length, 2);
 });
 test("malformed envelopes rejected; valid items survive malformed siblings", async () => {
  const { coordinator, input } = setup({ scenario: () => "malformed" });
  const result = await coordinator.run(input); assert.equal(result.offers.length, 0); assert.equal(result.errors[0].failure.code, "malformed-response");
  const normal = setup(); const response = await normal.fake.provider.searchProducts({ context: normal.input.selections[0], queries: [query] }, new AbortController().signal);
  response.items.push({ invalid: true }); response.items[0].credential = "must-not-survive";
  const parsed = parseProviderResult(response, candidateSchema, normal.fake.provider.identity);
  assert.equal(parsed.items.length, 2); assert.equal(parsed.failures[0].code, "malformed-response");
  assert.equal(JSON.stringify(parsed).includes("must-not-survive"), false);
 });
 test("store/channel mismatch produces safe partial empty comparison", async () => {
  const { coordinator, input } = setup({ scenario: (stage) => stage === "prices" ? "mismatch" : "success" });
  const result = await coordinator.run(input); assert.equal(result.offers.length, 0); assert.equal(result.partial, true);
  assert.equal(result.basket.cheapestCompleteStores.length, 0);
 });
 test("all basket winners come from Phase 2, including partial provider coverage", async () => {
  const { coordinator, input, now } = setup(); const result = await coordinator.run(input);
  const targets = input.snapshot.needs.map((need) => ({ need, ...input.comparisonBasis[need.id] }));
  const stores = input.selections.map((selection) => ({ retailerId: selection.retailerId, storeId: selection.storeId, channel: selection.channel, offers: result.offers }));
  assert.deepEqual(result.basket, compareStoreBaskets(targets, stores, { currency: input.currency, now: now() }, []));
 });
 test("snapshot signatures never appear in provider payloads; inputs remain immutable", async () => {
  const { coordinator, input, fake } = setup(); const before = JSON.stringify(input);
  await coordinator.run(input);
  assert.equal(JSON.stringify(input), before);
  const payload = JSON.stringify(fake.requests);
  assert.equal(payload.includes(input.snapshot.signature), false);
  for (const key of ["snapshot", "signature", "sourceRecipe", "rawItems", "sourceIds"]) assert.equal(payload.includes(`"${key}"`), false);
 });
 test("Pantry/Buy Anyway changes invalidate results and session-local decisions", async () => {
  const { coordinator, input, now } = setup(); const session = new DealsSession(coordinator, now);
  session.setInput(input); await session.refresh(false); const id = session.getState().result.offers[0].id;
  session.decide(id, "rejected"); assert.equal(session.getState().decisions[id], "rejected");
  session.setInput({ ...input, snapshot: snapshot(20, "covered", false) }); assert.equal(session.getState().result, null); assert.deepEqual(session.getState().decisions, {});
  session.setInput({ ...input, snapshot: snapshot(20, "covered", true) }); assert.equal(session.getState().status, "idle");
 });
 test("leaving/session cancellation prevents pending publication", async () => {
  const gate = new FakeProviderGate(); const { coordinator, input, now } = setup({ wait: (stage, signal) => stage === "search" ? gate.wait(signal) : Promise.resolve() });
  const session = new DealsSession(coordinator, now); session.setInput(input);
  const pending = session.refresh(); await until(() => gate.size === 1); session.cancel(); await pending;
  assert.equal(session.getState().status, "cancelled"); assert.equal(session.getState().result, null);
 });
 test("React hook unmount cancels work; input changes mask old results immediately", async () => {
  const gate = new FakeProviderGate(); let delayed = false;
  const { coordinator, input, now, fake } = setup({ wait: (stage, signal) => delayed && stage === "search" ? gate.wait(signal) : Promise.resolve() });
  let value; const observations = [];
  function Probe({ current }) { value = useDealsSession(coordinator, current, now); observations.push({ key: value.snapshotIdentity?.signature, result: value.result }); return null; }
  let root; await renderer.act(async () => { root = renderer.create(React.createElement(Probe, { current: input })); });
  assert.equal(fake.requests.length, 0);
  await renderer.act(async () => { await value.refresh(false); }); assert.ok(value.result);
  const next = { ...input, snapshot: snapshot(40) };
  await renderer.act(async () => { root.update(React.createElement(Probe, { current: next })); });
  assert.equal(value.result, null);
  assert.ok(observations.filter((entry) => entry.key === next.snapshot.signature).every((entry) => entry.result === null));
  delayed = true; let pending;
  await renderer.act(async () => { pending = value.refresh(true); await until(() => gate.size === 1); });
  await renderer.act(async () => root.unmount()); await pending; await flush(); assert.equal(fake.activeCount, 0);
 });

 test("malformed siblings survive coordinator normalization without false winner math", async () => {
  const setupData = setup(); const { fake, coordinator, input } = setupData;
  const search = fake.provider.searchProducts;
  fake.provider.searchProducts = async (request, signal) => {
    const result = await search(request, signal); result.items.push({ invalid: true }); return result;
  };
  const prices = fake.provider.getPrices;
  fake.provider.getPrices = async (request, signal) => {
    const result = await prices(request, signal); result.items[1].price.regularPrice.amountMinor = -1; return result;
  };
  const result = await coordinator.run(input);
  assert.equal(result.offers.length, 1); assert.equal(result.partial, true);
  assert.ok(result.errors.some((issue) => issue.failure.code === "malformed-response"));
  assert.equal(result.basket.stores[0].merchandiseSubtotal.amountMinor, 400);
 });
 test("session decisions cannot override unknown contents or hard product conflicts", async () => {
  const { fake, coordinator, input, now } = setup();
  const search = fake.provider.searchProducts;
  fake.provider.searchProducts = async (request, signal) => {
    const result = await search(request, signal);
    result.items[0].packageSize.size = null; result.items[0].compatibility = "unverified"; return result;
  };
  const session = new DealsSession(coordinator, now); session.setInput(input); await session.refresh(false);
  let offers = session.getState().result.offers;
  session.decide(offers[1].id, "rejected"); session.decide(offers[0].id, "accepted");
  assert.equal(session.getState().result.basket.cheapestCompleteStores.length, 0);
  assert.equal(fake.requests.length, 2);
  const other = setup(); const otherSearch = other.fake.provider.searchProducts;
  other.fake.provider.searchProducts = async (request, signal) => {
    const result = await otherSearch(request, signal); result.items.forEach((item) => { item.productFormKey = "cooked-chicken"; }); return result;
  };
  const hard = new DealsSession(other.coordinator, other.now); hard.setInput(other.input); await hard.refresh(false);
  const id = hard.getState().result.offers[0].id; hard.decide(id, "accepted");
  assert.equal(hard.getState().result.offers[0].compatibility, "mismatch");
  assert.equal(hard.getState().result.basket.cheapestCompleteStores.length, 0);
 });
 test("catalog-only prices, unsupported capabilities and wrong currency are rejected", async () => {
  for (const mode of ["catalog", "currency", "unsupported"]) {
    const { fake, coordinator, input } = setup();
    const prices = fake.provider.getPrices;
    if (mode === "unsupported") fake.provider.identity.capabilities.localPrices = false;
    else fake.provider.getPrices = async (request, signal) => {
      const result = await prices(request, signal);
      if (mode === "catalog") result.metadata.sourceScope = "catalog";
      else result.items.forEach((item) => { item.price.regularPrice.currency = "CAD"; });
      return result;
    };
    const result = await coordinator.run(input); assert.equal(result.offers.length, 0);
    assert.ok(result.errors.some((error) => error.failure.code === (mode === "unsupported" ? "unsupported" : "malformed-response")));
  }
 });
 test("cache strips extra payload fields, bounds memory and isolates store discovery", async () => {
  const { fake, input, now } = setup(); const backend = new MemoryDealsCacheStorage(1); const cache = new DealsCache(backend, now);
  const context = cacheContext(input);
  const products = await fake.provider.searchProducts({ context: input.selections[0], queries: [query] }, new AbortController().signal);
  products.credential = "secret-not-normalized"; products.items[0].credential = "secret-not-normalized";
  assert.equal(cache.set("product-metadata", context, products), true);
  assert.equal(JSON.stringify(cache.get("product-metadata", context)).includes("secret-not-normalized"), false);
  cache.set("negative", context, { empty: true }); assert.equal(cache.get("product-metadata", context).status, "miss");
  const directoryA = { ...context, storeSearch: { postalCode: "00000", cursor: null } };
  const directoryB = { ...context, storeSearch: { postalCode: "10001", cursor: null } };
  const stores = await fake.provider.discoverStores({ postalCode: "00000" }, new AbortController().signal);
  assert.equal(cache.set("store-directory", directoryA, stores), true);
  assert.equal(cache.get("store-directory", directoryB).status, "miss");
 });
 test("privacy owner changes clear cached data and reset decisions", async () => {
  const { coordinator, input, now, cache } = setup(); const privateInput = { ...input, cacheAccess: { visibility: "private", ownerKey: "a", personalized: true } };
  const session = new DealsSession(coordinator, now); session.setInput(privateInput); await session.refresh(false);
  const context = cacheContext(privateInput); assert.equal(cache.get("product-metadata", context).status, "hit");
  session.setInput({ ...privateInput, cacheAccess: { ...privateInput.cacheAccess, ownerKey: "b" } });
  assert.equal(session.getState().result, null); assert.deepEqual(session.getState().decisions, {});
  assert.equal(cache.get("product-metadata", context).status, "miss");
 });

 test("stricter product, price and availability TTLs cap cold session results", async () => {
  for (const kind of ["product-metadata", "price-observations", "availability"]) {
    const { coordinator, input, now, clock } = setup({ ttls: { [kind]: 100 } });
    const session = new DealsSession(coordinator, now); session.setInput(input); await session.refresh(false);
    assert.equal(session.getState().result.expiresAt, clock.time + 100);
    clock.time += 100; assert.equal(session.getState().result, null); assert.equal(session.getState().stale, true);
  }
 });

 test("stricter cache policies apply to entries written under an older policy", async () => {
  const { fake, input, now, clock } = setup(); const storage = new MemoryDealsCacheStorage();
  const old = new DealsCache(storage, now); const context = cacheContext(input);
  const products = await fake.provider.searchProducts({ context: input.selections[0], queries: [query] }, new AbortController().signal);
  old.set("product-metadata", context, products);
  const strict = new DealsCache(storage, now, { "product-metadata": 100 });
  assert.equal(strict.get("product-metadata", context).expiresAt, clock.time + 100);
  clock.time += 100; assert.equal(strict.get("product-metadata", context).status, "miss");
 });
 test("metadata that expires during a delayed price request cannot produce winners", async () => {
  const gate = new FakeProviderGate();
  const { coordinator, input, clock } = setup({ ttls: { "product-metadata": 100 }, wait: (stage, signal) => stage === "prices" ? gate.wait(signal) : Promise.resolve() });
  const pending = coordinator.run(input); await until(() => gate.size === 1); clock.time += 101; gate.releaseAll();
  const result = await pending; assert.equal(result.offers.length, 0); assert.equal(result.basket.cheapestCompleteStores.length, 0);
 });

 test("personalized or unknown audience is not public even without loyalty conditions", async () => {
  const { fake, input, cache } = setup(); const context = cacheContext(input);
  for (const audience of ["personalized", "unknown"]) {
    const prices = await fake.provider.getPrices({ context: input.selections[0], productIds: ["sku"] }, new AbortController().signal);
    prices.metadata.audience = audience;
    assert.equal(cache.set("price-observations", context, prices), false);
    assert.equal(cache.set("price-observations", { ...context, visibility: "private", ownerKey: "a", personalized: true }, prices), true);
  }
 });

(async () => {
 for (const [name, fn] of tests) { await fn(); console.log("PASS:", name); }
 console.log(`PASS: ${tests.length} Deals Phase 4 provider/cache/session scenarios; fake clocks and no network`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
