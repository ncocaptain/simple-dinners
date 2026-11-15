import type { PantryItem } from "./types";
import { formatPantryUnitLabel } from "./pantryStore";

export function canDecreasePantryQuantity(item: PantryItem) {
  return typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0;
}

export function formatPantryQuantity(item: PantryItem, inStock: string, stapleInStock: string) {
  if (item.isStaple) return stapleInStock;
  if (typeof item.quantity !== "number") return inStock;
  const quantity = Number.isInteger(item.quantity)
    ? String(item.quantity)
    : item.quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const unit = formatPantryUnitLabel(item.unit, item.quantity);
  return unit ? `${quantity} ${unit}` : quantity;
}
