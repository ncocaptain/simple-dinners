import { ShoppingSyncBridge } from
  "../cloud/ShoppingSyncBridge";
import {
  ShoppingListConflictModal,
} from "../cloud/ShoppingListConflictModal";
import {
  WeeklyPlanConflictModal,
} from "../cloud/WeeklyPlanConflictModal";
import {
  CookbookConflictModal,
} from "../cloud/CookbookConflictModal";
import {
  usePlusEntitlement,
} from "./PlusEntitlementContext";

export function PlusCloudSync() {
  const {
    hasPlus,
    plusLoading,
  } = usePlusEntitlement();

  /*
   * Local Simple Dinners data remains fully usable.
   * Only the household cloud-sync layer requires Plus.
   */
  if (plusLoading || !hasPlus) {
    return null;
  }

  return (
    <>
      <ShoppingSyncBridge />
      <ShoppingListConflictModal />
      <WeeklyPlanConflictModal />
      <CookbookConflictModal />
    </>
  );
}