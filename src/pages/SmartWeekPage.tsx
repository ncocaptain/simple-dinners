import SafeRecipeImage from "../components/SafeRecipeImage";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChefHat,
  Lock,
  RefreshCw,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import {
  interpretSmartWeekRequest,
} from "../core/smartWeekRequest";

import Card from "../components/Card";
import { days } from "../core/data";
import {
  buildSmartWeekDraft,
  replaceSmartWeekDraftDay,
  verifySmartWeekDraftRequest,
} from "../core/smartWeek";

import type {
  SmartWeekRequestVerificationIssue,
} from "../core/smartWeek";
import type {
  Effort,
  Meal,
  PantryItem,
  PlannedDay,
  Preferences,
  SmartWeekDraft,
  SmartWeekDraftDay,
  SmartWeekMealSource,
  SmartWeekReasonCode,
} from "../core/types";
import {
  getStoredLanguage,
  t,
} from "../i18n";
import { getLocalizedMeal } from "../core/localizedMeal";

// =====================================================
// SmartWeekPage: types
// =====================================================

type SmartWeekPageProps = {
  meals: Record<string, PlannedDay>;
  cookbook: Meal[];
  pantry: PantryItem[];
  daySettings: Record<string, Effort>;
  lockedDays: Record<string, boolean>;
  prefs: Preferences;
  onUseDraft: (draft: SmartWeekDraft) => void;
};

// =====================================================
// SmartWeekPage: helpers
// =====================================================

function normalizePhotoUrl(url?: string) {
  if (!url) return "";

  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    const extension =
      Capacitor.getPlatform() === "android"
        ? ".webp"
        : ".jpg";

    return trimmed.replace(
      /\.(png|jpg|jpeg|webp)$/i,
      extension,
    );
  }

  return trimmed;
}

function getTranslatedDay(day: string) {
  return t(
    `week.days.${day.toLowerCase()}`,
    day,
  );
}

function getSourceLabel(
  source: SmartWeekMealSource,
) {
  if (source === "cookbook") {
    return t("smartWeek.sources.cookbook");
  }

  if (source === "built-in") {
    return t("smartWeek.sources.builtIn");
  }

  if (source === "special") {
    return t("smartWeek.sources.special");
  }

  return t("smartWeek.sources.unknown");
}

function getReasonText(
  reason?: SmartWeekReasonCode,
) {
  switch (reason) {
    case "locked-day":
      return t("smartWeek.reasons.lockedDay");

    case "existing-leftovers":
      return t(
        "smartWeek.reasons.existingLeftovers",
      );

    case "existing-freezer":
      return t(
        "smartWeek.reasons.existingFreezer",
      );

    case "effort-match":
      return t(
        "smartWeek.reasons.effortMatch",
      );

    case "pantry-match":
      return t(
        "smartWeek.reasons.pantryMatch",
      );

    case "cookbook-pick":
      return t(
        "smartWeek.reasons.cookbookPick",
      );

    case "variety":
      return t("smartWeek.reasons.variety");

    case "takeout-night":
      return t(
        "smartWeek.reasons.takeoutNight",
      );

    case "request-match":
      return t(
        "smartWeek.reasons.requestMatch",
      );

    default:
      return "";
  }
}

function getEffortLabel(
  effort?: Effort,
) {
  if (!effort) return "";

  return t(
    `smartWeek.effort.${effort}`,
    effort,
  );
}

function getDraftDayTitle(
  draftDay: SmartWeekDraftDay,
) {
  const plannedDay = draftDay.plannedDay;

  if (plannedDay.mode === "leftovers") {
    return t("week.leftoversNight");
  }

  if (plannedDay.mode === "freezer") {
    return t("week.freezerNight");
  }

  return (
    plannedDay.meal?.name?.trim() ||
    t("smartWeek.noMeal")
  );
}

