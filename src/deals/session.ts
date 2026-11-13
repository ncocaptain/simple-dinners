import { compareStoreBaskets } from "./basketComparison";
import { compareNeedPrices } from "./savings";
import { DealsCoordinator, type DealsCoordinatorInput, type DealsCoordinatorResult, type SessionDecisions, type ProviderIssue } from "./coordinator";
import type { DeepReadonly, NeedComparisonTarget, StorePriceSet } from "./types";

export type DealsSessionState = DeepReadonly<{
  // LOCAL equality tokens containing private source data; never send or log them.
  inputKey: string | null;
  snapshotIdentity: { version: number; identityVersion: number; signature: string } | null;
  selections: DealsCoordinatorInput["selections"];
  status: "idle" | "loading" | "ready" | "partial" | "stale" | "cancelled";
  loading: boolean; refreshing: boolean; stale: boolean;
  result: DealsCoordinatorResult | null;
  providerErrors: readonly ProviderIssue[];
  decisions: SessionDecisions;
}>;

export function dealsSessionKey(input: DealsCoordinatorInput): string {
  return JSON.stringify([input.snapshot.version, input.snapshot.identityVersion, input.snapshot.signature,
    input.selections, input.currency, input.comparisonBasis, input.cacheAccess]);
}
export function emptyDealsSession(input?: DealsCoordinatorInput): DealsSessionState {
  return {
    inputKey: input ? dealsSessionKey(input) : null,
    snapshotIdentity: input ? { version: input.snapshot.version, identityVersion: input.snapshot.identityVersion, signature: input.snapshot.signature } : null,
    selections: input ? structuredClone(input.selections) : [], status: "idle",
    loading: false, refreshing: false, stale: false, result: null, providerErrors: [], decisions: {},
  };
}
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

/** One owner per coordinator. Explicit refresh only; no clocks/timers/background work. */
export class DealsSession {
  private input: DealsCoordinatorInput | null = null;
  private state: DealsSessionState = freeze(emptyDealsSession());
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private readonly coordinator: DealsCoordinator;
  private readonly now: () => number;
  constructor(coordinator: DealsCoordinator, now: () => number = Date.now) { this.coordinator = coordinator; this.now = now; }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(state: DealsSessionState) {
    this.state = freeze(structuredClone(state));
    this.listeners.forEach((listener) => listener());
  }
  getState = (): DealsSessionState => {
    if (this.state.result?.expiresAt !== null && this.state.result?.expiresAt !== undefined && this.state.result.expiresAt <= this.now()) {
      // Checked on access/render, not by an automatic background timer. Expired
      // winners are removed, not merely decorated with a stale badge.
      this.state = freeze({ ...this.state, result: null, stale: true, status: "stale" });
    }
    return this.state;
  };
  setInput(input: DealsCoordinatorInput) {
    const key = dealsSessionKey(input);
    if (key === this.state.inputKey) return;
    this.revision++; this.coordinator.cancel();
    if (this.input && JSON.stringify(this.input.cacheAccess) !== JSON.stringify(input.cacheAccess)) this.coordinator.clearCache();
    this.input = structuredClone(input);
    this.publish(emptyDealsSession(input));
  }
  cancel = () => {
    this.revision++; this.coordinator.cancel();
    this.publish({ ...this.state, result: null, status: "cancelled", loading: false, refreshing: false });
  };
  async refresh(bypassCache = true): Promise<void> {
    if (!this.input) return;
    const revision = ++this.revision;
    const state = this.getState();
    this.publish({ ...state, status: "loading", loading: true, refreshing: state.result !== null });
    const apply = (result: DealsCoordinatorResult, loading: boolean) => {
      if (revision !== this.revision) return;
      this.publish({ ...this.state, result: result.cancelled ? null : result, providerErrors: result.errors,
        status: result.cancelled ? "cancelled" : loading ? "loading" : result.partial ? "partial" : "ready",
        loading, refreshing: loading && state.result !== null, stale: false });
    };
    try {
      const result = await this.coordinator.run(this.input, { decisions: this.state.decisions, refresh: bypassCache,
        onProgress: (partial) => apply(partial, true) });
      apply(result, false);
    } catch {
      if (revision === this.revision) this.publish({ ...this.state, result: null, loading: false, refreshing: false, status: "partial" });
    }
  }
  decide(id: string, decision: "accepted" | "rejected") {
    const state = this.getState();
    if (!this.input || !state.result?.offers.some((offer) => offer.id === id)) return;
    this.revision++; this.coordinator.cancel();
    const decisions = { ...state.decisions, [id]: decision };
    const offers = state.result.offers.map((offer) => ({ ...offer,
      compatibility: offer.compatibility === "mismatch" ? "mismatch" as const : decisions[offer.id] === "rejected"
        ? "unverified" as const : decisions[offer.id] === "accepted" ? "verified" as const : offer.compatibility,
    }));
    const targets: NeedComparisonTarget[] = this.input.snapshot.needs.map((need) => ({ need,
      productFormKey: this.input!.comparisonBasis[need.id]?.productFormKey ?? "",
      requirementBasis: this.input!.comparisonBasis[need.id]?.requirementBasis ?? "unknown" }));
    const stores = new Map<string, StorePriceSet>();
    for (const selection of this.input.selections) stores.set(JSON.stringify([selection.retailerId, selection.storeId, selection.channel]), {
      retailerId: selection.retailerId, storeId: selection.storeId, channel: selection.channel,
      offers: offers.filter((offer) => offer.price.retailerId === selection.retailerId && offer.price.storeId === selection.storeId && offer.price.channel === selection.channel),
    });
    const result = { ...state.result, offers,
      comparisons: targets.flatMap((target) => [...stores.values()].map((store) => ({ needId: target.need.id, storeId: store.storeId,
        result: compareNeedPrices(target, store.offers.filter((offer) => offer.needId === target.need.id), { ...store, currency: this.input!.currency, now: this.now() }) }))),
      basket: compareStoreBaskets(targets, [...stores.values()], { currency: this.input.currency, now: this.now() }, this.input.snapshot.holds.map((_, index) => `hold:${index}`)),
    };
    this.publish({ ...state, decisions, result, status: result.partial ? "partial" : "ready", loading: false, refreshing: false });
  }
}
