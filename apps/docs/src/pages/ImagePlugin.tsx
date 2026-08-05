import { CodeBlock } from "../components/CodeBlock";

const BASIC_CODE = `import { Editor, Toolbar } from "seditor-react";
import { createImagePlugin } from "seditor-plugin-image";
import "seditor-theme/index.css";

export function App() {
  return (
    <Editor
      config={{
        placeholder: "Start writing...",
        plugins: [createImagePlugin()],
      }}
    >
      <Toolbar />
    </Editor>
  );
}`;

const UPLOAD_CODE = `import { createImagePlugin } from "seditor-plugin-image";
import type { ImagePluginConfig } from "seditor-plugin-image";

const uploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const { url } = await res.json();
  return url;
};

const plugin = createImagePlugin({ uploadHandler });`;

const DATA_URL_CODE = `const uploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};`;

export function ImagePlugin() {
  return (
    <div className="docs-prose">
      <h1>Image Plugin</h1>
      <p>
        The <code>seditor-plugin-image</code> package adds image support:
        upload via toolbar button, drag-and-drop from desktop, resize via
        corner handles, and alignment (left/center/right).
      </p>

      <h2>Install</h2>
      <CodeBlock code="npm install seditor-plugin-image" lang="bash" filename="terminal" />
      <p>
        Peer dependencies: <code>seditor-core</code>, <code>lexical</code>.
      </p>

      <h2>Basic usage</h2>
      <p>
        Pass the plugin to <code>config.plugins</code>. Without an upload
        handler, images are embedded as data URLs.
      </p>
      <CodeBlock code={BASIC_CODE} lang="tsx" filename="App.tsx" />

      <h2>Upload handler</h2>
      <p>
        Provide an <code>uploadHandler</code> to upload files to your server or
        CDN. It receives a <code>File</code> and must return a URL string.
      </p>
      <CodeBlock code={UPLOAD_CODE} lang="ts" filename="upload.ts" />

      <h3>Data URL fallback</h3>
      <p>
        For demos or local-only usage, convert files to data URLs:
      </p>
      <CodeBlock code={DATA_URL_CODE} lang="ts" filename="data-url.ts" />

      <h2>ImagePluginConfig</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>uploadHandler</code></td>
            <td><code>(file: File) =&gt; Promise&lt;string&gt;</code></td>
            <td>Upload function. If omitted, uses data URL fallback.</td>
          </tr>
        </tbody>
      </table>

      <h2>Features</h2>
      <ul>
        <li><strong>Upload</strong> — click the image button in the toolbar, select a file.</li>
        <li><strong>Drag-and-drop</strong> — drop image files from your desktop onto the editor.</li>
        <li><strong>Resize</strong> — click an image to select it, then drag corner handles.</li>
        <li><strong>Alignment</strong> — with an image selected, use the align buttons (left/center/right).</li>
        <li><strong>Reposition</strong> — drag a selected image to copy it elsewhere in the document.</li>
      </ul>

      <p>
        See the <a href="/Seditor/demo">live demo</a> to try all image features.
      </p>
    </div>
  );
}
