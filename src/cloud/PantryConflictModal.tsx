import {
  Cloud,
  PackageOpen,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import {
  resolvePantryConflict,
  usePantryConflict,
} from "./pantryConflictState";
import "./ShoppingListConflictModal.css";

export function PantryConflictModal() {
  const conflict = usePantryConflict();

  if (!conflict.isOpen) {
    return null;
  }

  const isSpanish =
    getStoredLanguage() === "es";

  const itemLabel = (
    count: number,
  ) =>
    isSpanish
      ? count === 1
        ? "artículo"
        : "artículos"
      : count === 1
        ? "item"
        : "items";

  return (
    <div
      className="sd-conflict-backdrop"
      role="presentation"
    >
      <section
        className="sd-conflict-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-pantry-conflict-title"
      >
        <div className="sd-conflict-heading">
          <span className="sd-conflict-plus">
            Plus
          </span>

          <h2 id="sd-pantry-conflict-title">
            {isSpanish
              ? "Elige qué despensa conservar"
              : "Choose which pantry to keep"}
          </h2>

          <p>
            {isSpanish
              ? "Simple Dinners encontró diferentes despensas en este dispositivo y en tu hogar."
              : "Simple Dinners found different pantry data on this device and in your household."}
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
                  ? "Despensa del hogar"
                  : "Household pantry"}
              </strong>
              <p>
                {conflict.cloud.itemCount}{" "}
                {itemLabel(conflict.cloud.itemCount)}
              </p>
            </div>
          </article>

          <article className="sd-conflict-option">
            <div className="sd-conflict-option-icon">
              <Smartphone size={21} />
            </div>
            <div>
              <strong>
                {isSpanish
                  ? "Despensa de este dispositivo"
                  : "This device’s pantry"}
              </strong>
              <p>
                {conflict.local.itemCount}{" "}
                {itemLabel(conflict.local.itemCount)}
              </p>
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
              ? "Guardaremos una copia local antes de reemplazar la despensa."
              : "We’ll save a local backup before replacing either pantry."}
          </span>
        </div>

        <div className="sd-conflict-actions">
          <button
            type="button"
            className="sd-conflict-primary"
            onClick={() =>
              resolvePantryConflict("cloud")
            }
          >
            <PackageOpen
              size={17}
              aria-hidden="true"
            />
            {isSpanish
              ? "Usar la despensa del hogar"
              : "Use Household Pantry"}
          </button>

          <button
            type="button"
            className="sd-conflict-secondary"
            onClick={() =>
              resolvePantryConflict("local")
            }
          >
            {isSpanish
              ? "Conservar la despensa de este dispositivo"
              : "Keep This Device’s Pantry"}
          </button>
        </div>
      </section>
    </div>
  );
}
