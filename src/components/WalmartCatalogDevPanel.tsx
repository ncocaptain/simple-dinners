import {
  useMemo,
  useState,
} from "react";

import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "../fulfillment/groceryRequirementSummary";

import {
  buildWalmartCart,
  buildWalmartSearchIntents,
  findWalmartStores,
  searchWalmartProducts,
  type WalmartProduct,
  type WalmartStore,
} from "../fulfillment/walmartApiClient";

type Props = {
  requirements:
    GroceryRequirementGroup[];
  searchOnly?:
    GrocerySearchOnlyRequirement[];
};

type SelectedProduct = {
  intentKey: string;
  shoppingName: string;
  product: WalmartProduct;
  quantity: number;
};

export default function WalmartCatalogDevPanel({
  requirements,
  searchOnly = [],
}: Props) {
  const featureEnabled =
    import.meta.env.DEV;

  const intents =
    useMemo(
      () =>
        buildWalmartSearchIntents(
          requirements,
          searchOnly,
        ),
      [requirements, searchOnly],
    );

  const [zip, setZip] =
    useState("37664");

  const [stores, setStores] =
    useState<WalmartStore[]>([]);

  const [storeId, setStoreId] =
    useState("");

  const [intentIndex, setIntentIndex] =
    useState(0);

  const [products, setProducts] =
    useState<WalmartProduct[]>([]);

  const [selected, setSelected] =
    useState<
      Record<string, SelectedProduct>
    >({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cartUrl, setCartUrl] =
    useState("");

  const currentIntent =
    intents[intentIndex] ?? null;

  if (!featureEnabled) {
    return null;
  }

  async function loadStores() {
    setLoading(true);
    setError("");
    setProducts([]);
    setCartUrl("");

    try {
      const data =
        await findWalmartStores(
          zip,
        );

      setStores(
        data.stores ?? [],
      );

      setStoreId(
        data.stores?.[0]
          ?.storeId ?? "",
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Walmart store lookup failed",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    if (
      !currentIntent ||
      !storeId
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setProducts([]);
    setCartUrl("");

    try {
      const data =
        await searchWalmartProducts(
          currentIntent.searchCandidate ||
            currentIntent.shoppingName,
          storeId,
        );

      setProducts(
        data.products ?? [],
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Walmart product search failed",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectProduct(
    product: WalmartProduct,
  ) {
    if (!currentIntent) {
      return;
    }

    const quantity =
      currentIntent.quantity &&
      currentIntent.quantity > 0
        ? Math.max(
            1,
            Math.ceil(
              currentIntent.quantity,
            ),
          )
        : 1;

    setSelected(
      (current) => ({
        ...current,
        [currentIntent.key]: {
          intentKey:
            currentIntent.key,
          shoppingName:
            currentIntent.shoppingName,
          product,
          quantity,
        },
      }),
    );

    setCartUrl("");
  }

  async function createCart() {
    const selections =
      Object.values(
        selected,
      );

    if (
      selections.length === 0
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setCartUrl("");

    try {
      const data =
        await buildWalmartCart(
          selections.map(
            (selection) => ({
              productId:
                selection.product
                  .productId,
              quantity:
                selection.quantity,
            }),
          ),
        );

      setCartUrl(
        data.cartUrl,
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Walmart cart handoff failed",
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedStore =
    stores.find(
      (store) =>
        store.storeId ===
        storeId,
    );

  const currentSelection =
    currentIntent
      ? selected[
          currentIntent.key
        ] ?? null
      : null;

  return (
    <section
      style={{
        marginTop: 30,
        padding: 18,
        borderRadius: 16,
        border:
          "1px solid rgba(59,130,246,0.28)",
        background:
          "rgba(37,99,235,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#60a5fa",
              letterSpacing:
                "0.06em",
            }}
          >
            DEV ONLY · WALMART MOCK
          </div>

          <h2
            style={{
              margin:
                "4px 0 0",
              fontSize: 18,
            }}
          >
            Walmart Provider Test
          </h2>
        </div>

        <span
          style={{
            padding:
              "4px 8px",
            borderRadius: 999,
            background:
              "rgba(34,197,94,0.1)",
            border:
              "1px solid rgba(34,197,94,0.24)",
            color: "#86efac",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          MOCK MODE
        </span>
      </div>

      <p
        style={{
          margin:
            "10px 0 16px",
          fontSize: 12,
          lineHeight: 1.5,
          opacity: 0.72,
        }}
      >
        Proves the Simple Dinners
        Walmart flow before live
        Walmart OPD access is enabled.
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
            setZip(
              event.target.value,
            )
          }
          placeholder="ZIP code"
          inputMode="numeric"
          style={{
            padding:
              "11px 12px",
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
          onClick={loadStores}
          style={{
            padding:
              "11px 12px",
            borderRadius: 10,
            border:
              "1px solid rgba(96,165,250,0.45)",
            background:
              loading
                ? "rgba(59,130,246,0.15)"
                : "rgba(37,99,235,0.9)",
            color: "#fff",
            fontWeight: 800,
            cursor:
              loading
                ? "default"
                : "pointer",
          }}
        >
          Find Walmart Stores
        </button>
      </div>

      {stores.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 12,
          }}
        >
          <select
            value={storeId}
            onChange={(event) => {
              setStoreId(
                event.target.value,
              );
              setProducts([]);
              setCartUrl("");
            }}
            style={{
              padding:
                "11px 12px",
              borderRadius: 10,
              border:
                "1px solid rgba(255,255,255,0.14)",
              background: "#0f172a",
              color: "#f8fafc",
            }}
          >
            {stores.map(
              (store) => (
                <option
                  key={
                    store.storeId
                  }
                  value={
                    store.storeId
                  }
                >
                  {store.name} ·{" "}
                  {store.city},{" "}
                  {store.state}
                </option>
              ),
            )}
          </select>

          {intents.length > 0 && (
            <select
              value={
                intentIndex
              }
              onChange={(event) => {
                setIntentIndex(
                  Number(
                    event.target
                      .value,
                  ),
                );
                setProducts([]);
                setCartUrl("");
              }}
              style={{
                padding:
                  "11px 12px",
                borderRadius: 10,
                border:
                  "1px solid rgba(255,255,255,0.14)",
                background:
                  "#0f172a",
                color:
                  "#f8fafc",
              }}
            >
              {intents.map(
                (
                  intent,
                  index,
                ) => (
                  <option
                    key={
                      intent.key
                    }
                    value={
                      index
                    }
                  >
                    {
                      intent.shoppingName
                    }
                    {intent.quantity
                      ? ` · ${intent.quantity} ${intent.unit || ""}`.trim()
                      : " · choose product"}
                  </option>
                ),
              )}
            </select>
          )}

          <button
            type="button"
            disabled={
              loading ||
              !storeId ||
              !currentIntent
            }
            onClick={
              loadProducts
            }
            style={{
              padding:
                "11px 12px",
              borderRadius: 10,
              border:
                "1px solid rgba(96,165,250,0.45)",
              background:
                loading ||
                !storeId ||
                !currentIntent
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(37,99,235,0.9)",
              color: "#fff",
              fontWeight: 800,
              cursor:
                loading ||
                !storeId ||
                !currentIntent
                  ? "default"
                  : "pointer",
            }}
          >
            Find Walmart Products
          </button>
        </div>
      )}

      {selectedStore && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            opacity: 0.65,
          }}
        >
          Store:{" "}
          {selectedStore.name} ·{" "}
          {selectedStore.address},{" "}
          {selectedStore.city},{" "}
          {selectedStore.state}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 12,
            color: "#fca5a5",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {products.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 8,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            WALMART MATCHES ·{" "}
            {products.length}
          </div>

          {products.map(
            (product) => {
              const isSelected =
                currentSelection
                  ?.product
                  .productId ===
                product.productId;

              return (
                <button
                  key={
                    product.productId
                  }
                  type="button"
                  onClick={() =>
                    selectProduct(
                      product,
                    )
                  }
                  style={{
                    textAlign:
                      "left",
                    padding:
                      "12px",
                    borderRadius:
                      11,
                    border:
                      isSelected
                        ? "1px solid rgba(34,197,94,0.48)"
                        : "1px solid rgba(255,255,255,0.09)",
                    background:
                      isSelected
                        ? "rgba(34,197,94,0.09)"
                        : "rgba(255,255,255,0.035)",
                    color:
                      "#f8fafc",
                    cursor:
                      "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {isSelected
                      ? "SELECTED · "
                      : ""}
                    {product.name}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      opacity: 0.72,
                    }}
                  >
                    {product.brand ||
                      "Walmart"}
                    {typeof product.price ===
                    "number"
                      ? ` · $${product.price.toFixed(2)}`
                      : ""}
                    {product.available ===
                    true
                      ? " · Available"
                      : ""}
                  </div>
                </button>
              );
            },
          )}
        </div>
      )}

      {Object.keys(
        selected,
      ).length > 0 && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
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
              fontWeight: 900,
              color: "#86efac",
            }}
          >
            YOUR WALMART CART ·{" "}
            {
              Object.keys(
                selected,
              ).length
            }{" "}
            selected
          </div>

          <div
            style={{
              display: "grid",
              gap: 6,
              marginTop: 10,
            }}
          >
            {Object.values(
              selected,
            ).map(
              (selection) => (
                <div
                  key={
                    selection.intentKey
                  }
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    padding:
                      "8px 9px",
                    borderRadius: 8,
                    background:
                      "rgba(255,255,255,0.035)",
                    fontSize: 11,
                  }}
                >
                  <span>
                    {
                      selection
                        .product
                        .name
                    }
                  </span>

                  <strong>
                    ×{" "}
                    {
                      selection.quantity
                    }
                  </strong>
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={
              createCart
            }
            style={{
              width: "100%",
              marginTop: 10,
              padding:
                "11px 12px",
              borderRadius: 10,
              border:
                "1px solid rgba(34,197,94,0.35)",
              background:
                loading
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(34,197,94,0.18)",
              color:
                "#dcfce7",
              fontWeight: 900,
              cursor:
                loading
                  ? "default"
                  : "pointer",
            }}
          >
            {loading
              ? "Building Walmart Cart..."
              : "Build Walmart Cart Handoff"}
          </button>

          {cartUrl && (
            <div
              style={{
                marginTop: 10,
                display: "grid",
                gap: 8,
              }}
            >
              <div
                style={{
                  padding:
                    "9px 10px",
                  borderRadius: 9,
                  background:
                    "rgba(59,130,246,0.08)",
                  border:
                    "1px solid rgba(96,165,250,0.18)",
                  fontSize: 11,
                  lineHeight: 1.45,
                  wordBreak:
                    "break-all",
                }}
              >
                Mock cart ready:
                {" "}
                {cartUrl}
              </div>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    cartUrl,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                style={{
                  padding:
                    "10px 12px",
                  borderRadius: 9,
                  border:
                    "1px solid rgba(96,165,250,0.4)",
                  background:
                    "rgba(37,99,235,0.18)",
                  color:
                    "#dbeafe",
                  fontWeight: 900,
                  cursor:
                    "pointer",
                }}
              >
                Open Mock Walmart Cart
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
