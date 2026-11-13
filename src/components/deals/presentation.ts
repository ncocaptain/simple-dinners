import { getStoredLanguage, t } from "../../i18n";
import type { Money, NormalizedMeasure, PackageSize, SuppressionReason } from "../../deals/types";

export const text = (key: string) => t(`deals.${key}`);
export const number = (value: number) => new Intl.NumberFormat(getStoredLanguage(), { maximumFractionDigits: 2 }).format(value);
export const money = (value: Money) => new Intl.NumberFormat(getStoredLanguage(), { style: "currency", currency: value.currency }).format(value.amountMinor / 100);
export const measure = (value: NormalizedMeasure) => `${number(value.quantity)} ${value.unit === "each" ? text("each") : value.unit}`;
export function packageLabel(size: PackageSize): string {
  if (size.kind === "variable-weight") return text("variableWeight");
  const inner = size.kind === "single" ? size.size : size.innerSize;
  if (!inner || (size.kind === "multipack" && size.packCount === null)) return text("unknownSize");
  return `${size.kind === "multipack" ? `${number(size.packCount!)} × ` : ""}${number(inner.quantity)} ${inner.unit === "each" ? text("each") : inner.unit}`;
}
const reasonKeys: Record<SuppressionReason, string> = {
  "invalid-measure": "unknownSize", "unsupported-unit": "incomparable", "unknown-package": "unknownSize",
  "variable-weight": "variableWeight", "basis-mismatch": "incomparable", "dimension-mismatch": "incomparable",
  "product-mismatch": "wrongForm", "unverified-product": "needsReview", "need-review": "needsReview",
  "unspecified-quantity": "quantityNeeded", "unsupported-requirement": "incomparable",
  "invalid-money": "priceUnavailable", "missing-price": "priceUnavailable", "currency-mismatch": "incomparable",
  "inapplicable-price": "inapplicable", "stale-price": "stale", unavailable: "priceUnavailable",
  "unresolved-condition": "conditions", "ineligible-condition": "conditions", "minimum-quantity": "conditions",
  "unsupported-promotion": "conditions", "missing-regular-price": "priceUnavailable", "no-positive-savings": "noSavings",
  "numeric-overflow": "incomparable", "incomplete-basket": "incomplete", "invalid-basket": "selectStores",
};
export const reasonText = (reason: SuppressionReason) => text(reasonKeys[reason]);
