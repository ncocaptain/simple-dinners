import { useNavigate } from "react-router-dom";
import {
  buildFulfillmentProviderUrl,
  getFulfillmentProvider,
} from "../fulfillment/providers";
import FulfillmentProviderCard from "../fulfillment/FulfillmentProviderCard";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const smashMealsProvider =
  getFulfillmentProvider("smashmeals");

const pageStyles = {
  page: {
    minHeight: "100vh",
    padding:
      "calc(20px + env(safe-area-inset-top, 0px)) 16px calc(48px + env(safe-area-inset-bottom, 0px))",
    background:
      "radial-gradient(circle at top, rgba(249, 115, 22, 0.16), transparent 34%), #0f172a",
    color: "#f8fafc",
  } satisfies React.CSSProperties,

  shell: {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
  } satisfies React.CSSProperties,

  panel: {
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    background: "rgba(30, 41, 59, 0.82)",
    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  smallLabel: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.3,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#fdba74",
  } satisfies React.CSSProperties,

  bodyText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.65,
    color: "rgba(248, 250, 252, 0.76)",
  } satisfies React.CSSProperties,
};

function openSmashMealsMenu() {
  if (!smashMealsProvider) return;

  const url = buildFulfillmentProviderUrl(
    smashMealsProvider,
    "partner-preview",
  );

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

export default function SmashMealsPreviewPage() {
  const navigate = useNavigate();

  return (
    <main style={pageStyles.page}>
      <div style={pageStyles.shell}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            minHeight: 44,
            marginBottom: 18,
            padding: "8px 4px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: 0,
            background: "transparent",
            color: "rgba(248, 250, 252, 0.74)",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Simple Dinners
        </button>

        <section style={pageStyles.panel}>
          <header
            style={{
              padding: "34px 24px 30px",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(249, 115, 22, 0.2), rgba(30, 41, 59, 0.3))",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                margin: "0 auto 18px",
                display: "grid",
                placeItems: "center",
                borderRadius: 18,
                background: "rgba(249, 115, 22, 0.18)",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                color: "#fdba74",
              }}
            >
              <Heart size={28} aria-hidden="true" />
            </div>

            <p style={pageStyles.smallLabel}>Partnership preview</p>

            <h1
              style={{
                margin: "10px 0 10px",
                fontSize: "clamp(30px, 8vw, 44px)",
                lineHeight: 1.05,
                fontWeight: 1000,
                letterSpacing: "-0.04em",
              }}
            >
              Simple Dinners
              <span
                style={{
                  display: "block",
                  marginTop: 6,
                  color: "#fb923c",
                }}
              >
                × {smashMealsProvider?.name}
              </span>
            </h1>

            <p
              style={{
                ...pageStyles.bodyText,
                maxWidth: 510,
                margin: "0 auto",
                fontSize: 17,
              }}
            >
              Helping busy families make dinner happen—even on the nights when
              cooking isn’t happening.
            </p>
          </header>

          <div style={{ padding: "26px 20px 30px" }}>
            <section
              aria-labelledby="card-preview-heading"
              style={{ marginBottom: 34 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 14,
                }}
              >
                <CalendarDays
                  size={19}
                  color="#94a3b8"
                  aria-hidden="true"
                />

                <h2
                  id="card-preview-heading"
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#cbd5e1",
                  }}
                >
                  How it could appear in Simple Dinners
                </h2>
              </div>

              {smashMealsProvider && (
                <FulfillmentProviderCard
                  provider={smashMealsProvider}
                  placement="partner-preview"
                />
              )}
            </section>

            <section style={{ marginBottom: 34 }}>
              <p style={pageStyles.smallLabel}>Why it fits</p>

              <h2
                style={{
                  margin: "8px 0 12px",
                  fontSize: 26,
                  lineHeight: 1.15,
                  fontWeight: 1000,
                  letterSpacing: "-0.03em",
                }}
              >
                A real-life answer for real-life nights
              </h2>

              <p style={pageStyles.bodyText}>
                Simple Dinners remains focused on helping families plan, shop,
                and cook. {smashMealsProvider?.name} becomes an optional local
                backup for the nights when the plan changes.
              </p>
            </section>

            <section
              style={{
                display: "grid",
                gap: 12,
                marginBottom: 34,
              }}
            >
              {[
                {
                  icon: <CalendarDays size={20} aria-hidden="true" />,
                  title: "Plan normally",
                  text: "Families continue building their weekly dinner plan in Simple Dinners.",
                },
                {
                  icon: <Sparkles size={20} aria-hidden="true" />,
                  title: "Real life happens",
                  text: "A late workday, practice, appointment, or exhausting evening changes the plan.",
                },
                {
                  icon: <ShoppingBag size={20} aria-hidden="true" />,
                  title: "Choose a local backup",
                  text: `The family can optionally view ${smashMealsProvider?.name} without leaving the Simple Dinners mission behind.`,
                },
              ].map((item) => (
                <article
                  key={item.title}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: 17,
                    borderRadius: 17,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(15, 23, 42, 0.45)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 13,
                      background: "rgba(249, 115, 22, 0.13)",
                      color: "#fb923c",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: "1px 0 5px",
                        fontSize: 15,
                        fontWeight: 1000,
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        ...pageStyles.bodyText,
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <section
              style={{
                padding: 20,
                borderRadius: 19,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(15, 23, 42, 0.45)",
              }}
            >
              <p style={pageStyles.smallLabel}>Start simple</p>

              <h2
                style={{
                  margin: "8px 0 15px",
                  fontSize: 23,
                  lineHeight: 1.15,
                  fontWeight: 1000,
                }}
              >
                A lightweight pilot
              </h2>

              <div style={{ display: "grid", gap: 11 }}>
                {[
                  "One optional placement inside Simple Dinners",
                  "A tracked link or Simple Dinners promo code",
                  "No account linking or in-app ordering",
                  "Review actual interest before building more",
                ].map((text) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                    }}
                  >
                    <Check
                      size={17}
                      color="#4ade80"
                      style={{ flexShrink: 0, marginTop: 2 }}
                      aria-hidden="true"
                    />

                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "rgba(248, 250, 252, 0.78)",
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={openSmashMealsMenu}
              style={{
                width: "100%",
                minHeight: 54,
                marginTop: 22,
                padding: "13px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                border: "1px solid rgba(251, 146, 60, 0.4)",
                borderRadius: 16,
                background: "rgba(249, 115, 22, 0.1)",
                color: "#fdba74",
                fontSize: 15,
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              Explore the SmashMeals Menu
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </section>

        <footer
          style={{
            padding: "22px 10px 0",
            textAlign: "center",
            fontSize: 12,
            lineHeight: 1.6,
            color: "rgba(248, 250, 252, 0.38)",
          }}
        >
          Partnership concept preview
          <br />
          Simple Dinners by nCo_Captain
        </footer>
      </div>
    </main>
  );
}