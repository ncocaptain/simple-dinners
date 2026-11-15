import {
  useEffect,
} from "react";
import {
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import "./PlusDiscoveryModal.css";

type PlusDiscoveryModalProps = {
  trialAvailable: boolean;
  onExplore: () => void;
  onDismiss: () => void;
};

const PLUS_DISCOVERY_COPY = {
  en: {
    badge: "SIMPLE DINNERS PLUS",
    trialTitle:
      "Try Simple Dinners Plus free for 7 days",
    standardTitle:
      "Discover Simple Dinners Plus",
    trialDescription:
      "See how much time Plus can save your household—from planning the week to saving recipes and shopping.",
    standardDescription:
      "Save time every week with smarter planning, shared household tools, faster recipe saving, and better-organized shopping.",
    features: [
      "Build your week faster with Smart Week",
      "Keep plans, Pantry, shopping lists, and Cookbook in sync",
      "Save recipes from Instagram, TikTok, and screenshots",
      "Get smarter shopping organization",
      "One Plus subscription can cover your household",
    ],
    trialAction: "See Trial Options",
    standardAction: "Explore Plus",
    later: "Maybe Later",
    trialNote:
      "Trial eligibility and billing details are shown on the Plus screen.",
    close: "Close",
  },
  es: {
    badge: "SIMPLE DINNERS PLUS",
    trialTitle:
      "Prueba Simple Dinners Plus gratis por 7 días",
    standardTitle:
      "Descubre Simple Dinners Plus",
    trialDescription:
      "Descubre cuánto tiempo puede ahorrar Plus a tu hogar, desde planificar la semana hasta guardar recetas y hacer las compras.",
    standardDescription:
      "Ahorra tiempo cada semana con planificación más inteligente, herramientas compartidas, recetas guardadas más rápido y compras mejor organizadas.",
    features: [
      "Crea tu semana más rápido con Semana Inteligente",
      "Sincroniza planes, despensa, compras y recetario",
      "Guarda recetas desde Instagram, TikTok y capturas",
      "Organiza mejor las compras",
      "Una suscripción Plus puede cubrir tu hogar",
    ],
    trialAction: "Ver Opciones de Prueba",
    standardAction: "Explorar Plus",
    later: "Quizás Después",
    trialNote:
      "La elegibilidad y los detalles de facturación se muestran en la pantalla de Plus.",
    close: "Cerrar",
  },
} as const;

export function PlusDiscoveryModal({
  trialAvailable,
  onExplore,
  onDismiss,
}: PlusDiscoveryModalProps) {
  const language = getStoredLanguage();
  const copy =
    PLUS_DISCOVERY_COPY[
      language === "es"
        ? "es"
        : "en"
    ];

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onDismiss]);

  return (
    <div
      className="sd-plus-discovery-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onDismiss();
        }
      }}
    >
      <section
        className="sd-plus-discovery-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-plus-discovery-title"
      >
        <button
          type="button"
          className="sd-plus-discovery-close"
          aria-label={copy.close}
          onClick={onDismiss}
        >
          <X size={20} />
        </button>

        <div className="sd-plus-discovery-icon">
          <Sparkles size={28} />
        </div>

        <div className="sd-plus-discovery-badge">
          {copy.badge}
        </div>

        <h2 id="sd-plus-discovery-title">
          {trialAvailable
            ? copy.trialTitle
            : copy.standardTitle}
        </h2>

        <p className="sd-plus-discovery-description">
          {trialAvailable
            ? copy.trialDescription
            : copy.standardDescription}
        </p>

        <div className="sd-plus-discovery-features">
          {copy.features.map((feature) => (
            <div
              key={feature}
              className="sd-plus-discovery-feature"
            >
              <CheckCircle2
                size={18}
                aria-hidden="true"
              />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="sd-plus-discovery-primary"
          onClick={onExplore}
        >
          {trialAvailable
            ? copy.trialAction
            : copy.standardAction}
        </button>

        <button
          type="button"
          className="sd-plus-discovery-later"
          onClick={onDismiss}
        >
          {copy.later}
        </button>

        {trialAvailable && (
          <p className="sd-plus-discovery-note">
            {copy.trialNote}
          </p>
        )}
      </section>
    </div>
  );
}
