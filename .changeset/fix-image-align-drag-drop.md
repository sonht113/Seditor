---
"seditor-plugin-image": patch
"seditor-react": patch
---

Fix image alignment and drag-and-drop in the docs demo

- Remove nested `editor.update()` calls inside command listeners in `imagePlugin.ts` (`INSERT_IMAGE_COMMAND`, `SE_SET_ALIGN_COMMAND`, `DROP_COMMAND`). Lexical command listeners already run inside an editor update, so the nested updates caused align and drag-and-drop to fail.
- Prevent toolbar buttons from stealing focus on mousedown in `Toolbar.tsx`, keeping image node-selection and text range selection alive while toolbar buttons are clicked.
- Add DOM tests for image align after blur and native dragstart/drop interactions.
