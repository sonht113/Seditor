import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { CodeBlock } from "../components/CodeBlock";

const FEATURES = [
  {
    icon: "✨",
    title: "Beautiful by default",
    desc: "Notion-like typography and a clean toolbar out of the box.",
  },
  {
    icon: "🪶",
    title: "Lightweight",
    desc: "Core is ~35 KB gzip (excluding the Lexical peer).",
  },
  {
    icon: "🔌",
    title: "Framework-agnostic core",
    desc: "seditor-core has zero React dependency. Build your own bindings.",
  },
  {
    icon: "⚙️",
    title: "Config as data",
    desc: "Toolbar and config are plain objects, not JSX children.",
  },
  {
    icon: "🎨",
    title: "CSS variables theming",
    desc: "Dark mode is a variable override, not a class swap.",
  },
  {
    icon: "📄",
    title: "100% MIT",
    desc: "No premium-gated features. Fully open source.",
  },
];

const PACKAGES = [
  {
    name: "seditor-core",
    desc: "Framework-agnostic core (Lexical wrapper + commands)",
    size: "~35 KB",
  },
  {
    name: "seditor-react",
    desc: "React bindings: <Editor>, <Toolbar>, useEditor()",
    size: "~5 KB",
  },
  {
    name: "seditor-theme",
    desc: "Default Notion-like theme (CSS variables + dark mode)",
    size: "~2 KB",
  },
  {
    name: "seditor-plugin-image",
    desc: "Image plugin: upload, resize, drag-and-drop, alignment",
    size: "~4 KB",
  },
];

const QUICK_CODE = `import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

export function App() {
  return (
    <Editor config={{ html: "<p>Hello <b>Seditor</b></p>" }}>
      <Toolbar />
    </Editor>
  );
}`;

export function Home() {
  return (
    <div className="docs-prose">
      <section className="text-center py-12">
        <div className="flex justify-center mb-6">
          <Logo size={80} />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">Seditor</h1>
        <p className="text-xl text-[var(--docs-text-muted)] max-w-2xl mx-auto mb-8">
          A beautiful, lightweight, framework-agnostic rich text editor built on{" "}
          <a href="https://lexical.dev" target="_blank" rel="noreferrer">
            Lexical
          </a>
          . 100% MIT.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/quick-start"
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/sonht113/Seditor"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--docs-border)] px-6 py-2.5 text-sm font-semibold text-[var(--docs-text)] hover:bg-[var(--docs-surface)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="py-8">
        <h2>Why Seditor?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--docs-border)] p-5 hover:border-brand-300 transition-colors"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-[var(--docs-text)] mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--docs-text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <h2>Quick start</h2>
        <CodeBlock code={QUICK_CODE} lang="tsx" filename="App.tsx" />
        <p>
          <Link to="/demo" className="text-brand-500 font-medium">
            Try the live demo →
          </Link>
        </p>
      </section>

      <section className="py-8">
        <h2>Packages</h2>
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Description</th>
              <th>Size (gzip)</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGES.map((p) => (
              <tr key={p.name}>
                <td>
                  <code>{p.name}</code>
                </td>
                <td>{p.desc}</td>
                <td>{p.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
