import { Capacitor } from "@capacitor/core";
import {
  LOG_LEVEL,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";

export const REVENUECAT_ENTITLEMENT_ID =
  "Simple Dinners Plus";

type RevenueCatSetupResult = {
  configured: boolean;
  error: string | null;
};

export type RevenueCatPackages = {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
};

function getRevenueCatApiKey(): string {
  return String(
    import.meta.env
      .VITE_REVENUECAT_TEST_API_KEY ?? "",
  ).trim();
}

export function isRevenueCatNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function customerHasPlus(
  customerInfo: CustomerInfo,
): boolean {
  return Boolean(
    customerInfo.entitlements.active[
    REVENUECAT_ENTITLEMENT_ID
    ],
  );
}

export async function configureRevenueCat(
  appUserID: string,
): Promise<RevenueCatSetupResult> {
  /*
   * Purchases only run inside the native iOS
   * and Android apps. The Vercel/PWA version
   * remains unaffected.
   */
  if (!isRevenueCatNativePlatform()) {
    return {
      configured: false,
      error: null,
    };
  }

  const apiKey = getRevenueCatApiKey();

  if (!apiKey) {
    return {
      configured: false,
      error:
        "RevenueCat API key is missing.",
    };
  }

  const normalizedUserID =
    appUserID.trim();

  if (!normalizedUserID) {
    return {
      configured: false,
      error:
        "RevenueCat requires a signed-in user.",
    };
  }

  try {
    if (import.meta.env.DEV) {
      await Purchases.setLogLevel({
        level: LOG_LEVEL.DEBUG,
      });
    }

    const configuration =
      await Purchases.isConfigured();

    if (!configuration.isConfigured) {
      await Purchases.configure({
        apiKey,
        appUserID: normalizedUserID,
      });
    } else {
      const currentUser =
        await Purchases.getAppUserID();

      if (
        currentUser.appUserID !==
        normalizedUserID
      ) {
        await Purchases.logIn({
          appUserID: normalizedUserID,
        });
      }
    }

    return {
      configured: true,
      error: null,
    };
  } catch (error) {
    console.error(
      "Unable to configure RevenueCat:",
      error,
    );

    return {
      configured: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to configure RevenueCat.",
    };
  }
}

export async function getRevenueCatCustomerInfo():
  Promise<CustomerInfo> {
  const result =
    await Purchases.getCustomerInfo();

  return result.customerInfo;
}

export async function getRevenueCatPackages():
  Promise<RevenueCatPackages> {
  if (!isRevenueCatNativePlatform()) {
    return {
      monthly: null,
      annual: null,
    };
  }

  const offerings =
    await Purchases.getOfferings();

  const currentOffering =
    offerings.current;

  if (!currentOffering) {
    return {
      monthly: null,
      annual: null,
    };
  }

  return {
    monthly:
      currentOffering.monthly ?? null,

    annual:
      currentOffering.annual ?? null,
  };
}

export async function purchaseRevenueCatPackage(
  aPackage: PurchasesPackage,
): Promise<CustomerInfo> {
  const result =
    await Purchases.purchasePackage({
      aPackage,
    });

  return result.customerInfo;
}

export async function restoreRevenueCatPurchases():
  Promise<CustomerInfo> {
  const result =
    await Purchases.restorePurchases();

  return result.customerInfo;
}

export function wasRevenueCatPurchaseCancelled(
  error: unknown,
): boolean {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  return (
    "userCancelled" in error &&
    error.userCancelled === true
  );
}

export function getRevenueCatErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}