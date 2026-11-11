import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "../fulfillment/groceryRequirementSummary";

import type {
  GroceryProviderId,
} from "../fulfillment/groceryProviderTypes";

import {
  getEnabledGroceryProviders,
} from "../fulfillment/groceryProviders";

import KrogerCatalogDevPanel from "./KrogerCatalogDevPanel";
import WalmartCatalogDevPanel from "./WalmartCatalogDevPanel";

type Props = {
  requirements:
    GroceryRequirementGroup[];
  searchOnly?:
    GrocerySearchOnlyRequirement[];
};

const GROCERY_PROVIDER_KEY =
  "simple-dinners:grocery-provider";

export default function GroceryProviderWorkspace({
  requirements,
  searchOnly = [],
}: Props) {
  const providers =
    useMemo(
      () =>
        getEnabledGroceryProviders(),
      [],
    );

  const [providerId, setProviderId] =
    useState<GroceryProviderId>(() => {
      try {
        const saved =
          localStorage.getItem(
            GROCERY_PROVIDER_KEY,
          ) as GroceryProviderId | null;

        if (
          saved &&
          providers.some(
            (provider) =>
              provider.id === saved,
          )
        ) {
          return saved;
        }
      } catch {
        // Ignore storage failures.
      }

      return (
        providers[0]?.id ??
        "kroger"
      );
    });

  useEffect(() => {
    if (
      providers.some(
        (provider) =>
          provider.id === providerId,
      )
    ) {
      return;
    }

    if (providers[0]) {
      setProviderId(
        providers[0].id,
      );
    }
  }, [
    providerId,
    providers,
  ]);

  const provider =
    providers.find(
      (item) =>
        item.id === providerId,
    ) ??
    providers[0] ??
    null;

  if (!provider) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: 30,
      }}
    >
      <div
        style={{
          padding: 16,
          borderRadius: 16,
          border:
            "1px solid rgba(255,255,255,0.1)",
          background:
            "rgba(255,255,255,0.045)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing:
              "0.06em",
            color: "#93c5fd",
          }}
        >
          GROCERY PROVIDERS
        </div>

        <h2
          style={{
            margin:
              "5px 0 5px",
            fontSize: 19,
          }}
        >
          Choose where to shop
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            opacity: 0.68,
          }}
        >
          Your Simple Dinners list
          stays the same. The selected
          provider handles store and
          product matching.
        </p>

        {providers.length > 1 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                `repeat(${providers.length}, minmax(0, 1fr))`,
              gap: 8,
              marginTop: 14,
            }}
          >
            {providers.map(
              (item) => {
                const active =
                  item.id ===
                  provider.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() => {
                      setProviderId(
                        item.id,
                      );

                      try {
                        localStorage.setItem(
                          GROCERY_PROVIDER_KEY,
                          item.id,
                        );
                      } catch {
                        // Ignore storage failures.
                      }
                    }}
                    style={{
                      padding:
                        "11px 10px",
                      borderRadius: 11,
                      border:
                        active
                          ? "1px solid rgba(96,165,250,0.55)"
                          : "1px solid rgba(255,255,255,0.1)",
                      background:
                        active
                          ? "rgba(59,130,246,0.16)"
                          : "rgba(255,255,255,0.035)",
                      color:
                        "#f8fafc",
                      cursor:
                        "pointer",
                      fontWeight: 900,
                      fontSize: 12,
                    }}
                  >
                    {item.name}

                    {item.status ===
                      "scaffold" &&
                      import.meta.env.DEV && (
                        <span
                          style={{
                            display:
                              "block",
                            marginTop: 3,
                            fontSize: 9,
                            color:
                              "#fcd34d",
                          }}
                        >
                          DEV
                        </span>
                      )}
                  </button>
                );
              },
            )}
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            padding:
              "11px 12px",
            borderRadius: 11,
            background:
              "rgba(15,23,42,0.58)",
            border:
              "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            {provider.headline}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              lineHeight: 1.5,
              opacity: 0.7,
            }}
          >
            {provider.description}
          </div>
        </div>
      </div>

      {provider.id ===
        "kroger" && (
        <KrogerCatalogDevPanel
          requirements={
            requirements
          }
          searchOnly={
            searchOnly
          }
        />
      )}

      {provider.id ===
        "walmart" && (
        <WalmartCatalogDevPanel
          requirements={
            requirements
          }
          searchOnly={
            searchOnly
          }
        />
      )}
    </section>
  );
}
