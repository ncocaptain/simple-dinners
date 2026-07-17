import {
  CalendarDays,
  Cloud,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import {
  resolveWeeklyPlanConflict,
  useWeeklyPlanConflict,
} from "./weeklyPlanConflictState";

/*
 * Reuse the polished conflict-modal design already
 * created for the shopping list.
 */
import "./ShoppingListConflictModal.css";

type SummaryProps = {
  dinnerCount: number;
  specialNightCount: number;
  lockedDayCount: number;
  isSpanish: boolean;
};

function Summary({
  dinnerCount,
  specialNightCount,
  lockedDayCount,
  isSpanish,
}: SummaryProps) {
  return (
    <p>
      {dinnerCount}{" "}
      {isSpanish ? "cenas" : "dinners"}
      {" · "}
      {specialNightCount}{" "}
      {isSpanish
        ? "noches especiales"
        : "special nights"}
      {" · "}
      {lockedDayCount}{" "}
      {isSpanish
        ? "días bloqueados"
        : "locked days"}
    </p>
  );
}

export function WeeklyPlanConflictModal() {
  const conflict = useWeeklyPlanConflict();

  if (!conflict.isOpen) {
    return null;
  }

  const isSpanish =
    getStoredLanguage() === "es";

  return (
    <div
      className="sd-conflict-backdrop"
      role="presentation"
    >
      <section
        className="sd-conflict-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-plan-conflict-title"
      >
        <div className="sd-conflict-heading">
          <span className="sd-conflict-plus">
            Plus
          </span>

          <h2 id="sd-plan-conflict-title">
            {isSpanish
              ? "Elige qué plan conservar"
              : "Choose which plan to keep"}
          </h2>

          <p>
            {isSpanish
              ? "Simple Dinners encontró un plan semanal diferente en este dispositivo y en tu hogar."
              : "Simple Dinners found a different weekly plan on this device and in your household."}
          </p>
        </div>

        <div className="sd-conflict-options">
          <article className="sd-conflict-option">
            <div className="sd-conflict-option-icon">
              <Cloud size={21} />
            </div>

            <div>
              <strong>
                {isSpanish
                  ? "Plan del hogar"
                  : "Household plan"}
              </strong>

              <Summary
                {...conflict.cloud}
                isSpanish={isSpanish}
              />
            </div>
          </article>

          <article className="sd-conflict-option">
            <div className="sd-conflict-option-icon">
              <Smartphone size={21} />
            </div>

            <div>
              <strong>
                {isSpanish
                  ? "Plan de este dispositivo"
                  : "This device’s plan"}
              </strong>

              <Summary
                {...conflict.local}
                isSpanish={isSpanish}
              />
            </div>
          </article>
        </div>

        <div className="sd-conflict-backup-note">
          <ShieldCheck
            size={18}
            aria-hidden="true"
          />

          <span>
            {isSpanish
              ? "Guardaremos una copia de seguridad antes de reemplazar cualquier plan."
              : "We’ll save a backup before either plan is replaced."}
          </span>
        </div>

        <div className="sd-conflict-actions">
          <button
            type="button"
            className="sd-conflict-primary"
            onClick={() =>
              resolveWeeklyPlanConflict("cloud")
            }
          >
            <CalendarDays
              size={17}
              aria-hidden="true"
            />

            {isSpanish
              ? "Usar el plan del hogar"
              : "Use Household Plan"}
          </button>

          <button
            type="button"
            className="sd-conflict-secondary"
            onClick={() =>
              resolveWeeklyPlanConflict("local")
            }
          >
            {isSpanish
              ? "Conservar el plan de este dispositivo"
              : "Keep This Device’s Plan"}
          </button>
        </div>
      </section>
    </div>
  );
}