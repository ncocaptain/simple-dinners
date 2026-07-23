import {
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Copy,
  ListChecks,
  RefreshCw,
  Share2,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import {
  useEffect,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  useShoppingSyncStatus,
} from "../cloud/shoppingSyncState";
import {
  useWeeklyPlanSyncStatus,
} from "../cloud/weeklyPlanSyncState";
import {
  useCookbookSyncStatus,
} from "../cloud/cookbookSyncState";
import "./PlusDashboardPage.css";
import {
  getHouseholdMembers,
  regenerateHouseholdInviteCode,
  type HouseholdMember,
} from "../cloud/household";
import {
  usePlusEntitlement,
} from "../plus/PlusEntitlementContext";
import {
  PlusUpgradePanel,
} from "../plus/PlusUpgradePanel";


const PLUS_COPY = {
  en: {
    heroTitle: "Shared planning for busy families.",
    heroDescription:
      "Plan together, save recipes faster, and make the weekly dinner routine feel a little more simple.",
    householdEyebrow: "Your household",
    loading: "Loading…",
    setUpHousehold: "Set up your household",
    owner: "Owner",
    member: "Member",
    weeklyPlan: "Weekly Plan",
    shoppingList: "Shopping List",
    cookbook: "Cookbook",
    householdMembers: "Household members",
    memberSingular: "member",
    memberPlural: "members",
    loadingMembers: "Loading household members…",
    unableToLoadMembers:
      "Unable to load household members.",
    householdMember: "Household member",
    you: "You",
    inviteSomeone: "Invite someone",
    shareHouseholdCode: "Share your household code",
    inviteDescription:
      "Send this code privately to someone you want to plan, shop, and save recipes with.",
    copied: "Copied",
    copyCode: "Copy code",
    copyCodeError:
      "Unable to copy the household code.",
    regenerateCode: "Regenerate code",
    replaceCodeQuestion:
      "Replace this household code?",
    replaceCodeDescription:
      "The current code will stop working immediately. Existing household members will not be removed.",
    replacing: "Replacing…",
    replaceCode: "Replace code",
    cancel: "Cancel",
    regenerateCodeError:
      "Unable to generate a new household code.",
    includedInPlus: "Included in Plus",
    makeDinnerEasier: "Make dinner easier",
    aiBadge: "AI",
    socialBadge: "SOCIAL",
    features: {
      smartWeek: {
        title: "Smart Week",
        description:
          "Build a thoughtful week around your schedule, pantry, preferences, and requests.",
      },
      smartShopping: {
        title: "Smart Shopping",
        description:
          "Turn your dinner plan into a cleaner, smarter, easier grocery trip.",
      },
      socialImport: {
        title: "Instagram & TikTok Import",
        description:
          "Save recipes directly from social posts instead of copying everything by hand.",
      },
      screenshotImport: {
        title: "Screenshot Import",
        description:
          "Turn one or more recipe screenshots into a complete recipe you can review and save.",
      },
      sharedWeeklyPlan: {
        title: "Shared Weekly Plan",
        description:
          "Keep everyone in your household working from the same dinner plan.",
      },
      sharedShoppingList: {
        title: "Shared Shopping List",
        description:
          "Let household members add, check off, and update groceries together.",
      },
      sharedCookbook: {
        title: "Shared Cookbook",
        description:
          "Keep your household’s saved recipes together and synced across devices.",
      },
      householdSharing: {
        title: "Household Sharing",
        description:
          "Keep planning, shopping, and recipes connected across your family.",
      },
    },
  },
  es: {
    heroTitle:
      "Planificación compartida para familias ocupadas.",
    heroDescription:
      "Planifiquen juntos, guarden recetas más rápido y hagan que la rutina semanal de la cena sea un poco más simple.",
    householdEyebrow: "Tu hogar",
    loading: "Cargando…",
    setUpHousehold: "Configura tu hogar",
    owner: "Propietario",
    member: "Miembro",
    weeklyPlan: "Plan semanal",
    shoppingList: "Lista de compras",
    cookbook: "Recetario",
    householdMembers: "Miembros del hogar",
    memberSingular: "miembro",
    memberPlural: "miembros",
    loadingMembers:
      "Cargando miembros del hogar…",
    unableToLoadMembers:
      "No se pudieron cargar los miembros del hogar.",
    householdMember: "Miembro del hogar",
    you: "Tú",
    inviteSomeone: "Invita a alguien",
    shareHouseholdCode:
      "Comparte el código de tu hogar",
    inviteDescription:
      "Envía este código en privado a la persona con quien quieras planificar, comprar y guardar recetas.",
    copied: "Copiado",
    copyCode: "Copiar código",
    copyCodeError:
      "No se pudo copiar el código del hogar.",
    regenerateCode: "Generar código nuevo",
    replaceCodeQuestion:
      "¿Reemplazar este código del hogar?",
    replaceCodeDescription:
      "El código actual dejará de funcionar inmediatamente. Los miembros actuales del hogar no serán eliminados.",
    replacing: "Reemplazando…",
    replaceCode: "Reemplazar código",
    cancel: "Cancelar",
    regenerateCodeError:
      "No se pudo generar un código nuevo para el hogar.",
    includedInPlus: "Incluido en Plus",
    makeDinnerEasier:
      "Haz que la cena sea más fácil",
    aiBadge: "IA",
    socialBadge: "SOCIAL",
    features: {
      smartWeek: {
        title: "Semana Inteligente",
        description:
          "Crea una semana pensada para tu horario, despensa, preferencias y solicitudes.",
      },
      smartShopping: {
        title: "Compras Inteligentes",
        description:
          "Convierte tu plan de cenas en una compra más organizada, inteligente y sencilla.",
      },
      socialImport: {
        title: "Importar desde Instagram y TikTok",
        description:
          "Guarda recetas directamente desde publicaciones sociales sin copiar todo a mano.",
      },
      screenshotImport: {
        title: "Importar capturas",
        description:
          "Convierte una o varias capturas de una receta en una receta completa que puedes revisar y guardar.",
      },
      sharedWeeklyPlan: {
        title: "Plan semanal compartido",
        description:
          "Mantén a todos en tu hogar usando el mismo plan de cenas.",
      },
      sharedShoppingList: {
        title: "Lista de compras compartida",
        description:
          "Permite que los miembros del hogar agreguen, marquen y actualicen las compras juntos.",
      },
      sharedCookbook: {
        title: "Recetario compartido",
        description:
          "Mantén las recetas guardadas de tu hogar juntas y sincronizadas entre dispositivos.",
      },
      householdSharing: {
        title: "Hogar compartido",
        description:
          "Mantén conectados la planificación, las compras y las recetas de tu familia.",
      },
    },
  },
} as const;

type PlusFeatureId =
  | "smart-week"
  | "smart-shopping"
  | "screenshot-import"
  | "social-recipe-import"
  | "household-sharing";

type PlusLocationState = {
  feature?: string | null;
  returnTo?: string | null;
};

const PLUS_FOCUS_COPY = {
  en: {
    "smart-week": {
      title: "Smart Week is included in Plus",
      description:
        "Build a personalized dinner week around your schedule, pantry, preferences, and requests.",
    },
    "smart-shopping": {
      title: "Smart Shopping is included in Plus",
      description:
        "Organize and clean up your list while the everyday shopping-list basics remain free.",
    },
    "screenshot-import": {
      title: "Screenshot Import is included in Plus",
      description:
        "Turn one or more recipe screenshots into a recipe you can review and save.",
    },
    "social-recipe-import": {
      title:
        "Instagram & TikTok Import is included in Plus",
      description:
        "Save recipes directly from supported social posts and videos instead of copying everything by hand.",
    },
    "household-sharing": {
      title: "Household Sharing is included in Plus",
      description:
        "Create or join a household to sync plans, groceries, and recipes across devices.",
    },
  },
  es: {
    "smart-week": {
      title: "Semana Inteligente está incluida en Plus",
      description:
        "Crea una semana de cenas personalizada según tu horario, despensa, preferencias y solicitudes.",
    },
    "smart-shopping": {
      title: "Compras Inteligentes está incluida en Plus",
      description:
        "Organiza y limpia tu lista mientras las funciones básicas de la lista de compras siguen siendo gratuitas.",
    },
    "screenshot-import": {
      title: "Importar capturas está incluido en Plus",
      description:
        "Convierte una o varias capturas de una receta en una receta que puedes revisar y guardar.",
    },
    "social-recipe-import": {
      title:
        "Importar desde Instagram y TikTok está incluido en Plus",
      description:
        "Guarda recetas directamente desde publicaciones y videos sociales compatibles sin copiar todo a mano.",
    },
    "household-sharing": {
      title: "Hogar compartido está incluido en Plus",
      description:
        "Crea o únete a un hogar para sincronizar planes, compras y recetas entre dispositivos.",
    },
  },
} as const;

const PLUS_FOCUS_ICONS: Record<
  PlusFeatureId,
  typeof Sparkles
> = {
  "smart-week": CalendarDays,
  "smart-shopping": ShoppingCart,
  "screenshot-import": Camera,
  "social-recipe-import": Share2,
  "household-sharing": Users,
};

function isPlusFeatureId(
  value: unknown,
): value is PlusFeatureId {
  return (
    typeof value === "string" &&
    value in PLUS_FOCUS_ICONS
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  to: string;
  icon: typeof Sparkles;
  badge?: string;
  onClick?: () => void;
};

function FeatureCard({
  title,
  description,
  to,
  icon: Icon,
  badge,
  onClick,
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="sd-plus-feature-card"
      onClick={onClick}
    >
      <div className="sd-plus-feature-icon">
        <Icon
          size={23}
          aria-hidden="true"
        />
      </div>

      <div className="sd-plus-feature-copy">
        <div className="sd-plus-feature-heading">
          <h3>{title}</h3>

          {badge && (
            <span>{badge}</span>
          )}
        </div>

        <p>{description}</p>
      </div>

      <ChevronRight
        size={20}
        aria-hidden="true"
        className="sd-plus-feature-arrow"
      />
    </Link>
  );
}

function SyncItem({
  label,
  status,
  isSpanish,
}: {
  label: string;
  status: string;
  isSpanish: boolean;
}) {
  const isSynced = status === "synced";

  const statusLabel =
    status === "synced"
      ? isSpanish
        ? "Sincronizado"
        : "Synced"
      : status === "syncing"
        ? isSpanish
          ? "Sincronizando…"
          : "Syncing…"
        : status === "connecting"
          ? isSpanish
            ? "Conectando…"
            : "Connecting…"
          : status === "offline"
            ? isSpanish
              ? "Sin conexión"
              : "Offline"
            : status === "error"
              ? isSpanish
                ? "Necesita atención"
                : "Needs attention"
              : isSpanish
                ? "En este dispositivo"
                : "On this device";

  return (
    <div className="sd-plus-sync-item">
      <CheckCircle2
        size={17}
        aria-hidden="true"
        className={
          isSynced
            ? "is-synced"
            : undefined
        }
      />

      <span>{label}</span>

      <strong>{statusLabel}</strong>
    </div>
  );
}

export default function PlusDashboardPage() {
  const {
    user,
    isSignedIn,
    household,
    householdLoading,
    refreshHousehold,
  } = useAuth();
  const {
    hasPlus,
  } = usePlusEntitlement();

  const location = useLocation();
  const language = getStoredLanguage();
  const isSpanish = language === "es";
  const copy = PLUS_COPY[isSpanish ? "es" : "en"];

  const locationState =
    location.state as PlusLocationState | null;

  const requestedFeatureValue =
    locationState?.feature;

  const requestedFeature =
    isPlusFeatureId(requestedFeatureValue)
      ? requestedFeatureValue
      : null;

  const focusedFeature = requestedFeature
    ? PLUS_FOCUS_COPY[isSpanish ? "es" : "en"][
    requestedFeature
    ]
    : null;

  const FocusedFeatureIcon = requestedFeature
    ? PLUS_FOCUS_ICONS[requestedFeature]
    : Sparkles;

  useEffect(() => {
    if (!requestedFeature) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }, [requestedFeature]);

  useEffect(() => {
    if (location.hash === "#household") {
      scrollToHousehold();
    }
  }, [location.hash]);

  function scrollToHousehold() {
    window.requestAnimationFrame(() => {
      document
        .getElementById("household")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  const shoppingSync =
    useShoppingSyncStatus();

  const weeklyPlanSync =
    useWeeklyPlanSyncStatus();

  const cookbookSync =
    useCookbookSyncStatus();

  const [
    householdMembers,
    setHouseholdMembers,
  ] = useState<HouseholdMember[]>([]);

  const [
    householdMembersLoading,
    setHouseholdMembersLoading,
  ] = useState(false);

  const [
    householdMembersError,
    setHouseholdMembersError,
  ] = useState<string | null>(null);

  const [inviteCodeCopied, setInviteCodeCopied] =
    useState(false);

  const [inviteCodeError, setInviteCodeError] =
    useState<string | null>(null);

  const [
    showRegenerateCodeConfirm,
    setShowRegenerateCodeConfirm,
  ] = useState(false);

  const [
    isRegeneratingInviteCode,
    setIsRegeneratingInviteCode,
  ] = useState(false);

  const [
    regenerateInviteCodeError,
    setRegenerateInviteCodeError,
  ] = useState<string | null>(null);

  async function handleCopyInviteCode() {
    if (!household?.inviteCode) {
      return;
    }

    setInviteCodeCopied(false);
    setInviteCodeError(null);

    try {
      await navigator.clipboard.writeText(
        household.inviteCode,
      );

      setInviteCodeCopied(true);

      window.setTimeout(() => {
        setInviteCodeCopied(false);
      }, 2500);
    } catch {
      const textarea =
        document.createElement("textarea");

      textarea.value = household.inviteCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const copied =
        document.execCommand("copy");

      document.body.removeChild(textarea);

      if (copied) {
        setInviteCodeCopied(true);

        window.setTimeout(() => {
          setInviteCodeCopied(false);
        }, 2500);
      } else {
        setInviteCodeError(
          copy.copyCodeError,
        );
      }
    }
  }

  async function handleRegenerateInviteCode() {
    setIsRegeneratingInviteCode(true);
    setRegenerateInviteCodeError(null);
    setInviteCodeCopied(false);

    try {
      const result =
        await regenerateHouseholdInviteCode();

      if (result.error) {
        console.error(
          "Unable to regenerate household invite code:",
          result.error,
        );

        setRegenerateInviteCodeError(
          copy.regenerateCodeError,
        );
        return;
      }

      /*
       * Reload the household summary so every place
       * using household.inviteCode receives the new code.
       */
      await refreshHousehold();

      setShowRegenerateCodeConfirm(false);
    } finally {
      setIsRegeneratingInviteCode(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!isSignedIn || !household?.id) {
      setHouseholdMembers([]);
      setHouseholdMembersError(null);
      setHouseholdMembersLoading(false);
      return;
    }

    async function loadMembers() {
      setHouseholdMembersLoading(true);
      setHouseholdMembersError(null);

      const result =
        await getHouseholdMembers();

      if (cancelled) {
        return;
      }

      if (result.error) {
        setHouseholdMembers([]);
        setHouseholdMembersError(
          result.error,
        );
      } else {
        setHouseholdMembers(
          result.data ?? [],
        );
      }

      setHouseholdMembersLoading(false);
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [
    household?.id,
    isSignedIn,
  ]);

  return (
    <main className="sd-plus-page">
      <section className="sd-plus-hero">
        <span className="sd-plus-badge">
          Simple Dinners Plus
        </span>

        <h1>{copy.heroTitle}</h1>

        <p>{copy.heroDescription}</p>
      </section>

      {focusedFeature && (
        <section
          className="sd-plus-focus-card"
          role="status"
        >
          <div className="sd-plus-focus-icon">
            <FocusedFeatureIcon
              size={23}
              aria-hidden="true"
            />
          </div>

          <div className="sd-plus-focus-copy">
            <span>
              {isSpanish
                ? "Función de Plus"
                : "Plus feature"}
            </span>

            <h2>{focusedFeature.title}</h2>

            <p>{focusedFeature.description}</p>
          </div>
        </section>
      )}

      {!hasPlus && (
        <PlusUpgradePanel />
      )}

      {hasPlus && isSignedIn && (
        <section
          id="household"
          className="sd-plus-section"
        >
          <div className="sd-plus-section-heading">
            <div>
              <span>{copy.householdEyebrow}</span>

              <h2>
                {householdLoading
                  ? isSpanish
                    ? "Cargando…"
                    : "Loading…"
                  : household?.name === "My Household" &&
                    isSpanish
                    ? "Mi hogar"
                    : household?.name ??
                    (isSpanish
                      ? "Configura tu hogar"
                      : "Set up your household")}
              </h2>
            </div>

            {household && (
              <span className="sd-plus-role">
                {household.role === "owner"
                  ? copy.owner
                  : copy.member}
              </span>
            )}
          </div>

          <p className="sd-plus-account-email">
            {user?.email}
          </p>

          {household && (
            <div className="sd-plus-sync-card">
              <SyncItem
                label={copy.weeklyPlan}
                status={weeklyPlanSync.status}
                isSpanish={isSpanish}
              />

              <SyncItem
                label={copy.shoppingList}
                status={shoppingSync.status}
                isSpanish={isSpanish}
              />

              <SyncItem
                label={copy.cookbook}
                status={cookbookSync.status}
                isSpanish={isSpanish}
              />
            </div>
          )}

          <div className="sd-plus-members-card">
            <div className="sd-plus-members-heading">
              <div>
                <span>
                  {copy.householdMembers}
                </span>

                <h3>
                  {householdMembers.length}{" "}
                  {householdMembers.length === 1
                    ? copy.memberSingular
                    : copy.memberPlural}
                </h3>
              </div>

              <Users
                size={21}
                aria-hidden="true"
              />
            </div>

            {householdMembersLoading ? (
              <p className="sd-plus-members-message">
                {copy.loadingMembers}
              </p>
            ) : householdMembersError ? (
              <p className="sd-plus-members-message is-error">
                {copy.unableToLoadMembers}
              </p>
            ) : (
              <div className="sd-plus-members-list">
                {householdMembers.map((member) => {
                  const memberName =
                    member.displayName?.trim() ||
                    member.email ||
                    copy.householdMember;

                  const initial =
                    memberName
                      .charAt(0)
                      .toUpperCase() || "?";

                  return (
                    <div
                      key={member.userId}
                      className="sd-plus-member-row"
                    >
                      <div
                        className="sd-plus-member-avatar"
                        aria-hidden="true"
                      >
                        {initial}
                      </div>

                      <div className="sd-plus-member-copy">
                        <strong>
                          {memberName}

                          {member.isCurrentUser && (
                            <span>
                              {" "}
                              {copy.you}
                            </span>
                          )}
                        </strong>

                        {member.displayName &&
                          member.email && (
                            <p>{member.email}</p>
                          )}
                      </div>

                      <span className="sd-plus-member-role">
                        {member.role === "owner"
                          ? copy.owner
                          : copy.member}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {household?.role === "owner" &&
            household.inviteCode && (
              <div className="sd-plus-invite-card">
                <div className="sd-plus-invite-icon">
                  <Users
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="sd-plus-invite-copy">
                  <span>{copy.inviteSomeone}</span>

                  <h3>
                    {copy.shareHouseholdCode}
                  </h3>

                  <p>{copy.inviteDescription}</p>

                  <div className="sd-plus-invite-code-row">
                    <code>
                      {household.inviteCode}
                    </code>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyInviteCode()
                      }
                    >
                      {inviteCodeCopied ? (
                        <CheckCircle2
                          size={16}
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy
                          size={16}
                          aria-hidden="true"
                        />
                      )}

                      {inviteCodeCopied
                        ? copy.copied
                        : copy.copyCode}
                    </button>
                  </div>

                  {!showRegenerateCodeConfirm ? (
                    <button
                      type="button"
                      className="sd-plus-regenerate-button"
                      onClick={() => {
                        setRegenerateInviteCodeError(null);
                        setShowRegenerateCodeConfirm(true);
                      }}
                    >
                      <RefreshCw
                        size={15}
                        aria-hidden="true"
                      />

                      {copy.regenerateCode}
                    </button>
                  ) : (
                    <div className="sd-plus-regenerate-confirm">
                      <strong>
                        {copy.replaceCodeQuestion}
                      </strong>

                      <p>
                        {copy.replaceCodeDescription}
                      </p>

                      <div className="sd-plus-regenerate-actions">
                        <button
                          type="button"
                          className="confirm"
                          disabled={isRegeneratingInviteCode}
                          onClick={() =>
                            void handleRegenerateInviteCode()
                          }
                        >
                          {isRegeneratingInviteCode
                            ? copy.replacing
                            : copy.replaceCode}
                        </button>

                        <button
                          type="button"
                          className="cancel"
                          disabled={isRegeneratingInviteCode}
                          onClick={() => {
                            setShowRegenerateCodeConfirm(false);
                            setRegenerateInviteCodeError(null);
                          }}
                        >
                          {copy.cancel}
                        </button>
                      </div>
                    </div>
                  )}

                  {(inviteCodeError ||
                    regenerateInviteCodeError) && (
                      <p className="sd-plus-invite-error">
                        {inviteCodeError ??
                          regenerateInviteCodeError}
                      </p>
                    )}
                </div>
              </div>
            )}
        </section>
      )}

      <section
        className="sd-plus-section"
        id={isSignedIn ? undefined : "household"}
      >
        <div className="sd-plus-section-heading">
          <div>
            <span>{copy.includedInPlus}</span>

            <h2>{copy.makeDinnerEasier}</h2>
          </div>
        </div>

        <div className="sd-plus-feature-grid">
          <FeatureCard
            title={copy.features.smartWeek.title}
            description={
              copy.features.smartWeek.description
            }
            to="/smart-week"
            icon={CalendarDays}
            badge={copy.aiBadge}
          />

          <FeatureCard
            title={copy.features.smartShopping.title}
            description={
              copy.features.smartShopping.description
            }
            to="/shopping-list"
            icon={ShoppingCart}
          />

          <FeatureCard
            title={copy.features.socialImport.title}
            description={
              copy.features.socialImport.description
            }
            to="/cookbook"
            icon={Share2}
            badge={copy.socialBadge}
          />

          <FeatureCard
            title={
              copy.features.screenshotImport.title
            }
            description={
              copy.features.screenshotImport
                .description
            }
            to="/cookbook"
            icon={Camera}
            badge={copy.aiBadge}
          />

          <FeatureCard
            title={
              copy.features.sharedWeeklyPlan.title
            }
            description={
              copy.features.sharedWeeklyPlan
                .description
            }
            to="/week"
            icon={CalendarDays}
          />

          <FeatureCard
            title={
              copy.features.sharedShoppingList.title
            }
            description={
              copy.features.sharedShoppingList
                .description
            }
            to="/shopping-list"
            icon={ListChecks}
          />

          <FeatureCard
            title={
              copy.features.sharedCookbook.title
            }
            description={
              copy.features.sharedCookbook
                .description
            }
            to="/cookbook"
            icon={BookOpen}
          />

          <FeatureCard
            title={
              copy.features.householdSharing.title
            }
            description={
              copy.features.householdSharing
                .description
            }
            to="/plus#household"
            icon={Users}
            onClick={scrollToHousehold}
          />
        </div>
      </section>
    </main>
  );
}