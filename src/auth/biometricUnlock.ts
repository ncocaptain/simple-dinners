import { Capacitor } from "@capacitor/core";
import {
  BiometryType,
  NativeBiometric,
} from "@capgo/capacitor-native-biometric";

const BIOMETRIC_UNLOCK_KEY =
  "simple-dinners:biometric-unlock-enabled";

export type BiometricAvailability = {
  available: boolean;
  label: string;
};

export function isBiometricUnlockEnabled() {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    return (
      localStorage.getItem(
        BIOMETRIC_UNLOCK_KEY,
      ) === "true"
    );
  } catch {
    return false;
  }
}

export function setBiometricUnlockEnabled(
  enabled: boolean,
) {
  try {
    if (enabled) {
      localStorage.setItem(
        BIOMETRIC_UNLOCK_KEY,
        "true",
      );
    } else {
      localStorage.removeItem(
        BIOMETRIC_UNLOCK_KEY,
      );
    }
  } catch {
    // Ignore storage failures.
  }

  window.dispatchEvent(
    new CustomEvent(
      "simple-dinners:biometric-unlock-changed",
      {
        detail: { enabled },
      },
    ),
  );
}

function biometricLabel(
  biometryType: BiometryType,
) {
  switch (biometryType) {
    case BiometryType.FACE_ID:
      return "Face ID";
    case BiometryType.TOUCH_ID:
      return "Touch ID";
    case BiometryType.FINGERPRINT:
      return "fingerprint";
    case BiometryType.FACE_AUTHENTICATION:
      return "face unlock";
    case BiometryType.IRIS_AUTHENTICATION:
      return "iris unlock";
    default:
      return "biometrics";
  }
}

export async function getBiometricAvailability():
  Promise<BiometricAvailability> {
  if (!Capacitor.isNativePlatform()) {
    return {
      available: false,
      label: "biometrics",
    };
  }

  try {
    const result =
      await NativeBiometric.isAvailable();

    return {
      available: result.isAvailable,
      label: biometricLabel(
        result.biometryType,
      ),
    };
  } catch {
    return {
      available: false,
      label: "biometrics",
    };
  }
}

export async function verifyBiometricUnlock(
  reason = "Unlock Simple Dinners",
) {
  await NativeBiometric.verifyIdentity({
    reason,
    title: "Unlock Simple Dinners",
    subtitle:
      "Use your device security to continue.",
    description:
      "Simple Dinners does not store your account password.",
    negativeButtonText: "Cancel",
    useFallback: true,
    fallbackTitle: "Use device passcode",
    maxAttempts: 3,
  });
}
