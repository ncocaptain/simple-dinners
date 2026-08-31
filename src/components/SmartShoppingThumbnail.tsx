import {
  Apple,
  CircleHelp,
  CookingPot,
  CupSoda,
  Drumstick,
  Milk,
  Package,
  Snowflake,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type { GroceryCategory } from "../core/groceryCategories";
import {
  getLocalSmartShoppingThumbnailSrc,
  hasLocalSmartShoppingThumbnail,
} from "../plus/smartShoppingThumbnails";

type SmartShoppingThumbnailProps = {
  thumbnailKey: string;
  altText: string;
  category: GroceryCategory;
  size?: number;
  variant?: "preview" | "list";
  debugTitle?: string;
};

function getFallbackIcon(
  category: GroceryCategory,
): LucideIcon {
  const normalizedCategory = String(category)
    .toLowerCase()
    .trim();

  if (normalizedCategory.includes("produce")) {
    return Apple;
  }

  if (
    normalizedCategory.includes("dairy") ||
    normalizedCategory.includes("egg")
  ) {
    return Milk;
  }

  if (
    normalizedCategory.includes("meat") ||
    normalizedCategory.includes("seafood")
  ) {
    return Drumstick;
  }

  if (normalizedCategory.includes("bakery")) {
    return Wheat;
  }

  if (normalizedCategory.includes("frozen")) {
    return Snowflake;
  }

  if (normalizedCategory.includes("beverage")) {
    return CupSoda;
  }

  if (normalizedCategory.includes("household")) {
    return Package;
  }

  if (
    normalizedCategory.includes("pantry") ||
    normalizedCategory.includes("spice")
  ) {
    return CookingPot;
  }

  return CircleHelp;
}

export default function SmartShoppingThumbnail({
  thumbnailKey,
  altText,
  category,
  size = 40,
  variant = "preview",
  debugTitle,
}: SmartShoppingThumbnailProps) {
  const hasLocalImage =
    hasLocalSmartShoppingThumbnail(
      thumbnailKey,
    );

  const [
    imageStatus,
    setImageStatus,
  ] = useState<
    "loading" | "loaded" | "failed"
  >(
    hasLocalImage
      ? "loading"
      : "failed",
  );

  useEffect(() => {
    setImageStatus(
      hasLocalSmartShoppingThumbnail(
        thumbnailKey,
      )
        ? "loading"
        : "failed",
    );
  }, [thumbnailKey]);

  const FallbackIcon =
    getFallbackIcon(category);

  const localImageSrc =
    getLocalSmartShoppingThumbnailSrc(
      thumbnailKey,
    );

  const isListVariant = variant === "list";

  const borderRadius = isListVariant
    ? Math.max(10, Math.round(size * 0.3))
    : Math.max(10, Math.round(size * 0.32));

  const imageInset = isListVariant ? 3 : 0;

  return (
    <div
      role="img"
      aria-label={altText}
      title={debugTitle}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: isListVariant
          ? "linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035))"
          : "rgba(255,255,255,0.055)",
        border: isListVariant
          ? "1px solid rgba(255,255,255,0.11)"
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isListVariant
          ? "inset 0 1px 0 rgba(255,255,255,0.045), 0 5px 14px rgba(0,0,0,0.16)"
          : "none",
        color: isListVariant
          ? "rgba(255,255,255,0.62)"
          : "rgba(255,255,255,0.72)",
      }}
    >
      {imageStatus !== "loaded" && (
        <FallbackIcon
          size={Math.round(
            size * (isListVariant ? 0.5 : 0.48)
          )}
          strokeWidth={isListVariant ? 1.7 : 2}
          aria-hidden="true"
        />
      )}

      {hasLocalImage &&
        imageStatus !== "failed" && (
          <img
            src={localImageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() =>
              setImageStatus("loaded")
            }
            onError={() =>
              setImageStatus("failed")
            }
            style={{
              position: "absolute",

              top: imageInset,
              left: imageInset,

              width: `calc(100% - ${imageInset * 2}px)`,
              height: `calc(100% - ${imageInset * 2}px)`,

              display: "block",
              objectFit: isListVariant
                ? "contain"
                : "cover",

              opacity:
                imageStatus === "loaded"
                  ? 1
                  : 0,

              filter: isListVariant
                ? "saturate(0.88) contrast(1.02)"
                : "none",

              pointerEvents: "none",

              transition:
                "opacity 160ms ease",
            }}
          />
        )}
    </div>
  );
}