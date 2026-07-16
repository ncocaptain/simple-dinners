import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../auth/AuthContext";
import {
  addCloudShoppingItem,
  clearCheckedCloudShoppingItems,
  loadCloudShoppingItems,
  removeCloudShoppingItem,
  resetCloudShoppingItems,
  setCloudShoppingItemChecked,
  type ShoppingItemInput,
} from "../cloud/shoppingItems";

export type ShoppingItem = {
  id: string;
  name: string;
  qty?: string;
  unit?: string;
  category?: string;
  checked: boolean;
  createdAt: number;
};

const LS_KEY = "simple-dinners:shopping-list:v1";

function uid() {
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

function sortShoppingItems(
  items: ShoppingItem[],
): ShoppingItem[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }

    return b.createdAt - a.createdAt;
  });
}

export function useShoppingList() {
  const {
    isSignedIn,
    householdId,
    householdLoading,
    householdError,
  } = useAuth();

  const [localItems, setLocalItems] = useState<
    ShoppingItem[]
  >([]);

  const [cloudItems, setCloudItems] = useState<
    ShoppingItem[]
  >([]);

  const [localLoaded, setLocalLoaded] = useState(false);
  const [cloudLoading, setCloudLoading] =
    useState(false);
  const [cloudError, setCloudError] = useState<
    string | null
  >(null);

  /*
   * Load the existing free/local shopping list once.
   * It remains stored even while the user is signed in.
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setLocalItems(parsed as ShoppingItem[]);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load local shopping list:",
        error,
      );
    } finally {
      setLocalLoaded(true);
    }
  }, []);

  /*
   * Save only the local version to localStorage.
   * Cloud items never overwrite the user's free/local list.
   */
  useEffect(() => {
    if (!localLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify(localItems),
      );
    } catch (error) {
      console.error(
        "Unable to save local shopping list:",
        error,
      );
    }
  }, [localItems, localLoaded]);

  /*
   * Load the household shopping list whenever the user
   * signs in or their household becomes available.
   */
  useEffect(() => {
    let cancelled = false;

    if (!isSignedIn) {
      setCloudItems([]);
      setCloudLoading(false);
      setCloudError(null);
      return;
    }

    if (!householdId) {
      setCloudItems([]);
      setCloudLoading(householdLoading);

      if (!householdLoading && householdError) {
        setCloudError(householdError);
      }

      return;
    }

    setCloudLoading(true);
    setCloudError(null);

    void loadCloudShoppingItems(householdId).then(
      (result) => {
        if (cancelled) {
          return;
        }

        if (result.error) {
          setCloudError(result.error);
        } else {
          setCloudItems(result.data ?? []);
        }

        setCloudLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    householdError,
    householdId,
    householdLoading,
    isSignedIn,
  ]);

  const activeItems = isSignedIn
    ? cloudItems
    : localItems;

  const sorted = useMemo(
    () => sortShoppingItems(activeItems),
    [activeItems],
  );

  function addItem(input: ShoppingItemInput) {
    const name = input.name.trim();

    if (!name) {
      return;
    }

    if (!isSignedIn) {
      setLocalItems((previous) => [
        {
          id: uid(),
          name,
          qty: input.qty?.trim() || undefined,
          unit: input.unit?.trim() || undefined,
          category:
            input.category?.trim() || undefined,
          checked: false,
          createdAt: Date.now(),
        },
        ...previous,
      ]);

      return;
    }

    if (!householdId) {
      setCloudError(
        "Your household is still loading. Please try again.",
      );
      return;
    }

    setCloudError(null);

    void addCloudShoppingItem(
      householdId,
      input,
    ).then((result) => {
      if (result.error || !result.data) {
        setCloudError(
          result.error ??
          "Unable to add the shopping item.",
        );
        return;
      }

      setCloudItems((previous) => [
        result.data!,
        ...previous,
      ]);
    });
  }

  function toggleItem(id: string) {
    if (!isSignedIn) {
      setLocalItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
              ...item,
              checked: !item.checked,
            }
            : item,
        ),
      );

      return;
    }

    if (!householdId) {
      setCloudError(
        "Your household is still loading. Please try again.",
      );
      return;
    }

    const currentItem = cloudItems.find(
      (item) => item.id === id,
    );

    if (!currentItem) {
      return;
    }

    const nextChecked = !currentItem.checked;

    setCloudError(null);

    setCloudItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
            ...item,
            checked: nextChecked,
          }
          : item,
      ),
    );

    void setCloudShoppingItemChecked(
      householdId,
      id,
      nextChecked,
    ).then((result) => {
      if (result.error || !result.data) {
        setCloudError(
          result.error ??
          "Unable to update the shopping item.",
        );

        setCloudItems((previous) =>
          previous.map((item) =>
            item.id === id
              ? {
                ...item,
                checked: currentItem.checked,
              }
              : item,
          ),
        );

        return;
      }

      setCloudItems((previous) =>
        previous.map((item) =>
          item.id === id ? result.data! : item,
        ),
      );
    });
  }

  function removeItem(id: string) {
    if (!isSignedIn) {
      setLocalItems((previous) =>
        previous.filter((item) => item.id !== id),
      );

      return;
    }

    if (!householdId) {
      setCloudError(
        "Your household is still loading. Please try again.",
      );
      return;
    }

    const removedItem = cloudItems.find(
      (item) => item.id === id,
    );

    setCloudError(null);

    setCloudItems((previous) =>
      previous.filter((item) => item.id !== id),
    );

    void removeCloudShoppingItem(
      householdId,
      id,
    ).then((result) => {
      if (!result.error) {
        return;
      }

      setCloudError(result.error);

      if (removedItem) {
        setCloudItems((previous) => [
          removedItem,
          ...previous.filter(
            (item) => item.id !== removedItem.id,
          ),
        ]);
      }
    });
  }

  function clearChecked() {
    if (!isSignedIn) {
      setLocalItems((previous) =>
        previous.filter((item) => !item.checked),
      );

      return;
    }

    if (!householdId) {
      setCloudError(
        "Your household is still loading. Please try again.",
      );
      return;
    }

    const removedItems = cloudItems.filter(
      (item) => item.checked,
    );

    setCloudError(null);

    setCloudItems((previous) =>
      previous.filter((item) => !item.checked),
    );

    void clearCheckedCloudShoppingItems(
      householdId,
    ).then((result) => {
      if (!result.error) {
        return;
      }

      setCloudError(result.error);

      setCloudItems((previous) => [
        ...removedItems,
        ...previous.filter(
          (item) =>
            !removedItems.some(
              (removed) => removed.id === item.id,
            ),
        ),
      ]);
    });
  }

  function resetAll() {
    if (!isSignedIn) {
      setLocalItems([]);
      return;
    }

    if (!householdId) {
      setCloudError(
        "Your household is still loading. Please try again.",
      );
      return;
    }

    const previousItems = cloudItems;

    setCloudError(null);
    setCloudItems([]);

    void resetCloudShoppingItems(
      householdId,
    ).then((result) => {
      if (!result.error) {
        return;
      }

      setCloudError(result.error);
      setCloudItems(previousItems);
    });
  }

  async function refreshCloud() {
    if (!isSignedIn || !householdId) {
      return;
    }

    setCloudLoading(true);
    setCloudError(null);

    const result =
      await loadCloudShoppingItems(householdId);

    if (result.error) {
      setCloudError(result.error);
    } else {
      setCloudItems(result.data ?? []);
    }

    setCloudLoading(false);
  }

  return {
    items: sorted,
    addItem,
    toggleItem,
    removeItem,
    clearChecked,
    resetAll,

    isCloudMode: isSignedIn,
    loading: isSignedIn
      ? householdLoading || cloudLoading
      : !localLoaded,
    error: isSignedIn
      ? householdError ?? cloudError
      : null,
    refreshCloud,
  };
}