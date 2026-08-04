import type { ThemeConfig } from "./types";

export const defaultTheme: ThemeConfig = {
  paragraph: "se-paragraph",
  heading: {
    h1: "se-h1",
    h2: "se-h2",
    h3: "se-h3",
    h4: "se-h4",
    h5: "se-h5",
    h6: "se-h6",
  },
  quote: "se-quote",
  text: {
    bold: "se-text-bold",
    italic: "se-text-italic",
    underline: "se-text-underline",
    strikethrough: "se-text-strikethrough",
    code: "se-text-code",
  },
  link: "se-link",
  list: {
    ul: "se-bullet-list",
    ol: "se-numbered-list",
    listitem: "se-list-item",
    nested: {
      listitem: "se-nested-list-item",
    },
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeTheme(
  base: ThemeConfig,
  overrides?: Partial<ThemeConfig>,
): ThemeConfig {
  if (!overrides) return base;
  const out: ThemeConfig = { ...base };
  for (const key of Object.keys(overrides)) {
    const ov = (overrides as Record<string, unknown>)[key];
    const bv = (base as Record<string, unknown>)[key];
    if (ov === undefined) continue;
    if (isPlainObject(ov) && isPlainObject(bv)) {
      out[key] = mergeTheme(bv as ThemeConfig, ov as Partial<ThemeConfig>);
    } else {
      out[key] = ov;
    }
  }
  return out;
}
