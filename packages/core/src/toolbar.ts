import type { ToolbarItem } from "./types";

/**
 * Return a new array of toolbar items with the given ids removed.
 */
export function filterToolbarItems(
  items: ToolbarItem[],
  exclude?: string[],
): ToolbarItem[] {
  if (!exclude || exclude.length === 0) return items;
  const excluded = new Set(exclude);
  return items.filter((item) => !excluded.has(item.id));
}
