import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "./AuthContext";
import "./AccountModal.css";

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AccountMode = "sign-in" | "sign-up";

export function AccountModal({
  isOpen,
  onClose,
}: AccountModalProps) {
  const {
    user,
    isSignedIn,
    isConfigured,
    signIn,
    signUp,
    signOut,
  } = useAuth();

  const [mode, setMode] =
    useState<AccountMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [message, setMessage] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMessage(null);
    setError(null);
    setPassword("");
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

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
      setError("Please enter your email address.");
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
      setMessage("You are signed out.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="sd-account-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
            Cloud sync is not configured on this device.
          </div>
        ) : isSignedIn ? (
          <div className="sd-account-signed-in">
            <div className="sd-account-status-card">
              <span className="sd-account-status-dot" />

              <div>
                <strong>Signed in</strong>
                <p>{user?.email ?? "Simple Dinners user"}</p>
              </div>
            </div>

            <p className="sd-account-description">
              Your account is ready. Shopping-list sync
              will be connected in the next step.
            </p>

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
              type="button"
              className="sd-account-secondary-button"
              onClick={() => void handleSignOut()}
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
                  mode === "sign-in" ? "active" : ""
                }
                onClick={() => setMode("sign-in")}
              >
                Sign in
              </button>

              <button
                type="button"
                className={
                  mode === "sign-up" ? "active" : ""
                }
                onClick={() => setMode("sign-up")}
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
                    setPassword(event.target.value)
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

            <p className="sd-account-free-note">
              Simple Dinners remains fully usable without
              an account. Plus adds cloud and household
              convenience.
            </p>
          </>
        )}
      </section>
    </div>
  );
}