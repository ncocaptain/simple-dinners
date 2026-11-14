import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { DealsCoordinator, type DealsCoordinatorInput } from "../../deals/coordinator";
import { DealsProviderRegistry } from "../../deals/providerRegistry";
import { createSimpleDinnersPriceProvider } from "../../deals/providers/simpleDinnersPriceProvider";
import { useDealsSession } from "../../deals/useDealsSession";
import { loadPriceNetworkStores, priceNetworkSessionInput, priceNetworkStoreLabel, type PriceNetworkStore } from "../../deals/priceNetworkPreview";
import type { DealsRouteSnapshot } from "../../deals/fixturePreview";
import { getStoredLanguage } from "../../i18n";
import { money, number, packageLabel, reasonText, text } from "./presentation";

type Props = { snapshot: DealsRouteSnapshot; client?: Pick<SupabaseClient, "from"> | null; now?: () => number };
const dateLabel = (time: number) => new Date(time).toLocaleString(getStoredLanguage());

/** Loaded only by the DEV route after explicitly choosing Price Network mode. */
export default function PriceNetworkWorkspace({ snapshot, client = supabase, now = Date.now }: Props) {
  return client ? <ConnectedPriceNetwork snapshot={snapshot} client={client} now={now} /> : <p role="status">{text("networkNotConfigured")}</p>;
}
function ConnectedPriceNetwork({ snapshot, client, now }: Required<Props> & { client: Pick<SupabaseClient, "from"> }) {
  const [stores, setStores] = useState<readonly PriceNetworkStore[]>([]);
  const [storeStatus, setStoreStatus] = useState<"loading" | "ready" | "error">("loading");
  const [storeRevision, setStoreRevision] = useState(0);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [basis, setBasis] = useState<DealsCoordinatorInput["comparisonBasis"]>({});
  const [formOptions, setFormOptions] = useState<Record<string, readonly string[]>>({});
  const [, invalidateExpiry] = useState(0);
  const coordinator = useMemo(() => new DealsCoordinator(new DealsProviderRegistry([
    createSimpleDinnersPriceProvider(client, now),
  ]), undefined, now), [client, now]);
  const input = useMemo(() => priceNetworkSessionInput(snapshot, stores, selected, basis), [snapshot, stores, selected, basis]);
  const session = useDealsSession(coordinator, input, now);
  useEffect(() => {
    const controller = new AbortController();
    setStoreStatus("loading"); setStores([]); setSelected([]);
    void loadPriceNetworkStores(client, controller.signal).then((rows) => {
      if (!controller.signal.aborted) { setStores(rows); setStoreStatus("ready"); }
    }).catch(() => { if (!controller.signal.aborted) setStoreStatus("error"); });
    return () => controller.abort();
  }, [client, storeRevision]);
  // Expiry invalidates display only; it never refreshes or queries in background.
  const expiry = session.result?.expiresAt;
  useEffect(() => {
    if (expiry === null || expiry === undefined) return;
    const timer = setTimeout(() => invalidateExpiry((revision) => revision + 1), Math.max(0, expiry - now()) + 1);
    return () => clearTimeout(timer);
  }, [expiry, now]);
  const result = session.result;
  useEffect(() => {
    if (!result) return;
    setFormOptions((previous) => ({ ...previous, ...Object.fromEntries(snapshot.needs.map((need) => [need.id,
      [...new Set(result.offers.filter((offer) => offer.needId === need.id && offer.packageSize.basis !== "unknown")
        .map((offer) => JSON.stringify([offer.productFormKey, offer.packageSize.basis])))],
    ])) }));
  }, [result, snapshot]);
  const label = (id: string) => { const store = stores.find((entry) => entry.id === id); return store ? priceNetworkStoreLabel(store) : id; };
  return <>
    <p>{text("active")}: {number(snapshot.needs.length)} · {text("held")}: {number(snapshot.holds.length)}</p>
    {storeStatus === "loading" && <p role="status">{text("networkLoadingStores")}</p>}
    {storeStatus === "error" && <p role="alert">{text("networkStoreError")}</p>}
    {storeStatus === "ready" && !stores.length && <p role="status">{text("networkNoStores")}</p>}
    <button type="button" disabled={storeStatus === "loading"} onClick={() => setStoreRevision((revision) => revision + 1)}>{text("networkReloadStores")}</button>
    {!!stores.length && <fieldset className="deals-card"><legend>{text("stores")}</legend>
      {stores.map((store) => <label className="deals-choice" key={store.id}><input type="checkbox" checked={selected.includes(store.id)}
        onChange={(event) => setSelected((previous) => event.target.checked ? [...previous, store.id] : previous.filter((id) => id !== store.id))} />{priceNetworkStoreLabel(store)}</label>)}
    </fieldset>}
    {!!stores.length && <div className="deals-actions">
      <button type="button" disabled={!selected.length || session.loading} onClick={() => void session.refresh()}>{text("networkCompare")}</button>
      {session.loading && <button type="button" onClick={session.cancel}>{text("networkCancel")}</button>}
    </div>}
    {session.loading && <p role="status">{text("networkLoadingPrices")}</p>}
    {session.status === "cancelled" && <p role="status">{text("networkCancelled")}</p>}
    {session.stale && <p role="status">{text("networkStaleSession")}</p>}
    {!!session.providerErrors.length && <p role="status">{text("networkPartialHelp")}</p>}
    {result && <section aria-label={text("baskets")}>
      <h2>{text("baskets")}</h2><p>{text("subtotalOnly")}</p>
      <div className="deals-store-grid">{result.basket.stores.map((store) => <article className="deals-card" key={store.storeId}>
        <h3>{label(store.storeId)}</h3><p>{text(store.complete ? "complete" : "partial")}</p>
        <p>{text("priced").replace("{priced}", number(store.pricedItemCount)).replace("{total}", number(store.totalItemCount))}</p>
        <p>{text("subtotal")}: <strong>{store.merchandiseSubtotal ? money(store.merchandiseSubtotal) : text("priceUnavailable")}</strong></p>
        {!!store.missingNeedIds.length && <p>{text("missing")}: {store.missingNeedIds.map((id) => snapshot.needs.find((need) => need.id === id)?.shoppingName || text("held")).join(", ")}</p>}
        {result.basket.cheapestCompleteStores.some((winner) => winner.storeId === store.storeId) && <p className="deals-status">{text("networkStoreWinner")}</p>}
      </article>)}</div>
      {result.basket.winnerSuppression && <p role="status">{text(result.basket.winnerSuppression === "invalid-basket" ? "selectStores" : "incomplete")}</p>}
    </section>}
    {!snapshot.needs.length && !snapshot.holds.length && <p className="deals-card">{text("empty")}</p>}
    {snapshot.needs.map((need) => {
      const offers = result?.offers.filter((offer) => offer.needId === need.id) ?? [];
      // Candidate form/basis is evidence to REVIEW, not an automatic target.
      // Only this explicit user's confirmation supplies Phase 4 comparisonBasis.
      const options = formOptions[need.id] ?? [];
      return <article className="deals-card" key={need.id}>
        <h2>{need.shoppingName}</h2>
        {need.identity.status !== "matched" || need.state === "needs-review" ? <p>{text("needsReview")}</p> : null}
        {!!options.length && <label className="deals-choice">{text("networkConfirmForm")}
          <select aria-label={`${text("networkConfirmForm")}: ${need.shoppingName}`} value={basis[need.id] ? JSON.stringify([basis[need.id].productFormKey, basis[need.id].requirementBasis]) : ""}
            onChange={(event) => {
              const index = options.indexOf(event.target.value);
              const evidence = index >= 0 ? JSON.parse(options[index]) as [string, "net" | "drained" | "count"] : null;
              setBasis((previous) => {
                const next = { ...previous }; delete next[need.id];
                if (evidence) next[need.id] = { productFormKey: evidence[0], requirementBasis: evidence[1] };
                return next;
              });
            }}>
            <option value="">{text("networkReviewForm")}</option>
            {options.map((option) => { const [form, content] = JSON.parse(option) as string[];
              return <option key={option} value={option}>{form} · {content}</option>; })}
          </select>
        </label>}
        {!!options.length && !basis[need.id] && <p>{text("networkConfirmFormHelp")}</p>}
        {selected.map((storeId) => {
          const storeOffers = offers.filter((offer) => offer.price.storeId === storeId);
          const issues = session.providerErrors.filter((issue) => issue.storeId === storeId && issue.needId === need.id);
          const missing = issues.some((issue) => issue.failure.reason === "stale-observation") ? "networkStaleObservation"
            : issues.some((issue) => issue.failure.reason === "no-observation") ? "networkNoObservation"
              : issues.length ? "priceUnavailable" : "noMatch";
          return <section className="deals-product" key={storeId} aria-label={`${need.shoppingName}, ${label(storeId)}`}>
            <h3>{label(storeId)}</h3>
            {result && !storeOffers.length && <p role="status">{text(missing)}</p>}
            {storeOffers.map((offer) => {
              const comparison = result?.comparisons.find((entry) => entry.needId === need.id && entry.storeId === storeId)?.result.offers.find((entry) => entry.offerId === offer.id);
              const price = comparison?.packagePrice.value ?? comparison?.unitPrice.value?.money;
              // Comparison results, not page-owned price-selection logic, decide
              // whether any observed amount is eligible to be shown as a price.
              return <div key={offer.id}>
                <p>{packageLabel(offer.packageSize)} · {offer.productFormKey} · {offer.packageSize.basis}</p>
                <p>{text("networkRecentPrice")}: <strong>{comparison?.packagePrice.value ? money(comparison.packagePrice.value)
                  : comparison?.unitPrice.value ? `${money(comparison.unitPrice.value.money)} / ${number(comparison.unitPrice.value.per.quantity)} ${comparison.unitPrice.value.per.unit}`
                    : comparison ? reasonText(comparison.packagePrice.reason!) : text("priceUnavailable")}</strong></p>
                <p>{text("networkObservedAt")}: {dateLabel(offer.price.observedAt)}</p>
                {offer.price.sourceType && <p>{text("networkSource")}: {offer.price.sourceType}</p>}
                {price && <p>{offer.price.regularPrice && <>{text("regular")}: {money(offer.price.regularPrice)} · </>}
                  {offer.price.salePrice && <>{text("sale")}: {money(offer.price.salePrice)}</>}</p>}
                {offer.compatibility !== "verified" && <p>{text("needsReview")}</p>}
              </div>;
            })}
          </section>;
        })}
      </article>;
    })}
    {snapshot.holds.map((hold, index) => <article className="deals-card" key={`${hold.rowId}:${index}`}><h2>{hold.shoppingName || text("held")}</h2>
      <p>{text(hold.reason === "partial-pantry" ? "partialPantry" : "sourceHold")}</p></article>)}
  </>;
}
