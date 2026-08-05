import { useCallback, useEffect, useRef, useState } from "react";
import { getPendingFontSize } from "seditor-core";
import { useEditor } from "./Editor";

const FONT_SIZES: Array<{ label: string; value: string | null }> = [
  { label: "Default", value: null },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "13", value: "13px" },
  { label: "14", value: "14px" },
  { label: "15", value: "15px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "40", value: "40px" },
  { label: "48", value: "48px" },
  { label: "56", value: "56px" },
  { label: "64", value: "64px" },
];

export function FontSizePicker() {
  const instance = useEditor();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unregister = instance.editor.registerUpdateListener(() => {
      force((n) => n + 1);
    });
    return unregister;
  }, [instance]);

  const handleSelect = useCallback(
    (value: string | null) => {
      if (value === null) {
        instance.commands.clearFontSize();
      } else {
        instance.commands.setFontSize(value);
      }
      force((n) => n + 1);
      setOpen(false);
    },
    [instance],
  );

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const pending = getPendingFontSize();
  const activeSize = pending ?? "";

  return (
    <div className="se-fontsize-picker" ref={ref}>
      <button
        type="button"
        title="Font size"
        aria-label="Font size"
        className={`se-toolbar-button se-fontsize-picker-button${activeSize ? " se-fontsize-picker-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 18 18" width="18" height="18">
          <text
            x="5"
            y="13"
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="currentColor"
          >
            A
          </text>
          <text
            x="13"
            y="13"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="currentColor"
          >
            A
          </text>
        </svg>
      </button>
      {open && (
        <div className="se-fontsize-picker-dropdown" role="menu">
          {FONT_SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              className="se-fontsize-picker-option"
              title={s.label}
              aria-label={s.label}
              onClick={() => handleSelect(s.value)}
            >
              <span
                className="se-fontsize-picker-sample"
                style={{ fontSize: s.value ?? undefined }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
