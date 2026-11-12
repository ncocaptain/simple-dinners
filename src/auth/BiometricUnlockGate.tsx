import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "./AuthContext";
import {
  getBiometricAvailability,
  isBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
  verifyBiometricUnlock,
} from "./biometricUnlock";

type GateState =
  | "checking"
  | "unlocked"
  | "locked";

export function BiometricUnlockGate({
  children,
}: PropsWithChildren) {
  const {
    loading,
    isSignedIn,
    signOut,
  } = useAuth();

  const [state, setState] =
    useState<GateState>("checking");
  const [label, setLabel] =
    useState("biometrics");
  const [error, setError] =
    useState<string | null>(null);
  const [unlocking, setUnlocking] =
    useState(false);

  const unlock = useCallback(
    async () => {
      setUnlocking(true);
      setError(null);

      try {
        await verifyBiometricUnlock();
        setState("unlocked");
      } catch {
        setState("locked");
        setError(
          "Authentication was canceled or could not be completed.",
        );
      } finally {
        setUnlocking(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !Capacitor.isNativePlatform() ||
      !isSignedIn ||
      !isBiometricUnlockEnabled()
    ) {
      setState("unlocked");
      return;
    }

    let active = true;

    void getBiometricAvailability()
      .then((availability) => {
        if (!active) {
          return;
        }

        setLabel(availability.label);

        if (!availability.available) {
          setBiometricUnlockEnabled(false);
          setState("unlocked");
          return;
        }

        setState("locked");
        void unlock();
      });

    return () => {
      active = false;
    };
  }, [
    loading,
    isSignedIn,
    unlock,
  ]);

  if (
    state === "checking" ||
    loading
  ) {
    return null;
  }

  if (state === "unlocked") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding:
          "calc(24px + env(safe-area-inset-top, 0px)) 20px calc(24px + env(safe-area-inset-bottom, 0px))",
        background:
          "linear-gradient(180deg, #050505 0%, #07111f 45%, #06111f 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "min(100%, 420px)",
          padding: 26,
          borderRadius: 22,
          border:
            "1px solid rgba(255,255,255,0.12)",
          background:
            "rgba(15,23,42,0.88)",
          boxShadow:
            "0 24px 70px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 58,
            height: 58,
            margin: "0 auto 16px",
            display: "grid",
            placeItems: "center",
            borderRadius: 18,
            background:
              "rgba(245,158,11,0.14)",
            fontSize: 28,
          }}
        >
          🔐
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          Simple Dinners is locked
        </h1>

        <p
          style={{
            margin: "10px 0 20px",
            opacity: 0.7,
            lineHeight: 1.5,
          }}
        >
          Unlock with {label} to continue.
          Your Simple Dinners password is not
          stored on this device.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 11,
              background:
                "rgba(239,68,68,0.12)",
              color: "#fecaca",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => void unlock()}
          disabled={unlocking}
          style={{
            width: "100%",
            minHeight: 48,
            border: 0,
            borderRadius: 12,
            background: "#f59e0b",
            color: "#271900",
            fontWeight: 900,
            cursor:
              unlocking
                ? "wait"
                : "pointer",
          }}
        >
          {unlocking
            ? "Unlocking..."
            : `Unlock with ${label}`}
        </button>

        <button
          type="button"
          onClick={() => {
            setBiometricUnlockEnabled(false);
            void signOut();
            setState("unlocked");
          }}
          disabled={unlocking}
          style={{
            width: "100%",
            minHeight: 44,
            marginTop: 10,
            border: 0,
            background: "transparent",
            color: "#cbd5e1",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Sign out instead
        </button>
      </section>
    </div>
  );
}
