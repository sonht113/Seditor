import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type LexicalEditor,
} from "lexical";

export function updateInlineStyle(
  editor: LexicalEditor,
  property: string,
  value: string | null,
): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const nodes = selection.extract();
    for (const node of nodes) {
      if (!$isTextNode(node)) continue;
      const writable = node.getWritable();
      const current = writable.__style || "";
      const updated = mergeStyle(current, property, value);
      writable.__style = updated;
    }
  });
}

export function mergeStyle(
  style: string,
  property: string,
  value: string | null,
): string {
  const entries = style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const idx = s.indexOf(":");
      return [s.slice(0, idx).trim(), s.slice(idx + 1).trim()];
    });
  const filtered = entries.filter(([key]) => key !== property);
  if (value !== null) {
    filtered.push([property, value]);
  }
  return filtered.map(([k, v]) => `${k}: ${v}`).join("; ");
}
