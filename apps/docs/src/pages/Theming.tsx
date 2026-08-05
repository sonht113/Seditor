import { CodeBlock } from "../components/CodeBlock";

const OVERRIDE_CODE = `:root {
  --se-color-primary: #ff6b35;
  --se-color-link: #ff6b35;
  --se-font-size: 16px;
}`;

const DARK_CODE = `import "seditor-theme/index.css";
import "seditor-theme/dark.css";

// Toggle via JS:
document.documentElement.setAttribute("data-se-theme", "dark");
// Or back to light:
document.documentElement.setAttribute("data-se-theme", "light");`;

const CSS_VARS = [
  { name: "--se-color-bg", value: "#ffffff", desc: "Editor background" },
  { name: "--se-color-text", value: "#37352f", desc: "Body text color" },
  { name: "--se-color-text-muted", value: "#6b7280", desc: "Muted text" },
  { name: "--se-color-border", value: "#e3e2e0", desc: "Borders" },
  { name: "--se-color-primary", value: "#2383e2", desc: "Primary/brand color" },
  { name: "--se-color-link", value: "#2383e2", desc: "Link color" },
  { name: "--se-color-surface", value: "#f7f6f3", desc: "Toolbar/surface bg" },
  { name: "--se-color-selection", value: "rgba(35,131,226,.18)", desc: "Selection highlight" },
  { name: "--se-font-family", value: "system stack", desc: "Editor font family" },
  { name: "--se-font-size", value: "15px", desc: "Base font size" },
  { name: "--se-line-height", value: "1.6", desc: "Line height" },
  { name: "--se-radius", value: "8px", desc: "Default border radius" },
  { name: "--se-editor-min-height", value: "240px", desc: "Min editor height" },
  { name: "--se-toolbar-button-size", value: "30px", desc: "Toolbar button size" },
];

export function Theming() {
  return (
    <div className="docs-prose">
      <h1>Theming</h1>
      <p>
        The default theme (<code>seditor-theme</code>) uses CSS variables under
        the <code>--se-*</code> namespace. Override them to rebrand the editor
        without touching component code.
      </p>

      <h2>CSS variables</h2>
      <table>
        <thead>
          <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          {CSS_VARS.map((v) => (
            <tr key={v.name}>
              <td><code>{v.name}</code></td>
              <td><code>{v.value}</code></td>
              <td>{v.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Override</h2>
      <p>
        Set variables on <code>:root</code> (or any ancestor of the editor) to
        rebrand. This changes the primary color to orange:
      </p>
      <CodeBlock code={OVERRIDE_CODE} lang="css" filename="theme.css" />

      <h2>Dark mode</h2>
      <p>
        Dark mode ships as <code>seditor-theme/dark.css</code>. It activates
        via <code>prefers-color-scheme</code> automatically, or explicitly via
        the <code>data-se-theme="dark"</code> attribute on{" "}
        <code>&lt;html&gt;</code>.
      </p>
      <CodeBlock code={DARK_CODE} lang="ts" filename="theme-toggle.ts" />

      <h2>Dark mode variables</h2>
      <p>
        The dark theme overrides the color variables above with darker values:
      </p>
      <table>
        <thead>
          <tr><th>Variable</th><th>Light</th><th>Dark</th></tr>
        </thead>
        <tbody>
          <tr><td><code>--se-color-bg</code></td><td><code>#ffffff</code></td><td><code>#2f3437</code></td></tr>
          <tr><td><code>--se-color-text</code></td><td><code>#37352f</code></td><td><code>#d8d8d6</code></td></tr>
          <tr><td><code>--se-color-primary</code></td><td><code>#2383e2</code></td><td><code>#5b9ff5</code></td></tr>
          <tr><td><code>--se-color-surface</code></td><td><code>#f7f6f3</code></td><td><code>#383d3f</code></td></tr>
          <tr><td><code>--se-color-border</code></td><td><code>#e3e2e0</code></td><td><code>#4a4f52</code></td></tr>
        </tbody>
      </table>

      <p>
        Try the dark mode toggle in the top-right corner of this page to see it
        in action.
      </p>
    </div>
  );
}
