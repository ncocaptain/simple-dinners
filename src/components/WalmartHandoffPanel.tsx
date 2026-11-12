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
  type WalmartSearchIntent,
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

const PRODUCE_WORDS = [
  "apple",
  "apples",
  "banana",
  "bananas",
  "blueberries",
  "blueberry",
  "strawberries",
  "strawberry",
  "tomato",
  "tomatoes",
  "onion",
  "onions",
  "avocado",
  "avocados",
  "lemon",
  "lemons",
  "lime",
  "limes",
  "orange",
  "oranges",
  "pepper",
  "peppers",
  "potato",
  "potatoes",
  "carrot",
  "carrots",
  "cucumber",
  "cucumbers",
  "zucchini",
  "spinach",
  "spring mix",
  "lettuce",
  "garlic",
  "kiwi",
];

const PACKAGE_WORDS = [
  "cheese",
  "bread",
  "tortilla",
  "chips",
  "crackers",
  "cookies",
  "cereal",
  "pasta",
  "rice",
  "sauce",
  "dressing",
  "yogurt",
  "cream",
  "sausage",
  "bacon",
  "chicken",
  "beef",
  "pork",
  "turkey",
  "berries",
];

const VOLUME_UNITS = new Set([
  "cup",
  "Tbsp",
  "tsp",
  "ml",
  "l",
]);

const PLURAL_UNITS: Record<string, string> = {
  can: "cans",
  package: "packages",
  packet: "packets",
  box: "boxes",
  jar: "jars",
  carton: "cartons",
  bag: "bags",
  bunch: "bunches",
  head: "heads",
  clove: "cloves",
  count: "count",
  ear: "ears",
  lb: "lb",
  oz: "oz",
  cup: "cups",
  Tbsp: "Tbsp",
  tsp: "tsp",
  ml: "ml",
  l: "l",
};

function normalized(
  value: string,
) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(
  value: string,
  words: readonly string[],
) {
  const text =
    normalized(value);

  return words.some(
    (word) =>
      text.includes(word),
  );
}

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

function friendlyNumber(
  value: number,
) {
  return Number.isInteger(value)
    ? String(value)
    : String(
        Math.round(value * 100) / 100,
      );
}

function unitLabel(
  quantity: number,
  unit: string,
) {
  if (!unit) {
    return friendlyNumber(quantity);
  }

  if (quantity === 1) {
    return [
      friendlyNumber(quantity),
      unit,
    ].join(" ");
  }

  return [
    friendlyNumber(quantity),
    PLURAL_UNITS[unit] || unit,
  ].join(" ");
}

function retailerAmountLabel(
  intent: WalmartSearchIntent,
) {
  const name =
    intent.shoppingName;

  if (
    typeof intent.quantity !== "number" ||
    !Number.isFinite(intent.quantity) ||
    intent.quantity <= 0
  ) {
    if (
      includesAny(
        name,
        PRODUCE_WORDS,
      )
    ) {
      return "Choose quantity";
    }

    if (
      includesAny(
        name,
        PACKAGE_WORDS,
      )
    ) {
      return "Choose package size";
    }

    return "Choose the amount you need";
  }

  const amount =
    unitLabel(
      intent.quantity,
      intent.unit || "",
    );

  if (
    intent.unit &&
    VOLUME_UNITS.has(
      intent.unit,
    ) &&
    !intent.packageSize
  ) {
    return (
      `Recipe needs ${amount} · choose a package`
    );
  }

  if (intent.packageSize) {
    return (
      `${amount} · ${intent.packageSize}`
    );
  }

  return amount;
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

  const [opened, setOpened] =
    useState<
      Record<string, boolean>
    >({});

  const openedCount =
    intents.filter(
      (intent) =>
        Boolean(
          opened[intent.key],
        ),
    ).length;

  async function copyList() {
    const value =
      intents
        .map(
          (intent) =>
            `${intent.shoppingName} — ${retailerAmountLabel(
              intent,
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

      {intents.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding:
              "9px 11px",
            borderRadius: 10,
            background:
              "rgba(15,23,42,0.42)",
            border:
              "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            opacity: 0.76,
          }}
        >
          {openedCount} of{" "}
          {intents.length} items opened
          on Walmart
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 8,
          marginTop: 12,
        }}
      >
        {intents.map(
          (intent) => {
            const wasOpened =
              Boolean(
                opened[
                  intent.key
                ],
              );

            return (
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
                    wasOpened
                      ? "1px solid rgba(34,197,94,0.28)"
                      : "1px solid rgba(255,255,255,0.08)",
                  background:
                    wasOpened
                      ? "rgba(34,197,94,0.055)"
                      : "rgba(15,23,42,0.46)",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 7,
                      flexWrap:
                        "wrap",
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

                    {wasOpened && (
                      <span
                        style={{
                          padding:
                            "2px 6px",
                          borderRadius:
                            999,
                          background:
                            "rgba(34,197,94,0.12)",
                          color:
                            "#86efac",
                          fontSize: 9,
                          fontWeight:
                            900,
                        }}
                      >
                        OPENED
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      opacity: 0.64,
                    }}
                  >
                    {
                      retailerAmountLabel(
                        intent,
                      )
                    }
                  </div>
                </div>

                <a
                  href={walmartSearchUrl(
                    intent.searchCandidate ||
                      intent.shoppingName,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    setOpened(
                      (current) => ({
                        ...current,
                        [intent.key]:
                          true,
                      }),
                    )
                  }
                  style={{
                    padding:
                      "9px 10px",
                    borderRadius: 9,
                    border:
                      wasOpened
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(96,165,250,0.4)",
                    background:
                      wasOpened
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(37,99,235,0.16)",
                    color:
                      wasOpened
                        ? "#dcfce7"
                        : "#dbeafe",
                    fontSize: 11,
                    fontWeight: 900,
                    textDecoration:
                      "none",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {wasOpened
                    ? "Open Again"
                    : "Search Walmart"}
                </a>
              </article>
            );
          },
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
