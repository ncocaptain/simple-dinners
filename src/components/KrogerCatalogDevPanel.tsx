import { useEffect, useMemo, useState } from "react";
import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "../fulfillment/groceryRequirementSummary";
import {
  buildKrogerManualPackageChoices,
  relevantKrogerProductsToRetailerPackageCandidates,
  type KrogerLocation,
  type KrogerProduct,
} from "../fulfillment/krogerCatalog";
import { rankRetailerPackageCandidates } from "../fulfillment/retailerPackageSolver";
import {
  buildCalculatedKrogerCartSelection,
  buildKrogerCartPreview,
  buildManualKrogerCartSelection,
  groceryRequirementKey,
  type KrogerCartSelection,
} from "../fulfillment/krogerCartPlan";
import {
  addItemsToKrogerCart,
  disconnectKroger,
  getKrogerConnectionStatus,
  startKrogerConnection,
  krogerApiUrl,
} from "../fulfillment/krogerApiClient";

type Props = {
  requirements: GroceryRequirementGroup[];
  searchOnly?: GrocerySearchOnlyRequirement[];
};

type LocationResponse = {
  locations?: KrogerLocation[];
  error?: string;
};

type ProductResponse = {
  products?: KrogerProduct[];
  warning?: string;
  storeFilterApplied?: boolean;
  error?: string;
};

