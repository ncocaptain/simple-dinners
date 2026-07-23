import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  usePlusEntitlement,
} from "./PlusEntitlementContext";

type RequirePlusOptions = {
  feature?: string;
};

export function usePlusAccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    hasPlus,
    plusLoading,
  } = usePlusEntitlement();

  function requirePlus(
    options: RequirePlusOptions = {},
  ): boolean {
    if (plusLoading) {
      return false;
    }

    if (hasPlus) {
      return true;
    }

    navigate("/plus", {
      state: {
        feature: options.feature ?? null,
        returnTo:
          location.pathname +
          location.search +
          location.hash,
      },
    });

    return false;
  }

  return {
    hasPlus,
    plusLoading,
    requirePlus,
  };
}