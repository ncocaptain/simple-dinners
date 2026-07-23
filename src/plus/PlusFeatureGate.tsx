import {
  type PropsWithChildren,
} from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";
import { getStoredLanguage } from "../i18n";
import {
  usePlusEntitlement,
} from "./PlusEntitlementContext";

type PlusFeatureGateProps =
  PropsWithChildren<{
    redirectTo?: string;
    feature?: string;
  }>;

export function PlusFeatureGate({
  children,
  redirectTo = "/plus",
  feature,
}: PlusFeatureGateProps) {
  const location = useLocation();
  const isSpanish =
    getStoredLanguage() === "es";

  const {
    hasPlus,
    plusLoading,
  } = usePlusEntitlement();

  if (plusLoading) {
    return (
      <main className="sd-plus-access-page">
        <p>
          {isSpanish
            ? "Comprobando acceso a Plus…"
            : "Checking Plus access…"}
        </p>
      </main>
    );
  }

  if (!hasPlus) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          feature: feature ?? null,
          returnTo:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  return <>{children}</>;
}
