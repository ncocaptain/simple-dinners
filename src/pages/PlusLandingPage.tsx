import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ncocaptain.simpledinners&pcampaignid=web_share";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/simple-dinners/id6761655374";

export default function PlusLandingPage() {
  const navigate = useNavigate();
  const isSpanish = getStoredLanguage() === "es";

  const copy = isSpanish
    ? {
        eyebrow: "SIMPLE DINNERS PLUS",
        title: "Menos trabajo para la cena. Más tiempo para tu familia.",
        subtitle:
          "Simple Dinners sigue siendo útil gratis. Plus añade herramientas que te ayudan a planificar más rápido, mantener tu hogar sincronizado y guardar recetas con menos trabajo.",
        price: "$3.99/mes o $34.99/año",
        trial: "Prueba gratis de 7 días para cuentas elegibles.",
        cta: "Abrir Simple Dinners",
        stores: "Descarga Simple Dinners",
        freeTitle: "Lo esencial sigue siendo gratis",
        freeText:
          "Plan semanal, recetario, lista de compras, despensa, Modo Cocina y herramientas básicas para las comidas siguen disponibles sin Plus.",
        plusTitle: "Qué añade Plus",
        householdTitle: "Una suscripción puede cubrir tu hogar",
        householdText:
          "Mantén planes, despensa, lista de compras y recetario sincronizados entre los miembros de tu hogar.",
        finalTitle: "Prueba Plus cuando quieras que Simple Dinners haga más del trabajo.",
        finalText:
          "La suscripción se gestiona en la app para iPhone o Android. Verás el precio, la elegibilidad de la prueba y los términos antes de confirmar.",
        features: [
          ["Planifica más rápido", "Smart Week crea una semana alrededor de tu horario, despensa, preferencias y peticiones."],
          ["Mantén el hogar sincronizado", "Planes, despensa, compras y recetario se mantienen conectados entre dispositivos."],
          ["Guarda recetas desde redes sociales", "Importa recetas compatibles desde Instagram y TikTok sin copiar todo a mano."],
          ["Convierte capturas en recetas", "Usa capturas de pantalla para crear una receta que puedas revisar y guardar."],
          ["Compra con menos desorden", "Smart Shopping ayuda a organizar y limpiar tu lista para una compra más sencilla."],
        ],
      }
    : {
        eyebrow: "SIMPLE DINNERS PLUS",
        title: "Less dinner work. More time for your family.",
        subtitle:
          "Simple Dinners stays genuinely useful for free. Plus adds tools that help you plan faster, keep your household in sync, and save recipes with less work.",
        price: "$3.99/month or $34.99/year",
        trial: "7-day free trial for eligible accounts.",
        cta: "Open Simple Dinners",
        stores: "Download Simple Dinners",
        freeTitle: "The essentials stay free",
        freeText:
          "Weekly planning, Cookbook, Shopping List, Pantry, Cook Mode, and everyday meal tools stay available without Plus.",
        plusTitle: "What Plus adds",
        householdTitle: "One subscription can cover your household",
        householdText:
          "Keep plans, Pantry, Shopping List, and Cookbook synced across the people and devices in your household.",
        finalTitle: "Try Plus when you want Simple Dinners to do more of the work.",
        finalText:
          "Subscriptions are managed in the iPhone and Android apps. You will see pricing, trial eligibility, and billing terms before confirming.",
        features: [
          ["Plan faster", "Smart Week builds a dinner week around your schedule, Pantry, preferences, and requests."],
          ["Keep the household in sync", "Plans, Pantry, shopping, and Cookbook stay connected across devices."],
          ["Save recipes from social media", "Import supported Instagram and TikTok recipes without copying everything by hand."],
          ["Turn screenshots into recipes", "Use recipe screenshots to build a recipe you can review and save."],
          ["Shop with less cleanup", "Smart Shopping helps organize and clean up your list for an easier grocery trip."],
        ],
      };

  const icons = [CalendarDays, Users, Sparkles, Camera, ShoppingCart];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "24px 20px 120px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 920, display: "grid", gap: 22 }}>
        <section
          style={{
            padding: "34px 24px",
            borderRadius: 30,
            border: "1px solid rgba(250,204,21,0.22)",
            background:
              "radial-gradient(circle at top left, rgba(250,204,21,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(34,197,94,0.12), transparent 30%), rgba(255,255,255,0.04)",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              width: "fit-content",
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(250,204,21,0.10)",
              border: "1px solid rgba(250,204,21,0.24)",
              color: "#fde68a",
              fontSize: 12,
              fontWeight: 950,
              letterSpacing: 0.5,
            }}
          >
            {copy.eyebrow}
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: "clamp(38px, 7vw, 68px)",
              lineHeight: 0.98,
              letterSpacing: "-0.055em",
              fontWeight: 1000,
            }}
          >
            {copy.title}
          </h1>

          <p style={{ margin: 0, maxWidth: 700, fontSize: 18, lineHeight: 1.6, opacity: 0.78 }}>
            {copy.subtitle}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              fontWeight: 900,
            }}
          >
            <span style={{ color: "#fde68a" }}>{copy.price}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: "#bbf7d0" }}>{copy.trial}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                border: "1px solid rgba(34,197,94,0.45)",
                background: "rgba(34,197,94,0.16)",
                color: "#86efac",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 1000,
                cursor: "pointer",
              }}
            >
              {copy.cta}
            </button>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              Google Play
            </a>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              App Store
            </a>
          </div>
        </section>

        <section
          style={{
            padding: 22,
            borderRadius: 24,
            border: "1px solid rgba(34,197,94,0.18)",
            background: "rgba(34,197,94,0.07)",
            display: "grid",
            gap: 8,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 25 }}>{copy.freeTitle}</h2>
          <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.55 }}>{copy.freeText}</p>
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em" }}>
            {copy.plusTitle}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
              gap: 12,
            }}
          >
            {copy.features.map(([title, text], index) => {
              const Icon = icons[index] ?? Sparkles;
              return (
                <article
                  key={title}
                  style={{
                    padding: 19,
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.09)",
                    background: "rgba(255,255,255,0.04)",
                    display: "grid",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(250,204,21,0.10)",
                      color: "#fde68a",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
                  <p style={{ margin: 0, opacity: 0.72, lineHeight: 1.5, fontSize: 14 }}>
                    {text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 26,
            border: "1px solid rgba(250,204,21,0.2)",
            background: "rgba(250,204,21,0.07)",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={22} style={{ color: "#fde68a" }} />
            <h2 style={{ margin: 0, fontSize: 25 }}>{copy.householdTitle}</h2>
          </div>
          <p style={{ margin: 0, opacity: 0.76, lineHeight: 1.55 }}>{copy.householdText}</p>
        </section>

        <section
          style={{
            padding: 26,
            borderRadius: 26,
            border: "1px solid rgba(34,197,94,0.22)",
            background: "rgba(34,197,94,0.08)",
            textAlign: "center",
            display: "grid",
            gap: 12,
          }}
        >
          <CheckCircle2 size={30} style={{ margin: "0 auto", color: "#86efac" }} />
          <h2 style={{ margin: 0, fontSize: 29 }}>{copy.finalTitle}</h2>
          <p style={{ margin: "0 auto", maxWidth: 680, opacity: 0.72, lineHeight: 1.55 }}>
            {copy.finalText}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "#22c55e",
                color: "#052e16",
                borderRadius: 16,
                padding: "13px 17px",
                fontWeight: 1000,
              }}
            >
              Google Play
            </a>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "white",
                color: "#111827",
                borderRadius: 16,
                padding: "13px 17px",
                fontWeight: 1000,
              }}
            >
              App Store
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
