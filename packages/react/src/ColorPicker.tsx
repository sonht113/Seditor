import { useCallback, useEffect, useRef, useState } from "react";
import { getPendingTextColor, getPendingBgColor } from "seditor-core";
import { useEditor } from "./Editor";

const TEXT_COLORS: Array<{ label: string; value: string | null }> = [
  { label: "Default", value: null },
  { label: "Dark gray", value: "#434343" },
  { label: "Gray", value: "#666666" },
  { label: "Light gray", value: "#999999" },
  { label: "Red", value: "#e03e3e" },
  { label: "Dark red", value: "#a56548" },
  { label: "Coral", value: "#e06666" },
  { label: "Orange", value: "#f08c00" },
  { label: "Dark orange", value: "#b45f06" },
  { label: "Amber", value: "#bf9000" },
  { label: "Yellow", value: "#dfab01" },
  { label: "Olive", value: "#808000" },
  { label: "Green", value: "#4f9b45" },
  { label: "Dark green", value: "#38761d" },
  { label: "Teal", value: "#008080" },
  { label: "Cyan", value: "#009eaf" },
  { label: "Blue", value: "#2383e2" },
  { label: "Dark blue", value: "#1155cc" },
  { label: "Indigo", value: "#3b5998" },
  { label: "Purple", value: "#9065b0" },
  { label: "Dark purple", value: "#674ea7" },
  { label: "Magenta", value: "#a4396b" },
  { label: "Pink", value: "#d6459d" },
  { label: "Brown", value: "#8b4513" },
];

const BG_COLORS: Array<{ label: string; value: string | null }> = [
  { label: "None", value: null },
  { label: "Light gray", value: "#e3e2e0" },
  { label: "Gray", value: "#cccccc" },
  { label: "Dark gray", value: "#999999" },
  { label: "Light red", value: "#fde0e0" },
  { label: "Red", value: "#f7b3b3" },
  { label: "Salmon", value: "#fad7a0" },
  { label: "Light orange", value: "#fdebd0" },
  { label: "Orange", value: "#fbd9a8" },
  { label: "Light amber", value: "#fce8b3" },
  { label: "Light yellow", value: "#fcf2c7" },
  { label: "Yellow", value: "#fff2a8" },
  { label: "Light olive", value: "#e8e8c0" },
  { label: "Light green", value: "#dbeddb" },
  { label: "Green", value: "#b6d7a8" },
  { label: "Light teal", value: "#c0e0e0" },
  { label: "Light cyan", value: "#c0e8ec" },
  { label: "Light blue", value: "#d4e4fa" },
  { label: "Blue", value: "#a8c8f0" },
  { label: "Light indigo", value: "#c8d2e8" },
  { label: "Light purple", value: "#e5dcef" },
  { label: "Purple", value: "#c9b8e0" },
  { label: "Light pink", value: "#f8dcec" },
  { label: "Pink", value: "#f0b8d8" },
  { label: "Light brown", value: "#e0d0c0" },
];

interface ColorPickerProps {
  kind: "text" | "background";
}

export function ColorPicker({ kind }: ColorPickerProps) {
  const instance = useEditor();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const colors = kind === "text" ? TEXT_COLORS : BG_COLORS;
  const label = kind === "text" ? "Text color" : "Background color";
  const apply =
    kind === "text"
      ? instance.commands.setTextColor
      : instance.commands.setTextBackgroundColor;
  const clear =
    kind === "text"
      ? instance.commands.clearTextColor
      : instance.commands.clearTextBackgroundColor;
  const getPending = kind === "text" ? getPendingTextColor : getPendingBgColor;

  useEffect(() => {
    const unregister = instance.editor.registerUpdateListener(() => {
      force((n) => n + 1);
    });
    return unregister;
  }, [instance]);

  const handleSelect = useCallback(
    (value: string | null) => {
      if (value === null) {
        clear();
      } else {
        apply(value);
      }
      force((n) => n + 1);
      setOpen(false);
    },
    [apply, clear],
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

  const activeColor = getPending();

  return (
    <div className="se-color-picker" ref={ref}>
      <button
        type="button"
        title={label}
        aria-label={label}
        className={`se-toolbar-button se-color-picker-button${activeColor ? " se-color-picker-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {kind === "text" ? (
          <svg viewBox="0 0 18 18" width="18" height="18">
            <text
              x="9"
              y="12"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="currentColor"
            >
              A
            </text>
            <rect
              x="2"
              y="14"
              width="14"
              height="2.5"
              rx="1"
              fill={activeColor ?? "currentColor"}
              opacity={activeColor ? 1 : 0.3}
            />
          </svg>
        ) : (
          <svg viewBox="0 0 18 18" width="18" height="18">
            <rect
              x="2"
              y="3"
              width="14"
              height="11"
              rx="2"
              fill={activeColor ?? "none"}
              stroke="currentColor"
              strokeWidth="1"
              opacity={activeColor ? 1 : 0.4}
            />
            <text
              x="9"
              y="11"
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill={activeColor ? "#fff" : "currentColor"}
            >
              ab
            </text>
          </svg>
        )}
      </button>
      {open && (
        <div className="se-color-picker-dropdown" role="menu">
          {colors.map((c) => (
            <button
              key={c.label}
              type="button"
              className="se-color-picker-swatch"
              title={c.label}
              aria-label={c.label}
              onClick={() => handleSelect(c.value)}
            >
              <span
                className="se-color-picker-color"
                style={
                  c.value === null
                    ? {
                        backgroundImage:
                          "linear-gradient(135deg, transparent 43%, #e03e3e 43%, #e03e3e 57%, transparent 57%)",
                      }
                    : { backgroundColor: c.value }
                }
              />
              <span className="se-color-picker-label">{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
