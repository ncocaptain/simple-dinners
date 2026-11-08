import { useLocation, useNavigate } from "react-router-dom";
import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "../fulfillment/groceryRequirementSummary";
import { buildRetailerMatchPreview } from "../fulfillment/groceryRetailerMatch";
import { GROCERY_DELIVERY_PROVIDERS, getGroceryDeliveryProviderSummary } from "../fulfillment/groceryDeliveryProviders";
import type { GroceryHandoffHold } from "../fulfillment/groceryHandoffFromShopping";
import KrogerCatalogDevPanel from "../components/KrogerCatalogDevPanel";

type ReviewItem = {
  itemId: string;
  reason: string;
  shoppingName: string;
  originalIngredient: string;
};

type GroceryPreviewSnapshot = {
  version: 1;
  createdAt: number;
  rawItems: number;
  mergedRows: number;
  excludedCheckedRows: number;
  excludedCoveredRows: number;
  requirements: GroceryRequirementGroup[];
  searchOnly: GrocerySearchOnlyRequirement[];
  reviews: ReviewItem[];
  holds: GroceryHandoffHold[];
};

const GROCERY_PREVIEW_SNAPSHOT_KEY =
  "simple-dinners:grocery-preview-snapshot";

function readSavedGroceryPreviewSnapshot():
  | GroceryPreviewSnapshot
  | null {
  try {
    const raw = sessionStorage.getItem(
      GROCERY_PREVIEW_SNAPSHOT_KEY
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw) as
      | GroceryPreviewSnapshot
      | null;

    return parsed?.version === 1 &&
      Array.isArray(parsed.requirements) &&
      Array.isArray(parsed.searchOnly) &&
      Array.isArray(parsed.reviews) &&
      Array.isArray(parsed.holds)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function formatFriendlyQuantity(value: number) {
  const whole = Math.floor(value);
  const fraction = Math.round((value - whole) * 100) / 100;

  const fractionLabel =
    fraction === 0.25
      ? "¼"
      : fraction === 0.5
        ? "½"
        : fraction === 0.75
          ? "¾"
          : "";

  if (!fractionLabel) {
    return Number.isInteger(value)
      ? String(value)
      : String(value);
  }

  return whole > 0
    ? `${whole} ${fractionLabel}`
    : fractionLabel;
}

function countLabel(
  name: string,
  quantity: number
) {
  const key = name.toLowerCase().trim();

  const labels: Record<string, [string, string]> = {
    "graham cracker sheets": ["sheet", "sheets"],
    "ready-to-eat vanilla pudding snack cups": ["cup", "cups"],
    "ready-to-eat chocolate pudding snack cups": ["cup", "cups"],
    "ripe bananas": ["banana", "bananas"],
    "vanilla wafer cookies": ["cookie", "cookies"],
    "chocolate sandwich cookies": ["cookie", "cookies"],
    "gummy worms": ["worm", "worms"],
    "tomato": ["tomato", "tomatoes"],
    "tomatoes": ["tomato", "tomatoes"],
  };

  const pair = labels[key];

  if (!pair) {
    return quantity === 1 ? "item" : "items";
  }

  return quantity === 1 ? pair[0] : pair[1];
}

function pluralizeRequirementUnit(
  unit: string,
  quantity: number
) {
  if (
    quantity === 1 ||
    ["lb", "oz", "tsp", "Tbsp"].includes(unit)
  ) {
    return unit;
  }

  const plurals: Record<string, string> = {
    cup: "cups",
    can: "cans",
    packet: "packets",
    package: "packages",
    jar: "jars",
    bag: "bags",
  };

  return plurals[unit] ?? unit;
}

function formatAmount(group: GroceryRequirementGroup) {
  const quantity =
    formatFriendlyQuantity(group.quantity);

  const unit =
    group.unit === "count"
      ? countLabel(
          group.shoppingName,
          group.quantity
        )
      : pluralizeRequirementUnit(
          group.unit,
          group.quantity
        );

  const amount = `${quantity} ${unit}`.trim();

  return group.packageSize
    ? `${amount} · ${group.packageSize} required`
    : amount;
}

export default function GroceryDeliveryPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const candidate = location.state as
    | GroceryPreviewSnapshot
    | null;

  const routedSnapshot =
    candidate?.version === 1 &&
    Array.isArray(candidate.requirements) &&
    Array.isArray(candidate.searchOnly) &&
    Array.isArray(candidate.reviews) &&
    Array.isArray(candidate.holds)
      ? candidate
      : null;

  const snapshot =
    routedSnapshot ??
    readSavedGroceryPreviewSnapshot();

  const retailerPreview = snapshot
    ? buildRetailerMatchPreview(snapshot.requirements)
    : null;

  const deliveryProviderSummary =
    getGroceryDeliveryProviderSummary();

  const panelStyle = {
    padding: 18,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.045)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09111f",
        color: "#f8fafc",
        padding: "24px 16px 150px",
      }}
    >
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/shopping-list")}
          style={{
            background: "transparent",
            color: "#93c5fd",
            border: 0,
            cursor: "pointer",
            padding: "8px 0",
            marginBottom: 18,
          }}
        >
          ← Back to Shopping List
        </button>

        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          Grocery Delivery Preview
        </h1>

        <p style={{ opacity: 0.75, lineHeight: 1.6 }}>
          Review what your recipes need before
          choosing a grocery provider.
        </p>

        {!snapshot ? (
          <section style={{ ...panelStyle, marginTop: 24 }}>
            <h2>Return to your Shopping List</h2>
            <p>
              This preview uses the current Shopping List
              and Pantry decisions. Return to Shopping List
              to generate a fresh snapshot.
            </p>
          </section>
        ) : (
          <>
            <p style={{ opacity: 0.55, fontSize: 12 }}>
              Snapshot created{" "}
              {new Date(snapshot.createdAt).toLocaleString()}.
              Return to Shopping List to refresh it.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(155px, 1fr))",
                gap: 12,
                margin: "24px 0",
              }}
            >
              <div style={panelStyle}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {snapshot.requirements.length}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  Grocery requirements
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {snapshot.reviews.length + snapshot.holds.length}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  Needs review
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {snapshot.excludedCoveredRows}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  Covered by Pantry
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {retailerPreview?.searchReady ?? 0}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  Ready for retailer search
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {retailerPreview?.packageMatchNeeded ?? 0}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  Need package match
                </div>
              </div>
            </div>

            <section>
              <h2 style={{ fontSize: 19, marginBottom: 14 }}>
                Grocery Requirements
              </h2>

              <p style={{ opacity: 0.7, fontSize: 13 }}>
                Recipe amounts are shown here so you can
                review what is needed. Store package sizes
                will be matched when a grocery provider is
                connected.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                {snapshot.requirements.map((group, index) => {
                  const retailerMatch =
                    retailerPreview?.items[index];

                  return (
                  <article
                    key={index}
                    style={panelStyle}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 750,
                            textTransform: "capitalize",
                          }}
                        >
                          {group.shoppingName}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            opacity: 0.72,
                            marginTop: 5,
                          }}
                        >
                          {formatAmount(group)}
                        </div>
                      </div>
                    </div>

                    {retailerMatch && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          borderRadius: 12,
                          background:
                            retailerMatch.status === "search-ready"
                              ? "rgba(34,197,94,0.08)"
                              : "rgba(245,158,11,0.08)",
                          border:
                            retailerMatch.status === "search-ready"
                              ? "1px solid rgba(34,197,94,0.22)"
                              : "1px solid rgba(245,158,11,0.22)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color:
                              retailerMatch.status === "search-ready"
                                ? "#86efac"
                                : "#fcd34d",
                          }}
                        >
                          {retailerMatch.status === "search-ready"
                            ? "READY TO SHOP"
                            : "PACKAGE MATCH NEEDED"}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            opacity: 0.82,
                          }}
                        >
                          {retailerMatch.purchaseTarget}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            marginTop: 4,
                            opacity: 0.58,
                            lineHeight: 1.45,
                          }}
                        >
                          {retailerMatch.reason}
                        </div>
                      </div>
                    )}

                    <details style={{ marginTop: 12 }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          color: "#93c5fd",
                          fontSize: 12,
                        }}
                      >
                        Shopping details
                        {" · "}
                        {group.sourceLines.length}
                      </summary>

                      <div
                        style={{
                          paddingTop: 10,
                          fontSize: 12,
                          lineHeight: 1.7,
                          opacity: 0.8,
                        }}
                      >
                        {group.sourceLines.map((source, i) => (
                          <div key={`${source.itemId}-${i}`}>
                            {source.sourceRecipe || "Manual item"}
                            {" — "}
                            {source.originalIngredient}
                          </div>
                        ))}
                      </div>
                    </details>
                  </article>
                  );
                })}

                {snapshot.requirements.length === 0 && (
                  <div style={panelStyle}>
                    No grocery requirements to show.
                  </div>
                )}
              </div>
            </section>

            {(snapshot.reviews.length > 0 ||
              snapshot.holds.length > 0) && (
              <section style={{ marginTop: 30 }}>
                <h2 style={{ fontSize: 19 }}>
                  A Few Items Need Your Choice
                </h2>

                {snapshot.reviews.map((item, index) => (
                  <div
                    key={`${item.itemId}-${index}`}
                    style={{
                      ...panelStyle,
                      marginTop: 10,
                    }}
                  >
                    <strong>
                      {item.shoppingName || "Ingredient"}
                    </strong>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      {item.originalIngredient}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Reason: {item.reason}
                    </div>
                  </div>
                ))}

                {snapshot.holds.map((hold, index) => (
                  <div
                    key={`${hold.rowId}-${index}`}
                    style={{
                      ...panelStyle,
                      marginTop: 10,
                    }}
                  >
                    <strong>Pantry or source review</strong>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {hold.reason}
                    </div>
                  </div>
                ))}
              </section>
            )}

            <KrogerCatalogDevPanel
              requirements={snapshot.requirements}
              searchOnly={snapshot.searchOnly}
            />

            <section
              style={{
                ...panelStyle,
                marginTop: 30,
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>
                Delivery Partner Readiness
              </h2>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.75,
                  lineHeight: 1.55,
                  marginTop: 0,
                }}
              >
                The grocery handoff is ready for a delivery
                partner. Right now, partner developer access
                is the blocker — not the Simple Dinners
                shopping data.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {GROCERY_DELIVERY_PROVIDERS.map(
                  (provider) => (
                    <div
                      key={provider.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        background:
                          "rgba(255,255,255,0.025)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <strong>{provider.name}</strong>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                            color: "#fcd34d",
                          }}
                        >
                          {provider.status === "setup-required"
                            ? "CERTIFICATION"
                            : "ACCESS PENDING"}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 11,
                          opacity: 0.62,
                          lineHeight: 1.45,
                        }}
                      >
                        {provider.description}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.07)",
                  border:
                    "1px solid rgba(59,130,246,0.18)",
                  fontSize: 11,
                  lineHeight: 1.5,
                  opacity: 0.78,
                }}
              >
                {deliveryProviderSummary.available} providers are live and{" "}
                {deliveryProviderSummary.setupRequired} are in setup/testing.
                Kroger Certification is now connected; customer cart authorization
                remains intentionally disabled during validation.
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
