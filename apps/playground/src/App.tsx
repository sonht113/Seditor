import { useState, useCallback } from "react";
import { Editor, Toolbar } from "seditor-react";
import {
  createImagePlugin,
  type ImagePluginConfig,
} from "seditor-plugin-image";
import type { SeditorInstance } from "seditor-core";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

const INITIAL_HTML =
  '<h1>Welcome to Seditor</h1><p>A beautiful, lightweight rich text editor built on <b>Lexical</b>.</p><h2>Features</h2><ul><li>Bold, italic, underline, strikethrough</li><li>Headings &amp; lists</li><li>Links &amp; undo/redo</li><li>Image upload, resize &amp; drag-and-drop</li>    <li>Alignment for text &amp; images</li><li>Font size, text &amp; background colors</li></ul><h2>Image demo</h2><p>Click the image below to select it, then drag the corner handles to resize. Drag the image to reposition it (copy). You can also drop image files from your desktop onto the editor. With an image (or text) selected, use the align buttons to set left/center/right alignment.</p><img src="https://picsum.photos/id/237/400/280" alt="Demo image" width="400" height="280"/><p>Try editing this text!</p>';

const demoUploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
  console.info(
    "[playground] uploading file:",
    file.name,
    file.type,
    file.size,
    "bytes",
  );
  await new Promise((r) => setTimeout(r, 300));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.info("[playground] upload resolved (data URL)");
      resolve(reader.result as string);
    };
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
    <div className="output">
      <div className="output-actions">
        <button onClick={showHtml} disabled={!instance}>
          Get HTML
        </button>
        <button onClick={showJson} disabled={!instance}>
          Get JSON
        </button>
      </div>
      {html && (
        <pre>
          <code>{html}</code>
        </pre>
      )}
      {json && (
        <pre>
          <code>{json}</code>
        </pre>
      )}
    </div>
  );
}

function DarkToggle() {
  const [dark, setDark] = useState(false);
  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute(
      "data-se-theme",
      next ? "dark" : "light",
    );
  }, [dark]);
  return (
    <button className="theme-toggle" onClick={toggle}>
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}

export default function App() {
  const [instance, setInstance] = useState<SeditorInstance | null>(null);
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo">S</span>
          <div>
            <h1>Seditor</h1>
            <p>Beautiful, lightweight rich text editor</p>
          </div>
        </div>
        <DarkToggle />
      </header>
      <main className="app-main">
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
        <OutputPanel instance={instance} />
      </main>
    </div>
  );
}
