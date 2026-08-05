import { useState, useCallback } from "react";

export function DarkToggle() {
  const [dark, setDark] = useState(false);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.setAttribute(
      "data-se-theme",
      next ? "dark" : "light",
    );
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg border border-[var(--docs-border)] px-3 py-1.5 text-sm font-medium text-[var(--docs-text-muted)] hover:bg-[var(--docs-surface)] transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀" : "☾"} <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}
