import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type PlusStatus =
  | "loading"
  | "active"
  | "inactive";

export type PlusSource =
  | "beta"
  | "apple"
  | "google"
  | "promo"
  | "none";

type PlusEntitlementContextValue = {
  hasPlus: boolean;
  plusStatus: PlusStatus;
  plusSource: PlusSource;
  plusLoading: boolean;

  refreshPlusEntitlement: () => Promise<void>;
};

/*
 * Quiet beta:
 * Every user currently receives Plus access.
 *
 * Later, Apple/Google subscription verification
 * will replace this flag without requiring changes
 * throughout every Plus feature.
 */
const PLUS_BETA_ENABLED = true;

const PlusEntitlementContext =
  createContext<PlusEntitlementContextValue | null>(
    null,
  );

export function PlusEntitlementProvider({
  children,
}: PropsWithChildren) {
  const [plusStatus, setPlusStatus] =
    useState<PlusStatus>(
      PLUS_BETA_ENABLED
        ? "active"
        : "inactive",
    );

  const [plusSource, setPlusSource] =
    useState<PlusSource>(
      PLUS_BETA_ENABLED
        ? "beta"
        : "none",
    );

  const refreshPlusEntitlement =
    useCallback(async () => {
      /*
       * Beta behavior for now.
       *
       * This function will eventually:
       * 1. Check Apple or Google purchases.
       * 2. Restore existing subscriptions.
       * 3. Update Supabase entitlement records.
       * 4. Set the correct status and source.
       */
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

  const value =
    useMemo<PlusEntitlementContextValue>(
      () => ({
        hasPlus:
          plusStatus === "active",

        plusStatus,
        plusSource,

        plusLoading:
          plusStatus === "loading",

        refreshPlusEntitlement,
      }),
      [
        plusStatus,
        plusSource,
        refreshPlusEntitlement,
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