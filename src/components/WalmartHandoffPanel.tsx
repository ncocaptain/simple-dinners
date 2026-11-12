import {
  useMemo,
  useState,
} from "react";

import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "../fulfillment/groceryRequirementSummary";

import {
  buildWalmartSearchIntents,
} from "../fulfillment/walmartApiClient";

import {
  WALMART_ASSOCIATE_DISCLOSURE,
  WALMART_HANDOFF_NOTE,
} from "../fulfillment/walmartDisclosure";

type Props = {
  requirements:
    GroceryRequirementGroup[];
  searchOnly?:
    GrocerySearchOnlyRequirement[];
};

function walmartSearchUrl(
  value: string,
) {
  const query =
    String(value || "")
      .trim();

  return (
    "https://www.walmart.com/search?q=" +
    encodeURIComponent(query)
  );
}

function amountLabel(
  quantity: number | null,
  unit: string | null,
) {
  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return "Choose the amount you need";
  }

  const rounded =
    Number.isInteger(quantity)
      ? String(quantity)
      : String(
          Math.round(quantity * 100) / 100,
        );

  return [
    rounded,
    unit || "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function WalmartHandoffPanel({
  requirements,
  searchOnly = [],
}: Props) {
  const intents =
    useMemo(
      () =>
        buildWalmartSearchIntents(
          requirements,
          searchOnly,
        ),
      [
        requirements,
        searchOnly,
      ],
    );

  const [copied, setCopied] =
    useState(false);

  async function copyList() {
    const value =
      intents
        .map(
          (intent) =>
            `${intent.shoppingName} — ${amountLabel(
              intent.quantity,
              intent.unit,
            )}`,
        )
        .join("\n");

    if (
      !value ||
      !navigator.clipboard
        ?.writeText
    ) {
      return;
    }

    await navigator.clipboard
      .writeText(value);

    setCopied(true);

    window.setTimeout(
      () =>
        setCopied(false),
      1800,
    );
  }

  return (
    <section
      style={{
        marginTop: 30,
        padding: 18,
        borderRadius: 16,
        border:
          "1px solid rgba(37,99,235,0.24)",
        background:
          "rgba(37,99,235,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing:
                "0.06em",
              color: "#60a5fa",
            }}
          >
            WALMART HANDOFF
          </div>

          <h2
            style={{
              margin:
                "4px 0 0",
              fontSize: 18,
            }}
          >
            Shop your list at Walmart
          </h2>

          <p
            style={{
              margin:
                "7px 0 0",
              maxWidth: 580,
              fontSize: 12,
              lineHeight: 1.55,
              opacity: 0.72,
            }}
          >
            Open each grocery item on
            Walmart, choose the product
            you want, and complete your
            order directly with Walmart.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void copyList()
          }
          disabled={
            intents.length === 0
          }
          style={{
            padding:
              "9px 11px",
            borderRadius: 10,
            border:
              "1px solid rgba(96,165,250,0.34)",
            background:
              "rgba(37,99,235,0.14)",
            color: "#dbeafe",
            fontSize: 11,
            fontWeight: 900,
            cursor:
              intents.length
                ? "pointer"
                : "default",
          }}
        >
          {copied
            ? "Copied"
            : "Copy List"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginTop: 16,
        }}
      >
        {intents.map(
          (intent) => (
            <article
              key={
                intent.key
              }
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) auto",
                gap: 12,
                alignItems:
                  "center",
                padding:
                  "11px 12px",
                borderRadius: 11,
                border:
                  "1px solid rgba(255,255,255,0.08)",
                background:
                  "rgba(15,23,42,0.46)",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    textTransform:
                      "capitalize",
                  }}
                >
                  {
                    intent.shoppingName
                  }
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    opacity: 0.64,
                  }}
                >
                  {amountLabel(
                    intent.quantity,
                    intent.unit,
                  )}
                  {intent.packageSize
                    ? ` · ${intent.packageSize}`
                    : ""}
                </div>
              </div>

              <a
                href={walmartSearchUrl(
                  intent.searchCandidate ||
                    intent.shoppingName,
                )}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:
                    "9px 10px",
                  borderRadius: 9,
                  border:
                    "1px solid rgba(96,165,250,0.4)",
                  background:
                    "rgba(37,99,235,0.16)",
                  color:
                    "#dbeafe",
                  fontSize: 11,
                  fontWeight: 900,
                  textDecoration:
                    "none",
                  whiteSpace:
                    "nowrap",
                }}
              >
                Search Walmart
              </a>
            </article>
          ),
        )}

        {intents.length === 0 && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background:
                "rgba(255,255,255,0.035)",
              fontSize: 12,
              opacity: 0.68,
            }}
          >
            No grocery items are ready
            for Walmart yet.
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          padding:
            "11px 12px",
          borderRadius: 10,
          border:
            "1px solid rgba(255,255,255,0.08)",
          background:
            "rgba(15,23,42,0.5)",
          fontSize: 10,
          lineHeight: 1.55,
          opacity: 0.62,
        }}
      >
        <div>
          {
            WALMART_ASSOCIATE_DISCLOSURE
          }
        </div>

        <div
          style={{
            marginTop: 4,
          }}
        >
          {
            WALMART_HANDOFF_NOTE
          }
        </div>
      </div>
    </section>
  );
}
