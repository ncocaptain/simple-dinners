import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  Purchases,
  type CustomerInfo,
} from "@revenuecat/purchases-capacitor";
import { useAuth } from "../auth/AuthContext";
import {
  configureRevenueCat,
  customerHasPlus,
  getRevenueCatCustomerInfo,
  getRevenueCatErrorMessage,
  getRevenueCatPackages,
  isRevenueCatNativePlatform,
  purchaseRevenueCatPackage,
  REVENUECAT_ENTITLEMENT_ID,
  restoreRevenueCatPurchases,
  wasRevenueCatPurchaseCancelled,
  type RevenueCatPackages,
} from "./revenueCat";

export type PlusStatus =
  | "loading"
  | "active"
  | "inactive";

export type PlusSource =
  | "beta"
  | "test"
  | "apple"
  | "google"
  | "promo"
  | "other"
  | "none";

export type PlusPlan =
  | "monthly"
  | "annual";

export type PlusActionResult = {
  success: boolean;
  cancelled: boolean;
  error: string | null;
};

type PlusEntitlementContextValue = {
  hasPlus: boolean;
  plusStatus: PlusStatus;
  plusSource: PlusSource;
  plusLoading: boolean;

  monthlyPrice: string | null;
  annualPrice: string | null;
  annualMonthlyPrice: string | null;

  packagesLoading: boolean;
  purchaseLoading: boolean;
  restoreLoading: boolean;

  refreshPlusEntitlement: () => Promise<void>;
  refreshPlusPackages: () => Promise<void>;

  purchasePlus: (
    plan: PlusPlan,
  ) => Promise<PlusActionResult>;

  restorePlusPurchases:
  () => Promise<PlusActionResult>;
};

/*
 * Quiet beta:
 * Everyone still receives Plus access.
 *
 * RevenueCat is checked on native devices,
 * but a customer without a subscription continues
 * receiving beta access while this remains true.
 *
 * Set this to false locally when testing actual
 * RevenueCat inactive and purchase states.
 */
const PLUS_BETA_ENABLED = true;

const EMPTY_PACKAGES: RevenueCatPackages = {
  monthly: null,
  annual: null,
};

const PlusEntitlementContext =
  createContext<PlusEntitlementContextValue | null>(
    null,
  );

function getPlusSource(
  customerInfo: CustomerInfo,
): PlusSource {
  const entitlement =
    customerInfo.entitlements.active[
    REVENUECAT_ENTITLEMENT_ID
    ];

  switch (entitlement?.store) {
    case "APP_STORE":
    case "MAC_APP_STORE":
      return "apple";

    case "PLAY_STORE":
      return "google";

    case "PROMOTIONAL":
      return "promo";

    case "TEST_STORE":
      return "test";

    default:
      return entitlement
        ? "other"
        : "none";
  }
}