function getDraftDayPhoto(
  draftDay: SmartWeekDraftDay,
) {
  const plannedDay = draftDay.plannedDay;

  if (plannedDay.mode === "leftovers") {
    return normalizePhotoUrl(
      "/images/leftovers.jpg",
    );
  }

  if (plannedDay.mode === "freezer") {
    return normalizePhotoUrl(
      "/images/freezer-night.jpg",
    );
  }

  return normalizePhotoUrl(
    plannedDay.meal?.photoUrl,
  );
}

function getVerificationIssueText(
  issue: SmartWeekRequestVerificationIssue,
) {
  if (
    issue.kind ===
    "excluded-keyword"
  ) {
    return `${t(
      "smartWeek.verificationExcluded",
    )}: ${issue.keyword}`;
  }

  if (
    issue.kind ===
    "mostly-quick"
  ) {
    return `${t(
      "smartWeek.verificationMostlyQuick",
    )} — ${t(
      "smartWeek.verificationRequested",
    )}: ${issue.expected}; ${t(
      "smartWeek.verificationDraft",
    )}: ${issue.actual}`;
  }

  const label =
    issue.keyword === "vegetarian"
      ? t(
        "smartWeek.verificationVegetarianCount",
      )
      : `${t(
        "smartWeek.verificationProteinCount",
      )}: ${issue.keyword}`;

  return `${label} — ${t(
    "smartWeek.verificationRequested",
  )}: ${issue.expected}; ${t(
    "smartWeek.verificationDraft",
  )}: ${issue.actual}`;
}

// =====================================================
// SmartWeekPage: component
// =====================================================

