import type { ShoppingItem } from "../hooks/useShoppingList";
import { supabase } from "../lib/supabase";

export type ShoppingItemInput = {
  name: string;
  qty?: string;
  unit?: string;
  category?: string;
};

type ShoppingItemRow = {
  id: string;
  household_id: string;
  item_text: string;
  qty: string | null;
  unit: string | null;
  category: string | null;
  checked: boolean;
  created_at: string;
};

type CloudResult<T> = {
  data: T | null;
  error: string | null;
};

function rowToShoppingItem(
  row: ShoppingItemRow,
): ShoppingItem {
  return {
    id: row.id,
    name: row.item_text,
    qty: row.qty ?? undefined,
    unit: row.unit ?? undefined,
    category: row.category ?? undefined,
    checked: row.checked,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function loadCloudShoppingItems(
  householdId: string,
): Promise<CloudResult<ShoppingItem[]>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("shopping_items")
    .select(
      `
        id,
        household_id,
        item_text,
        qty,
        unit,
        category,
        checked,
        created_at
      `,
    )
    .eq("household_id", householdId);

  if (error) {
    console.error(
      "Unable to load cloud shopping items:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  const items = (data as ShoppingItemRow[])
    .map(rowToShoppingItem)
    .sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }

      return b.createdAt - a.createdAt;
    });

  return {
    data: items,
    error: null,
  };
}

export async function addCloudShoppingItem(
  householdId: string,
  input: ShoppingItemInput,
): Promise<CloudResult<ShoppingItem>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const name = input.name.trim();

  if (!name) {
    return {
      data: null,
      error: "Item name is required.",
    };
  }

  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      household_id: householdId,
      item_text: name,
      qty: input.qty?.trim() || null,
      unit: input.unit?.trim() || null,
      category: input.category?.trim() || null,
      checked: false,
    })
    .select(
      `
        id,
        household_id,
        item_text,
        qty,
        unit,
        category,
        checked,
        created_at
      `,
    )
    .single();

  if (error) {
    console.error(
      "Unable to add cloud shopping item:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: rowToShoppingItem(
      data as ShoppingItemRow,
    ),
    error: null,
  };
}

export async function setCloudShoppingItemChecked(
  householdId: string,
  itemId: string,
  checked: boolean,
): Promise<CloudResult<ShoppingItem>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("shopping_items")
    .update({ checked })
    .eq("id", itemId)
    .eq("household_id", householdId)
    .select(
      `
        id,
        household_id,
        item_text,
        qty,
        unit,
        category,
        checked,
        created_at
      `,
    )
    .single();

  if (error) {
    console.error(
      "Unable to update cloud shopping item:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: rowToShoppingItem(
      data as ShoppingItemRow,
    ),
    error: null,
  };
}

export async function removeCloudShoppingItem(
  householdId: string,
  itemId: string,
): Promise<CloudResult<boolean>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", itemId)
    .eq("household_id", householdId);

  if (error) {
    console.error(
      "Unable to remove cloud shopping item:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: true,
    error: null,
  };
}

export async function clearCheckedCloudShoppingItems(
  householdId: string,
): Promise<CloudResult<boolean>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("household_id", householdId)
    .eq("checked", true);

  if (error) {
    console.error(
      "Unable to clear checked cloud items:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: true,
    error: null,
  };
}

export async function resetCloudShoppingItems(
  householdId: string,
): Promise<CloudResult<boolean>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("household_id", householdId);

  if (error) {
    console.error(
      "Unable to clear cloud shopping list:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: true,
    error: null,
  };
}