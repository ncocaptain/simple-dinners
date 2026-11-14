import type { MembershipEligibility } from "./provider";
import type { PriceObservation } from "./types";

/** Session interpretation only. Never change provider rows or cached observations.
 * Membership is an explicit preference for the current selection, not a provider
 * authorization claim. Other conditions and every price/package field stay intact.
 */
export function resolveMembershipConditions(
  observation: PriceObservation, eligibility: MembershipEligibility = "unknown",
): PriceObservation {
  return {
    ...observation,
    conditions: observation.conditions.map((condition) => condition.kind === "membership"
      ? { ...condition, eligibility } : condition),
  };
}
