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
  getHouseholdPlusStatus,
} from "./householdPlus";
import {
  configureRevenueCat,
  customerHasPlus,
  getRevenueCatCustomerInfo,
  getRevenueCatErrorMessage,
  getRevenueCatPackages,
  getRevenueCatTrialAvailability,
  isRevenueCatNativePlatform,
  purchaseRevenueCatPackage,
  REVENUECAT_ENTITLEMENT_ID,
  restoreRevenueCatPurchases,
  wasRevenueCatPurchaseCancelled,
  EMPTY_TRIAL_AVAILABILITY,
  type RevenueCatTrialAvailability,
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
  | "personal"
  | "household"
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

  subscriptionManagementURL: string | null;

  monthlyPrice: string | null;
  annualPrice: string | null;
  annualMonthlyPrice: string | null;
  monthlyTrialAvailable: boolean;
  annualTrialAvailable: boolean;

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

const PLUS_BETA_ENABLED = false;

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
    householdId,
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

  const [
    householdPlusLoading,
    setHouseholdPlusLoading,
  ] = useState(false);

  const [
    subscriptionManagementURL,
    setSubscriptionManagementURL,
  ] = useState<string | null>(null);

  const [packages, setPackages] =
    useState<RevenueCatPackages>(
      EMPTY_PACKAGES,
    );

  const [
    trialAvailability,
    setTrialAvailability,
  ] = useState<RevenueCatTrialAvailability>(
    EMPTY_TRIAL_AVAILABILITY,
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
      setSubscriptionManagementURL(null);

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
      (
        customerInfo: CustomerInfo,
      ): boolean => {
        const hasPersonalPlus =
          customerHasPlus(customerInfo);

        setSubscriptionManagementURL(
          hasPersonalPlus
            ? customerInfo.managementURL ?? null
            : null,
        );

        if (!hasPersonalPlus) {
          return false;
        }

        setPlusStatus("active");
        setPlusSource(
          getPlusSource(customerInfo),
        );

        return true;
      },
      [],
    );

  const checkHouseholdPlus =
    useCallback(async (): Promise<boolean> => {
      if (!user?.id) {
        return false;
      }

      setHouseholdPlusLoading(true);

      try {
        const result =
          await getHouseholdPlusStatus();

        if (result.error || !result.data) {
          if (result.error) {
            console.error(
              "Household Plus status unavailable:",
              result.error,
            );
          }

          return false;
        }

        if (!result.data.hasPlus) {
          return false;
        }

        setSubscriptionManagementURL(null);
        setPlusStatus("active");

        setPlusSource(
          result.data.source === "household"
            ? "household"
            : "personal",
        );

        return true;
      } catch (error) {
        console.error(
          "Unable to check household Plus access:",
          error,
        );

        return false;
      } finally {
        setHouseholdPlusLoading(false);
      }
    }, [user?.id]);

  const refreshPlusPackages =
    useCallback(async () => {
      if (
        authLoading ||
        !user?.id ||
        !isRevenueCatNativePlatform()
      ) {
        setPackages(EMPTY_PACKAGES);
        setTrialAvailability(
          EMPTY_TRIAL_AVAILABILITY,
        );
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
          setTrialAvailability(
            EMPTY_TRIAL_AVAILABILITY,
          );
          return;
        }

        const nextPackages =
          await getRevenueCatPackages();

        setPackages(nextPackages);

        try {
          const nextTrialAvailability =
            await getRevenueCatTrialAvailability(
              nextPackages,
            );

          setTrialAvailability(
            nextTrialAvailability,
          );
        } catch (error) {
          console.error(
            "Unable to determine Plus trial availability:",
            error,
          );

          setTrialAvailability(
            EMPTY_TRIAL_AVAILABILITY,
          );
        }
      } catch (error) {
        console.error(
          "Unable to load RevenueCat packages:",
          error,
        );

        setPackages(EMPTY_PACKAGES);
        setTrialAvailability(
          EMPTY_TRIAL_AVAILABILITY,
        );
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

      if (!user?.id) {
        applyBetaFallback();
        return;
      }

      if (!PLUS_BETA_ENABLED) {
        setPlusStatus("loading");
        setPlusSource("none");
      }

      if (!isRevenueCatNativePlatform()) {
        const hasServerAccess =
          await checkHouseholdPlus();

        if (!hasServerAccess) {
          applyBetaFallback();
        }

        return;
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

        const hasServerAccess =
          await checkHouseholdPlus();

        if (!hasServerAccess) {
          applyBetaFallback();
        }

        return;
      }

      try {
        const customerInfo =
          await getRevenueCatCustomerInfo();

        const hasPersonalPlus =
          applyCustomerInfo(customerInfo);

        if (hasPersonalPlus) {
          return;
        }

        const hasHouseholdAccess =
          await checkHouseholdPlus();

        if (!hasHouseholdAccess) {
          applyBetaFallback();
        }
      } catch (error) {
        console.error(
          "Unable to refresh Plus entitlement:",
          error,
        );

        const hasServerAccess =
          await checkHouseholdPlus();

        if (!hasServerAccess) {
          applyBetaFallback();
        }
      }
    }, [
      authLoading,
      user?.id,
      applyBetaFallback,
      applyCustomerInfo,
      checkHouseholdPlus,
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

          const hasPersonalPlus =
            applyCustomerInfo(customerInfo);

          if (!hasPersonalPlus) {
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

          const hasPersonalPlus =
            applyCustomerInfo(customerInfo);

          if (!hasPersonalPlus) {
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

                const hasPersonalPlus =
                  applyCustomerInfo(
                    customerInfo,
                  );

                if (hasPersonalPlus) {
                  return;
                }

                void checkHouseholdPlus()
                  .then(
                    (
                      hasHouseholdAccess,
                    ) => {
                      if (
                        cancelled ||
                        hasHouseholdAccess
                      ) {
                        return;
                      }

                      applyBetaFallback();
                    },
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
    householdId,
    refreshPlusEntitlement,
    refreshPlusPackages,
    applyCustomerInfo,
    checkHouseholdPlus,
    applyBetaFallback,
  ]);

  const value =
    useMemo<PlusEntitlementContextValue>(
      () => ({
        hasPlus:
          plusStatus === "active",

        plusStatus,
        plusSource,

        plusLoading:
          plusStatus === "loading" ||
          householdPlusLoading,

        subscriptionManagementURL,

        monthlyPrice:
          packages.monthly?.product
            .priceString ?? null,

        annualPrice:
          packages.annual?.product
            .priceString ?? null,

        annualMonthlyPrice:
          packages.annual?.product
            .pricePerMonthString ?? null,

        monthlyTrialAvailable:
          trialAvailability.monthly,
        annualTrialAvailable:
          trialAvailability.annual,
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
        householdPlusLoading,
        subscriptionManagementURL,
        packages,
        trialAvailability,
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