export default function SmartWeekPage({
  meals,
  cookbook,
  pantry,
  daySettings,
  lockedDays,
  prefs,
  onUseDraft,
}: SmartWeekPageProps) {
  const navigate = useNavigate();
  const language = getStoredLanguage();

  const [request, setRequest] =
    useState("");

  const [draft, setDraft] =
    useState<SmartWeekDraft | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    requestWarning,
    setRequestWarning,
  ] = useState("");

  const [replacingDay, setReplacingDay] =
    useState<string | null>(null);

  const [keptDays, setKeptDays] =
    useState<Record<string, boolean>>({});

  const allDaysLocked = days.every(
    (day) => !!lockedDays[day],
  );

  const requestVerification =
    draft
      ? verifySmartWeekDraftRequest(
        draft,
      )
      : null;

  const requestNeedsAttention =
    requestVerification?.status ===
    "partial";

  const contextItems = [
    {
      icon: <BookOpen size={16} />,
      label: t(
        "smartWeek.cookbookContext",
      ),
    },
    {
      icon: <ChefHat size={16} />,
      label: t(
        "smartWeek.builtInContext",
      ),
    },
    {
      icon: <Utensils size={16} />,
      label: t(
        "smartWeek.effortContext",
      ),
    },
    {
      icon: <Refrigerator size={16} />,
      label: t(
        "smartWeek.pantryContext",
      ),
    },
    {
      icon: <ShieldCheck size={16} />,
      label: t(
        "smartWeek.preferenceContext",
      ),
    },
    {
      icon: <Lock size={16} />,
      label: t(
        "smartWeek.currentWeekContext",
      ),
    },
  ];

  const createDraft = async () => {
    if (allDaysLocked) {
      setError(
        t("smartWeek.allDaysLocked"),
      );

      return;
    }

    setError("");
    setRequestWarning("");
    setIsGenerating(true);

    try {
      const trimmedRequest =
        request.trim();

      let requestConstraints =
        draft?.request === trimmedRequest
          ? draft.constraints
          : undefined;

      /*
       * The optional sentence is the only information
       * sent to the backend. Recipe selection still
       * happens locally using validated constraints.
       */
      if (
        trimmedRequest &&
        !requestConstraints
      ) {
        try {
          requestConstraints =
            await interpretSmartWeekRequest(
              trimmedRequest,
              language,
            ) ?? undefined;
        } catch (interpretationError) {
          console.warn(
            "Smart Week request could not be interpreted:",
            interpretationError,
          );

          /*
           * AI downtime must not prevent Smart Week from
           * creating a safe deterministic draft.
           */
          setRequestWarning(
            t(
              "smartWeek.requestUnavailable",
            ),
          );
        }
      }

      const nextDraft =
        buildSmartWeekDraft({
          currentMeals: meals,
          cookbook,
          pantry,
          daySettings,
          lockedDays,
          preferences: prefs,
          request: trimmedRequest,
          requestConstraints,
        });

      if (!draft) {
        setKeptDays({});
        setDraft(nextDraft);
        return;
      }

      const mergedDraft: SmartWeekDraft = {
        ...nextDraft,
        days: {
          ...nextDraft.days,
        },
      };

      for (const day of days) {
        if (
          keptDays[day] &&
          draft.days[day]
        ) {
          mergedDraft.days[day] =
            draft.days[day];
        }
      }

      setDraft(mergedDraft);
    } catch (draftError) {
      console.error(
        "Smart Week draft failed:",
        draftError,
      );

      setError(
        t("smartWeek.draftError"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleKeepDay = (
    day: (typeof days)[number],
  ) => {
    const draftDay = draft?.days[day];

    if (!draftDay || draftDay.preserved) {
      return;
    }

    setKeptDays((current) => ({
      ...current,
      [day]: !current[day],
    }));
  };

  const handleReplaceDay = (
    day: (typeof days)[number],
  ) => {
    if (!draft) return;

    const currentDraftDay = draft.days[day];

    if (
      !currentDraftDay ||
      currentDraftDay.preserved ||
      lockedDays[day] ||
      keptDays[day] ||
      replacingDay
    ) {
      return;
    }

    setError("");
    setReplacingDay(day);

    window.setTimeout(() => {
      try {
        const nextDraft =
          replaceSmartWeekDraftDay({
            draft,
            day,
            cookbook,
            pantry,
            daySettings,
            lockedDays,
            preferences: prefs,
          });

        setDraft(nextDraft);
      } catch (replacementError) {
        console.error(
          "Smart Week dinner replacement failed:",
          replacementError,
        );

        setError(
          t("smartWeek.draftError"),
        );
      } finally {
        setReplacingDay(null);
      }
    }, 80);
  };

  const handleUseDraft = () => {
    if (!draft) return;

    onUseDraft(draft);
    navigate("/week");
  };

  const handleCancel = () => {
    navigate("/plan");
  };

  // =====================================================
  // Shared styles
  // =====================================================

  const pageWrap: CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const contentWrap: CSSProperties = {
    maxWidth: 550,
    width: "100%",
    padding: "0 20px 140px",
    display: "grid",
    gap: 20,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    minHeight: 112,
    resize: "vertical",
    boxSizing: "border-box",
    padding: 16,
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: 16,
    fontFamily: "inherit",
    outline: "none",
  };

  const primaryButton: CSSProperties = {
    width: "100%",
    borderRadius: 16,
    border:
      "1px solid rgba(34,197,94,0.28)",
    background:
      "rgba(34,197,94,0.16)",
    color: "#86efac",
    padding: "15px 16px",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const secondaryButton: CSSProperties = {
    width: "100%",
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.82)",
    padding: "14px 16px",
    fontSize: 14,
    fontWeight: 850,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  // =====================================================
  // Render: setup
  // =====================================================

  if (!draft) {
    return (
      <div style={pageWrap}>
        <div style={contentWrap}>
          <header
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                width: "fit-content",
                border: "none",
                background: "transparent",
                color:
                  "rgba(255,255,255,0.68)",
                padding: 0,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ArrowLeft size={16} />
              {t("smartWeek.backToPlan")}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(34,197,94,0.14)",
                  border:
                    "1px solid rgba(34,197,94,0.24)",
                  color: "#86efac",
                }}
              >
                <Sparkles size={21} />
              </span>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 30,
                    fontWeight: 1000,
                  }}
                >
                  {t("smartWeek.title")}
                </h1>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#86efac",
                    textTransform:
                      "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Simple Dinners Plus
                </div>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                opacity: 0.68,
                lineHeight: 1.5,
                fontSize: 15,
              }}
            >
              {t("smartWeek.subtitle")}
            </p>
          </header>

          <Card
            title={t(
              "smartWeek.contextTitle",
            )}
          >
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {contextItems.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 14,
                      background:
                        "rgba(255,255,255,0.035)",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        color: "#86efac",
                        display: "inline-flex",
                      }}
                    >
                      {item.icon}
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 750,
                        opacity: 0.82,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>

          <Card>
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: 10,
                }}
              >
                <label
                  htmlFor="smart-week-request"
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  {t(
                    "smartWeek.requestLabel",
                  )}
                </label>

                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: 999,
                    background:
                      "rgba(255,255,255,0.05)",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    fontSize: 11,
                    fontWeight: 850,
                    opacity: 0.68,
                  }}
                >
                  {t(
                    "smartWeek.requestOptional",
                  )}
                </span>
              </div>

              <textarea
                id="smart-week-request"
                value={request}
                onChange={(event) =>
                  setRequest(
                    event.target.value,
                  )
                }
                placeholder={t(
                  "smartWeek.requestPlaceholder",
                )}
                style={inputStyle}
              />

              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.45,
                  opacity: 0.55,
                }}
              >
                {t(
                  "smartWeek.requestHelper",
                )}
              </div>
            </div>
          </Card>

          {error && (
            <div
              style={{
                padding: "13px 15px",
                borderRadius: 15,
                background:
                  "rgba(239,68,68,0.11)",
                border:
                  "1px solid rgba(239,68,68,0.26)",
                color: "#fca5a5",
                fontSize: 14,
                fontWeight: 750,
                lineHeight: 1.45,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={createDraft}
            disabled={isGenerating}
            style={{
              ...primaryButton,
              opacity: isGenerating
                ? 0.66
                : 1,
              cursor: isGenerating
                ? "wait"
                : "pointer",
            }}
          >
            {isGenerating ? (
              <RefreshCw size={18} />
            ) : (
              <Sparkles size={18} />
            )}

            {isGenerating
              ? t(
                "smartWeek.creatingDraft",
              )
              : t(
                "smartWeek.createDraft",
              )}
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // Render: draft review
  // =====================================================

  return (
    <div style={pageWrap}>
      <div style={contentWrap}>
        <header
          style={{
            display: "grid",
            gap: 8,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 1000,
            }}
          >
            {t("smartWeek.reviewTitle")}
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.66,
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            {t(
              "smartWeek.reviewSubtitle",
            )}
          </p>

          {requestVerification &&
            requestVerification.status !==
            "none" && (
              <div
                style={{
                  padding: "11px 13px",
                  borderRadius: 14,
                  background:
                    requestNeedsAttention
                      ? "rgba(234,179,8,0.10)"
                      : "rgba(34,197,94,0.10)",
                  border:
                    requestNeedsAttention
                      ? "1px solid rgba(234,179,8,0.22)"
                      : "1px solid rgba(34,197,94,0.20)",
                  color:
                    requestNeedsAttention
                      ? "#fde68a"
                      : "#86efac",
                  fontSize: 12,
                  fontWeight: 800,
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                {requestNeedsAttention ? (
                  <ShieldCheck
                    size={15}
                    style={{
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Check
                    size={15}
                    style={{
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                )}

                <div
                  style={{
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div>
                    {requestVerification.status ===
                      "met"
                      ? t(
                        "smartWeek.requestMet",
                      )
                      : requestVerification.status ===
                        "considered"
                        ? t(
                          "smartWeek.requestConsidered",
                        )
                        : t(
                          "smartWeek.requestNeedsAttention",
                        )}
                  </div>

                  {requestVerification.issues
                    .length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gap: 4,
                          fontWeight: 700,
                          opacity: 0.9,
                        }}
                      >
                        {requestVerification.issues.map(
                          (issue, index) => (
                            <div key={index}>
                              •{" "}
                              {getVerificationIssueText(
                                issue,
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}

          {requestWarning && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background:
                  "rgba(234,179,8,0.10)",
                border:
                  "1px solid rgba(234,179,8,0.22)",
                color: "#fde68a",
                fontSize: 12,
                fontWeight: 750,
                lineHeight: 1.45,
              }}
            >
              {requestWarning}
            </div>
          )}
        </header>

        <div
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          {days.map((day) => {
            const draftDay =
              draft.days[day];

            if (!draftDay) return null;

            const localizedMeal =
              draftDay.plannedDay.mode ===
                "planned"
                ? getLocalizedMeal(
                  draftDay.plannedDay.meal,
                  language,
                )
                : null;

            const displayDraftDay = {
              ...draftDay,
              plannedDay: {
                ...draftDay.plannedDay,
                meal:
                  localizedMeal ??
                  draftDay.plannedDay.meal,
              },
            };

            const title =
              getDraftDayTitle(
                displayDraftDay,
              );

            const photoUrl =
              getDraftDayPhoto(
                displayDraftDay,
              );

            const effort =
              displayDraftDay.plannedDay
                .mode === "planned"
                ? getEffortLabel(
                  displayDraftDay
                    .plannedDay.meal
                    ?.effort,
                )
                : "";

            const reason = getReasonText(
              displayDraftDay.reason,
            );

            return (
              <Card
                key={day}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: 22,
                  border:
                    displayDraftDay.preserved
                      ? "1px solid rgba(96,165,250,0.22)"
                      : undefined,
                }}
              >
                <div
                  id={`smart-week-day-${day}`}
                  style={{
                    padding: 18,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 950,
                        fontSize: 16,
                        textTransform:
                          "uppercase",
                        letterSpacing: 0.35,
                      }}
                    >
                      {getTranslatedDay(day)}
                    </div>

                    {displayDraftDay.preserved && (
                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: 5,
                          padding: "6px 9px",
                          borderRadius: 999,
                          background:
                            "rgba(96,165,250,0.12)",
                          border:
                            "1px solid rgba(96,165,250,0.22)",
                          color: "#93c5fd",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        <Lock size={12} />
                        {displayDraftDay.reason ===
                          "locked-day"
                          ? t(
                            "smartWeek.lockedPreserved",
                          )
                          : t(
                            "smartWeek.preservedNight",
                          )}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <SafeRecipeImage
                      src={photoUrl}
                      alt={title}
                      style={{
                        width: 78,
                        height: 78,
                        objectFit: "cover",
                        borderRadius: 17,
                        border:
                          "1px solid rgba(255,255,255,0.1)",
                        background:
                          "rgba(255,255,255,0.04)",
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 18,
                          lineHeight: 1.22,
                        }}
                      >
                        {title}
                      </div>

                      <div
                        style={{
                          marginTop: 7,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 7,
                        }}
                      >
                        <span
                          style={{
                            padding:
                              "5px 8px",
                            borderRadius: 999,
                            background:
                              "rgba(34,197,94,0.1)",
                            border:
                              "1px solid rgba(34,197,94,0.18)",
                            color:
                              "#86efac",
                            fontSize: 11,
                            fontWeight: 850,
                          }}
                        >
                          {getSourceLabel(
                            displayDraftDay.source,
                          )}
                        </span>

                        {effort && (
                          <span
                            style={{
                              padding:
                                "5px 8px",
                              borderRadius:
                                999,
                              background:
                                "rgba(255,255,255,0.05)",
                              border:
                                "1px solid rgba(255,255,255,0.08)",
                              color:
                                "rgba(255,255,255,0.72)",
                              fontSize:
                                11,
                              fontWeight:
                                850,
                            }}
                          >
                            {effort}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {reason && (
                    <div
                      style={{
                        padding: "11px 13px",
                        borderRadius: 14,
                        background:
                          "rgba(20,184,166,0.09)",
                        border:
                          "1px solid rgba(20,184,166,0.16)",
                        color: "#ccfbf1",
                        fontSize: 13,
                        lineHeight: 1.45,
                      }}
                    >
                      {reason}
                    </div>
                  )}

                  {!displayDraftDay.preserved && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleKeepDay(day)}
                        disabled={replacingDay !== null}
                        style={{
                          minWidth: 0,
                          width: "100%",
                          padding: "11px 9px",
                          borderRadius: 14,
                          border: keptDays[day]
                            ? "1px solid rgba(34,197,94,0.32)"
                            : "1px solid rgba(255,255,255,0.10)",
                          background: keptDays[day]
                            ? "rgba(34,197,94,0.14)"
                            : "rgba(255,255,255,0.045)",
                          color: keptDays[day]
                            ? "#86efac"
                            : "rgba(255,255,255,0.82)",
                          fontSize: 12,
                          lineHeight: 1.2,
                          fontWeight: 850,
                          cursor:
                            replacingDay !== null
                              ? "wait"
                              : "pointer",
                          opacity:
                            replacingDay !== null
                              ? 0.6
                              : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Check size={14} />

                        {keptDays[day]
                          ? t("smartWeek.keptDinner")
                          : t("smartWeek.keepDinner")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReplaceDay(day)}
                        disabled={
                          replacingDay !== null ||
                          !!keptDays[day]
                        }
                        style={{
                          minWidth: 0,
                          width: "100%",
                          padding: "11px 9px",
                          borderRadius: 14,
                          border:
                            "1px solid rgba(255,255,255,0.10)",
                          background:
                            "rgba(255,255,255,0.045)",
                          color:
                            replacingDay === day
                              ? "#86efac"
                              : "rgba(255,255,255,0.82)",
                          fontSize: 12,
                          lineHeight: 1.2,
                          fontWeight: 850,
                          cursor:
                            replacingDay !== null ||
                              keptDays[day]
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            keptDays[day] ||
                              (replacingDay !== null &&
                                replacingDay !== day)
                              ? 0.5
                              : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <RefreshCw size={14} />

                        {replacingDay === day
                          ? t("smartWeek.replacingDinner")
                          : t("smartWeek.replaceDinner")}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {requestWarning && (
          <div
            style={{
              padding: "13px 15px",
              borderRadius: 15,
              background:
                "rgba(234,179,8,0.10)",
              border:
                "1px solid rgba(234,179,8,0.24)",
              color: "#fde68a",
              fontSize: 14,
              fontWeight: 750,
              lineHeight: 1.45,
            }}
          >
            {requestWarning}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "13px 15px",
              borderRadius: 15,
              background:
                "rgba(239,68,68,0.11)",
              border:
                "1px solid rgba(239,68,68,0.26)",
              color: "#fca5a5",
              fontSize: 14,
              fontWeight: 750,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={handleUseDraft}
            style={primaryButton}
          >
            <Check size={18} />
            {t("smartWeek.useThisWeek")}
          </button>

          <button
            type="button"
            onClick={createDraft}
            disabled={isGenerating}
            style={{
              ...secondaryButton,
              opacity: isGenerating
                ? 0.66
                : 1,
            }}
          >
            <RefreshCw size={17} />

            {isGenerating
              ? t(
                "smartWeek.creatingDraft",
              )
              : t(
                "smartWeek.regenerateDraft",
              )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={secondaryButton}
          >
            <ArrowLeft size={17} />
            {t("smartWeek.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}