export default function KrogerCatalogDevPanel({
  requirements,
  searchOnly = [],
}: Props) {
  const [zip, setZip] = useState("37660");
  const [locations, setLocations] = useState<KrogerLocation[]>([]);
  const [locationId, setLocationId] = useState("");
  const [requirementIndex, setRequirementIndex] = useState(0);
  const [products, setProducts] = useState<KrogerProduct[]>([]);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualProductId, setManualProductId] =
    useState("");
  const [selections, setSelections] = useState<
    Record<string, KrogerCartSelection>
  >({});
  const [krogerConnected, setKrogerConnected] =
    useState(false);
  const [cartLoading, setCartLoading] =
    useState(false);
  const [cartMessage, setCartMessage] =
    useState("");
  const [krogerEnvironment, setKrogerEnvironment] =
    useState("certification");
  const [lastAddedSignature, setLastAddedSignature] =
    useState("");

  const searchableRequirements = useMemo(
    () => [
      ...requirements.map((item) => ({
        kind: "measured" as const,
        item,
      })),
      ...searchOnly.map((item) => ({
        kind: "search-only" as const,
        item,
      })),
    ],
    [requirements, searchOnly]
  );

  const selectedSearch =
    searchableRequirements[requirementIndex] ?? null;

  const requirement =
    selectedSearch?.kind === "measured"
      ? selectedSearch.item
      : null;

  const searchOnlyRequirement =
    selectedSearch?.kind === "search-only"
      ? selectedSearch.item
      : null;

  const searchTerm =
    requirement?.searchCandidate ||
    searchOnlyRequirement?.searchCandidate ||
    requirement?.shoppingName ||
    searchOnlyRequirement?.shoppingName ||
    "";

  const ranked = useMemo(() => {
    if (!requirement) return [];

    const candidates =
      relevantKrogerProductsToRetailerPackageCandidates(
        searchTerm,
        products
      );

    return rankRetailerPackageCandidates(
      requirement,
      candidates
    );
  }, [products, requirement, searchTerm]);

  const manualChoices = useMemo(
    () =>
      buildKrogerManualPackageChoices(
        searchTerm,
        products
      ),
    [products, searchTerm]
  );

  const manualSelectionRequirement:
    | GroceryRequirementGroup
    | null =
    requirement ??
    (searchOnlyRequirement
      ? {
          shoppingName:
            searchOnlyRequirement.shoppingName,
          searchCandidate:
            searchOnlyRequirement.searchCandidate,
          quantity: 1,
          unit: "package",
          packageSize: "",
          sourceLines: [
            {
              itemId:
                searchOnlyRequirement.itemId,
              sourceRecipe:
                searchOnlyRequirement.sourceRecipe,
              originalIngredient:
                searchOnlyRequirement.originalIngredient,
              quantity: 1,
            },
          ],
          canAutoAddToCart: false,
        }
      : null);

  const requirementKey =
    manualSelectionRequirement
      ? groceryRequirementKey(
          manualSelectionRequirement
        )
      : "";

  const savedSelection =
    requirementKey
      ? selections[requirementKey] ?? null
      : null;

  const selectedManualChoice =
    manualChoices.find(
      (choice) =>
        choice.productId ===
        (savedSelection?.selectionMode ===
        "manual-package-choice"
          ? savedSelection.productId
          : manualProductId)
    ) ?? null;

  const cartPreview = buildKrogerCartPreview(
    Object.values(selections)
  );

  const saveCalculatedSelection = (
    index: number
  ) => {
    if (!requirement) return;

    const solution = ranked[index];
    if (!solution) return;

    const selection =
      buildCalculatedKrogerCartSelection(
        requirement,
        solution,
        products
      );

    if (!selection) return;

    setSelections((current) => ({
      ...current,
      [selection.requirementKey]:
        selection,
    }));
  };

  const saveManualSelection = (
    productId: string
  ) => {
    if (!manualSelectionRequirement) return;

    const product = products.find(
      (item) =>
        item.productId === productId
    );

    if (!product) return;

    const selection =
      buildManualKrogerCartSelection(
        manualSelectionRequirement,
        product
      );

    if (!selection) return;

    setManualProductId(productId);
    setSelections((current) => ({
      ...current,
      [selection.requirementKey]:
        selection,
    }));
  };

  const featureEnabled =
    import.meta.env.DEV ||
    import.meta.env.VITE_KROGER_ENABLED ===
      "true";

  useEffect(() => {
    if (!featureEnabled) {
      return;
    }

    const refreshStatus = async () => {
      try {
        const data =
          await getKrogerConnectionStatus();
        const connected =
          Boolean(data?.connected);

        setKrogerConnected(
          connected
        );
        setKrogerEnvironment(
          data?.environment ||
            "certification"
        );

        return connected;
      } catch {
        setKrogerConnected(false);
        return false;
      }
    };

    const handleMessage = (
      event: MessageEvent
    ) => {
      const allowedOrigins =
        new Set([
          window.location.origin,
          "http://localhost:8787",
        ]);

      if (
        !allowedOrigins.has(
          event.origin
        ) ||
        event.data?.type !==
          "simple-dinners-kroger-oauth"
      ) {
        return;
      }

      if (event.data?.connected) {
        setKrogerConnected(true);
        setCartMessage(
          "Kroger account connected."
        );
      }
    };

    const handleNativeOAuthReturn =
      async () => {
        const raw =
          sessionStorage.getItem(
            "simple-dinners:kroger-oauth-return"
          );

        if (!raw) {
          return;
        }

        sessionStorage.removeItem(
          "simple-dinners:kroger-oauth-return"
        );

        const connected =
          await refreshStatus();

        setCartMessage(
          connected
            ? "Kroger account connected."
            : "Kroger connection was not completed. Try connecting again."
        );
      };

    void refreshStatus();
    void handleNativeOAuthReturn();

    window.addEventListener(
      "message",
      handleMessage
    );

    const handleFocus = () => {
      void handleNativeOAuthReturn();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [featureEnabled]);

  if (!featureEnabled) {
    return null;
  }

  const connectKroger = async () => {
    setCartMessage("");

    try {
      const data =
        await startKrogerConnection();

      window.open(
        data.url,
        "simple-dinners-kroger-oauth",
        "popup=yes,width=520,height=720"
      );
    } catch (nextError) {
      setCartMessage(
        nextError instanceof Error
          ? nextError.message
          : "Unable to start Kroger connection."
      );
    }
  };

  const disconnectKrogerAccount =
    async () => {
      try {
        await disconnectKroger();
        setKrogerConnected(false);
        setCartMessage(
          "Kroger account disconnected."
        );
      } catch (nextError) {
        setCartMessage(
          nextError instanceof Error
            ? nextError.message
            : "Unable to disconnect Kroger."
        );
      }
    };

  const addSelectedToKrogerCart =
    async () => {
      if (!cartPreview.items.length) {
        return;
      }

      setCartLoading(true);
      setCartMessage("");

      try {
        const data =
          await addItemsToKrogerCart(
            cartPreview.items
          );

        setLastAddedSignature(
          JSON.stringify(
            cartPreview.items
          )
        );

        setCartMessage(
          `${data.added} selected item${data.added === 1 ? "" : "s"} added to the Kroger cart.`
        );
      } catch (nextError) {
        setCartMessage(
          nextError instanceof Error
            ? nextError.message
            : "Kroger cart add failed"
        );
      } finally {
        setCartLoading(false);
      }
    };

  const loadLocations = async () => {
    setLoading(true);
    setError("");
    setProducts([]);
    setWarning("");
    setManualProductId("");
    setSelections({});

    try {
      const response = await fetch(
        krogerApiUrl(`/api/kroger-catalog?action=locations&zip=${encodeURIComponent(zip)}`)
      );
      const data =
        (await response.json()) as LocationResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Kroger location lookup failed"
        );
      }

      const next = data.locations ?? [];
      setLocations(next);
      setLocationId(
        next[0]?.locationId ?? ""
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Kroger location lookup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!selectedSearch || !locationId) return;

    setLoading(true);
    setError("");
    setProducts([]);
    setWarning("");
    setManualProductId("");

    try {
      const term = searchTerm;

      const response = await fetch(
        krogerApiUrl(`/api/kroger-catalog?action=products&locationId=${encodeURIComponent(locationId)}&term=${encodeURIComponent(term)}`)
      );
      const data =
        (await response.json()) as ProductResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Kroger product search failed"
        );
      }

      setProducts(data.products ?? []);
      setWarning(data.warning ?? "");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Kroger product search failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedLocation = locations.find(
    (location) =>
      location.locationId === locationId
  );

  return (
    <section
      style={{
        marginTop: 30,
        padding: 18,
        borderRadius: 16,
        border: "1px solid rgba(96,165,250,0.25)",
        background: "rgba(59,130,246,0.06)",
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
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#93c5fd",
              letterSpacing: "0.05em",
            }}
          >
            {import.meta.env.DEV
              ? "DEV ONLY"
              : "KROGER"}
          </div>
          <h2
            style={{
              fontSize: 18,
              margin: "4px 0 0",
            }}
          >
            {krogerEnvironment ===
            "production"
              ? "Kroger"
              : "Kroger"}
          </h2>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: krogerConnected
              ? "#86efac"
              : "rgba(248,250,252,0.55)",
          }}
        >
          {krogerConnected
            ? "CONNECTED"
            : "NOT CONNECTED"}
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          opacity: 0.7,
          lineHeight: 1.5,
        }}
      >
        Match your Simple Dinners shopping
        list to products available at Kroger.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
        }}
      >
        <input
          value={zip}
          onChange={(event) =>
            setZip(event.target.value)
          }
          placeholder="ZIP code"
          inputMode="numeric"
          style={{
            padding: "11px 12px",
            borderRadius: 10,
            border:
              "1px solid rgba(255,255,255,0.14)",
            background: "#0f172a",
            color: "#f8fafc",
          }}
        />

        <button
          type="button"
          disabled={loading}
          onClick={loadLocations}
          style={{
            padding: "11px 12px",
            borderRadius: 10,
            border: "1px solid rgba(96,165,250,0.45)",
            background: loading
              ? "rgba(59,130,246,0.16)"
              : "rgba(59,130,246,0.92)",
            color: loading
              ? "rgba(219,234,254,0.55)"
              : "#ffffff",
            cursor: loading ? "default" : "pointer",
            fontWeight: 800,
            opacity: loading ? 0.75 : 1,
          }}
        >
          Find My Kroger Store
        </button>
      </div>

      {locations.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 12,
          }}
        >
          <select
            value={locationId}
            onChange={(event) => {
              setLocationId(event.target.value);
              setProducts([]);
              setManualProductId("");
              setSelections({});
            }}
            style={{
              padding: "11px 12px",
              borderRadius: 10,
              background: "#0f172a",
              color: "#f8fafc",
              border:
                "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {locations.map((location) => (
              <option
                key={location.locationId}
                value={location.locationId}
              >
                {location.name} · {location.city},{" "}
                {location.state}
              </option>
            ))}
          </select>

          <select
            value={requirementIndex}
            onChange={(event) => {
              const nextIndex = Number(
                event.target.value
              );
              setRequirementIndex(nextIndex);
              setProducts([]);
              const nextEntry =
                searchableRequirements[nextIndex];
              const nextRequirement =
                nextEntry?.kind === "measured"
                  ? nextEntry.item
                  : nextEntry?.kind === "search-only"
                    ? {
                        shoppingName:
                          nextEntry.item.shoppingName,
                        searchCandidate:
                          nextEntry.item.searchCandidate,
                        quantity: 1,
                        unit: "package",
                        packageSize: "",
                        sourceLines: [
                          {
                            itemId:
                              nextEntry.item.itemId,
                            sourceRecipe:
                              nextEntry.item.sourceRecipe,
                            originalIngredient:
                              nextEntry.item.originalIngredient,
                            quantity: 1,
                          },
                        ],
                        canAutoAddToCart:
                          false as const,
                      }
                    : null;
              const nextKey =
                nextRequirement
                  ? groceryRequirementKey(
                      nextRequirement
                    )
                  : "";
              const nextSelection =
                nextKey
                  ? selections[nextKey]
                  : null;
              setManualProductId(
                nextSelection?.selectionMode ===
                  "manual-package-choice"
                  ? nextSelection.productId
                  : ""
              );
            }}
            style={{
              padding: "11px 12px",
              borderRadius: 10,
              background: "#0f172a",
              color: "#f8fafc",
              border:
                "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {searchableRequirements.map(
              (entry, index) => {
                if (entry.kind === "measured") {
                  const item = entry.item;

                  return (
                    <option
                      key={`${item.shoppingName}-${index}`}
                      value={index}
                    >
                      {item.shoppingName} · {item.quantity}{" "}
                      {item.unit}
                    </option>
                  );
                }

                const item = entry.item;

                return (
                  <option
                    key={`search-only-${item.itemId}`}
                    value={index}
                  >
                    {item.shoppingName} · choose product
                  </option>
                );
              }
            )}
          </select>

          <button
            type="button"
            disabled={
              loading ||
              !locationId ||
              !selectedSearch
            }
            onClick={searchProducts}
            style={{
              padding: "11px 12px",
              borderRadius: 10,
              border: "1px solid rgba(96,165,250,0.45)",
              background:
                loading ||
                !locationId ||
                !selectedSearch
                  ? "rgba(59,130,246,0.16)"
                  : "rgba(59,130,246,0.92)",
              color:
                loading ||
                !locationId ||
                !selectedSearch
                  ? "rgba(219,234,254,0.55)"
                  : "#ffffff",
              cursor:
                loading ||
                !locationId ||
                !selectedSearch
                  ? "default"
                  : "pointer",
              fontWeight: 800,
              opacity:
                loading ||
                !locationId ||
                !selectedSearch
                  ? 0.75
                  : 1,
            }}
          >
            Find Kroger Products
          </button>
        </div>
      )}

      {selectedLocation && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            opacity: 0.65,
          }}
        >
          Store: {selectedLocation.name} ·{" "}
          {selectedLocation.addressLine1}
        </div>
      )}

      {warning && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "#fcd34d",
          }}
        >
          {warning}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          padding: "12px",
          borderRadius: 12,
          border:
            "1px solid rgba(96,165,250,0.22)",
          background:
            "rgba(15,23,42,0.55)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Kroger Account
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                opacity: 0.68,
              }}
            >
              {krogerConnected
                ? krogerEnvironment ===
                  "production"
                  ? "Connected to your Kroger account."
                  : "Connected to your Kroger account."
                : "Connect before sending selected products to the Kroger cart."}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
          <button
            type="button"
            onClick={connectKroger}
            style={{
              padding: "9px 12px",
              borderRadius: 9,
              border:
                krogerConnected
                  ? "1px solid rgba(34,197,94,0.35)"
                  : "1px solid rgba(96,165,250,0.4)",
              background:
                krogerConnected
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(59,130,246,0.18)",
              color: "#f8fafc",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            {krogerConnected
              ? "Reconnect Kroger"
              : "Connect Kroger Account"}
          </button>

          {krogerConnected && (
            <button
              type="button"
              onClick={
                disconnectKrogerAccount
              }
              style={{
                padding: "9px 12px",
                borderRadius: 9,
                border:
                  "1px solid rgba(248,113,113,0.28)",
                background:
                  "rgba(127,29,29,0.18)",
                color: "#fecaca",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Disconnect
            </button>
          )}
          </div>
        </div>
      </div>

      {Object.keys(selections).length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border:
              "1px solid rgba(34,197,94,0.22)",
            background:
              "rgba(34,197,94,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#86efac",
            }}
          >
            YOUR KROGER CART ·{" "}
            {cartPreview.selectionCount} selected
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              opacity: 0.75,
              lineHeight: 1.5,
            }}
          >
            Review these selections before
            sending them to Kroger.
          </div>

          <div
            style={{
              display: "grid",
              gap: 6,
              marginTop: 10,
            }}
          >
            {Object.values(
              selections
            ).map((selection) => (
              <div
                key={
                  selection.requirementKey
                }
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 12,
                  fontSize: 11,
                  padding: "7px 9px",
                  borderRadius: 8,
                  background:
                    "rgba(255,255,255,0.035)",
                }}
              >
                <span>
                  {selection.description}
                  {selection.size
                    ? ` · ${selection.size}`
                    : ""}
                </span>
                <strong>
                  × {selection.quantity}
                </strong>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={
              !krogerConnected ||
              cartLoading ||
              cartPreview.selectionCount === 0 ||
              lastAddedSignature ===
                JSON.stringify(
                cartPreview.items
              )
            }
            onClick={
              addSelectedToKrogerCart
            }
            style={{
              marginTop: 10,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 9,
              border:
                "1px solid rgba(34,197,94,0.32)",
              background:
                !krogerConnected ||
                cartLoading ||
                lastAddedSignature ===
                  JSON.stringify(
                cartPreview.items
              )
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(34,197,94,0.2)",
              color:
                !krogerConnected ||
                cartLoading ||
                lastAddedSignature ===
                  JSON.stringify(
                cartPreview.items
              )
                  ? "rgba(220,252,231,0.5)"
                  : "#dcfce7",
              fontWeight: 800,
              cursor:
                !krogerConnected ||
                cartLoading ||
                lastAddedSignature ===
                  JSON.stringify(
                cartPreview.items
              )
                  ? "default"
                  : "pointer",
            }}
          >
            {cartLoading
              ? "Adding to Kroger Cart..."
              : lastAddedSignature ===
                  JSON.stringify(
                cartPreview.items
              )
                ? "Already Added to Kroger Cart"
                : `Add ${cartPreview.selectionCount} Selected Item${cartPreview.selectionCount === 1 ? "" : "s"} to Kroger Cart`}
          </button>

          {lastAddedSignature ===
            JSON.stringify(
                cartPreview.items
              ) && (
              <button
                type="button"
                onClick={() =>
                  setLastAddedSignature("")
                }
                style={{
                  marginTop: 8,
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  color: "#93c5fd",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                I want to add these items again
              </button>
            )}

          {cartMessage && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                lineHeight: 1.45,
                opacity: 0.82,
              }}
            >
              {cartMessage}
            </div>
          )}
        </div>
      )}

      {products.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Recommended package matches · {ranked.length}
          </div>

          {ranked.slice(0, 5).map((result, index) => {
            const product = products.find(
              (item) =>
                item.productId ===
                result.candidate.id
            );

            return (
              <div
                key={result.candidate.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background:
                    index === 0
                      ? "rgba(34,197,94,0.09)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    index === 0
                      ? "1px solid rgba(34,197,94,0.25)"
                      : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {index === 0
                    ? "BEST SAFE MATCH · "
                    : ""}
                  {result.candidate.productName}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    opacity: 0.75,
                  }}
                >
                  {product?.size || "Package size"} · buy{" "}
                  {result.packagesNeeded}
                  {product?.regularPrice !== null &&
                  product?.regularPrice !== undefined
                    ? ` · ${product.regularPrice.toFixed(2)}`
                    : ""}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    saveCalculatedSelection(
                      index
                    )
                  }
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border:
                      savedSelection?.productId ===
                        result.candidate.id
                        ? "1px solid rgba(34,197,94,0.45)"
                        : "1px solid rgba(96,165,250,0.3)",
                    background:
                      savedSelection?.productId ===
                        result.candidate.id
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(59,130,246,0.14)",
                    color: "#f8fafc",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  {savedSelection?.productId ===
                  result.candidate.id
                    ? "Selected for Kroger"
                    : "Use this match"}
                </button>
              </div>
            );
          })}

          {ranked.length === 0 &&
            manualChoices.length > 0 && (
              <div
                style={{
                  marginTop: 4,
                  padding: "12px",
                  borderRadius: 12,
                  border:
                    "1px solid rgba(245,158,11,0.24)",
                  background:
                    "rgba(245,158,11,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fcd34d",
                  }}
                >
                  CHOOSE YOUR PRODUCT
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 11,
                    lineHeight: 1.5,
                    opacity: 0.78,
                  }}
                >
                  Choose the Kroger product and
                  package size you want to buy.
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {manualChoices
                    .slice(0, 5)
                    .map((choice) => {
                      const selected =
                        savedSelection?.productId ===
                        choice.productId;

                      const displayPrice =
                        choice.promoPrice ??
                        choice.regularPrice;

                      return (
                        <button
                          key={choice.productId}
                          type="button"
                          onClick={() =>
                            saveManualSelection(
                              choice.productId
                            )
                          }
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: selected
                              ? "1px solid rgba(34,197,94,0.45)"
                              : "1px solid rgba(255,255,255,0.09)",
                            background: selected
                              ? "rgba(34,197,94,0.09)"
                              : "rgba(255,255,255,0.03)",
                            color: "#f8fafc",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {selected
                              ? "SELECTED · "
                              : ""}
                            {choice.description}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              opacity: 0.72,
                            }}
                          >
                            {choice.size ||
                              "Package size unavailable"}
                            {displayPrice !== null
                              ? ` · ${displayPrice.toFixed(2)}`
                              : ""}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {selectedManualChoice && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "9px 10px",
                      borderRadius: 9,
                      background:
                        "rgba(34,197,94,0.08)",
                      border:
                        "1px solid rgba(34,197,94,0.2)",
                      fontSize: 11,
                      lineHeight: 1.45,
                    }}
                  >
                    Selected for your Kroger cart:{" "}
                    <strong>
                      {selectedManualChoice.description}
                    </strong>
                    .
                  </div>
                )}
              </div>
            )}

          {ranked.length === 0 &&
            manualChoices.length === 0 && (
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              Kroger returned products, but none
              passed both grocery relevance and
              safe package matching for this
              requirement.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
