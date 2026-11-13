import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  buildFixturePreview, FIXTURE_STORES, readDealsRouteSnapshot,
  type DealsRouteSnapshot, type FixtureScenario, type MatchDecisions,
} from "../deals/fixturePreview";
import DealsNeedCard from "../components/deals/DealsNeedCard";
import { money, number, text } from "../components/deals/presentation";
import "../components/deals/Deals.css";

export function DealsWorkspace({ snapshot }: { snapshot: DealsRouteSnapshot }) {
  const [decisions, setDecisions] = useState<MatchDecisions>({});
  const [selectedStores, setSelectedStores] = useState<readonly string[]>(FIXTURE_STORES);
  const [scenario, setScenario] = useState<FixtureScenario>("standard");
  const preview = useMemo(() => buildFixturePreview(snapshot, decisions, selectedStores, scenario), [snapshot, decisions, selectedStores, scenario]);
  const reviews = snapshot.needs.filter((need) => need.state === "needs-review" || need.identity.status === "needs-review").length;
  return <>
    <p>{text("active")}: <strong>{number(snapshot.needs.length)}</strong> · {text("held")}: {number(snapshot.holds.length)} · {text("needsReview")}: {number(reviews)}</p>
    <p>{text("checkedExcluded")}: {number(snapshot.excludedCheckedRows + snapshot.excludedCheckedSources)} · {text("pantryExcluded")}: {number(snapshot.excludedCoveredRows)}</p>
    <fieldset className="deals-card"><legend>{text("stores")}</legend>
      {FIXTURE_STORES.map((id) => <label className="deals-choice" key={id}><input type="checkbox" checked={selectedStores.includes(id)}
        onChange={(event) => setSelectedStores((previous) => event.target.checked ? [...previous, id] : previous.filter((value) => value !== id))} />{text(id)}</label>)}
      <label className="deals-choice">{text("scenario")}<select value={scenario} onChange={(event) => setScenario(event.target.value as FixtureScenario)}>
        <option value="standard">{text("standard")}</option><option value="stale">{text("staleScenario")}</option><option value="inapplicable">{text("inapplicableScenario")}</option>
      </select></label>
    </fieldset>
    {!snapshot.needs.length && !snapshot.holds.length && <p className="deals-card">{text("empty")}</p>}
    {snapshot.needs.length + snapshot.holds.length > 0 && <section aria-label={text("baskets")}>
      <h2>{text("baskets")}</h2><p>{text("subtotalOnly")}</p>
      <div className="deals-store-grid">{preview.basket.stores.map((store) => <article className="deals-card" key={store.storeId}>
        <h3>{text(store.storeId)}</h3><p>{text(store.complete ? "complete" : "partial")}</p>
        <p>{text("priced").replace("{priced}", number(store.pricedItemCount)).replace("{total}", number(store.totalItemCount))}</p>
        <p>{text("subtotal")}: <strong>{store.merchandiseSubtotal ? money(store.merchandiseSubtotal) : text("priceUnavailable")}</strong></p>
        {!!store.missingNeedIds.length && <p>{text("missing")}: {store.missingNeedIds.map((id) => snapshot.needs.find((need) => need.id === id)?.shoppingName || text("held")).join(", ")}</p>}
        {preview.basket.cheapestCompleteStores.some((winner) => winner.storeId === store.storeId) && <p className="deals-status">{text("storeWinner")}</p>}
      </article>)}</div>
      {preview.basket.winnerSuppression && <p role="status">{text(preview.basket.winnerSuppression === "invalid-basket" ? "selectStores" : "incomplete")}</p>}
    </section>}
    <section aria-label={text("items")}>
      {preview.comparisons.map((item) => <DealsNeedCard key={item.target.need.id} item={item} products={preview.products} decisions={decisions}
        onDecision={(id, decision) => setDecisions((previous) => ({ ...previous, [id]: decision }))} />)}
      {snapshot.holds.map((hold, index) => <article className="deals-card" key={`${hold.rowId}:${index}`}><h2>{hold.shoppingName || text("held")}</h2>
        <p className="deals-status">{text("held")}</p><p>{text(hold.reason === "partial-pantry" ? "partialPantry" : "sourceHold")}</p></article>)}
    </section>
  </>;
}

export default function ShoppingDealsPage() {
  const location = useLocation();
  const snapshot = readDealsRouteSnapshot(location.state);
  return <main className="deals-workspace">
    <Link to="/shopping-list" className="deals-back">{text("back")}</Link>
    <h1>{text("title")}</h1><p className="deals-preview-note" role="note">{text("previewNotice")}</p>
    <p>{text("sessionNotice")}</p>
    {snapshot ? <DealsWorkspace key={location.key} snapshot={snapshot} /> : <p className="deals-card">{text("startFromList")}</p>}
  </main>;
}
