import type { DealsProvider, ProviderEnvironment } from "./provider";

/** Explicit injection only. No default/live providers or side-effect registration. */
export class DealsProviderRegistry {
  private readonly providers = new Map<string, DealsProvider>();
  constructor(providers: readonly DealsProvider[] = []) {
    for (const provider of providers) {
      const { identity } = provider;
      const key = JSON.stringify([identity.id, identity.environment]);
      if (!identity.id || !identity.name || this.providers.has(key) ||
          !Number.isSafeInteger(identity.maxBatchSize) || identity.maxBatchSize < 1 || identity.maxBatchSize > 1000 ||
          ["storeDiscovery", "productSearch", "localPrices", "availability", "promotions", "batchSearch"].some((key) => typeof identity.capabilities[key as keyof typeof identity.capabilities] !== "boolean") ||
          !["test", "production"].includes(identity.environment) ||
          (identity.capabilities.productSearch && typeof provider.searchProducts !== "function") ||
          (identity.capabilities.storeDiscovery && !provider.discoverStores) ||
          (identity.capabilities.localPrices && !provider.getPrices)) throw new Error("Invalid or duplicate Deals provider");
      this.providers.set(key, provider);
    }
  }
  get(id: string, environment: ProviderEnvironment): DealsProvider | undefined {
    return this.providers.get(JSON.stringify([id, environment]));
  }
  list() { return [...this.providers.values()].map((provider) => structuredClone(provider.identity)); }
}
