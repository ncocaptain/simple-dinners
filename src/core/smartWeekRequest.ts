import { API_BASE } from "./api";
import type { LanguageCode } from "../i18n";
import type {
  SmartWeekProteinTarget,
  SmartWeekRequestConstraints,
} from "./types";

function normalizeStringList(
  value: unknown,
  maximumItems = 12,
) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) =>
          String(item ?? "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ).slice(0, maximumItems);
}

function normalizeProteinTargets(
  value: unknown,
): SmartWeekProteinTarget[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const targets: SmartWeekProteinTarget[] = [];

  for (const item of value) {
    const raw =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {};

    const keyword = String(
      raw.keyword ?? "",
    )
      .trim()
      .toLowerCase();

    const rawCount = Number(raw.count);

    if (
      !keyword ||
      seen.has(keyword) ||
      !Number.isFinite(rawCount)
    ) {
      continue;
    }

    seen.add(keyword);

    targets.push({
      keyword,
      count: Math.max(
        1,
        Math.min(7, Math.round(rawCount)),
      ),
    });
  }

  return targets.slice(0, 4);
}

function normalizeConstraints(
  value: unknown,
): SmartWeekRequestConstraints {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const rawVegetarianCount = Number(
    raw.vegetarianNightCount,
  );

  return {
    excludedKeywords: normalizeStringList(
      raw.excludedKeywords,
    ),

    preferredKeywords: normalizeStringList(
      raw.preferredKeywords,
    ),

    preferredTags: normalizeStringList(
      raw.preferredTags,
    ),

    mostlyQuick:
      raw.mostlyQuick === true,

    vegetarianNightCount:
      Number.isFinite(rawVegetarianCount)
        ? Math.max(
          0,
          Math.min(
            7,
            Math.round(
              rawVegetarianCount,
            ),
          ),
        )
        : 0,

    pantryPriority:
      raw.pantryPriority === true,

    budgetPriority:
      raw.budgetPriority === true,

    kidFriendly:
      raw.kidFriendly === true,

    proteinTargets:
      normalizeProteinTargets(
        raw.proteinTargets,
      ),
  };
}

export async function interpretSmartWeekRequest(
  requestText: string,
  language: LanguageCode,
): Promise<SmartWeekRequestConstraints | null> {
  const trimmedRequest =
    requestText.trim();

  if (!trimmedRequest) {
    return null;
  }

  const response = await fetch(
    `${API_BASE}/interpret-smart-week-request`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        requestText: trimmedRequest,
        language,
      }),
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Simple Dinners could not read the Smart Week response.",
    );
  }

  if (
    !response.ok ||
    data?.success !== true
  ) {
    throw new Error(
      data?.error ||
      "Smart Week request interpretation is unavailable.",
    );
  }

  return normalizeConstraints(
    data.constraints,
  );
}