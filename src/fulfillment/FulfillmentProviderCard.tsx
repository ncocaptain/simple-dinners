import {
  ExternalLink,
  MapPin,
  Utensils,
} from "lucide-react";

import {
  buildFulfillmentProviderUrl,
} from "./providers";

import type {
  FulfillmentPlacement,
  FulfillmentProvider,
} from "./types";

type FulfillmentProviderCardProps = {
  provider: FulfillmentProvider;
  placement: FulfillmentPlacement;
  variant?: "full" | "compact";
};

export default function FulfillmentProviderCard({
  provider,
  placement,
  variant = "full",
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

  if (variant === "compact") {
    return (
      <article
        style={{
          padding: 14,
          borderRadius: 16,
          border: "1px solid rgba(251, 146, 60, 0.24)",
          background:
            "linear-gradient(145deg, rgba(124, 45, 18, 0.22), rgba(30, 41, 59, 0.72))",
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 12,
              background: provider.logoSrc
                ? "rgba(255,255,255,0.94)"
                : "rgba(249, 115, 22, 0.16)",
              color: "#fb923c",
            }}
          >
            {provider.logoSrc ? (
              <img
                src={provider.logoSrc}
                alt={`${provider.name} logo`}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <Utensils
                size={20}
                aria-hidden="true"
              />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fdba74",
                }}
              >
                {provider.eyebrowLabel}
              </span>

              <span
                style={{
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
                  fontSize: 9,
                  fontWeight: 900,
                  color: "#cbd5e1",
                }}
              >
                Optional
              </span>
            </div>

            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {provider.name}
            </div>

            <div
              style={{
                fontSize: 12,
                lineHeight: 1.45,
                color: "rgba(248,250,252,0.62)",
              }}
            >
              {provider.description}
            </div>
          </div>
        </div>

        {(provider.serviceAreaLabel ||
          provider.secondaryLabel) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(248,250,252,0.62)",
              }}
            >
              {provider.serviceAreaLabel && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <MapPin size={12} aria-hidden="true" />
                  {provider.serviceAreaLabel}
                </span>
              )}

              {provider.serviceAreaLabel &&
                provider.secondaryLabel && (
                  <span aria-hidden="true">•</span>
                )}

              {provider.secondaryLabel && (
                <span>{provider.secondaryLabel}</span>
              )}
            </div>
          )}

        {provider.serviceAreaUrl &&
          provider.serviceAreaCtaLabel && (
            <a
              href={provider.serviceAreaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "fit-content",
                fontSize: 11,
                fontWeight: 800,
                color: "#fdba74",
                textDecoration: "none",
                opacity: 0.9,
              }}
            >
              {provider.serviceAreaCtaLabel} →
            </a>
          )}

        <button
          type="button"
          onClick={openProvider}
          style={{
            width: "100%",
            minHeight: 42,
            border: 0,
            borderRadius: 12,
            background: "#f97316",
            color: "#fff",
            fontSize: 13,
            fontWeight: 900,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          {provider.ctaLabel}
          <ExternalLink size={15} aria-hidden="true" />
        </button>
      </article>
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
            background: provider.logoSrc
              ? "rgba(255,255,255,0.94)"
              : "#f97316",
            color: "#fff7ed",
            boxShadow:
              "0 10px 24px rgba(249, 115, 22, 0.26)",
          }}
        >
          {provider.logoSrc ? (
            <img
              src={provider.logoSrc}
              alt={`${provider.name} logo`}
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          ) : (
            <Utensils
              size={23}
              aria-hidden="true"
            />
          )}
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
