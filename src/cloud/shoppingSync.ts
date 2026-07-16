import type { ShoppingItem } from "../shoppingList";
import { supabase } from "../lib/supabase";

type CloudResult<T> = {
  data: T | null;
  error: string | null;
};

type ShoppingItemRow = {
  client_id: string | null;
  item_text: string;
  category: string | null;
  checked: boolean;
  sort_order: number;
  source_recipe: string | null;
  normalized_name: string | null;
  quantity: number | null;
  unit: string | null;
  package_size: string | null;
  display_text: string | null;
  grocery_search_name: string | null;
  grocery_notes: string | null;
  added_at: number | null;
};

type ShoppingSnapshotPayload = {
  client_id: string;
  item_text: string;
  category: string;
  checked: boolean;
  source_recipe: string | null;
  normalized_name: string | null;
  quantity: number | null;
  unit: string | null;
  package_size: string | null;
  display_text: string | null;
  grocery_search_name: string | null;
  grocery_notes: string | null;
  added_at: number;
};

function toCloudPayload(
  item: ShoppingItem,
): ShoppingSnapshotPayload {
  return {
    client_id: item.id,
    item_text: item.text,
    category: item.category,
    checked: item.checked,
    source_recipe: item.sourceRecipe?.trim() || null,
    normalized_name:
      item.normalizedName?.trim() || null,
    quantity:
      typeof item.quantity === "number" &&
        Number.isFinite(item.quantity)
        ? item.quantity
        : null,
    unit: item.unit?.trim() || null,
    package_size: item.packageSize?.trim() || null,
    display_text: item.displayText?.trim() || null,
    grocery_search_name:
      item.grocerySearchName?.trim() || null,
    grocery_notes: item.groceryNotes?.trim() || null,
    added_at:
      typeof item.addedAt === "number"
        ? item.addedAt
        : Date.now(),
  };
}

function fromCloudRow(
  row: ShoppingItemRow,
): ShoppingItem | null {
  if (!row.client_id) {
    return null;
  }

  return {
    id: row.client_id,
    text: row.item_text,
    checked: row.checked,
    addedAt: row.added_at ?? Date.now(),
    category:
      (row.category ?? "Other") as ShoppingItem["category"],
    sourceRecipe: row.source_recipe ?? "",
    normalizedName: row.normalized_name ?? undefined,
    quantity: row.quantity,
    unit: row.unit ?? undefined,
    packageSize: row.package_size ?? undefined,
    displayText: row.display_text ?? undefined,
    grocerySearchName:
      row.grocery_search_name ?? undefined,
    groceryNotes: row.grocery_notes ?? undefined,
  };
}

export async function loadCloudShoppingSnapshot(
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
        client_id,
        item_text,
        category,
        checked,
        sort_order,
        source_recipe,
        normalized_name,
        quantity,
        unit,
        package_size,
        display_text,
        grocery_search_name,
        grocery_notes,
        added_at
      `,
    )
    .eq("household_id", householdId)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Unable to load shopping-list snapshot:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  const items = (data as ShoppingItemRow[])
    .map(fromCloudRow)
    .filter(
      (item): item is ShoppingItem => item !== null,
    );

  return {
    data: items,
    error: null,
  };
}

export async function replaceCloudShoppingSnapshot(
  householdId: string,
  items: ShoppingItem[],
): Promise<CloudResult<boolean>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const payload = items.map(toCloudPayload);

  const { error } = await supabase.rpc(
    "replace_shopping_items",
    {
      p_household_id: householdId,
      p_items: payload,
    },
  );

  if (error) {
    console.error(
      "Unable to save shopping-list snapshot:",
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