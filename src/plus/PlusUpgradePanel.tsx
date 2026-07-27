import {
  useState,
} from "react";
import {
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getStoredLanguage } from "../i18n";
import {
  usePlusEntitlement,
  type PlusPlan,
} from "./PlusEntitlementContext";
import {
  isRevenueCatNativePlatform,
} from "./revenueCat";
import "./PlusUpgradePanel.css";

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

const PRIVACY_POLICY_URL =
  "https://dinners.ncocaptain.com/privacy/index.html";

const TERMS_OF_USE_URL =
  "https://dinners.ncocaptain.com/terms/index.html";

const UPGRADE_COPY = {
  en: {
    eyebrow: "Simple Dinners plans",
    title: "Dinner help that fits your family.",
    description:
      "Simple Dinners stays genuinely useful for free. Plus adds smarter tools and household convenience.",
    free: {
      badge: "FREE",
      title: "Simple Dinners",
      subtitle: "The complete everyday foundation.",
      items: [
        "Weekly dinner planning",
        "Cookbook and standard recipe links",
        "Shopping list essentials",
        "Cook Mode and meal tools",
      ],
      footer: "Free and useful for every family.",
    },
    plus: {
      badge: "PLUS",
      title: "Simple Dinners Plus",
      subtitle:
        "Extra convenience for busy households.",
      items: [
        "Smart Week personalized planning",
        "Smart Shopping organization",
        "Instagram and TikTok recipe import",
        "AI screenshot recipe import",
        "Shared plans, lists, and Cookbook",
      ],
      monthly: "Monthly",
      annual: "Yearly",
      bestValue: "BEST VALUE",
      perMonth: "per month",
      billedYearly: "billed yearly",
      chooseMonthly: "Choose monthly",
      chooseAnnual: "Choose yearly",
      loadingPlans: "Loading subscription options…",
      signInNote:
        "Sign in before subscribing or restoring purchases.",
      mobileOnly:
        "Plus subscriptions are available in the Simple Dinners iOS and Android apps.",
      activeTitle:
        "Your Plus subscription is active",
      activeDescription:
        "Your subscription is connected to this Simple Dinners account.",
      manageSubscription:
        "Manage subscription",
      manageDescription:
        "Change or cancel your plan through Google Play or the App Store.",
      householdActiveTitle:
        "Plus is included through your household",
      householdActiveDescription:
        "A member of your household has an active Simple Dinners Plus subscription.",
      householdFooter:
        "Plus access is provided through your household’s active subscription.",
      manageUnavailable:
        "Manage this subscription through the Apple or Google account used to subscribe.",
      restore: "Restore purchases",
      restoring: "Restoring…",
      purchaseSuccess:
        "Welcome to Simple Dinners Plus!",
      restoreSuccess:
        "Your Simple Dinners Plus purchase was restored.",
      purchaseError:
        "Unable to complete the purchase.",
      restoreError:
        "Unable to restore purchases.",
      footer:
        "Subscriptions renew automatically unless cancelled through your Apple or Google account.",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
    },
  },

  es: {
    eyebrow: "Planes de Simple Dinners",
    title:
      "Ayuda con la cena que se adapta a tu familia.",
    description:
      "Simple Dinners seguirá siendo realmente útil gratis. Plus añade herramientas más inteligentes y comodidad para el hogar.",
    free: {
      badge: "GRATIS",
      title: "Simple Dinners",
      subtitle:
        "La base completa para todos los días.",
      items: [
        "Planificación semanal de cenas",
        "Recetario y enlaces normales de recetas",
        "Funciones esenciales de la lista de compras",
        "Modo Cocina y herramientas para las comidas",
      ],
      footer:
        "Gratis y útil para todas las familias.",
    },
    plus: {
      badge: "PLUS",
      title: "Simple Dinners Plus",
      subtitle:
        "Más comodidad para hogares ocupados.",
      items: [
        "Planificación personalizada con Semana Inteligente",
        "Organización con Compras Inteligentes",
        "Importación desde Instagram y TikTok",
        "Importación de recetas desde capturas con IA",
        "Planes, listas y recetario compartidos",
      ],
      monthly: "Mensual",
      annual: "Anual",
      bestValue: "MEJOR VALOR",
      perMonth: "al mes",
      billedYearly: "facturado anualmente",
      chooseMonthly: "Elegir mensual",
      chooseAnnual: "Elegir anual",
      loadingPlans:
        "Cargando opciones de suscripción…",
      signInNote:
        "Inicia sesión antes de suscribirte o restaurar compras.",
      mobileOnly:
        "Las suscripciones de Plus están disponibles en las aplicaciones de Simple Dinners para iOS y Android.",
      activeTitle:
        "Tu suscripción Plus está activa",
      activeDescription:
        "Tu suscripción está conectada a esta cuenta de Simple Dinners.",
      householdFooter:
        "El acceso a Plus se proporciona mediante la suscripción activa de tu hogar.",
      manageSubscription:
        "Administrar suscripción",
      manageDescription:
        "Cambia o cancela tu plan desde Google Play o App Store.",
      householdActiveTitle:
        "Plus está incluido a través de tu hogar",
      householdActiveDescription:
        "Un miembro de tu hogar tiene una suscripción activa a Simple Dinners Plus.",
      manageUnavailable:
        "Administra esta suscripción desde la cuenta de Apple o Google que usaste para suscribirte.",
      restore: "Restaurar compras",
      restoring: "Restaurando…",
      purchaseSuccess:
        "¡Te damos la bienvenida a Simple Dinners Plus!",
      restoreSuccess:
        "Tu compra de Simple Dinners Plus fue restaurada.",
      purchaseError:
        "No se pudo completar la compra.",
      restoreError:
        "No se pudieron restaurar las compras.",
      footer:
        "Las suscripciones se renuevan automáticamente a menos que se cancelen desde tu cuenta de Apple o Google.",
      privacy: "Política de privacidad",
      terms: "Términos de uso",
    },
  },
} as const;

