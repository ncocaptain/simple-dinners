import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChefHat,
  Globe2,
  Heart,
  Languages,
  ShoppingCart,
  Sparkles,
  Utensils,
} from "lucide-react";

import Card from "../components/Card";
import { getStoredLanguage } from "../i18n";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ncocaptain.simpledinners&pcampaignid=web_share";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/simple-dinners/id6761655374";

export default function AboutPage() {
  const navigate = useNavigate();
  const language = getStoredLanguage();

  const isSpanish = language === "es";

  const copy = isSpanish
    ? {
        appName: "Simple Dinners",
        eyebrow: "Planificación de cenas para la vida real",
        title: "La cena, más simple.",
        subtitle:
          "Simple Dinners te ayuda a planificar tu semana, guardar recetas, crear listas de compras y cocinar paso a paso sin complicarte.",
        primaryCta: "Abrir la app",
        playStore: "Google Play",
        appStore: "App Store",
        updateTitle: "Ahora con Complete the Meal",
        updateText:
          "Simple Dinners ahora sugiere acompañamientos y postres opcionales, con soporte para la lista de compras y enlaces al Modo Cocina cuando hay una receta disponible.",
        socialProof: "12 reseñas públicas de 5 estrellas en Google Play",
        missionTitle: "Hecha para familias ocupadas",
        missionText:
          "Simple Dinners fue creada para reducir el estrés de la cena. Ya sea que estés alimentando a tu familia, planificando una semana ocupada o simplemente cansado de preguntar “¿qué hay para cenar?”, el objetivo es simple: hacer la cena más fácil, una noche a la vez.",
        featuresTitle: "Qué puedes hacer",
        finalTitle: "¿Listo para hacer la cena más fácil?",
        finalText:
          "Usa Simple Dinners en la web o descarga la app en tu teléfono.",
        features: [
          {
            title: "Planifica tu semana",
            text: "Crea un plan de cenas para cada noche sin pensarlo demasiado.",
          },
          {
            title: "Completa la comida",
            text: "Agrega acompañamientos y postres opcionales a tu plan.",
          },
          {
            title: "Lista de compras",
            text: "Manda ingredientes, acompañamientos y postres a una lista limpia.",
          },
          {
            title: "Modo Cocina",
            text: "Sigue instrucciones paso a paso mientras cocinas.",
          },
          {
            title: "Importa recetas",
            text: "Guarda recetas favoritas desde enlaces o texto pegado.",
          },
          {
            title: "Inglés y español",
            text: "Cambia de idioma y planifica la cena a tu manera.",
          },
        ],
      }
    : {
        appName: "Simple Dinners",
        eyebrow: "Dinner planning for real life",
        title: "Dinner planning made simple.",
        subtitle:
          "Simple Dinners helps you plan your week, save recipes, build shopping lists, and cook step by step without overcomplicating dinner.",
        primaryCta: "Open the app",
        playStore: "Google Play",
        appStore: "App Store",
        updateTitle: "Now with Complete the Meal",
        updateText:
          "Simple Dinners now suggests side dishes and optional desserts, with shopping list support and Cook Mode links when a matching recipe is available.",
        socialProof: "12 public 5-star reviews on Google Play",
        missionTitle: "Built for busy families",
        missionText:
          "Simple Dinners was built to make dinner feel less stressful. Whether you’re feeding a family, planning around a busy week, or just tired of asking “what’s for dinner?”, the goal is simple: make dinner easier, one night at a time.",
        featuresTitle: "What you can do",
        finalTitle: "Ready to make dinner easier?",
        finalText:
          "Use Simple Dinners on the web or download the app on your phone.",
        features: [
          {
            title: "Plan your week",
            text: "Create a dinner plan for each night without overthinking it.",
          },
          {
            title: "Complete the meal",
            text: "Add suggested sides and optional desserts to your dinner plan.",
          },
          {
            title: "Build a shopping list",
            text: "Send ingredients, sides, and desserts to one clean list.",
          },
          {
            title: "Cook step by step",
            text: "Use Cook Mode to follow recipes one step at a time.",
          },
          {
            title: "Import recipes",
            text: "Save favorite recipes from links or pasted text.",
          },
          {
            title: "English and Spanish",
            text: "Switch languages and plan dinner your way.",
          },
        ],
      };

  const featureIcons = [
    CalendarDays,
    Utensils,
    ShoppingCart,
    ChefHat,
    Sparkles,
    Languages,
  ];

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
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "grid",
          gap: 22,
        }}
      >
        <section
          style={{
            padding: "28px 22px",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 34%), rgba(255,255,255,0.04)",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              width: "fit-content",
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.24)",
              color: "#86efac",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {copy.eyebrow}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 8vw, 70px)",
                lineHeight: 0.95,
                letterSpacing: "-0.06em",
                fontWeight: 1000,
              }}
            >
              {copy.title}
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 680,
                fontSize: "clamp(16px, 2.6vw, 20px)",
                lineHeight: 1.5,
                opacity: 0.76,
              }}
            >
              {copy.subtitle}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/week")}
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
              {copy.primaryCta}
            </button>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              {copy.playStore}
            </a>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              {copy.appStore}
            </a>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#fde68a",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <Heart size={15} />
            {copy.socialProof}
          </div>
        </section>

        <Card title={copy.updateTitle} subtitle={copy.updateText}>
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(250,204,21,0.10)",
              border: "1px solid rgba(250,204,21,0.22)",
              color: "#fde68a",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={16} style={{ marginRight: 6, marginBottom: -3 }} />
            {copy.updateText}
          </div>
        </Card>

        <section
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "-0.03em",
            }}
          >
            {copy.featuresTitle}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 12,
            }}
          >
            {copy.features.map((feature, index) => {
              const Icon = featureIcons[index] || Sparkles;

              return (
                <div
                  key={feature.title}
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 14,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.24)",
                      color: "#86efac",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div style={{ fontWeight: 1000, fontSize: 17 }}>
                    {feature.title}
                  </div>

                  <div
                    style={{
                      opacity: 0.68,
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  >
                    {feature.text}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Card title={copy.missionTitle} subtitle="">
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
              opacity: 0.78,
            }}
          >
            <Globe2 size={17} style={{ marginRight: 8, marginBottom: -3 }} />
            {copy.missionText}
          </p>
        </Card>

        <section
          style={{
            padding: 22,
            borderRadius: 26,
            border: "1px solid rgba(34,197,94,0.22)",
            background: "rgba(34,197,94,0.08)",
            display: "grid",
            gap: 12,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              letterSpacing: "-0.04em",
            }}
          >
            {copy.finalTitle}
          </h2>

          <p style={{ margin: 0, opacity: 0.72 }}>{copy.finalText}</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/week")}
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
              {copy.primaryCta}
            </button>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              {copy.playStore}
            </a>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                borderRadius: 16,
                padding: "13px 16px",
                fontWeight: 900,
              }}
            >
              {copy.appStore}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}