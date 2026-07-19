import {
  Check,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  GROCERY_CATEGORY_ORDER,
  type GroceryCategory,
} from "../core/groceryCategories";
import { getStoredLanguage } from "../i18n";
import type {
  SmartShoppingChange,
  SmartShoppingPreview,
  SmartShoppingQuantityStatus,
} from "../plus/smartShopping";
import SmartShoppingThumbnail from "./SmartShoppingThumbnail";

type SmartShoppingPreviewModalProps = {
  preview: SmartShoppingPreview | null;
  isStale: boolean;
  canApply: boolean;
  showItemPictures: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onApply: () => void;
};

type ModalCopy = {
  title: string;
  subtitle: string;

  previewOnly: string;
  previewOnlyDescription: string;
  alreadyOrganized: string;
  alreadyOrganizedDescription: string;

  listChanged: string;
  listChangedDescription: string;
  refreshPreview: string;

  currentItems: string;
  organizedItems: string;
  combinedEntries: string;
  noChanges: string;
  originalEntries: string;

  changes: Record<SmartShoppingChange, string>;
  applyChanges: string;
  close: string;
};

const ENGLISH_COPY: ModalCopy = {
  title: "Smart Shopping Preview",
  subtitle:
    "Here is how Simple Dinners could organize your shopping list.",
  previewOnly: "Preview only",
  previewOnlyDescription:
    "Your current shopping list has not been changed.",
  alreadyOrganized: "Your list is already organized",
  alreadyOrganizedDescription:
    "Smart Shopping did not find any new changes to apply.",
  listChanged: "Your shopping list changed",
  listChangedDescription:
    "Someone edited the list while this preview was open. Refresh the preview before continuing.",
  refreshPreview: "Refresh preview",
  currentItems: "Current items",
  organizedItems: "Organized items",
  combinedEntries: "Combined",
  noChanges:
    "Your list is already looking organized.",
  originalEntries: "Original entries",
  changes: {
    combined: "Combined",
    normalized: "Cleaned up",
    "quantity-separated": "Quantity separated",
    recategorized: "Moved section",
  },
  applyChanges: "Apply changes",
  close: "Close preview",
};

const SPANISH_COPY: ModalCopy = {
  title: "Vista previa de compra inteligente",
  subtitle:
    "Así podría organizar Simple Dinners tu lista de compras.",
  previewOnly: "Solo vista previa",
  previewOnlyDescription:
    "Tu lista de compras actual no ha cambiado.",
  alreadyOrganized: "Tu lista ya está organizada",
  alreadyOrganizedDescription:
    "Compra Inteligente no encontró nuevos cambios para aplicar.",
  listChanged: "Tu lista de compras cambió",
  listChangedDescription:
    "Alguien editó la lista mientras esta vista previa estaba abierta. Actualiza la vista previa antes de continuar.",
  refreshPreview: "Actualizar vista previa",
  currentItems: "Artículos actuales",
  organizedItems: "Artículos organizados",
  combinedEntries: "Combinados",
  noChanges:
    "Tu lista ya está bien organizada.",
  originalEntries: "Artículos originales",
  changes: {
    combined: "Combinados",
    normalized: "Texto mejorado",
    "quantity-separated": "Cantidad separada",
    recategorized: "Sección cambiada",
  },
  applyChanges: "Aplicar cambios",
  close: "Cerrar vista previa",
};

const SPANISH_CATEGORY_LABELS: Record<string, string> = {
  Produce: "Frutas y verduras",
  Dairy: "Lácteos",
  "Dairy & Eggs": "Lácteos y huevos",
  Meat: "Carnes",
  "Meat & Seafood": "Carnes y mariscos",
  Seafood: "Mariscos",
  Bakery: "Panadería",
  Frozen: "Congelados",
  Pantry: "Despensa",
  Spices: "Especias",
  Beverages: "Bebidas",
  Household: "Hogar",
  Other: "Otros",
};

function getCategoryLabel(
  category: GroceryCategory,
  isSpanish: boolean,
): string {
  const categoryName = String(category);

  if (!isSpanish) {
    return categoryName;
  }

  return (
    SPANISH_CATEGORY_LABELS[categoryName] ||
    categoryName
  );
}

function buildCategorySections(
  preview: SmartShoppingPreview,
): GroceryCategory[] {
  const usedCategories = new Set(
    preview.items.map((item) => item.category),
  );

  const orderedCategories =
    GROCERY_CATEGORY_ORDER.filter((category) =>
      usedCategories.has(category),
    );

  const additionalCategories = Array.from(
    usedCategories,
  ).filter(
    (category) =>
      !GROCERY_CATEGORY_ORDER.includes(category),
  );

  return [
    ...orderedCategories,
    ...additionalCategories,
  ];
}

