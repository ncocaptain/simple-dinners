import { useMemo, useState } from "react";
import type { GroceryRequirementGroup } from "../fulfillment/groceryRequirementSummary";
import {
  krogerProductsToRetailerPackageCandidates,
  type KrogerLocation,
  type KrogerProduct,
} from "../fulfillment/krogerCatalog";
import { rankRetailerPackageCandidates } from "../fulfillment/retailerPackageSolver";

type Props = {
  requirements: GroceryRequirementGroup[];
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
}: Props) {
  const [zip, setZip] = useState("37660");
  const [locations, setLocations] = useState<KrogerLocation[]>([]);
  const [locationId, setLocationId] = useState("");
  const [requirementIndex, setRequirementIndex] = useState(0);
  const [products, setProducts] = useState<KrogerProduct[]>([]);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requirement =
    requirements[requirementIndex] ?? null;

  const ranked = useMemo(() => {
    if (!requirement) return [];

    const candidates =
      krogerProductsToRetailerPackageCandidates(
        products
      );

    return rankRetailerPackageCandidates(
      requirement,
      candidates
    );
  }, [products, requirement]);

  if (!import.meta.env.DEV) {
    return null;
  }

  const loadLocations = async () => {
    setLoading(true);
    setError("");
    setProducts([]);
    setWarning("");

    try {
      const response = await fetch(
        `/api/kroger-catalog?action=locations&zip=${encodeURIComponent(zip)}`
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
    if (!requirement || !locationId) return;

    setLoading(true);
    setError("");
    setProducts([]);
    setWarning("");

    try {
      const term =
        requirement.searchCandidate ||
        requirement.shoppingName;

      const response = await fetch(
        `/api/kroger-catalog?action=products&locationId=${encodeURIComponent(locationId)}&term=${encodeURIComponent(term)}`
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
            DEV ONLY
          </div>
          <h2
            style={{
              fontSize: 18,
              margin: "4px 0 0",
            }}
          >
            Kroger Certification
          </h2>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#86efac",
          }}
        >
          CONNECTED
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          opacity: 0.7,
          lineHeight: 1.5,
        }}
      >
        Test a real Simple Dinners grocery
        requirement against Kroger Certification
        products and the package solver.
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
          Find Kroger Stores
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
            onChange={(event) =>
              setLocationId(event.target.value)
            }
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
              setRequirementIndex(
                Number(event.target.value)
              );
              setProducts([]);
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
            {requirements.map((item, index) => (
              <option
                key={`${item.shoppingName}-${index}`}
                value={index}
              >
                {item.shoppingName} · {item.quantity}{" "}
                {item.unit}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={
              loading ||
              !locationId ||
              !requirement
            }
            onClick={searchProducts}
            style={{
              padding: "11px 12px",
              borderRadius: 10,
              border: "1px solid rgba(96,165,250,0.45)",
              background:
                loading ||
                !locationId ||
                !requirement
                  ? "rgba(59,130,246,0.16)"
                  : "rgba(59,130,246,0.92)",
              color:
                loading ||
                !locationId ||
                !requirement
                  ? "rgba(219,234,254,0.55)"
                  : "#ffffff",
              cursor:
                loading ||
                !locationId ||
                !requirement
                  ? "default"
                  : "pointer",
              fontWeight: 800,
              opacity:
                loading ||
                !locationId ||
                !requirement
                  ? 0.75
                  : 1,
            }}
          >
            Search Kroger for This Requirement
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
            Safe package matches · {ranked.length}
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
                    ? ` · $${product.regularPrice.toFixed(2)}`
                    : ""}
                </div>
              </div>
            );
          })}

          {ranked.length === 0 && (
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              Kroger returned products, but none
              can be safely compared to this
              requirement yet.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
