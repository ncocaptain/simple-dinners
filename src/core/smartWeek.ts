import { days } from "./data";
import {
  generatePlan,
  mealMatchesPrimaryProteinKeyword,
  mealMatchesRequestKeyword,
} from "./planner";
import type {
  Effort,
  Meal,
  PantryItem,
  PlannedDay,
  Preferences,
  SmartWeekDraft,
  SmartWeekDraftDay,
  SmartWeekMealSource,
  SmartWeekRequestConstraints,
} from "./types";

type Day = (typeof days)[number];

export type BuildSmartWeekDraftOptions = {
  currentMeals: Record<string, PlannedDay>;
  cookbook?: Meal[];
  pantry?: PantryItem[];
  daySettings?: Partial<Record<Day, Effort>>;
  lockedDays?: Record<string, boolean>;
  preferences: Preferences;
  request?: string;
  requestConstraints?: SmartWeekRequestConstraints;
};

function normalizeText(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getSmartWeekDaySettings({
  currentMeals,
  daySettings,
  lockedDays,
  requestConstraints,
}: {
  currentMeals: Record<string, PlannedDay>;
  daySettings: Partial<Record<Day, Effort>>;
  lockedDays: Record<string, boolean>;
  requestConstraints?: SmartWeekRequestConstraints;
}): Partial<Record<Day, Effort>> {
  const nextSettings = {
    ...daySettings,
  };

  if (!requestConstraints?.mostlyQuick) {
    return nextSettings;
  }

  /*
   * Do not reconsider locked days, preserved special
   * nights, or explicitly configured Takeout Nights.
   */
  const eligibleDays = days.filter((day) => {
    const currentDay = currentMeals[day];

    if (lockedDays[day]) return false;

    if (
      currentDay?.mode === "leftovers" ||
      currentDay?.mode === "freezer"
    ) {
      return false;
    }

    return nextSettings[day] !== "takeout";
  });

  if (eligibleDays.length === 0) {
    return nextSettings;
  }

  /*
   * "Mostly quick" means roughly two-thirds of the
   * editable cooking nights. For a seven-day week,
   * that normally produces five Quick dinners.
   */
  const quickTarget = Math.max(
    1,
    Math.ceil(eligibleDays.length * 0.67),
  );

  const alreadyQuick = eligibleDays.filter(
    (day) => nextSettings[day] === "quick",
  );

  const normalDays = eligibleDays.filter(
    (day) =>
      (nextSettings[day] ?? "normal") ===
      "normal",
  );

  const bigDays = eligibleDays.filter(
    (day) => nextSettings[day] === "big",
  );

  const additionalQuickDays = Math.max(
    0,
    quickTarget - alreadyQuick.length,
  );

  /*
   * Convert Normal days first. Big days are changed
   * only if needed to fulfill the explicit request.
   */
  [...normalDays, ...bigDays]
    .slice(0, additionalQuickDays)
    .forEach((day) => {
      nextSettings[day] = "quick";
    });

  return nextSettings;
}

function hasCookbookTag(meal?: Meal | null) {
  return (meal?.tags ?? []).some(
    (tag) => normalizeText(tag) === "cookbook",
  );
}

function isTakeoutMeal(meal?: Meal | null) {
  if (!meal) return false;

  if (meal.effort === "takeout") return true;

  return (meal.tags ?? []).some(
    (tag) => normalizeText(tag) === "takeout",
  );
}

function getMealSource(
  plannedDay: PlannedDay,
): SmartWeekMealSource {
  if (
    plannedDay.mode === "leftovers" ||
    plannedDay.mode === "freezer"
  ) {
    return "special";
  }

  const meal = plannedDay.meal;

  if (!meal) return "unknown";
  if (isTakeoutMeal(meal)) return "special";
  if (hasCookbookTag(meal)) return "cookbook";

  return "built-in";
}

function copyPlannedDay(
  plannedDay: PlannedDay | undefined,
): PlannedDay {
  if (!plannedDay) {
    return {
      mode: "planned",
      meal: null,
    };
  }

  if (plannedDay.mode !== "planned") {
    return {
      mode: plannedDay.mode,
      meal: null,
    };
  }

  return {
    mode: "planned",
    meal: plannedDay.meal
      ? {
        ...plannedDay.meal,
        tags: plannedDay.meal.tags
          ? [...plannedDay.meal.tags]
          : undefined,
        suggestedSides: plannedDay.meal.suggestedSides
          ? [...plannedDay.meal.suggestedSides]
          : undefined,
        suggestedDesserts:
          plannedDay.meal.suggestedDesserts
            ? [...plannedDay.meal.suggestedDesserts]
            : undefined,
      }
      : null,
  };
}

function mealUsesPantry(
  meal: Meal,
  pantryNames: string[],
) {
  if (pantryNames.length === 0) return false;

  const searchText = [
    meal.name,
    meal.ingredients,
    meal.notes,
    ...(meal.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return pantryNames.some((item) =>
    searchText.includes(item),
  );
}

function getGeneratedDayReason(
  meal: Meal | null,
  requestedEffort: Effort | undefined,
  pantryNames: string[],
): SmartWeekDraftDay["reason"] {
  if (!meal) return undefined;

  if (isTakeoutMeal(meal)) {
    return "takeout-night";
  }

  if (mealUsesPantry(meal, pantryNames)) {
    return "pantry-match";
  }

  if (hasCookbookTag(meal)) {
    return "cookbook-pick";
  }

  if (
    requestedEffort &&
    meal.effort === requestedEffort
  ) {
    return "effort-match";
  }

  return "variety";
}

type SmartWeekTarget = {
  keyword: string;
  count: number;
};

function isProteinTargetKeyword(
  keyword: string,
  constraints?: SmartWeekRequestConstraints,
) {
  const normalizedKeyword =
    normalizeText(keyword);

  return (
    constraints?.proteinTargets ??
    []
  ).some(
    (target) =>
      normalizeText(target.keyword) ===
      normalizedKeyword,
  );
}

function mealMatchesSmartWeekTarget(
  meal: Meal,
  keyword: string,
  constraints?: SmartWeekRequestConstraints,
) {
  if (
    isProteinTargetKeyword(
      keyword,
      constraints,
    )
  ) {
    return mealMatchesPrimaryProteinKeyword(
      meal,
      keyword,
    );
  }

  return mealMatchesRequestKeyword(
    meal,
    keyword,
  );
}

function getSmartWeekTargets(
  constraints?: SmartWeekRequestConstraints,
): SmartWeekTarget[] {
  if (!constraints) return [];

  const targets = new Map<
    string,
    number
  >();

  const vegetarianCount = Math.max(
    0,
    Math.min(
      7,
      Math.round(
        constraints.vegetarianNightCount,
      ),
    ),
  );

  if (vegetarianCount > 0) {
    targets.set(
      "vegetarian",
      vegetarianCount,
    );
  }

  for (
    const target of
    constraints.proteinTargets ?? []
  ) {
    const keyword = normalizeText(
      target.keyword,
    );

    const count = Math.max(
      1,
      Math.min(
        7,
        Math.round(target.count),
      ),
    );

    if (!keyword) continue;

    targets.set(
      keyword,
      Math.max(
        targets.get(keyword) ?? 0,
        count,
      ),
    );
  }

  return Array.from(
    targets.entries(),
  ).map(([keyword, count]) => ({
    keyword,
    count,
  }));
}

function getDraftMeal(
  draftDay?: SmartWeekDraftDay,
) {
  if (
    draftDay?.plannedDay.mode !==
    "planned"
  ) {
    return null;
  }

  return draftDay.plannedDay.meal;
}

function countDraftTargetMatches(
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >,
  keyword: string,
  constraints?: SmartWeekRequestConstraints,
) {
  return days.filter((day) => {
    const meal = getDraftMeal(
      draftDays[day],
    );

    return (
      !!meal &&
      mealMatchesSmartWeekTarget(
        meal,
        keyword,
        constraints,
      )
    );
  }).length;
}

function smartWeekTargetsAreExact(
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >,
  constraints?: SmartWeekRequestConstraints,
) {
  const targets =
    getSmartWeekTargets(constraints);

  return targets.every(
    (target) =>
      countDraftTargetMatches(
        draftDays,
        target.keyword,
        constraints,
      ) === target.count,
  );
}

function buildTargetedDraftDay({
  draftDays,
  day,
  keyword,
  cookbook,
  pantryNames,
  effectiveDaySettings,
  preferences,
  requestConstraints,
}: {
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >;
  day: Day;
  keyword: string;
  cookbook: Meal[];
  pantryNames: string[];
  effectiveDaySettings: Partial<
    Record<Day, Effort>
  >;
  preferences: Preferences;
  requestConstraints?: SmartWeekRequestConstraints;
}): SmartWeekDraftDay | null {
  const excludeMeals = days.flatMap(
    (draftDayName) => {
      const meal = getDraftMeal(
        draftDays[draftDayName],
      );

      return getMealExclusionValues(
        meal,
      );
    },
  );

  /*
   * Keep the other six proposed meals fixed while
   * generating a targeted recipe for this one day.
   */
  const lockedMeals =
    Object.fromEntries(
      days.map((draftDayName) => {
        if (draftDayName === day) {
          return [
            draftDayName,
            null,
          ];
        }

        const meal = getDraftMeal(
          draftDays[draftDayName],
        );

        return [
          draftDayName,
          meal,
        ];
      }),
    ) as Partial<
      Record<Day, Meal | null>
    >;

  const isProteinTarget =
    isProteinTargetKeyword(
      keyword,
      requestConstraints,
    );

  const generatedMeals = generatePlan({
    cookbook,
    pantry: pantryNames,
    daySettings:
      effectiveDaySettings,
    lockedMeals,
    preferences,
    excludeMeals,
    requestConstraints,
    requiredRequestKeywords:
      isProteinTarget
        ? []
        : [keyword],

    requiredPrimaryProteinKeywords:
      isProteinTarget
        ? [keyword]
        : [],
    markFirstPlanGenerated: false,
  });

  const replacementMeal =
    generatedMeals[day] ?? null;

  /*
   * The planner safely falls back when no targeted
   * recipe exists, so validate the result before using it.
   */
  if (
    !replacementMeal ||
    !mealMatchesSmartWeekTarget(
      replacementMeal,
      keyword,
      requestConstraints,
    )
  ) {
    return null;
  }

  const replacementPlannedDay: PlannedDay =
  {
    mode: "planned",
    meal: replacementMeal,
  };

  return {
    plannedDay:
      replacementPlannedDay,
    source: getMealSource(
      replacementPlannedDay,
    ),
    reason: "request-match",
    preserved: false,
  };
}

function buildNonTargetedDraftDay({
  draftDays,
  day,
  excludedKeyword,
  avoidKeywords = [],
  cookbook,
  pantryNames,
  effectiveDaySettings,
  preferences,
  requestConstraints,
}: {
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >;
  day: Day;
  excludedKeyword: string;
  avoidKeywords?: string[];
  cookbook: Meal[];
  pantryNames: string[];
  effectiveDaySettings: Partial<
    Record<Day, Effort>
  >;
  preferences: Preferences;
  requestConstraints?: SmartWeekRequestConstraints;
}): SmartWeekDraftDay | null {
  const normalizedExcludedKeyword =
    normalizeText(excludedKeyword);

  const normalizedAvoidKeywords =
    avoidKeywords
      .map((keyword) =>
        normalizeText(keyword),
      )
      .filter(Boolean);

  const excludeMeals = days.flatMap(
    (draftDayName) => {
      const meal = getDraftMeal(
        draftDays[draftDayName],
      );

      return getMealExclusionValues(
        meal,
      );
    },
  );

  const lockedMeals =
    Object.fromEntries(
      days.map((draftDayName) => {
        if (draftDayName === day) {
          return [
            draftDayName,
            null,
          ];
        }

        return [
          draftDayName,
          getDraftMeal(
            draftDays[draftDayName],
          ),
        ];
      }),
    ) as Partial<
      Record<Day, Meal | null>
    >;

  /*
   * Preserve the original guidance, but temporarily
   * exclude the overrepresented target for this one
   * replacement.
   */
  const replacementConstraints =
    requestConstraints
      ? {
        ...requestConstraints,
        excludedKeywords:
          Array.from(
            new Set([
              ...requestConstraints
                .excludedKeywords
                .map(normalizeText),
              normalizedExcludedKeyword,
              ...normalizedAvoidKeywords,
            ]),
          ),
      }
      : undefined;

  const generatedMeals = generatePlan({
    cookbook,
    pantry: pantryNames,
    daySettings:
      effectiveDaySettings,
    lockedMeals,
    preferences,
    excludeMeals,
    requestConstraints:
      replacementConstraints,
    markFirstPlanGenerated: false,
  });

  const replacementMeal =
    generatedMeals[day] ?? null;

  if (
    !replacementMeal ||
    mealMatchesSmartWeekTarget(
      replacementMeal,
      normalizedExcludedKeyword,
      requestConstraints,
    ) ||
    normalizedAvoidKeywords.some(
      (keyword) =>
        mealMatchesSmartWeekTarget(
          replacementMeal,
          keyword,
          requestConstraints,
        ),
    )
  ) {
    return null;
  }

  const replacementPlannedDay: PlannedDay =
  {
    mode: "planned",
    meal: replacementMeal,
  };

  const satisfiesAnotherTarget =
    getSmartWeekTargets(
      requestConstraints,
    ).some(
      (target) =>
        target.keyword !==
        normalizedExcludedKeyword &&
        mealMatchesSmartWeekTarget(
          replacementMeal,
          target.keyword,
          requestConstraints,
        ),
    );

  return {
    plannedDay:
      replacementPlannedDay,
    source: getMealSource(
      replacementPlannedDay,
    ),
    reason: satisfiesAnotherTarget
      ? "request-match"
      : getGeneratedDayReason(
        replacementMeal,
        effectiveDaySettings[day],
        pantryNames,
      ),
    preserved: false,
  };
}

function coordinateSmartWeekTargets({
  draftDays,
  cookbook,
  pantryNames,
  effectiveDaySettings,
  preferences,
  requestConstraints,
}: {
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >;
  cookbook: Meal[];
  pantryNames: string[];
  effectiveDaySettings: Partial<
    Record<Day, Effort>
  >;
  preferences: Preferences;
  requestConstraints?: SmartWeekRequestConstraints;
}) {
  const targets =
    getSmartWeekTargets(
      requestConstraints,
    );

  if (targets.length === 0) {
    return draftDays;
  }

  const nextDays = {
    ...draftDays,
  };

  /*
   * A target may temporarily displace another target,
   * so make a few bounded passes. Seven days keeps this
   * small and deterministic.
   */
  for (
    let pass = 0;
    pass < 3;
    pass += 1
  ) {
    let changedThisPass = false;

    for (const target of targets) {
      const attemptedDays =
        new Set<Day>();

      while (
        countDraftTargetMatches(
          nextDays,
          target.keyword,
          requestConstraints,
        ) < target.count
      ) {
        const protectedTargets =
          targets.filter(
            (otherTarget) =>
              otherTarget.keyword !==
              target.keyword &&
              countDraftTargetMatches(
                nextDays,
                otherTarget.keyword,
                requestConstraints,
              ) <= otherTarget.count
          );

        const editableDays =
          days.filter((day) => {
            const draftDay =
              nextDays[day];

            const meal =
              getDraftMeal(draftDay);

            if (
              !draftDay ||
              draftDay.preserved ||
              attemptedDays.has(day) ||
              !meal ||
              isTakeoutMeal(meal)
            ) {
              return false;
            }

            return !mealMatchesSmartWeekTarget(
              meal,
              target.keyword,
              requestConstraints,
            );
          });

        if (
          editableDays.length === 0
        ) {
          break;
        }

        /*
         * Prefer replacing a meal that is not currently
         * satisfying another still-needed request.
         */
        const saferDays =
          editableDays.filter((day) => {
            const meal = getDraftMeal(
              nextDays[day],
            );

            if (!meal) return false;

            return !protectedTargets.some(
              (protectedTarget) =>
                mealMatchesSmartWeekTarget(
                  meal,
                  protectedTarget.keyword,
                  requestConstraints,
                ),
            );
          });

        const selectedDay =
          saferDays[0] ??
          editableDays[0];

        attemptedDays.add(
          selectedDay,
        );

        const replacement =
          buildTargetedDraftDay({
            draftDays: nextDays,
            day: selectedDay,
            keyword:
              target.keyword,
            cookbook,
            pantryNames,
            effectiveDaySettings,
            preferences,
            requestConstraints,
          });

        if (!replacement) {
          continue;
        }

        nextDays[selectedDay] =
          replacement;

        changedThisPass = true;
      }
    }

    const allTargetsMet =
      targets.every(
        (target) =>
          countDraftTargetMatches(
            nextDays,
            target.keyword,
            requestConstraints,
          ) >= target.count,
      );

    if (
      allTargetsMet ||
      !changedThisPass
    ) {
      break;
    }
  }

  /*
 * Once minimum targets are satisfied, trim editable
 * surplus matches so phrases such as "chicken twice"
 * behave like a desired count rather than "at least two."
 *
 * Locked and preserved days are never changed, so they
 * may still force a count above the requested amount.
 */
  for (
    let trimPass = 0;
    trimPass < 3;
    trimPass += 1
  ) {
    let changedThisPass = false;

    for (const target of targets) {
      const attemptedDays =
        new Set<Day>();

      while (
        countDraftTargetMatches(
          nextDays,
          target.keyword,
          requestConstraints,
        ) > target.count
      ) {
        const protectedTargets =
          targets.filter(
            (otherTarget) =>
              otherTarget.keyword !==
              target.keyword &&
              countDraftTargetMatches(
                nextDays,
                otherTarget.keyword,
                requestConstraints,
              ) <= otherTarget.count
          );

        const editableMatchingDays =
          days.filter((day) => {
            const draftDay =
              nextDays[day];

            const meal =
              getDraftMeal(draftDay);

            if (
              !draftDay ||
              draftDay.preserved ||
              attemptedDays.has(day) ||
              !meal ||
              isTakeoutMeal(meal)
            ) {
              return false;
            }

            return mealMatchesSmartWeekTarget(
              meal,
              target.keyword,
              requestConstraints,
            );
          });

        if (
          editableMatchingDays.length ===
          0
        ) {
          break;
        }

        /*
         * Prefer removing a surplus meal that is not also
         * needed to satisfy another request.
         */
        const saferDays =
          editableMatchingDays.filter(
            (day) => {
              const meal = getDraftMeal(
                nextDays[day],
              );

              if (!meal) return false;

              return !protectedTargets.some(
                (protectedTarget) =>
                  mealMatchesSmartWeekTarget(
                    meal,
                    protectedTarget.keyword,
                    requestConstraints,
                  ),
              );
            },
          );

        const selectedDay =
          saferDays[0] ??
          editableMatchingDays[0];

        attemptedDays.add(
          selectedDay,
        );

        const replacement =
          buildNonTargetedDraftDay({
            draftDays: nextDays,
            day: selectedDay,
            excludedKeyword:
              target.keyword,
            cookbook,
            pantryNames,
            effectiveDaySettings,
            preferences,
            requestConstraints,
          });

        if (!replacement) {
          continue;
        }

        nextDays[selectedDay] =
          replacement;

        changedThisPass = true;
      }
    }

    if (!changedThisPass) {
      break;
    }
  }

  return nextDays;
}

export type SmartWeekRequestVerificationIssue =
  | {
    kind: "excluded-keyword";
    keyword: string;
    actual: number;
  }
  | {
    kind: "target-count";
    keyword: string;
    expected: number;
    actual: number;
  }
  | {
    kind: "mostly-quick";
    expected: number;
    actual: number;
  };

export type SmartWeekRequestVerification = {
  status:
  | "none"
  | "met"
  | "partial"
  | "considered";
  issues: SmartWeekRequestVerificationIssue[];
  checkedRules: number;
};

export function verifySmartWeekDraftRequest(
  draft: SmartWeekDraft,
): SmartWeekRequestVerification {
  const constraints = draft.constraints;

  if (!constraints) {
    return {
      status: "none",
      issues: [],
      checkedRules: 0,
    };
  }

  const issues:
    SmartWeekRequestVerificationIssue[] = [];

  let checkedRules = 0;

  const plannedMeals = days.flatMap(
    (day) => {
      const meal = getDraftMeal(
        draft.days[day],
      );

      return meal ? [meal] : [];
    },
  );

  /*
   * Exclusions are hard, measurable requests.
   * Locked or preserved meals may make an exclusion
   * impossible to satisfy, but the review should say so.
   */
  for (
    const rawKeyword of
    constraints.excludedKeywords ?? []
  ) {
    const keyword =
      normalizeText(rawKeyword);

    if (!keyword) continue;

    checkedRules += 1;

    const actual =
      plannedMeals.filter((meal) =>
        mealMatchesRequestKeyword(
          meal,
          keyword,
        ),
      ).length;

    if (actual > 0) {
      issues.push({
        kind: "excluded-keyword",
        keyword,
        actual,
      });
    }
  }

  /*
   * Vegetarian and protein counts are treated as desired
   * exact counts. Preserved nights can force a higher total.
   */
  for (
    const target of
    getSmartWeekTargets(constraints)
  ) {
    checkedRules += 1;

    const actual =
      countDraftTargetMatches(
        draft.days,
        target.keyword,
        constraints,
      );

    if (actual !== target.count) {
      issues.push({
        kind: "target-count",
        keyword: target.keyword,
        expected: target.count,
        actual,
      });
    }
  }

  if (constraints.mostlyQuick) {
    checkedRules += 1;

    const editableCookingDays =
      days.filter((day) => {
        const draftDay =
          draft.days[day];

        if (
          !draftDay ||
          draftDay.preserved ||
          draftDay.plannedDay.mode !==
          "planned"
        ) {
          return false;
        }

        const meal =
          draftDay.plannedDay.meal;

        return (
          !!meal &&
          !isTakeoutMeal(meal)
        );
      });

    const expected =
      editableCookingDays.length > 0
        ? Math.max(
          1,
          Math.ceil(
            editableCookingDays.length *
            0.67,
          ),
        )
        : 0;

    const actual =
      editableCookingDays.filter(
        (day) =>
          normalizeText(
            draft.days[day]
              ?.plannedDay.meal
              ?.effort,
          ) === "quick",
      ).length;

    if (actual < expected) {
      issues.push({
        kind: "mostly-quick",
        expected,
        actual,
      });
    }
  }

  /*
   * Pantry, budget, kid-friendly, and preferred-keyword
   * guidance are scoring preferences rather than exact
   * promises, so do not claim they were objectively met.
   */
  if (checkedRules === 0) {
    return {
      status: "considered",
      issues: [],
      checkedRules,
    };
  }

  return {
    status:
      issues.length === 0
        ? "met"
        : "partial",
    issues,
    checkedRules,
  };
}

function reconcileExactSmartWeekTargets({
  draftDays,
  cookbook,
  pantryNames,
  effectiveDaySettings,
  preferences,
  requestConstraints,
}: {
  draftDays: Record<
    string,
    SmartWeekDraftDay
  >;
  cookbook: Meal[];
  pantryNames: string[];
  effectiveDaySettings: Partial<
    Record<Day, Effort>
  >;
  preferences: Preferences;
  requestConstraints?: SmartWeekRequestConstraints;
}) {
  const targets =
    getSmartWeekTargets(
      requestConstraints,
    );

  if (targets.length === 0) {
    return draftDays;
  }

  const nextDays = {
    ...draftDays,
  };

  for (const target of targets) {
    let guard = 0;

    while (
      countDraftTargetMatches(
        nextDays,
        target.keyword,
        requestConstraints,
      ) > target.count &&
      guard < days.length * 2
    ) {
      guard += 1;

      const protectedTargets =
        targets.filter(
          (otherTarget) =>
            otherTarget.keyword !==
            target.keyword &&
            countDraftTargetMatches(
              nextDays,
              otherTarget.keyword,
              requestConstraints,
            ) <= otherTarget.count,
        );

      const matchingEditableDays =
        days.filter((day) => {
          const draftDay =
            nextDays[day];

          const meal =
            getDraftMeal(draftDay);

          if (
            !draftDay ||
            draftDay.preserved ||
            !meal ||
            isTakeoutMeal(meal)
          ) {
            return false;
          }

          return mealMatchesSmartWeekTarget(
            meal,
            target.keyword,
            requestConstraints,
          );
        });

      if (
        matchingEditableDays.length === 0
      ) {
        break;
      }

      /*
       * First try meals that are not also satisfying
       * another exact request.
       */
      const saferDays =
        matchingEditableDays.filter(
          (day) => {
            const meal =
              getDraftMeal(
                nextDays[day],
              );

            if (!meal) return false;

            return !protectedTargets.some(
              (protectedTarget) =>
                mealMatchesSmartWeekTarget(
                  meal,
                  protectedTarget.keyword,
                  requestConstraints,
                ),
            );
          },
        );

      const orderedDays = [
        ...saferDays,
        ...matchingEditableDays.filter(
          (day) =>
            !saferDays.includes(day),
        ),
      ];

      const avoidKeywords =
        targets
          .filter(
            (otherTarget) =>
              otherTarget.keyword !==
              target.keyword &&
              countDraftTargetMatches(
                nextDays,
                otherTarget.keyword,
                requestConstraints,
              ) >= otherTarget.count,
          )
          .map(
            (otherTarget) =>
              otherTarget.keyword,
          );

      let replacementMade = false;

      /*
       * Try every eligible surplus day rather than
       * abandoning the target after one failed attempt.
       */
      for (const selectedDay of orderedDays) {
        const replacement =
          buildNonTargetedDraftDay({
            draftDays: nextDays,
            day: selectedDay,
            excludedKeyword:
              target.keyword,
            avoidKeywords,
            cookbook,
            pantryNames,
            effectiveDaySettings,
            preferences,
            requestConstraints,
          });

        if (!replacement) {
          continue;
        }

        nextDays[selectedDay] =
          replacement;

        replacementMade = true;
        break;
      }

      if (!replacementMade) {
        break;
      }
    }
  }

  return nextDays;
}

export function buildSmartWeekDraft({
  currentMeals,
  cookbook = [],
  pantry = [],
  daySettings = {},
  lockedDays = {},
  preferences,
  request = "",
  requestConstraints,
}: BuildSmartWeekDraftOptions): SmartWeekDraft {
  const pantryNames = pantry
    .map((item) => normalizeText(item.name))
    .filter(Boolean);

  const effectiveDaySettings =
    getSmartWeekDaySettings({
      currentMeals,
      daySettings,
      lockedDays,
      requestConstraints,
    });

  /*
   * The existing generator understands locked meals,
   * while full PlannedDay preservation is handled below.
   */
  const lockedMeals = Object.fromEntries(
    days.map((day) => {
      const currentDay = currentMeals[day];

      if (
        lockedDays[day] &&
        currentDay?.mode === "planned" &&
        currentDay.meal
      ) {
        return [day, currentDay.meal];
      }

      return [day, null];
    }),
  ) as Partial<Record<Day, Meal | null>>;

  const generatedMeals = generatePlan({
    cookbook,
    pantry: pantryNames,
    daySettings: effectiveDaySettings,
    lockedMeals,
    preferences,
    requestConstraints,
    markFirstPlanGenerated: false,
  });

  const draftDays = {} as Record<
    string,
    SmartWeekDraftDay
  >;

  for (const day of days) {
    const currentDay = copyPlannedDay(
      currentMeals[day],
    );

    /*
     * Locked days are copied exactly into the draft.
     * This includes planned meals, Leftovers Night,
     * Freezer Night, and even an intentionally empty day.
     */
    if (lockedDays[day]) {
      draftDays[day] = {
        plannedDay: currentDay,
        source: getMealSource(currentDay),
        reason: "locked-day",
        preserved: true,
      };

      continue;
    }

    /*
     * Smart Week MVP preserves existing low-effort nights.
     * A later version can let users choose whether unlocked
     * Leftovers and Freezer Nights may be reconsidered.
     */
    if (currentDay.mode === "leftovers") {
      draftDays[day] = {
        plannedDay: currentDay,
        source: "special",
        reason: "existing-leftovers",
        preserved: true,
      };

      continue;
    }

    if (currentDay.mode === "freezer") {
      draftDays[day] = {
        plannedDay: currentDay,
        source: "special",
        reason: "existing-freezer",
        preserved: true,
      };

      continue;
    }

    const generatedMeal =
      generatedMeals[day] ?? null;

    const generatedDay: PlannedDay = {
      mode: "planned",
      meal: generatedMeal,
    };

    draftDays[day] = {
      plannedDay: generatedDay,
      source: getMealSource(generatedDay),
      reason: getGeneratedDayReason(
        generatedMeal,
        effectiveDaySettings[day],
        pantryNames,
      ),
      preserved: false,
    };
  }

  let finalizedDraftDays =
    draftDays;

  /*
   * A later protein adjustment can affect a vegetarian
   * count, or vice versa. Repeat a few bounded passes until
   * every measurable target is exact or no further safe
   * improvement can be made.
   */
  for (
    let pass = 0;
    pass < 3;
    pass += 1
  ) {
    const coordinatedDraftDays =
      coordinateSmartWeekTargets({
        draftDays:
          finalizedDraftDays,
        cookbook,
        pantryNames,
        effectiveDaySettings,
        preferences,
        requestConstraints,
      });

    finalizedDraftDays =
      reconcileExactSmartWeekTargets({
        draftDays:
          coordinatedDraftDays,
        cookbook,
        pantryNames,
        effectiveDaySettings,
        preferences,
        requestConstraints,
      });

    if (
      smartWeekTargetsAreExact(
        finalizedDraftDays,
        requestConstraints,
      )
    ) {
      break;
    }
  }

  return {
    days: finalizedDraftDays,
    request:
      request.trim() || undefined,
    constraints:
      requestConstraints,
    createdAt: Date.now(),
  };
}

export type ApplySmartWeekDraftOptions = {
  currentMeals: Record<string, PlannedDay>;
  lockedDays?: Record<string, boolean>;
  draft: SmartWeekDraft;
};

export function applySmartWeekDraft({
  currentMeals,
  lockedDays = {},
  draft,
}: ApplySmartWeekDraftOptions): Record<string, PlannedDay> {
  const nextMeals = {} as Record<string, PlannedDay>;

  for (const day of days) {
    /*
     * Recheck the current lock state at approval time.
     * A day may have been locked after the draft was created,
     * including through household sync on another device.
     */
    if (lockedDays[day]) {
      nextMeals[day] = copyPlannedDay(
        currentMeals[day],
      );

      continue;
    }

    const draftDay = draft.days[day];

    /*
     * Apply the proposed day when one exists.
     * Fall back to the latest live day if the draft is incomplete.
     */
    nextMeals[day] = copyPlannedDay(
      draftDay?.plannedDay ??
      currentMeals[day],
    );
  }

  return nextMeals;
}

export type ReplaceSmartWeekDraftDayOptions = {
  draft: SmartWeekDraft;
  day: Day;
  cookbook?: Meal[];
  pantry?: PantryItem[];
  daySettings?: Partial<Record<Day, Effort>>;
  lockedDays?: Record<string, boolean>;
  preferences: Preferences;
};

function getMealExclusionValues(
  meal?: Meal | null,
) {
  if (!meal) return [];

  return [
    meal.name,
    meal.id,
    meal.slug,
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );
}

export function replaceSmartWeekDraftDay({
  draft,
  day,
  cookbook = [],
  pantry = [],
  daySettings = {},
  lockedDays = {},
  preferences,
}: ReplaceSmartWeekDraftDayOptions): SmartWeekDraft {
  const currentDraftDay = draft.days[day];

  /*
   * Preserved and currently locked days cannot be
   * replaced from the Smart Week review screen.
   */
  if (
    !currentDraftDay ||
    currentDraftDay.preserved ||
    lockedDays[day]
  ) {
    return draft;
  }

  const pantryNames = pantry
    .map((item) => normalizeText(item.name))
    .filter(Boolean);

  const draftMeals = Object.fromEntries(
    days.map((draftDayName) => [
      draftDayName,
      draft.days[draftDayName]?.plannedDay ?? {
        mode: "planned",
        meal: null,
      },
    ]),
  ) as Record<string, PlannedDay>;

  const effectiveDaySettings =
    getSmartWeekDaySettings({
      currentMeals: draftMeals,
      daySettings,
      lockedDays,
      requestConstraints: draft.constraints,
    });

  /*
   * Exclude every meal already present in the draft,
   * including the dinner currently assigned to this day.
   */
  const excludeMeals = days.flatMap(
    (draftDayName) => {
      const plannedDay =
        draft.days[draftDayName]?.plannedDay;

      if (
        plannedDay?.mode !== "planned" ||
        !plannedDay.meal
      ) {
        return [];
      }

      return getMealExclusionValues(
        plannedDay.meal,
      );
    },
  );

  /*
   * Keep the other proposed meals fixed while asking
   * the production planner for a new choice on this day.
   */
  const lockedMeals = Object.fromEntries(
    days.map((draftDayName) => {
      if (draftDayName === day) {
        return [draftDayName, null];
      }

      const plannedDay =
        draft.days[draftDayName]?.plannedDay;

      if (
        plannedDay?.mode === "planned" &&
        plannedDay.meal
      ) {
        return [
          draftDayName,
          plannedDay.meal,
        ];
      }

      return [draftDayName, null];
    }),
  ) as Partial<Record<Day, Meal | null>>;

  const generatedMeals = generatePlan({
    cookbook,
    pantry: pantryNames,
    daySettings: effectiveDaySettings,
    lockedMeals,
    preferences,
    excludeMeals,
    requestConstraints: draft.constraints,
    markFirstPlanGenerated: false,
  });

  const replacementMeal =
    generatedMeals[day] ?? null;

  const replacementPlannedDay: PlannedDay = {
    mode: "planned",
    meal: replacementMeal,
  };

  return {
    ...draft,
    days: {
      ...draft.days,
      [day]: {
        plannedDay: replacementPlannedDay,
        source: getMealSource(
          replacementPlannedDay,
        ),
        reason: getGeneratedDayReason(
          replacementMeal,
          effectiveDaySettings[day],
          pantryNames,
        ),
        preserved: false,
      },
    },
    createdAt: Date.now(),
  };
}