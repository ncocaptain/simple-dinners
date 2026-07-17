import {
  Cloud,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { getStoredLanguage } from "../i18n";
import {
  resolveShoppingListConflict,
  useShoppingListConflict,
} from "./shoppingListConflictState";
import "./ShoppingListConflictModal.css";

export function ShoppingListConflictModal() {
  const conflict = useShoppingListConflict();

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
        aria-labelledby="sd-conflict-title"
      >
        <div className="sd-conflict-heading">
          <span className="sd-conflict-plus">
            Plus
          </span>

          <h2 id="sd-conflict-title">
            {isSpanish
              ? "Elige qué lista conservar"
              : "Choose which list to keep"}
          </h2>

          <p>
            {isSpanish
              ? "Simple Dinners encontró una lista diferente en este dispositivo y en tu hogar."
              : "Simple Dinners found a different list on this device and in your household."}
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
                  ? "Lista del hogar"
                  : "Household list"}
              </strong>

              <p>
                {conflict.cloudItemCount}{" "}
                {isSpanish ? "artículos" : "items"}
                {conflict.cloudCheckedCount > 0
                  ? ` · ${conflict.cloudCheckedCount} ${isSpanish
                    ? "marcados"
                    : "checked"
                  }`
                  : ""}
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
                  ? "Lista de este dispositivo"
                  : "This device’s list"}
              </strong>

              <p>
                {conflict.localItemCount}{" "}
                {isSpanish ? "artículos" : "items"}
                {conflict.localCheckedCount > 0
                  ? ` · ${conflict.localCheckedCount} ${isSpanish
                    ? "marcados"
                    : "checked"
                  }`
                  : ""}
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
              ? "Guardaremos una copia de seguridad antes de reemplazar cualquier lista."
              : "We’ll save a backup before either list is replaced."}
          </span>
        </div>

        <div className="sd-conflict-actions">
          <button
            type="button"
            className="sd-conflict-primary"
            onClick={() =>
              resolveShoppingListConflict("cloud")
            }
          >
            {isSpanish
              ? "Usar la lista del hogar"
              : "Use Household List"}
          </button>

          <button
            type="button"
            className="sd-conflict-secondary"
            onClick={() =>
              resolveShoppingListConflict("local")
            }
          >
            {isSpanish
              ? "Conservar la lista de este dispositivo"
              : "Keep This Device’s List"}
          </button>
        </div>
      </section>
    </div>
  );
}