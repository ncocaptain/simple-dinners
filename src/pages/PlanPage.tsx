import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  Info,
  Leaf,
  Refrigerator,
  Sparkles,
  Utensils,
} from "lucide-react";

import Button from "../components/Button";
import Card from "../components/Card";
import { days } from "../core/data";
import { ALLERGENS } from "../core/planner";
import type { Effort, PantryItem } from "../core/types";
import {
  getLanguageLabel,
  getStoredLanguage,
  saveStoredLanguage,
  t,
  type LanguageCode,
} from "../i18n";

// =====================================================
// PlanPage: types
// =====================================================

type PlanPageProps = {
  daySettings: Record<string, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<string, Effort>>>;
  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  generateDinnerPlan: (force?: boolean) => void;
  prefs: any;
  setPrefs: any;
};

// =====================================================
// PlanPage: component
// =====================================================

export default function PlanPage({
  daySettings,
  setDaySettings,
  pantry,
  setPantry,
  generateDinnerPlan,
  prefs,
  setPrefs,
}: PlanPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // State
  // =====================================================

  const [pantryText, setPantryText] = useState(
    pantry.map((p) => p.name).join(", ")
  );

  const [language, setLanguage] = useState<LanguageCode>(() =>
    getStoredLanguage()
  );

  // =====================================================
  // Effects
  // =====================================================

  useEffect(() => {
    setPantryText(pantry.map((p) => p.name).join(", "));
  }, [pantry]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("first") === "true") {
      generateDinnerPlan(true);
    }
  }, [location.search, generateDinnerPlan]);

  // =====================================================
  // Derived data
  // =====================================================

  const pantryItems = useMemo(() => {
    return pantryText
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [pantryText]);

  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: t("plan.effort.quick") },
    { key: "normal", label: t("plan.effort.normal") },
    { key: "big", label: t("plan.effort.big") },
    { key: "takeout", label: t("plan.effort.takeout") },
  ];

  const activeAllergens: string[] = Array.isArray(prefs.allergens)
    ? prefs.allergens
    : [];

  const allergenLabels: Record<string, string> = {
    shellfish: t("plan.allergens.shellfish"),
    fish: t("plan.allergens.fish"),
    dairy: t("plan.allergens.dairy"),

    // Support both possible stored keys.
    eggs: t("plan.allergens.eggs"),
    Eggs: t("plan.allergens.eggs"),

    peanuts: t("plan.allergens.peanuts"),
    tree_nuts: t("plan.allergens.treeNuts"),
    gluten: t("plan.allergens.gluten"),
    soy: t("plan.allergens.soy"),
    sesame: t("plan.allergens.sesame"),
  };

  const dayLabels: Record<string, string> = {
    Monday: t("plan.days.monday"),
    Tuesday: t("plan.days.tuesday"),
    Wednesday: t("plan.days.wednesday"),
    Thursday: t("plan.days.thursday"),
    Friday: t("plan.days.friday"),
    Saturday: t("plan.days.saturday"),
    Sunday: t("plan.days.sunday"),
  };

  // =====================================================
  // Actions
  // =====================================================

  const commitPantry = () => {
    const unique = Array.from(
      new Map(
        pantryItems.map((name) => [
          name.toLowerCase(),
          {
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            createdAt: Date.now(),
          },
        ])
      ).values()
    );

    setPantry(unique);
  };

  const updatePrefs = (updatedFields: any) => {
    const nextPrefs = { ...prefs, ...updatedFields };

    setPrefs(nextPrefs);
    localStorage.setItem("prefs", JSON.stringify(nextPrefs));
  };

  const removePantryItem = (nameToRemove: string) => {
    const nextItems = pantryItems.filter(
      (item) => item.toLowerCase() !== nameToRemove.toLowerCase()
    );

    const nextText = nextItems.join(", ");

    setPantryText(nextText);

    setPantry(
      nextItems.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        createdAt: Date.now(),
      }))
    );
  };

  const handleLanguageChange = (nextLanguage: LanguageCode) => {
    if (nextLanguage === language) return;

    saveStoredLanguage(nextLanguage);
    setLanguage(nextLanguage);

    window.dispatchEvent(
      new CustomEvent("simple-dinners-language-change", {
        detail: nextLanguage,
      })
    );
  };

  const toggleAllergen = (key: string) => {
    const current = Array.isArray(prefs.allergens) ? prefs.allergens : [];
    const exists = current.includes(key);

    updatePrefs({
      allergens: exists
        ? current.filter((item: string) => item !== key)
        : [...current, key],
    });
  };

  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan(true);
  };
  const handleSmartWeek = () => {
    /*
     * Save any pantry text currently being edited before
     * opening Smart Week so the draft uses the latest items.
     */
    commitPantry();
    navigate("/smart-week");
  };

  const handleBackToWeek = () => {
    commitPantry();
    navigate("/week");
  };

  // =====================================================
  // Shared styles: layout
  // =====================================================

  const pageWrap: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const contentWrap: React.CSSProperties = {
    maxWidth: "550px",
    width: "100%",
    padding: "0 20px 120px 20px",
    display: "grid",
    gap: 24,
  };

  const cardContentGrid: React.CSSProperties = {
    display: "grid",
    gap: 24,
  };

  const sectionCard: React.CSSProperties = {
    padding: 16,
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  // =====================================================
  // Shared styles: hero and section headers
  // =====================================================

  const heroTitle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    lineHeight: 1.1,
  };

  const heroIconWrap: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#86efac",
    flexShrink: 0,
  };

  const sectionTitleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  };

  const sectionIconWrap: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#86efac",
    flexShrink: 0,
  };

  const sectionHeading: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 900,
    margin: 0,
  };

  const sectionDescription: React.CSSProperties = {
    margin: "0 0 12px 0",
    fontSize: 14,
    opacity: 0.62,
    lineHeight: 1.4,
  };

  // =====================================================
  // Shared styles: inputs and helper text
  // =====================================================

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "16px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const helperRow: React.CSSProperties = {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  };

  const helperText: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.55,
    lineHeight: 1.4,
  };

  const countPill: React.CSSProperties = {
    padding: "5px 9px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };

  // =====================================================
  // Shared styles: buttons
  // =====================================================

  const languageButtonBase: React.CSSProperties = {
    flex: 1,
    padding: "11px 12px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
  };

  const effortGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    width: "100%",
  };

  const bottomActionGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 6,
  };

  const bottomActionButton: React.CSSProperties = {
    minWidth: 0,
    width: "100%",
    padding: "14px 10px",
    borderRadius: "16px",
    fontWeight: 800,
    fontSize: "clamp(12px, 3.2vw, 15px)",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  // =====================================================
  // Render helpers
  // =====================================================

  const renderSectionHeader = (
    icon: React.ReactNode,
    title: string
  ) => (
    <div style={sectionTitleRow}>
      <span style={sectionIconWrap}>{icon}</span>
      <h3 style={sectionHeading}>{title}</h3>
    </div>
  );

  const renderLanguageToggle = () => (
    <section
      style={{
        padding: 16,
        borderRadius: 20,
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.16)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900 }}>
        🌐 {t("plan.language", "Language")}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {(["en", "es"] as LanguageCode[]).map((option) => {
          const active = language === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleLanguageChange(option)}
              style={{
                ...languageButtonBase,
                border: active
                  ? "1px solid rgba(34,197,94,0.45)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: active
                  ? "rgba(34,197,94,0.14)"
                  : "rgba(255,255,255,0.04)",
                color: active ? "#86efac" : "white",
              }}
            >
              {getLanguageLabel(option)}
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderEffortButton = (day: string, opt: { key: Effort; label: string }) => {
    const active = (daySettings[day] ?? "normal") === opt.key;

    return (
      <button
        key={opt.key}
        type="button"
        onClick={() =>
          setDaySettings((prev) => ({
            ...prev,
            [day]: opt.key,
          }))
        }
        style={{
          minWidth: 0,
          width: "100%",
          padding: "10px 6px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: active ? "#22c55e" : "rgba(255,255,255,0.1)",
          background: active
            ? "rgba(34,197,94,0.1)"
            : "rgba(255,255,255,0.03)",
          color: active ? "#22c55e" : "rgba(255,255,255,0.6)",
          fontWeight: 800,
          fontSize: "clamp(10px, 2.8vw, 13px)",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {opt.label}
      </button>
    );
  };

  // =====================================================
  // Render: main
  // =====================================================

  return (
    <div style={pageWrap}>
      <div style={contentWrap}>
        <Card
          title={
            <span style={heroTitle}>
              <span style={heroIconWrap}>
                <Sparkles size={19} />
              </span>
              <span>{t("plan.title")}</span>
            </span>
          }
          subtitle={t("plan.subtitle")}
        >
          <div style={cardContentGrid}>
            {/* =====================================================
                Section: language toggle
            ===================================================== */}

            {renderLanguageToggle()}

            {/* =====================================================
                Section: what's in your kitchen
            ===================================================== */}

            <section style={sectionCard}>
              {renderSectionHeader(
                <Refrigerator size={17} />,
                t("plan.kitchenTitle")
              )}

              <p style={sectionDescription}>{t("plan.kitchenSubtitle")}</p>

              {!!pantryItems.length && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {pantryItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => removePantryItem(item)}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 12px",
                        background: "rgba(34,197,94,0.14)",
                        color: "#86efac",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                      title="Remove item"
                    >
                      {item} ×
                    </button>
                  ))}
                </div>
              )}

              <textarea
                placeholder={t("plan.kitchenPlaceholder")}
                value={pantryText}
                onChange={(e) => setPantryText(e.target.value)}
                onBlur={commitPantry}
                style={{ ...inputBase, minHeight: 96 }}
              />

              <div style={helperRow}>
                <span style={helperText}>{t("plan.separateItems")}</span>
                <span style={countPill}>
                  {pantryItems.length} {t("plan.itemCount")}
                </span>
              </div>
            </section>

            {/* =====================================================
                Section: dietary preferences
            ===================================================== */}

            <section style={sectionCard}>
              {renderSectionHeader(
                <Leaf size={17} />,
                t("plan.dietaryPreferences")
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "8px 0 2px 0",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>
                    {t("plan.vegetarianMode")}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.58 }}>
                    {t("plan.vegetarianSubtitle")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updatePrefs({ vegetarian: !prefs.vegetarian })}
                  style={{
                    width: 54,
                    height: 30,
                    borderRadius: 20,
                    background: prefs.vegetarian
                      ? "#22c55e"
                      : "rgba(255,255,255,0.1)",
                    position: "relative",
                    cursor: "pointer",
                    border: "none",
                    transition: "background 0.3s ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 4,
                      left: prefs.vegetarian ? 28 : 4,
                      transition:
                        "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                  />
                </button>
              </div>
            </section>

            {/* =====================================================
                Section: allergies and restrictions
            ===================================================== */}

            <section style={sectionCard}>
              {renderSectionHeader(
                <AlertCircle size={17} />,
                t("plan.allergies")
              )}

              <p style={sectionDescription}>{t("plan.allergiesSubtitle")}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALLERGENS.map((key) => {
                  const active = activeAllergens.includes(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAllergen(key)}
                      style={{
                        border: "1px solid",
                        borderColor: active
                          ? "rgba(239,68,68,0.4)"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: 999,
                        padding: "10px 14px",
                        background: active
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(255,255,255,0.04)",
                        color: active ? "#fca5a5" : "rgba(255,255,255,0.8)",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {allergenLabels[key] ?? key}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* =====================================================
                Section: dietary notes
            ===================================================== */}

            <section style={sectionCard}>
              {renderSectionHeader(
                <Info size={17} />,
                t("plan.dietaryNotes")
              )}

              <p style={sectionDescription}>
                {t("plan.dietaryNotesSubtitle")}
              </p>

              <textarea
                placeholder={t("plan.dietaryNotesPlaceholder")}
                value={prefs.dietaryNotes || ""}
                onChange={(e) => updatePrefs({ dietaryNotes: e.target.value })}
                style={{ ...inputBase, minHeight: 110 }}
              />
            </section>

            {/* =====================================================
                Section: set your week
            ===================================================== */}

            <section style={sectionCard}>
              {renderSectionHeader(
                <Utensils size={17} />,
                t("plan.setYourWeek")
              )}

              <p
                style={{
                  ...sectionDescription,
                  marginBottom: 14,
                }}
              >
                {t("plan.setYourWeekSubtitle")}
              </p>

              <div style={{ display: "grid", gap: 18 }}>
                {days.map((day) => (
                  <div
                    key={day}
                    style={{
                      paddingBottom: 16,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 13,
                        color: "#22c55e",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      {(dayLabels[day] || day).toUpperCase()}
                    </div>

                    <div style={effortGrid}>
                      {effortOptions.map((opt) => renderEffortButton(day, opt))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* =====================================================
    Section: Smart Week
===================================================== */}

            <button
              type="button"
              onClick={handleSmartWeek}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: 20,
                border: "1px solid rgba(34,197,94,0.28)",
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(20,184,166,0.10))",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
                boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: "rgba(34,197,94,0.16)",
                  border: "1px solid rgba(34,197,94,0.28)",
                  color: "#86efac",
                }}
              >
                <Sparkles size={21} />
              </span>

              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "grid",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 950,
                  }}
                >
                  {t("smartWeek.title")}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {t("smartWeek.subtitle")}
                </span>

                <span
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#86efac",
                    textTransform: "uppercase",
                    letterSpacing: 0.45,
                  }}
                >
                  Simple Dinners Plus
                </span>
              </span>

              <ChevronRight
                size={20}
                style={{
                  color: "#86efac",
                  flexShrink: 0,
                }}
              />
            </button>

            {/* =====================================================
    Section: bottom actions
===================================================== */}

            <div style={bottomActionGrid}>
              <Button
                onClick={handleGenerate}
                style={{
                  ...bottomActionButton,
                  padding: "14px 8px",
                }}
              >
                ✨ {t("plan.generatePlan")}
              </Button>

              <button
                type="button"
                onClick={handleBackToWeek}
                style={{
                  ...bottomActionButton,
                  background: "transparent",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span>{t("plan.backToWeek")}</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}