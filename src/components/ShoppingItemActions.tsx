import { useEffect, useId, useRef, useState } from "react";
import { t } from "../i18n";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

export default function ShoppingItemActions({ name, onEdit, onDelete }: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const skipReturn = useRef(false);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const returnTarget = trigger.current;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      if (!skipReturn.current && returnTarget?.isConnected) returnTarget.focus();
    };
  }, [open]);
  return <>
    <button
      ref={trigger}
      type="button"
      aria-label={`${t("shopping.moreActionsFor")} ${name}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={event => { event.stopPropagation(); skipReturn.current = false; setOpen(true); }}
      onTouchStart={event => event.stopPropagation()}
      onTouchEnd={event => event.stopPropagation()}
      style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "inherit", display: "grid", placeItems: "center", padding: 0 }}
    ><MoreHorizontal size={20} /></button>
    {open && createPortal(
      <div
        onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) setOpen(false); }}
        onTouchStart={event => event.stopPropagation()}
        onTouchEnd={event => event.stopPropagation()}
        onKeyDown={event => {
          event.stopPropagation();
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
          if (event.key === "Tab") {
            const buttons = panel.current?.querySelectorAll<HTMLButtonElement>("button");
            if (!buttons?.length) return;
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }}
        style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}
      >
        <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}
          style={{ width: "100%", maxWidth: 360, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", background: "#101722", color: "white", padding: 16, boxSizing: "border-box" }}>
          <div id={titleId} style={{ fontWeight: 800, overflowWrap: "anywhere", marginBottom: 12 }}>{t("shopping.itemActionsFor")} {name}</div>
          <button type="button" aria-label={`${t("common.edit")} ${name}`} onClick={event => { event.stopPropagation(); skipReturn.current = true; setOpen(false); onEdit(); }}
            style={{ width: "100%", minHeight: 44, padding: 10, display: "flex", alignItems: "center", gap: 10, background: "transparent", color: "inherit", border: 0, textAlign: "left" }}><Pencil size={18} />{t("common.edit")}</button>
          <button type="button" aria-label={`${t("common.delete")} ${name}`} onClick={event => { event.stopPropagation(); skipReturn.current = true; setOpen(false); onDelete(); }}
            style={{ width: "100%", minHeight: 44, padding: 10, display: "flex", alignItems: "center", gap: 10, background: "transparent", color: "#fca5a5", border: 0, textAlign: "left" }}><Trash2 size={18} />{t("common.delete")}</button>
          <button type="button" aria-label={t("shopping.closeItemActions")} onClick={event => { event.stopPropagation(); setOpen(false); }}
            style={{ width: "100%", minHeight: 44, marginTop: 8, padding: 10, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.06)", color: "inherit", border: "1px solid rgba(255,255,255,0.1)" }}><X size={18} />{t("common.done")}</button>
        </div>
      </div>, document.body,
    )}
  </>;
}