export function PlusEntitlementProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [plusStatus, setPlusStatus] =
    useState<PlusStatus>(
      PLUS_BETA_ENABLED
        ? "active"
        : "loading",
    );

  const [plusSource, setPlusSource] =
    useState<PlusSource>(
      PLUS_BETA_ENABLED
        ? "beta"
        : "none",
    );

  const [packages, setPackages] =
    useState<RevenueCatPackages>(
      EMPTY_PACKAGES,
    );

  const [
    packagesLoading,
    setPackagesLoading,
  ] = useState(false);

  const [
    purchaseLoading,
    setPurchaseLoading,
  ] = useState(false);

  const [
    restoreLoading,
    setRestoreLoading,
  ] = useState(false);

  const applyBetaFallback =
    useCallback(() => {
      setPlusStatus(
        PLUS_BETA_ENABLED
          ? "active"
          : "inactive",
      );

      setPlusSource(
        PLUS_BETA_ENABLED
          ? "beta"
          : "none",
      );
    }, []);

  const applyCustomerInfo =
    useCallback(
      (customerInfo: CustomerInfo) => {
        if (
          customerHasPlus(customerInfo)
        ) {
          setPlusStatus("active");
          setPlusSource(
            getPlusSource(customerInfo),
          );
          return;
        }

        applyBetaFallback();
      },
      [applyBetaFallback],
    );

  const refreshPlusPackages =
    useCallback(async () => {
      if (
        authLoading ||
        !user?.id ||
        !isRevenueCatNativePlatform()
      ) {
        setPackages(EMPTY_PACKAGES);
        setPackagesLoading(false);
        return;
      }

      setPackagesLoading(true);

      try {
        const setupResult =
          await configureRevenueCat(user.id);

        if (!setupResult.configured) {
          if (setupResult.error) {
            console.error(
              "RevenueCat packages unavailable:",
              setupResult.error,
            );
          }

          setPackages(EMPTY_PACKAGES);
          return;
        }

        const nextPackages =
          await getRevenueCatPackages();

        setPackages(nextPackages);
      } catch (error) {
        console.error(
          "Unable to load RevenueCat packages:",
          error,
        );

        setPackages(EMPTY_PACKAGES);
      } finally {
        setPackagesLoading(false);
      }
    }, [
      authLoading,
      user?.id,
    ]);

  const refreshPlusEntitlement =
    useCallback(async () => {
      if (authLoading) {
        if (!PLUS_BETA_ENABLED) {
          setPlusStatus("loading");
          setPlusSource("none");
        }

        return;
      }

      /*
       * RevenueCat purchases currently run only
       * inside native iOS and Android builds.
       *
       * The Vercel/PWA version continues using
       * the current beta entitlement.
       */
      if (
        !isRevenueCatNativePlatform() ||
        !user?.id
      ) {
        applyBetaFallback();
        return;
      }

      if (!PLUS_BETA_ENABLED) {
        setPlusStatus("loading");
        setPlusSource("none");
      }

      const setupResult =
        await configureRevenueCat(user.id);

      if (!setupResult.configured) {
        if (setupResult.error) {
          console.error(
            "RevenueCat setup was unavailable:",
            setupResult.error,
          );
        }

        applyBetaFallback();
        return;
      }

      try {
        const customerInfo =
          await getRevenueCatCustomerInfo();

        applyCustomerInfo(customerInfo);
      } catch (error) {
        console.error(
          "Unable to refresh Plus entitlement:",
          error,
        );

        /*
         * Keep the beta available if RevenueCat
         * is temporarily unavailable.
         */
        applyBetaFallback();
      }
    }, [
      authLoading,
      user?.id,
      applyBetaFallback,
      applyCustomerInfo,
    ]);

  const purchasePlus =
    useCallback(
      async (
        plan: PlusPlan,
      ): Promise<PlusActionResult> => {
        if (authLoading || !user?.id) {
          return {
            success: false,
            cancelled: false,
            error:
              "Sign in before subscribing to Simple Dinners Plus.",
          };
        }

        if (!isRevenueCatNativePlatform()) {
          return {
            success: false,
            cancelled: false,
            error:
              "Plus subscriptions are available in the iOS and Android apps.",
          };
        }

        setPurchaseLoading(true);

        try {
          const setupResult =
            await configureRevenueCat(user.id);

          if (!setupResult.configured) {
            return {
              success: false,
              cancelled: false,
              error:
                setupResult.error ??
                "Subscriptions are unavailable right now.",
            };
          }

          let availablePackages = packages;

          let packageToPurchase =
            plan === "monthly"
              ? availablePackages.monthly
              : availablePackages.annual;

          if (!packageToPurchase) {
            availablePackages =
              await getRevenueCatPackages();

            setPackages(availablePackages);

            packageToPurchase =
              plan === "monthly"
                ? availablePackages.monthly
                : availablePackages.annual;
          }

          if (!packageToPurchase) {
            return {
              success: false,
              cancelled: false,
              error:
                "That subscription option is not available right now.",
            };
          }

          const customerInfo =
            await purchaseRevenueCatPackage(
              packageToPurchase,
            );

          applyCustomerInfo(customerInfo);

          if (!customerHasPlus(customerInfo)) {
            return {
              success: false,
              cancelled: false,
              error:
                "The purchase completed, but Plus access could not be confirmed.",
            };
          }

          return {
            success: true,
            cancelled: false,
            error: null,
          };
        } catch (error) {
          if (
            wasRevenueCatPurchaseCancelled(
              error,
            )
          ) {
            return {
              success: false,
              cancelled: true,
              error: null,
            };
          }

          console.error(
            "Unable to purchase Plus:",
            error,
          );

          return {
            success: false,
            cancelled: false,
            error:
              getRevenueCatErrorMessage(
                error,
                "Unable to complete the purchase.",
              ),
          };
        } finally {
          setPurchaseLoading(false);
        }
      },
      [
        authLoading,
        user?.id,
        packages,
        applyCustomerInfo,
      ],
    );

  const restorePlusPurchases =
    useCallback(
      async (): Promise<PlusActionResult> => {
        if (authLoading || !user?.id) {
          return {
            success: false,
            cancelled: false,
            error:
              "Sign in before restoring purchases.",
          };
        }

        if (!isRevenueCatNativePlatform()) {
          return {
            success: false,
            cancelled: false,
            error:
              "Purchase restoration is available in the iOS and Android apps.",
          };
        }

        setRestoreLoading(true);

        try {
          const setupResult =
            await configureRevenueCat(user.id);

          if (!setupResult.configured) {
            return {
              success: false,
              cancelled: false,
              error:
                setupResult.error ??
                "Purchase restoration is unavailable right now.",
            };
          }

          const customerInfo =
            await restoreRevenueCatPurchases();

          applyCustomerInfo(customerInfo);

          if (!customerHasPlus(customerInfo)) {
            return {
              success: false,
              cancelled: false,
              error:
                "No active Simple Dinners Plus purchase was found.",
            };
          }

          return {
            success: true,
            cancelled: false,
            error: null,
          };
        } catch (error) {
          console.error(
            "Unable to restore Plus purchases:",
            error,
          );

          return {
            success: false,
            cancelled: false,
            error:
              getRevenueCatErrorMessage(
                error,
                "Unable to restore purchases.",
              ),
          };
        } finally {
          setRestoreLoading(false);
        }
      },
      [
        authLoading,
        user?.id,
        applyCustomerInfo,
      ],
    );

  useEffect(() => {
    let cancelled = false;
    let listenerId: string | null = null;

    async function startRevenueCat() {
      await refreshPlusEntitlement();
      await refreshPlusPackages();

      if (
        cancelled ||
        authLoading ||
        !user?.id ||
        !isRevenueCatNativePlatform()
      ) {
        return;
      }

      try {
        const nextListenerId =
          await Purchases
            .addCustomerInfoUpdateListener(
              (customerInfo) => {
                if (cancelled) {
                  return;
                }

                applyCustomerInfo(
                  customerInfo,
                );
              },
            );

        if (cancelled) {
          await Purchases
            .removeCustomerInfoUpdateListener({
              listenerToRemove:
                nextListenerId,
            });

          return;
        }

        listenerId = nextListenerId;
      } catch (error) {
        /*
         * This can occur when no native key is
         * present, such as normal web development.
         */
        console.error(
          "Unable to start RevenueCat listener:",
          error,
        );
      }
    }

    void startRevenueCat();

    return () => {
      cancelled = true;

      if (listenerId) {
        void Purchases
          .removeCustomerInfoUpdateListener({
            listenerToRemove: listenerId,
          })
          .catch((error) => {
            console.error(
              "Unable to remove RevenueCat listener:",
              error,
            );
          });
      }
    };
  }, [
    authLoading,
    user?.id,
    refreshPlusEntitlement,
    refreshPlusPackages,
    applyCustomerInfo,
  ]);

  const value =
    useMemo<PlusEntitlementContextValue>(
      () => ({
        hasPlus:
          plusStatus === "active",

        plusStatus,
        plusSource,

        plusLoading:
          plusStatus === "loading",

        monthlyPrice:
          packages.monthly?.product
            .priceString ?? null,

        annualPrice:
          packages.annual?.product
            .priceString ?? null,

        annualMonthlyPrice:
          packages.annual?.product
            .pricePerMonthString ?? null,

        packagesLoading,
        purchaseLoading,
        restoreLoading,

        refreshPlusEntitlement,
        refreshPlusPackages,
        purchasePlus,
        restorePlusPurchases,
      }),
      [
        plusStatus,
        plusSource,
        packages,
        packagesLoading,
        purchaseLoading,
        restoreLoading,
        refreshPlusEntitlement,
        refreshPlusPackages,
        purchasePlus,
        restorePlusPurchases,
      ],
    );

  return (
    <PlusEntitlementContext.Provider
      value={value}
    >
      {children}
    </PlusEntitlementContext.Provider>
  );
}

export function usePlusEntitlement():
  PlusEntitlementContextValue {
  const context = useContext(
    PlusEntitlementContext,
  );

  if (!context) {
    throw new Error(
      "usePlusEntitlement must be used inside a PlusEntitlementProvider.",
    );
  }

  return context;
}
