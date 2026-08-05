import { useState, useCallback } from "react";
import { Editor, Toolbar } from "seditor-react";
import {
  createImagePlugin,
  type ImagePluginConfig,
} from "seditor-plugin-image";
import type { SeditorInstance } from "seditor-core";

const INITIAL_HTML =
  '<h1>Welcome to Seditor</h1><p>A beautiful, lightweight rich text editor built on <b>Lexical</b>.</p><h2>Features</h2><ul><li>Bold, italic, underline, strikethrough</li><li>Headings &amp; lists</li><li>Links &amp; undo/redo</li><li>Image upload, resize &amp; drag-and-drop</li><li>Alignment for text &amp; images</li><li>Font size, text &amp; background colors</li></ul><h2>Image demo</h2><p>Click the image below to select it, then drag the corner handles to resize. Drag the image to reposition it (copy). You can also drop image files from your desktop onto the editor. With an image (or text) selected, use the align buttons to set left/center/right alignment.</p><img src="https://picsum.photos/id/237/400/280" alt="Demo image" width="400" height="280"/><p>Try editing this text!</p>';

const demoUploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
  await new Promise((r) => setTimeout(r, 300));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

function OutputPanel({ instance }: { instance: SeditorInstance | null }) {
  const [html, setHtml] = useState("");
  const [json, setJson] = useState("");

  const showHtml = useCallback(() => {
    if (!instance) return;
    setHtml(instance.getHTML());
    setJson("");
  }, [instance]);

  const showJson = useCallback(() => {
    if (!instance) return;
    setJson(JSON.stringify(instance.getJSON(), null, 2));
    setHtml("");
  }, [instance]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex gap-2">
        <button
          onClick={showHtml}
          disabled={!instance}
          className="cursor-pointer rounded-lg border border-[var(--docs-border)] px-3 py-1.5 text-sm font-medium text-[var(--docs-text-muted)] transition-colors hover:bg-[var(--docs-surface)] hover:text-[var(--docs-text)] disabled:opacity-40"
        >
          Get HTML
        </button>
        <button
          onClick={showJson}
          disabled={!instance}
          className="cursor-pointer rounded-lg border border-[var(--docs-border)] px-3 py-1.5 text-sm font-medium text-[var(--docs-text-muted)] transition-colors hover:bg-[var(--docs-surface)] hover:text-[var(--docs-text)] disabled:opacity-40"
        >
          Get JSON
        </button>
      </div>
      {(html || json) && (
        <pre className="overflow-x-auto rounded-xl bg-[var(--docs-code-bg)] p-4 font-mono text-xs text-gray-200">
          <code>{html || json}</code>
        </pre>
      )}
    </div>
  );
}

export function DemoEditor() {
  const [instance, setInstance] = useState<SeditorInstance | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-bg)]">
      <Editor
        config={{
          html: INITIAL_HTML,
          placeholder: "Start writing...",
          plugins: [createImagePlugin({ uploadHandler: demoUploadHandler })],
        }}
        onReady={setInstance}
      >
        <Toolbar />
      </Editor>
      <div className="border-t border-[var(--docs-border)] p-4">
        <OutputPanel instance={instance} />
      </div>
    </div>
  );
}
