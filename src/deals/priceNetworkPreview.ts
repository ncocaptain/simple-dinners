import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { DealsRouteSnapshot } from "./fixturePreview";
import type { DealsCoordinatorInput, ProviderSelection } from "./coordinator";
import type { ShoppingPurchaseSnapshot } from "./types";

const storeSchema = z.object({
  id: z.string().uuid(), retailer_name: z.string().min(1).max(200), active: z.literal(true),
  store_name: z.string().max(200).nullable(), store_number: z.string().max(100).nullable(),
  city: z.string().max(100).nullable(), state: z.string().max(100).nullable(),
});
export type PriceNetworkStore = Readonly<z.infer<typeof storeSchema>>;

/** Read-only catalog discovery for the DEV workspace, never observation access. */
export async function loadPriceNetworkStores(client: Pick<SupabaseClient, "from">, signal: AbortSignal): Promise<readonly PriceNetworkStore[]> {
  const { data, error } = await client.from("price_network_stores")
    .select("id,retailer_name,store_name,store_number,city,state,active").eq("active", true)
    .order("retailer_name").order("id").limit(101).abortSignal(signal);
  if (error || signal.aborted || !data || data.length > 100) throw new Error("Stores unavailable");
  // Re-check active status even on a mocked/malformed transport. Invalid rows do
  // not become selectable stores; no synthetic substitute is ever supplied.
  return data.flatMap((row) => { const parsed = storeSchema.safeParse(row); return parsed.success ? [parsed.data] : []; });
}

export const priceNetworkStoreLabel = (store: PriceNetworkStore) => [store.retailer_name,
  [store.store_name, store.store_number].filter(Boolean).join(" · "),
  [store.city, store.state].filter(Boolean).join(", ")].filter(Boolean).join(" — ");

/** Phase 1's navigation-safe projection already contains authoritative needs and
 * holds. Fill only unused source fields, without re-running Pantry/Shopping List
 * logic or persisting raw rows. This equality token stays local to the session.
 */
export function priceNetworkSessionInput(snapshot: DealsRouteSnapshot, stores: readonly PriceNetworkStore[],
  selectedIds: readonly string[], comparisonBasis: DealsCoordinatorInput["comparisonBasis"]): DealsCoordinatorInput {
  const purchase: ShoppingPurchaseSnapshot = {
    ...structuredClone(snapshot), identityVersion: 1, signature: JSON.stringify(snapshot),
    rawItems: [], combinedRows: [], pantryBuyAnywayIds: [],
  };
  const selections: ProviderSelection[] = stores.filter((store) => selectedIds.includes(store.id)).map((store) => ({
    providerId: "simple-dinners-price-network", environment: "production", retailerId: store.retailer_name,
    storeId: store.id, channel: "in-store", currency: "USD", eligibilityKey: "public",
  }));
  return { snapshot: purchase, selections, currency: "USD", comparisonBasis,
    cacheAccess: { visibility: "public", ownerKey: null, personalized: false } };
}
