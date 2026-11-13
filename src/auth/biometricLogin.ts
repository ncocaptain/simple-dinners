import { Capacitor } from "@capacitor/core";
import {
  AccessControl,
  BiometryType,
  NativeBiometric,
} from "@capgo/capacitor-native-biometric";

const SERVER = "dinners.ncocaptain.com";
const SAVED_LOGIN_KEY =
  "simple-dinners:biometric-login-saved";

function hasSavedLoginMarker() {
  try {
    return (
      localStorage.getItem(
        SAVED_LOGIN_KEY,
      ) === "true"
    );
  } catch {
    return false;
  }
}

function setSavedLoginMarker(
  saved: boolean,
) {
  try {
    if (saved) {
      localStorage.setItem(
        SAVED_LOGIN_KEY,
        "true",
      );
    } else {
      localStorage.removeItem(
        SAVED_LOGIN_KEY,
      );
    }
  } catch {
    // The secure credential remains authoritative.
  }
}

export type BiometricLoginStatus = {
  available: boolean;
  label: string;
  saved: boolean;
};

function labelFor(type?: BiometryType) {
  switch (type) {
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

export async function getBiometricLoginStatus():
  Promise<BiometricLoginStatus> {
  if (!Capacitor.isNativePlatform()) {
    return {
      available: false,
      label: "biometrics",
      saved: false,
    };
  }

  try {
    const availability =
      await NativeBiometric.isAvailable();

    return {
      available: availability.isAvailable,
      label: labelFor(
        availability.biometryType,
      ),
      saved:
        availability.isAvailable &&
        hasSavedLoginMarker(),
    };
  } catch {
    return {
      available: false,
      label: "biometrics",
      saved: false,
    };
  }
}

export async function saveBiometricLogin(
  email: string,
  password: string,
) {
  await NativeBiometric.setCredentials({
    username: email,
    password,
    server: SERVER,
    accessControl:
      AccessControl.BIOMETRY_CURRENT_SET,
    title:
      "Save Simple Dinners sign-in",
    negativeButtonText: "Cancel",
  });

  setSavedLoginMarker(true);
}

export async function getBiometricLogin() {
  return NativeBiometric.getSecureCredentials({
    server: SERVER,
  });
}

export async function deleteBiometricLogin() {
  await NativeBiometric.deleteCredentials({
    server: SERVER,
  });

  setSavedLoginMarker(false);
}

export function clearBiometricLoginMarker() {
  setSavedLoginMarker(false);
}
