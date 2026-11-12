import { Capacitor } from "@capacitor/core";
import {
  AccessControl,
  BiometryType,
  NativeBiometric,
} from "@capgo/capacitor-native-biometric";

const SERVER = "dinners.ncocaptain.com";

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
    const [availability, credentials] =
      await Promise.all([
        NativeBiometric.isAvailable(),
        NativeBiometric.isCredentialsSaved({
          server: SERVER,
        }).catch(() => ({
          isSaved: false,
        })),
      ]);

    return {
      available: availability.isAvailable,
      label: labelFor(
        availability.biometryType,
      ),
      saved: credentials.isSaved,
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
    subtitle:
      "Protect this login with your biometrics.",
    description:
      "Your password stays in your device Keychain or Keystore.",
    negativeButtonText: "Cancel",
  });
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
}
