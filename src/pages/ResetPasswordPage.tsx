import {
  useState,
  type FormEvent,
} from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredLanguage } from "../i18n";
import { useAuth } from "../auth/AuthContext";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const {
    loading,
    isSignedIn,
    updatePassword,
  } = useAuth();

  const isSpanish =
    getStoredLanguage() === "es";

  const copy = isSpanish
    ? {
        eyebrow: "SEGURIDAD DE LA CUENTA",
        title: "Crea una contraseña nueva",
        description:
          "Elige una contraseña nueva para tu cuenta de Simple Dinners.",
        password: "Nueva contraseña",
        confirm: "Confirmar contraseña",
        placeholder: "Al menos 8 caracteres",
        mismatch:
          "Las contraseñas no coinciden.",
        tooShort:
          "La contraseña debe tener al menos 8 caracteres.",
        saving: "Guardando…",
        save: "Guardar contraseña",
        successTitle:
          "Contraseña actualizada",
        success:
          "Tu nueva contraseña está lista. Ya puedes seguir usando Simple Dinners.",
        continue: "Continuar a Simple Dinners",
        invalidTitle:
          "Este enlace ya no es válido",
        invalid:
          "El enlace para restablecer la contraseña expiró o ya fue utilizado. Solicita uno nuevo desde la pantalla de inicio de sesión.",
        back: "Volver a Simple Dinners",
        show: "Mostrar contraseña",
        hide: "Ocultar contraseña",
      }
    : {
        eyebrow: "ACCOUNT SECURITY",
        title: "Create a new password",
        description:
          "Choose a new password for your Simple Dinners account.",
        password: "New password",
        confirm: "Confirm password",
        placeholder: "At least 8 characters",
        mismatch:
          "The passwords do not match.",
        tooShort:
          "Your password must be at least 8 characters.",
        saving: "Saving…",
        save: "Save new password",
        successTitle:
          "Password updated",
        success:
          "Your new password is ready. You can continue using Simple Dinners.",
        continue: "Continue to Simple Dinners",
        invalidTitle:
          "This reset link is no longer valid",
        invalid:
          "The password reset link expired or has already been used. Request a new one from the sign-in screen.",
        back: "Back to Simple Dinners",
        show: "Show password",
        hide: "Hide password",
      };

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [complete, setComplete] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(copy.tooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.mismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        await updatePassword(password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const shellStyle = {
    minHeight: "65vh",
    display: "grid",
    placeItems: "center",
    padding: "28px 18px 48px",
  } as const;

  const cardStyle = {
    width: "min(100%, 470px)",
    padding: "28px",
    borderRadius: 24,
    border:
      "1px solid rgba(255,255,255,0.10)",
    background:
      "rgba(15, 23, 42, 0.92)",
    boxShadow:
      "0 24px 60px rgba(0,0,0,0.35)",
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 14,
    border:
      "1px solid rgba(255,255,255,0.13)",
    background:
      "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    padding: "13px 48px 13px 14px",
    fontSize: 16,
    outline: "none",
  } as const;

  const buttonStyle = {
    width: "100%",
    border: 0,
    borderRadius: 14,
    padding: "14px 16px",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  } as const;

  if (loading) {
    return (
      <main style={shellStyle}>
        <section style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.72)",
              textAlign: "center",
            }}
          >
            Loading…
          </p>
        </section>
      </main>
    );
  }

  if (complete) {
    return (
      <main style={shellStyle}>
        <section style={cardStyle}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              background:
                "rgba(34,197,94,0.13)",
              marginBottom: 18,
            }}
          >
            <KeyRound
              size={26}
              aria-hidden="true"
            />
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 28,
              color: "#f8fafc",
            }}
          >
            {copy.successTitle}
          </h1>

          <p
            style={{
              margin: "0 0 22px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.55,
            }}
          >
            {copy.success}
          </p>

          <button
            type="button"
            style={{
              ...buttonStyle,
              background: "#f97316",
              color: "#fff",
            }}
            onClick={() =>
              navigate("/", { replace: true })
            }
          >
            {copy.continue}
          </button>
        </section>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main style={shellStyle}>
        <section style={cardStyle}>
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 28,
              color: "#f8fafc",
            }}
          >
            {copy.invalidTitle}
          </h1>

          <p
            style={{
              margin: "0 0 22px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.55,
            }}
          >
            {copy.invalid}
          </p>

          <button
            type="button"
            style={{
              ...buttonStyle,
              background:
                "rgba(255,255,255,0.09)",
              color: "#f8fafc",
            }}
            onClick={() =>
              navigate("/", { replace: true })
            }
          >
            {copy.back}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#fb923c",
            marginBottom: 9,
          }}
        >
          {copy.eyebrow}
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 29,
            color: "#f8fafc",
          }}
        >
          {copy.title}
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "rgba(255,255,255,0.68)",
            lineHeight: 1.55,
          }}
        >
          {copy.description}
        </p>

        <form
          onSubmit={(event) =>
            void handleSubmit(event)
          }
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <label
            style={{
              display: "grid",
              gap: 7,
              color: "#e2e8f0",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {copy.password}

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder={copy.placeholder}
                minLength={8}
                disabled={isSubmitting}
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                aria-label={
                  showPassword
                    ? copy.hide
                    : copy.show
                }
                title={
                  showPassword
                    ? copy.hide
                    : copy.show
                }
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform:
                    "translateY(-50%)",
                  display: "grid",
                  placeItems: "center",
                  padding: 4,
                  border: 0,
                  background: "transparent",
                  color:
                    "rgba(255,255,255,0.68)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    size={20}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </label>

          <label
            style={{
              display: "grid",
              gap: 7,
              color: "#e2e8f0",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {copy.confirm}

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder={copy.placeholder}
              minLength={8}
              disabled={isSubmitting}
              style={{
                ...inputStyle,
                paddingRight: 14,
              }}
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background:
                  "rgba(239,68,68,0.13)",
                color: "#fecaca",
                lineHeight: 1.45,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...buttonStyle,
              marginTop: 2,
              background: "#f97316",
              color: "#fff",
              opacity:
                isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting
              ? copy.saving
              : copy.save}
          </button>
        </form>
      </section>
    </main>
  );
}
