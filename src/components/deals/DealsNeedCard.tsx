import { calculateSaleSavings, effectivePrice } from "../../deals/savings";
import { FIXTURE_NOW, type buildFixturePreview, type MatchDecisions } from "../../deals/fixturePreview";
import { measure, money, number, packageLabel, reasonText, text } from "./presentation";

type Preview = ReturnType<typeof buildFixturePreview>;
type Props = {
  item: Preview["comparisons"][number]; products: Preview["products"];
  decisions: MatchDecisions; onDecision: (id: string, decision: "accepted" | "rejected") => void;
};

export default function DealsNeedCard({ item, products, decisions, onDecision }: Props) {
  const { need } = item.target;
  const candidates = products.filter((product) => product.offer.needId === need.id);
  const choose = need.lines.some((line) => line.status === "needs-choice");
  const hasPrices = item.stores.some((store) => store.result.offers.some((offer) => offer.packagePrice.value || offer.unitPrice.value));
  const status = choose ? "chooseIngredient" : need.state === "needs-review" || need.identity.status === "needs-review" ? "needsReview"
    : need.state === "search-only" ? "quantityNeeded" : !candidates.length ? "noMatch"
    : !candidates.some((product) => product.offer.compatibility === "verified") ? "needsReview"
    : !hasPrices ? "priceUnavailable" : "matched";
  return <article className="deals-card">
    <h2>{need.shoppingName}</h2>
    <p className="deals-status">{text(status)}</p>
    {status !== "matched" && <p>{text(`${status}Help`)}</p>}
    <details>
      <summary>{text("details")}</summary>
      <p>{text("original")}: {need.originalIngredients.join("; ")}</p>
      <p>{text("withinStore")}</p>
      {!candidates.length && <p>{text("noMatchHelp")}</p>}
      {candidates.map(({ offer, variant }) => {
        const store = item.stores.find((entry) => entry.storeId === offer.price.retailerId)!;
        const comparison = store.result.offers.find((entry) => entry.offerId === offer.id)!;
        const context = { retailerId: store.storeId, storeId: store.storeId, channel: "in-store" as const, currency: "USD", now: FIXTURE_NOW };
        const current = effectivePrice(offer.price, context);
        const savings = calculateSaleSavings(offer.price, context);
        const name = `${text("sampleProduct")} ${need.shoppingName} — ${text(variant)}`;
        const unit = comparison.unitPrice.value;
        const per = unit?.per.unit === "each" ? 1 : 100;
        return <section className="deals-product" key={offer.id} aria-label={`${name}, ${text(store.storeId)}`}>
          <h3>{name}</h3>
          <p>{text(store.storeId)} · {packageLabel(offer.packageSize)}</p>
          <p>{text("currentPrice")}: <strong>{current.value ? money(current.value) : reasonText(current.reason)}</strong></p>
          {savings.value && <p>{text("regular")}: <s>{money(offer.price.regularPrice!)}</s> · {text("sale")}: {money(offer.price.salePrice!)} · {text("saving")}: {money(savings.value)}</p>}
          <ul className="deals-comparisons">
            {store.result.lowestPackagePriceOfferIds.includes(offer.id) && <li>{text("lowestPackage")}</li>}
            {store.result.lowestUnitPriceOfferIds.includes(offer.id) && <li>{text("lowestUnit")}</li>}
            {store.result.lowestRequirementCostOfferIds.includes(offer.id) && <li>{text("lowestCost")}</li>}
          </ul>
          <p>{text("unitPrice")}: {unit ? `${money({ amountMinor: Math.round(unit.money.amountMinor / unit.per.quantity * per), currency: unit.money.currency })} / ${number(per)} ${unit.per.unit === "each" ? text("each") : unit.per.unit}` : reasonText(comparison.unitPrice.reason!)}</p>
          {comparison.requirementCost.value ? <p>{text("purchaseCost")}: <strong>{money(comparison.requirementCost.value.purchaseCost)}</strong><br />
            {text("packages")}: {number(comparison.requirementCost.value.packagesNeeded)} · {text("excess")}: {measure(comparison.requirementCost.value.excess)}</p>
            : <p>{text("purchaseCost")}: {reasonText(comparison.requirementCost.reason)}</p>}
          <p role="status">{decisions[offer.id] === "rejected" ? text("rejected") : offer.compatibility === "mismatch" ? text("wrongForm")
            : offer.compatibility === "verified" ? text("matched") : text("needsReview")}</p>
          <div className="deals-actions">
            <button type="button" disabled={offer.compatibility === "mismatch"} aria-pressed={decisions[offer.id] === "accepted"}
              aria-label={`${text("accept")} ${name}, ${text(store.storeId)}`} onClick={() => onDecision(offer.id, "accepted")}>{text("accept")}</button>
            <button type="button" aria-pressed={decisions[offer.id] === "rejected"}
              aria-label={`${text("reject")} ${name}, ${text(store.storeId)}`} onClick={() => onDecision(offer.id, "rejected")}>{text("reject")}</button>
          </div>
        </section>;
      })}
    </details>
  </article>;
}