export function PlusUpgradePanel() {
  const language = getStoredLanguage();
  const copy =
    UPGRADE_COPY[language === "es" ? "es" : "en"];

  const {
    isSignedIn,
  } = useAuth();

  const {
    hasPlus,
    plusSource,
    subscriptionManagementURL,
    monthlyPrice,
    annualPrice,
    annualMonthlyPrice,
    packagesLoading,
    purchaseLoading,
    restoreLoading,
    purchasePlus,
    restorePlusPurchases,
  } = usePlusEntitlement();

  const [actionMessage, setActionMessage] =
    useState<ActionMessage | null>(null);

  const isNative =
    isRevenueCatNativePlatform();

  const isBusy =
    purchaseLoading || restoreLoading;

  const hasHouseholdPlus =
    plusSource === "household";

  async function handlePurchase(
    plan: PlusPlan,
  ) {
    setActionMessage(null);

    const result =
      await purchasePlus(plan);

    if (result.cancelled) {
      return;
    }

    if (result.success) {
      setActionMessage({
        type: "success",
        text: copy.plus.purchaseSuccess,
      });
      return;
    }

    setActionMessage({
      type: "error",
      text:
        result.error ??
        copy.plus.purchaseError,
    });
  }

  async function handleRestore() {
    setActionMessage(null);

    const result =
      await restorePlusPurchases();

    if (result.success) {
      setActionMessage({
        type: "success",
        text: copy.plus.restoreSuccess,
      });
      return;
    }

    if (!result.cancelled) {
      setActionMessage({
        type: "error",
        text:
          result.error ??
          copy.plus.restoreError,
      });
    }
  }

  function handleManageSubscription() {
    if (!subscriptionManagementURL) {
      return;
    }

    window.open(
      subscriptionManagementURL,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="sd-plus-upgrade">
      <div className="sd-plus-upgrade-heading">
        <span>{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="sd-plus-plan-grid">
        <article className="sd-plus-plan-card">
          <span className="sd-plus-plan-badge is-free">
            {copy.free.badge}
          </span>

          <h3>{copy.free.title}</h3>

          <p className="sd-plus-plan-subtitle">
            {copy.free.subtitle}
          </p>

          <div className="sd-plus-plan-list">
            {copy.free.items.map((item) => (
              <div key={item}>
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                />

                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="sd-plus-plan-footer">
            {copy.free.footer}
          </p>
        </article>

        <article className="sd-plus-plan-card is-plus">
          <div className="sd-plus-plan-icon">
            <Sparkles
              size={22}
              aria-hidden="true"
            />
          </div>

          <span className="sd-plus-plan-badge is-plus">
            {copy.plus.badge}
          </span>

          <h3>{copy.plus.title}</h3>

          <p className="sd-plus-plan-subtitle">
            {copy.plus.subtitle}
          </p>

          <div className="sd-plus-plan-list">
            {copy.plus.items.map((item) => (
              <div key={item}>
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                />

                <span>{item}</span>
              </div>
            ))}
          </div>

          {hasPlus ? (
            <div className="sd-plus-purchase-options">
              <div className="sd-plus-purchase-note">
                <strong>
                  {hasHouseholdPlus
                    ? copy.plus.householdActiveTitle
                    : copy.plus.activeTitle}
                </strong>

                <br />

                <span>
                  {hasHouseholdPlus
                    ? copy.plus.householdActiveDescription
                    : copy.plus.activeDescription}
                </span>
              </div>

              {!hasHouseholdPlus && (
                <>
                  {subscriptionManagementURL ? (
                    <button
                      type="button"
                      className="sd-plus-purchase-option"
                      disabled={isBusy}
                      onClick={
                        handleManageSubscription
                      }
                    >
                      <span className="sd-plus-purchase-option-copy">
                        <strong>
                          {copy.plus.manageSubscription}
                        </strong>

                        <small>
                          {copy.plus.manageDescription}
                        </small>
                      </span>

                      <span
                        className="sd-plus-purchase-price"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                  ) : (
                    <div className="sd-plus-purchase-note">
                      {copy.plus.manageUnavailable}
                    </div>
                  )}

                  {isNative && isSignedIn && (
                    <button
                      type="button"
                      className="sd-plus-restore-button"
                      disabled={isBusy}
                      onClick={() =>
                        void handleRestore()
                      }
                    >
                      {restoreLoading
                        ? copy.plus.restoring
                        : copy.plus.restore}
                    </button>
                  )}
                </>
              )}
            </div>
          ) : !isNative ? (
            <div className="sd-plus-purchase-note">
              {copy.plus.mobileOnly}
            </div>
          ) : !isSignedIn ? (
            <div className="sd-plus-purchase-note">
              {copy.plus.signInNote}
            </div>
          ) : packagesLoading ? (
            <div className="sd-plus-purchase-note">
              {copy.plus.loadingPlans}
            </div>
          ) : (
            <div className="sd-plus-purchase-options">
              <button
                type="button"
                className="sd-plus-purchase-option"
                disabled={
                  isBusy ||
                  !monthlyPrice
                }
                onClick={() =>
                  void handlePurchase("monthly")
                }
              >
                <span className="sd-plus-purchase-option-copy">
                  <strong>
                    {copy.plus.monthly}
                  </strong>

                  <small>
                    {copy.plus.chooseMonthly}
                  </small>
                </span>

                <span className="sd-plus-purchase-price">
                  {monthlyPrice ?? "—"}
                </span>
              </button>

              <button
                type="button"
                className="sd-plus-purchase-option is-annual"
                disabled={
                  isBusy ||
                  !annualPrice
                }
                onClick={() =>
                  void handlePurchase("annual")
                }
              >
                <span className="sd-plus-purchase-value-badge">
                  {copy.plus.bestValue}
                </span>

                <span className="sd-plus-purchase-option-copy">
                  <strong>
                    {copy.plus.annual}
                  </strong>

                  <small>
                    {annualMonthlyPrice
                      ? `${annualMonthlyPrice} ${copy.plus.perMonth} · ${copy.plus.billedYearly}`
                      : copy.plus.chooseAnnual}
                  </small>
                </span>

                <span className="sd-plus-purchase-price">
                  {annualPrice ?? "—"}
                </span>
              </button>

              <button
                type="button"
                className="sd-plus-restore-button"
                disabled={isBusy}
                onClick={() =>
                  void handleRestore()
                }
              >
                {restoreLoading
                  ? copy.plus.restoring
                  : copy.plus.restore}
              </button>
            </div>
          )}

          {actionMessage && (
            <div
              className={
                actionMessage.type === "success"
                  ? "sd-plus-purchase-message is-success"
                  : "sd-plus-purchase-message is-error"
              }
              role={
                actionMessage.type === "error"
                  ? "alert"
                  : "status"
              }
            >
              {actionMessage.text}
            </div>
          )}

          <p className="sd-plus-plan-footer">
            {hasHouseholdPlus
              ? copy.plus.householdFooter
              : copy.plus.footer}
          </p>

          <div className="sd-plus-legal-links">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.plus.privacy}
            </a>

            <span aria-hidden="true">·</span>

            <a
              href={TERMS_OF_USE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.plus.terms}
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