function getCombinedDescription(
  sourceCount: number,
  quantityStatus: SmartShoppingQuantityStatus,
  isSpanish: boolean,
): string {
  if (sourceCount <= 1) {
    return "";
  }

  if (quantityStatus === "unknown") {
    return isSpanish
      ? `${sourceCount} artículos · cantidad no especificada`
      : `${sourceCount} entries · quantity not specified`;
  }

  return isSpanish
    ? `${sourceCount} artículos combinados`
    : `${sourceCount} entries combined`;
}

export default function SmartShoppingPreviewModal({
  preview,
  isStale,
  canApply,
  showItemPictures,
  onClose,
  onRefresh,
  onApply,
}: SmartShoppingPreviewModalProps) {
  if (!preview) {
    return null;
  }

  const isSpanish =
    getStoredLanguage() === "es";

  const copy = isSpanish
    ? SPANISH_COPY
    : ENGLISH_COPY;

  const categorySections =
    buildCategorySections(preview);

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "rgba(2, 6, 23, 0.82)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-shopping-preview-title"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 24,
          border:
            "1px solid rgba(255,255,255,0.13)",
          background:
            "linear-gradient(180deg, rgba(20,29,48,0.99), rgba(8,15,29,0.99))",
          boxShadow:
            "0 26px 80px rgba(0,0,0,0.52)",
          color: "white",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 20px 16px",
            borderBottom:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(168,85,247,0.15)",
                border:
                  "1px solid rgba(192,132,252,0.3)",
                color: "#d8b4fe",
              }}
            >
              <Sparkles size={21} />
            </div>

            <div>
              <h2
                id="smart-shopping-preview-title"
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.2,
                }}
              >
                {copy.title}
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color:
                    "rgba(255,255,255,0.67)",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {copy.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              padding: 0,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            overflowY: "auto",
            padding: 20,
          }}
        >
          {/* Preview-only notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: 13,
              marginBottom: 16,
              borderRadius: 16,
              background:
                "rgba(59,130,246,0.1)",
              border:
                "1px solid rgba(96,165,250,0.24)",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                flexShrink: 0,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(59,130,246,0.18)",
                color: "#93c5fd",
              }}
            >
              <Check size={15} />
            </div>

            <div>
              <div
                style={{
                  color: "#bfdbfe",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {copy.previewOnly}
              </div>

              <div
                style={{
                  marginTop: 2,
                  color:
                    "rgba(219,234,254,0.72)",
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {copy.previewOnlyDescription}
              </div>
            </div>
          </div>

          {!isStale && !canApply && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 13,
                marginBottom: 16,
                borderRadius: 16,
                background:
                  "rgba(34,197,94,0.09)",
                border:
                  "1px solid rgba(74,222,128,0.2)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(34,197,94,0.14)",
                  color: "#86efac",
                }}
              >
                <Check size={16} />
              </div>

              <div>
                <div
                  style={{
                    color: "#bbf7d0",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {copy.alreadyOrganized}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color:
                      "rgba(220,252,231,0.67)",
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {copy.alreadyOrganizedDescription}
                </div>
              </div>
            </div>
          )}

          {isStale && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 13,
                marginBottom: 16,
                borderRadius: 16,
                background:
                  "rgba(245,158,11,0.11)",
                border:
                  "1px solid rgba(251,191,36,0.3)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(245,158,11,0.18)",
                  color: "#fcd34d",
                }}
              >
                <TriangleAlert size={16} />
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    color: "#fde68a",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {copy.listChanged}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color:
                      "rgba(254,243,199,0.72)",
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {copy.listChangedDescription}
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  style={{
                    marginTop: 10,
                    padding: "8px 11px",
                    borderRadius: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background:
                      "rgba(245,158,11,0.15)",
                    border:
                      "1px solid rgba(251,191,36,0.3)",
                    color: "#fde68a",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  <RefreshCw size={14} />
                  {copy.refreshPreview}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <StatCard
              value={preview.originalItemCount}
              label={copy.currentItems}
            />

            <StatCard
              value={preview.proposedItemCount}
              label={copy.organizedItems}
            />

            <StatCard
              value={preview.combinedEntryCount}
              label={copy.combinedEntries}
            />
          </div>

          {preview.items.length === 0 ? (
            <div
              style={{
                padding: "26px 18px",
                textAlign: "center",
                borderRadius: 18,
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                color:
                  "rgba(255,255,255,0.65)",
                fontSize: 14,
              }}
            >
              {copy.noChanges}
            </div>
          ) : (
            categorySections.map((category) => {
              const sectionItems =
                preview.items.filter(
                  (item) =>
                    item.category === category,
                );

              if (sectionItems.length === 0) {
                return null;
              }

              return (
                <section
                  key={String(category)}
                  style={{ marginBottom: 22 }}
                >
                  <div
                    style={{
                      marginBottom: 9,
                      color:
                        "rgba(255,255,255,0.52)",
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {getCategoryLabel(
                      category,
                      isSpanish,
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {sectionItems.map((item) => {
                      const combinedDescription =
                        getCombinedDescription(
                          item.sourceIds.length,
                          item.quantityStatus,
                          isSpanish,
                        );

                      return (
                        <div
                          key={item.previewId}
                          style={{
                            padding: 13,
                            borderRadius: 17,
                            background:
                              "rgba(255,255,255,0.045)",
                            border:
                              "1px solid rgba(255,255,255,0.085)",
                            opacity: item.checked
                              ? 0.58
                              : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 11,
                            }}
                          >
                            {showItemPictures && (
                              <SmartShoppingThumbnail
                                thumbnailKey={item.thumbnailKey}
                                altText={item.thumbnailAltText}
                                category={item.category}
                                size={40}
                                debugTitle={`${item.thumbnailKey} · ${item.thumbnailMatchType}`}
                              />
                            )}

                            <div
                              style={{
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  color: "white",
                                  fontSize: 14,
                                  fontWeight: 850,
                                  lineHeight: 1.3,
                                }}
                              >
                                {item.displayName}
                              </div>

                              {(item.quantityText ||
                                combinedDescription) && (
                                  <div
                                    style={{
                                      marginTop: 3,
                                      color:
                                        "rgba(255,255,255,0.58)",
                                      fontSize: 12,
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {[
                                      item.quantityText,
                                      combinedDescription,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </div>
                                )}

                              {item.changes.length >
                                0 && (
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      flexWrap: "wrap",
                                      gap: 5,
                                      marginTop: 8,
                                    }}
                                  >
                                    {item.changes.map(
                                      (change) => (
                                        <span
                                          key={change}
                                          style={{
                                            padding:
                                              "4px 7px",
                                            borderRadius:
                                              999,
                                            background:
                                              "rgba(34,197,94,0.09)",
                                            border:
                                              "1px solid rgba(34,197,94,0.18)",
                                            color:
                                              "#86efac",
                                            fontSize: 9,
                                            fontWeight: 900,
                                            letterSpacing:
                                              0.3,
                                            textTransform:
                                              "uppercase",
                                          }}
                                        >
                                          {
                                            copy
                                              .changes[
                                            change
                                            ]
                                          }
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}

                              {item.originalTexts
                                .length > 1 && (
                                  <details
                                    style={{
                                      marginTop: 9,
                                    }}
                                  >
                                    <summary
                                      style={{
                                        color:
                                          "rgba(255,255,255,0.5)",
                                        fontSize: 11,
                                        cursor:
                                          "pointer",
                                      }}
                                    >
                                      {
                                        copy.originalEntries
                                      }
                                    </summary>

                                    <div
                                      style={{
                                        display:
                                          "flex",
                                        flexDirection:
                                          "column",
                                        gap: 4,
                                        marginTop: 7,
                                        paddingLeft: 10,
                                        borderLeft:
                                          "2px solid rgba(255,255,255,0.08)",
                                      }}
                                    >
                                      {item.originalTexts.map(
                                        (
                                          originalText,
                                          index,
                                        ) => (
                                          <div
                                            key={`${item.previewId}-${index}`}
                                            style={{
                                              color:
                                                "rgba(255,255,255,0.5)",
                                              fontSize:
                                                11,
                                              lineHeight:
                                                1.35,
                                            }}
                                          >
                                            {
                                              originalText
                                            }
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </details>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            padding: "14px 20px 20px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "13px 16px",
              borderRadius: 15,
              background:
                "rgba(255,255,255,0.07)",
              border:
                "1px solid rgba(255,255,255,0.13)",
              color: "white",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            {copy.close}
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={isStale || !canApply}
            style={{
              padding: "13px 16px",
              borderRadius: 15,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background:
                isStale || !canApply
                  ? "rgba(168,85,247,0.08)"
                  : "linear-gradient(135deg, #9333ea, #7c3aed)",
              border:
                isStale || !canApply
                  ? "1px solid rgba(192,132,252,0.12)"
                  : "1px solid rgba(216,180,254,0.32)",
              color:
                isStale || !canApply
                  ? "rgba(216,180,254,0.38)"
                  : "white",
              fontSize: 13,
              fontWeight: 900,
              cursor:
                isStale || !canApply
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                isStale || !canApply
                  ? "none"
                  : "0 10px 28px rgba(126,34,206,0.3)",
            }}
          >
            <Check size={16} />
            {copy.applyChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "12px 8px",
        borderRadius: 15,
        textAlign: "center",
        background:
          "rgba(255,255,255,0.04)",
        border:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 19,
          fontWeight: 950,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 3,
          color:
            "rgba(255,255,255,0.48)",
          fontSize: 9,
          fontWeight: 850,
          lineHeight: 1.2,
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        {label}
      </div>
    </div>
  );
}