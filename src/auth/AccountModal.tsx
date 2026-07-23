import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import { getStoredLanguage } from "../i18n";
import { useAuth } from "./AuthContext";
import "./AccountModal.css";

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AccountMode = "sign-in" | "sign-up";
type HouseholdMode = "create" | "join";

export function AccountModal({
  isOpen,
  onClose,
}: AccountModalProps) {
  const {
    user,
    isSignedIn,
    isConfigured,

    household,
    householdLoading,
    householdError,
    needsHouseholdSetup,

    signIn,
    signUp,
    signOut,
    createHousehold,
    joinHousehold,
  } = useAuth();

  const navigate = useNavigate();
  const language = getStoredLanguage();
  const isSpanish = language === "es";

  const copy = isSpanish
    ? {
      closeLabel: "Cerrar ventana de cuenta",
      tagline:
        "Planificación compartida para familias ocupadas.",
      cloudNotConfigured:
        "La sincronización en la nube no está configurada en este dispositivo.",
      signedIn: "Sesión iniciada",
      defaultUser: "Usuario de Simple Dinners",
      loadingHousehold: "Cargando tu hogar…",
      setupHousehold: "Configura tu hogar",
      setupDescription:
        "Crea un hogar nuevo o únete al de otra persona usando su código.",
      createHousehold: "Crear hogar",
      joinHousehold: "Unirse a un hogar",
      householdName: "Nombre del hogar",
      householdCode: "Código del hogar",
      defaultHouseholdName: "Mi hogar",
      pleaseWait: "Espera…",
      household: "Hogar",
      owner: "Propietario",
      member: "Miembro",
      syncDescription:
        "Tu plan semanal, lista de compras y recetario están respaldados y sincronizados en tiempo real en tus dispositivos.",
      copyCode: "Copiar código",
      shareCode:
        "Comparte este código en privado con alguien que quieras añadir a tu hogar.",
      unableToLoadHousehold:
        "No se pudo cargar tu hogar.",
      openDashboard: "Abrir panel de Plus",
      signingOut: "Cerrando sesión…",
      signOut: "Cerrar sesión",
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      emailPlaceholder: "tu@ejemplo.com",
      passwordPlaceholder: "Introduce tu contraseña",
      explorePlus: "Explorar Simple Dinners Plus",
      freeNote:
        "Simple Dinners sigue siendo totalmente útil sin una cuenta. Plus añade hogares compartidos, planificación inteligente y herramientas avanzadas para recetas.",
      enterEmail:
        "Introduce tu correo electrónico.",
      enterPassword: "Introduce tu contraseña.",
      confirmEmail:
        "Revisa tu correo electrónico para confirmar tu cuenta de Simple Dinners.",
      accountReady:
        "Tu cuenta de Simple Dinners está lista.",
      signedInMessage:
        "Has iniciado sesión.",
      enterHouseholdName:
        "Introduce un nombre para el hogar.",
      householdReady: "Tu hogar está listo.",
      enterHouseholdCode:
        "Introduce el código del hogar.",
      joinedHousehold:
        "Te uniste al hogar.",
      signedOutMessage:
        "Has cerrado sesión.",
      codeCopied:
        "Código del hogar copiado.",
      unableToCopy:
        "No se pudo copiar el código del hogar.",
    }
    : {
      closeLabel: "Close account window",
      tagline:
        "Shared planning for busy families.",
      cloudNotConfigured:
        "Cloud sync is not configured on this device.",
      signedIn: "Signed in",
      defaultUser: "Simple Dinners user",
      loadingHousehold:
        "Loading your household…",
      setupHousehold:
        "Set up your household",
      setupDescription:
        "Create a new household or join someone else using their household code.",
      createHousehold:
        "Create household",
      joinHousehold: "Join household",
      householdName: "Household name",
      householdCode: "Household code",
      defaultHouseholdName:
        "My Household",
      pleaseWait: "Please wait...",
      household: "Household",
      owner: "Owner",
      member: "Member",
      syncDescription:
        "Your weekly plan, shopping list, and Cookbook are backed up and synced live across your devices.",
      copyCode: "Copy code",
      shareCode:
        "Share this code privately with someone you want to add to your household.",
      unableToLoadHousehold:
        "Unable to load your household.",
      openDashboard:
        "Open Plus Dashboard",
      signingOut: "Signing out...",
      signOut: "Sign out",
      signIn: "Sign in",
      createAccount: "Create account",
      email: "Email",
      password: "Password",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder:
        "Enter your password",
      explorePlus:
        "Explore Simple Dinners Plus",
      freeNote:
        "Simple Dinners remains fully usable without an account. Plus adds household sharing, smart planning, and advanced recipe tools.",
      enterEmail:
        "Please enter your email address.",
      enterPassword:
        "Please enter your password.",
      confirmEmail:
        "Check your email to confirm your Simple Dinners account.",
      accountReady:
        "Your Simple Dinners account is ready.",
      signedInMessage:
        "You are signed in.",
      enterHouseholdName:
        "Please enter a household name.",
      householdReady:
        "Your household is ready.",
      enterHouseholdCode:
        "Please enter the household code.",
      joinedHousehold:
        "You joined the household.",
      signedOutMessage:
        "You are signed out.",
      codeCopied:
        "Household code copied.",
      unableToCopy:
        "Unable to copy the household code.",
    };

  function openPlusDashboard() {
    onClose();
    navigate("/plus");
  }

  const [mode, setMode] =
    useState<AccountMode>("sign-in");

  const [householdMode, setHouseholdMode] =
    useState<HouseholdMode>("create");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [householdName, setHouseholdName] =
    useState(
      isSpanish
        ? "Mi hogar"
        : "My Household",
    );

  const [inviteCode, setInviteCode] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMessage(null);
    setError(null);
    setPassword("");

    setHouseholdName((currentName) => {
      if (
        currentName === "My Household" ||
        currentName === "Mi hogar"
      ) {
        return isSpanish
          ? "Mi hogar"
          : "My Household";
      }

      return currentName;
    });
  }, [
    isOpen,
    mode,
    householdMode,
    isSpanish,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(copy.enterEmail);
      return;
    }

    if (!password) {
      setError(copy.enterPassword);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const result = await signUp(
          normalizedEmail,
          password,
        );

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.needsEmailConfirmation) {
          setMessage(copy.confirmEmail);
          setPassword("");
          return;
        }

        setMessage(copy.accountReady);

        return;
      }

      const result = await signIn(
        normalizedEmail,
        password,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setPassword("");
      setMessage(copy.signedInMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleHouseholdSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      if (householdMode === "create") {
        const safeName = householdName.trim();

        if (!safeName) {
          setError(copy.enterHouseholdName);
          return;
        }

        const result =
          await createHousehold(safeName);

        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(copy.householdReady);

        return;
      }

      const normalizedCode = inviteCode
        .trim()
        .toUpperCase();

      if (!normalizedCode) {
        setError(copy.enterHouseholdCode);
        return;
      }

      const result =
        await joinHousehold(normalizedCode);

      if (result.error) {
        setError(result.error);
        return;
      }

      setInviteCode("");
      setMessage(copy.joinedHousehold);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signOut();

      if (result.error) {
        setError(result.error);
        return;
      }

      setEmail("");
      setPassword("");
      setInviteCode("");
      setMessage(copy.signedOutMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyInviteCode() {
    if (!household?.inviteCode) {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      await navigator.clipboard.writeText(
        household.inviteCode,
      );

      setMessage(copy.codeCopied);
    } catch {
      /*
       * Fallback for browsers or native WebViews where
       * the modern Clipboard API is unavailable.
       */
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
        setMessage(copy.codeCopied);
      } else {
        setError(copy.unableToCopy);
      }
    }
  }

  const displayedHouseholdName =
    isSpanish &&
      household?.name === "My Household"
      ? "Mi hogar"
      : household?.name;

  return (
    <div
      className="sd-account-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className="sd-account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-account-title"
      >
        <button
          type="button"
          className="sd-account-close"
          onClick={onClose}
          aria-label={copy.closeLabel}
        >
          ×
        </button>

        <div className="sd-account-brand">
          <span className="sd-account-plus-badge">
            Plus
          </span>

          <h2 id="sd-account-title">
            Simple Dinners Plus
          </h2>

          <p>{copy.tagline}</p>
        </div>

        {!isConfigured ? (
          <div className="sd-account-notice sd-account-error">
            {copy.cloudNotConfigured}
          </div>
        ) : isSignedIn ? (
          <div className="sd-account-signed-in">
            <div className="sd-account-status-card">
              <span className="sd-account-status-dot" />

              <div>
                <strong>{copy.signedIn}</strong>

                <p>
                  {user?.email ??
                    copy.defaultUser}
                </p>
              </div>
            </div>

            {householdLoading ? (
              <div className="sd-account-notice">
                {copy.loadingHousehold}
              </div>
            ) : needsHouseholdSetup ? (
              <div className="sd-household-setup">
                <div>
                  <h3>
                    {copy.setupHousehold}
                  </h3>

                  <p className="sd-account-description">
                    {copy.setupDescription}
                  </p>
                </div>

                <div className="sd-household-choice-grid">
                  <button
                    type="button"
                    className={
                      householdMode === "create"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setHouseholdMode("create")
                    }
                  >
                    {copy.createHousehold}
                  </button>

                  <button
                    type="button"
                    className={
                      householdMode === "join"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setHouseholdMode("join")
                    }
                  >
                    {copy.joinHousehold}
                  </button>
                </div>

                <form
                  className="sd-account-form"
                  onSubmit={(event) =>
                    void handleHouseholdSubmit(
                      event,
                    )
                  }
                >
                  {householdMode === "create" ? (
                    <label>
                      {copy.householdName}

                      <input
                        type="text"
                        value={householdName}
                        onChange={(event) =>
                          setHouseholdName(
                            event.target.value,
                          )
                        }
                        placeholder={
                          copy.defaultHouseholdName
                        }
                        maxLength={80}
                        disabled={isSubmitting}
                      />
                    </label>
                  ) : (
                    <label>
                      {copy.householdCode}

                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(event) =>
                          setInviteCode(
                            event.target.value
                              .toUpperCase(),
                          )
                        }
                        placeholder="ABCD1234"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={8}
                        disabled={isSubmitting}
                      />
                    </label>
                  )}

                  {message && (
                    <div className="sd-account-notice">
                      {message}
                    </div>
                  )}

                  {(error ||
                    householdError) && (
                      <div className="sd-account-notice sd-account-error">
                        {error ?? householdError}
                      </div>
                    )}

                  <button
                    type="submit"
                    className="sd-account-primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? copy.pleaseWait
                      : householdMode ===
                        "create"
                        ? copy.createHousehold
                        : copy.joinHousehold}
                  </button>
                </form>
              </div>
            ) : household ? (
              <>
                <div className="sd-household-card">
                  <div className="sd-household-card-header">
                    <div>
                      <span className="sd-household-label">
                        {copy.household}
                      </span>

                      <h3>
                        {displayedHouseholdName}
                      </h3>
                    </div>

                    <span className="sd-household-role">
                      {household.role === "owner"
                        ? copy.owner
                        : copy.member}
                    </span>
                  </div>

                  <p className="sd-account-description">
                    {copy.syncDescription}
                  </p>

                  {household.role === "owner" && (
                    <div className="sd-household-invite">
                      <span className="sd-household-label">
                        {copy.householdCode}
                      </span>

                      <div className="sd-household-code-row">
                        <code>
                          {household.inviteCode}
                        </code>

                        <button
                          type="button"
                          onClick={() =>
                            void handleCopyInviteCode()
                          }
                        >
                          {copy.copyCode}
                        </button>
                      </div>

                      <p>{copy.shareCode}</p>
                    </div>
                  )}
                </div>

                {message && (
                  <div className="sd-account-notice">
                    {message}
                  </div>
                )}

                {(error ||
                  householdError) && (
                    <div className="sd-account-notice sd-account-error">
                      {error ?? householdError}
                    </div>
                  )}
              </>
            ) : (
              <div className="sd-account-notice sd-account-error">
                {householdError ??
                  copy.unableToLoadHousehold}
              </div>
            )}

            <button
              type="button"
              className="sd-account-primary-button"
              onClick={openPlusDashboard}
            >
              {copy.openDashboard}
            </button>

            <button
              type="button"
              className="sd-account-secondary-button"
              onClick={() =>
                void handleSignOut()
              }
              disabled={isSubmitting}
            >
              {isSubmitting
                ? copy.signingOut
                : copy.signOut}
            </button>
          </div>
        ) : (
          <>
            <div className="sd-account-tabs">
              <button
                type="button"
                className={
                  mode === "sign-in"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMode("sign-in")
                }
              >
                {copy.signIn}
              </button>

              <button
                type="button"
                className={
                  mode === "sign-up"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMode("sign-up")
                }
              >
                {copy.createAccount}
              </button>
            </div>

            <form
              className="sd-account-form"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
            >
              <label>
                {copy.email}

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder={
                    copy.emailPlaceholder
                  }
                  disabled={isSubmitting}
                />
              </label>

              <label>
                {copy.password}

                <input
                  type="password"
                  autoComplete={
                    mode === "sign-up"
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder={
                    copy.passwordPlaceholder
                  }
                  disabled={isSubmitting}
                />
              </label>

              {message && (
                <div className="sd-account-notice">
                  {message}
                </div>
              )}

              {error && (
                <div className="sd-account-notice sd-account-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="sd-account-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? copy.pleaseWait
                  : mode === "sign-up"
                    ? copy.createAccount
                    : copy.signIn}
              </button>
            </form>

            <button
              type="button"
              className="sd-account-secondary-button"
              onClick={openPlusDashboard}
            >
              {copy.explorePlus}
            </button>

            <p className="sd-account-free-note">
              {copy.freeNote}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
