import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  type LexicalEditor,
} from "lexical";

/**
 * Serialize the editor's content to an HTML string.
 * Flushes pending updates before reading.
 */
export function getHTML(editor: LexicalEditor): string {
  return editor.read(() => $generateHtmlFromNodes(editor));
}

/**
 * Serialize the editor's content to a JSON-serializable EditorState object.
 * Flushes pending updates before reading.
 */
export function getJSON(editor: LexicalEditor): unknown {
  let json: unknown;
  editor.read(() => {
    json = editor.getEditorState().toJSON();
  });
  return json;
}

/**
 * Replace the editor's content from an HTML string.
 *
 * **Note:** This calls `editor.update()` which is asynchronous (batched).
 * The content may not be committed immediately after this function returns.
 * Call `editor.read(() => {})` to flush pending updates if you need to
 * read the content synchronously.
 *
 * **SSR note:** Uses `DOMParser` (browser API). Not available in Node.js.
 */
export function setHTML(editor: LexicalEditor, html: string): void {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    const root = $getRoot();
    root.clear();
    $insertNodes(nodes);
  });
}

/**
 * Replace the editor's content from a JSON-serializable EditorState object
 * (as produced by `getJSON`) or a JSON string.
 *
 * Unlike `setHTML`, this does not rely on `DOMParser`, so it is safe to call
 * in non-browser environments (Node.js / SSR).
 *
 * **Note:** Replaces the entire EditorState, which resets the undo/redo
 * history. Call `editor.read(() => {})` afterwards to flush pending updates
 * if you need to read the content synchronously.
 */
export function setJSON(editor: LexicalEditor, json: unknown): void {
  const serialized =
    typeof json === "string" ? json : JSON.stringify(json);
  const editorState = editor.parseEditorState(serialized);
  editor.setEditorState(editorState);
}
