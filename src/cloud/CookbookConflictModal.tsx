import {
  BookOpen,
  Cloud,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import {
  resolveCookbookConflict,
  useCookbookConflict,
} from "./cookbookConflictState";

/*
 * Reuse the existing polished conflict-modal
 * layout and styling.
 */
import "./ShoppingListConflictModal.css";

type SummaryProps = {
  recipeCount: number;
  isSpanish: boolean;
};

function Summary({
  recipeCount,
  isSpanish,
}: SummaryProps) {
  return (
    <p>
      {recipeCount}{" "}
      {isSpanish
        ? recipeCount === 1
          ? "receta"
          : "recetas"
        : recipeCount === 1
          ? "recipe"
          : "recipes"}
    </p>
  );
}

export function CookbookConflictModal() {
  const conflict = useCookbookConflict();

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
        aria-labelledby="sd-cookbook-conflict-title"
      >
        <div className="sd-conflict-heading">
          <span className="sd-conflict-plus">
            Plus
          </span>

          <h2 id="sd-cookbook-conflict-title">
            {isSpanish
              ? "Elige qué recetario conservar"
              : "Choose which cookbook to keep"}
          </h2>

          <p>
            {isSpanish
              ? "Simple Dinners encontró diferentes recetas guardadas en este dispositivo y en tu hogar."
              : "Simple Dinners found different saved recipes on this device and in your household."}
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
                  ? "Recetario del hogar"
                  : "Household cookbook"}
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
                  ? "Recetario de este dispositivo"
                  : "This device’s cookbook"}
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
              ? "Guardaremos una copia de seguridad antes de reemplazar cualquier recetario."
              : "We’ll save a backup before either cookbook is replaced."}
          </span>
        </div>

        <div className="sd-conflict-actions">
          <button
            type="button"
            className="sd-conflict-primary"
            onClick={() =>
              resolveCookbookConflict(
                "cloud",
              )
            }
          >
            <BookOpen
              size={17}
              aria-hidden="true"
            />

            {isSpanish
              ? "Usar el recetario del hogar"
              : "Use Household Cookbook"}
          </button>

          <button
            type="button"
            className="sd-conflict-secondary"
            onClick={() =>
              resolveCookbookConflict(
                "local",
              )
            }
          >
            {isSpanish
              ? "Conservar el recetario de este dispositivo"
              : "Keep This Device’s Cookbook"}
          </button>
        </div>
      </section>
    </div>
  );
}