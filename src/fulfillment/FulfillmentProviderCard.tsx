import {
  ExternalLink,
  MapPin,
  Utensils,
} from "lucide-react";

import {
  buildFulfillmentProviderUrl,
} from "./providers";

import type {
  FulfillmentProvider,
} from "./types";

type FulfillmentProviderCardProps = {
  provider: FulfillmentProvider;
  placement: string;
};

export default function FulfillmentProviderCard({
  provider,
  placement,
}: FulfillmentProviderCardProps) {
  function openProvider() {
    const url = buildFulfillmentProviderUrl(
      provider,
      placement,
    );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <article
      style={{
        position: "relative",
        padding: 22,
        borderRadius: 22,
        border:
          "1px solid rgba(251, 146, 60, 0.3)",
        background:
          "linear-gradient(145deg, rgba(124, 45, 18, 0.32), rgba(30, 41, 59, 0.96))",
        boxShadow:
          "0 18px 45px rgba(0, 0, 0, 0.22)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 170,
          height: 170,
          top: -90,
          right: -65,
          borderRadius: "50%",
          background:
            "rgba(249, 115, 22, 0.12)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 15,
            background: "#f97316",
            color: "#fff7ed",
            boxShadow:
              "0 10px 24px rgba(249, 115, 22, 0.26)",
          }}
        >
          <Utensils
            size={23}
            aria-hidden="true"
          />
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginBottom: 7,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 1000,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fdba74",
              }}
            >
              {provider.eyebrowLabel}
            </span>

            <span
              style={{
                padding: "3px 8px",
                borderRadius: 999,
                background:
                  "rgba(255, 255, 255, 0.08)",
                fontSize: 10,
                fontWeight: 900,
                color: "#cbd5e1",
              }}
            >
              Optional
            </span>
          </div>

          <h3
            style={{
              margin: "0 0 9px",
              fontSize: 22,
              lineHeight: 1.15,
              fontWeight: 1000,
              letterSpacing: "-0.025em",
            }}
          >
            {provider.headline}
          </h3>

          <p
            style={{
              margin: "0 0 16px",
              fontSize: 15,
              lineHeight: 1.65,
              color:
                "rgba(248, 250, 252, 0.76)",
            }}
          >
            {provider.description}
          </p>

          {provider.serviceAreaLabel && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#cbd5e1",
                }}
              >
                <MapPin
                  size={14}
                  aria-hidden="true"
                />

                {provider.serviceAreaLabel}
              </span>



              <span
                aria-hidden="true"
                style={{
                  color:
                    "rgba(255,255,255,0.28)",
                }}
              >
                •
              </span>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#cbd5e1",
                }}
              >
                {provider.secondaryLabel}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={openProvider}
            style={{
              width: "100%",
              minHeight: 50,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              border: 0,
              borderRadius: 15,
              background: "#f97316",
              color: "#fff",
              fontSize: 15,
              fontWeight: 1000,
              cursor: "pointer",
              boxShadow:
                "0 12px 28px rgba(249, 115, 22, 0.24)",
            }}
          >
            {provider.ctaLabel}

            <ExternalLink
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <p
        style={{
          position: "relative",
          margin: "14px 0 0",
          textAlign: "center",
          fontSize: 11,
          lineHeight: 1.45,
          color:
            "rgba(248, 250, 252, 0.45)",
        }}
      >
        Opens {provider.name} in a new window.
        Nothing is added to your plan unless you
        choose it.
      </p>
    </article>
  );
}
