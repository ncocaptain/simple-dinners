export type PantryFreshnessStatus =
  | "none"
  | "fresh"
  | "use-soon"
  | "past-date";

const DAY_MS =
  24 * 60 * 60 * 1000;

function localDayNumber(
  timestamp: number
) {
  const date =
    new Date(timestamp);

  return (
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ) / DAY_MS
  );
}

export function getPantryFreshness(
  expiresAt:
    | number
    | null
    | undefined,
  now = Date.now()
): {
  status: PantryFreshnessStatus;
  daysUntil: number | null;
} {
  if (
    typeof expiresAt !==
      "number" ||
    !Number.isFinite(
      expiresAt
    )
  ) {
    return {
      status: "none",
      daysUntil: null,
    };
  }

  const daysUntil =
    Math.round(
      localDayNumber(
        expiresAt
      ) -
        localDayNumber(now)
    );

  if (daysUntil < 0) {
    return {
      status: "past-date",
      daysUntil,
    };
  }

  if (daysUntil <= 3) {
    return {
      status: "use-soon",
      daysUntil,
    };
  }

  return {
    status: "fresh",
    daysUntil,
  };
}

export function parsePantryDateInput(
  value: string
) {
  const match =
    String(value || "").match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
      0
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date.getTime();
}

export function formatPantryDateInput(
  expiresAt:
    | number
    | null
    | undefined
) {
  if (
    typeof expiresAt !==
      "number" ||
    !Number.isFinite(
      expiresAt
    )
  ) {
    return "";
  }

  const date =
    new Date(expiresAt);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatPantryBestBy(
  expiresAt:
    | number
    | null
    | undefined,
  locale = "en-US"
) {
  if (
    typeof expiresAt !==
      "number" ||
    !Number.isFinite(
      expiresAt
    )
  ) {
    return "";
  }

  const date =
    new Date(expiresAt);

  const now =
    new Date();

  return new Intl.DateTimeFormat(
    locale,
    {
      month: "short",
      day: "numeric",
      ...(date.getFullYear() !==
      now.getFullYear()
        ? {
            year: "numeric",
          }
        : {}),
    }
  ).format(date);
}
