// =====================================================
// Smart Shopping device preferences
//
// These are presentation preferences only.
// They are intentionally device-local and are not part
// of the shared household shopping-list snapshot.
// =====================================================

const SMART_SHOPPING_PREFERENCES_KEY =
  "simple-dinners.smartShopping.preferences.v1";

export const SMART_SHOPPING_PREFERENCES_CHANGED_EVENT =
  "simple-dinners:smart-shopping-preferences-changed";

export type SmartShoppingPreferences = {
  showItemPictures: boolean;
};

const DEFAULT_SMART_SHOPPING_PREFERENCES: SmartShoppingPreferences =
{
  showItemPictures: true,
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeSmartShoppingPreferences(
  value: unknown,
): SmartShoppingPreferences {
  if (!isRecord(value)) {
    return {
      ...DEFAULT_SMART_SHOPPING_PREFERENCES,
    };
  }

  return {
    showItemPictures:
      typeof value.showItemPictures ===
        "boolean"
        ? value.showItemPictures
        : DEFAULT_SMART_SHOPPING_PREFERENCES.showItemPictures,
  };
}

export function loadSmartShoppingPreferences(): SmartShoppingPreferences {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_SMART_SHOPPING_PREFERENCES,
    };
  }

  try {
    const storedValue = window.localStorage.getItem(
      SMART_SHOPPING_PREFERENCES_KEY,
    );

    if (!storedValue) {
      return {
        ...DEFAULT_SMART_SHOPPING_PREFERENCES,
      };
    }

    return normalizeSmartShoppingPreferences(
      JSON.parse(storedValue),
    );
  } catch {
    return {
      ...DEFAULT_SMART_SHOPPING_PREFERENCES,
    };
  }
}

export function saveSmartShoppingPreferences(
  preferences: SmartShoppingPreferences,
): SmartShoppingPreferences {
  const normalizedPreferences =
    normalizeSmartShoppingPreferences(
      preferences,
    );

  if (typeof window === "undefined") {
    return normalizedPreferences;
  }

  try {
    window.localStorage.setItem(
      SMART_SHOPPING_PREFERENCES_KEY,
      JSON.stringify(normalizedPreferences),
    );

    window.dispatchEvent(
      new CustomEvent(
        SMART_SHOPPING_PREFERENCES_CHANGED_EVENT,
        {
          detail: normalizedPreferences,
        },
      ),
    );
  } catch {
    // A blocked or full localStorage should not prevent
    // the Shopping List from continuing to work.
  }

  return normalizedPreferences;
}

export function setShowSmartShoppingPictures(
  showItemPictures: boolean,
): SmartShoppingPreferences {
  const currentPreferences =
    loadSmartShoppingPreferences();

  return saveSmartShoppingPreferences({
    ...currentPreferences,
    showItemPictures,
  });
}