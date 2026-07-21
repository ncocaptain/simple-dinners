import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
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
    useState("My Household");

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
  }, [isOpen, mode, householdMode]);

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
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
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
          setMessage(
            "Check your email to confirm your Simple Dinners account.",
          );
          setPassword("");
          return;
        }

        setMessage(
          "Your Simple Dinners account is ready.",
        );

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
      setMessage("You are signed in.");
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
          setError(
            "Please enter a household name.",
          );
          return;
        }

        const result =
          await createHousehold(safeName);

        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(
          "Your household is ready.",
        );

        return;
      }

      const normalizedCode = inviteCode
        .trim()
        .toUpperCase();

      if (!normalizedCode) {
        setError(
          "Please enter the household code.",
        );
        return;
      }

      const result =
        await joinHousehold(normalizedCode);

      if (result.error) {
        setError(result.error);
        return;
      }

      setInviteCode("");
      setMessage(
        "You joined the household.",
      );
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
      setMessage("You are signed out.");
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

      setMessage(
        "Household code copied.",
      );
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
        setMessage(
          "Household code copied.",
        );
      } else {
        setError(
          "Unable to copy the household code.",
        );
      }
    }
  }

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
          aria-label="Close account window"
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

          <p>
            Shared planning for busy families.
          </p>
        </div>

        {!isConfigured ? (
          <div className="sd-account-notice sd-account-error">
            Cloud sync is not configured on this
            device.
          </div>
        ) : isSignedIn ? (
          <div className="sd-account-signed-in">
            <div className="sd-account-status-card">
              <span className="sd-account-status-dot" />

              <div>
                <strong>Signed in</strong>

                <p>
                  {user?.email ??
                    "Simple Dinners user"}
                </p>
              </div>
            </div>

            {householdLoading ? (
              <div className="sd-account-notice">
                Loading your household…
              </div>
            ) : needsHouseholdSetup ? (
              <div className="sd-household-setup">
                <div>
                  <h3>
                    Set up your household
                  </h3>

                  <p className="sd-account-description">
                    Create a new household or join
                    someone else using their household
                    code.
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
                    Create household
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
                    Join household
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
                      Household name

                      <input
                        type="text"
                        value={householdName}
                        onChange={(event) =>
                          setHouseholdName(
                            event.target.value,
                          )
                        }
                        placeholder="My Household"
                        maxLength={80}
                        disabled={isSubmitting}
                      />
                    </label>
                  ) : (
                    <label>
                      Household code

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
                      ? "Please wait..."
                      : householdMode ===
                        "create"
                        ? "Create household"
                        : "Join household"}
                  </button>
                </form>
              </div>
            ) : household ? (
              <>
                <div className="sd-household-card">
                  <div className="sd-household-card-header">
                    <div>
                      <span className="sd-household-label">
                        Household
                      </span>

                      <h3>{household.name}</h3>
                    </div>

                    <span className="sd-household-role">
                      {household.role === "owner"
                        ? "Owner"
                        : "Member"}
                    </span>
                  </div>

                  <p className="sd-account-description">
                    Your weekly plan, shopping list,
                    and Cookbook are backed up and
                    synced live across your devices.
                  </p>

                  {household.role === "owner" && (
                    <div className="sd-household-invite">
                      <span className="sd-household-label">
                        Household code
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
                          Copy code
                        </button>
                      </div>

                      <p>
                        Share this code privately with
                        someone you want to add to your
                        household.
                      </p>
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
                  "Unable to load your household."}
              </div>
            )}

            <button
              type="button"
              className="sd-account-primary-button"
              onClick={openPlusDashboard}
            >
              Open Plus Dashboard
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
                ? "Signing out..."
                : "Sign out"}
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
                Sign in
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
                Create account
              </button>
            </div>

            <form
              className="sd-account-form"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
            >
              <label>
                Email

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </label>

              <label>
                Password

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
                  placeholder="Enter your password"
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
                  ? "Please wait..."
                  : mode === "sign-up"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <button
              type="button"
              className="sd-account-secondary-button"
              onClick={openPlusDashboard}
            >
              Explore Simple Dinners Plus
            </button>

            <p className="sd-account-free-note">
              Simple Dinners remains fully usable
              without an account. Plus adds household
              sharing, smart planning, and advanced
              recipe tools.
            </p>
          </>
        )}
      </section>
    </div>
  );
}