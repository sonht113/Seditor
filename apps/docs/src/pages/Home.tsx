import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { CodeBlock } from "../components/CodeBlock";

const FEATURES = [
  {
    title: "Beautiful by default",
    desc: "Notion-like typography and a clean toolbar out of the box.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 1l2.5 5.5L18 7l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L10 1z" />
      </svg>
    ),
  },
  {
    title: "Lightweight",
    desc: "Core is ~35 KB gzip (excluding the Lexical peer).",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2v6m0 0a4 4 0 100 8 4 4 0 000-8z" />
        <path d="M10 2l3 3" />
      </svg>
    ),
  },
  {
    title: "Framework-agnostic core",
    desc: "Official React and Vue 3 bindings, or build your own.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="6" height="6" rx="1" />
        <rect x="12" y="2" width="6" height="6" rx="1" />
        <rect x="2" y="12" width="6" height="6" rx="1" />
        <path d="M12 12h6v6h-6z" />
      </svg>
    ),
  },
  {
    title: "Config as data",
    desc: "Toolbar and config are plain objects, not JSX children.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6h12M4 10h12M4 14h8" />
        <circle cx="16" cy="14" r="2" />
      </svg>
    ),
  },
  {
    title: "CSS variables theming",
    desc: "Dark mode is a variable override, not a class swap.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10" cy="10" r="8" />
        <path d="M10 2v16" />
        <path d="M10 2a8 8 0 010 16" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    title: "100% MIT",
    desc: "No premium-gated features. Fully open source.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10l7-7 7 7-7 7-7-7z" />
        <path d="M7 10l3-3 3 3-3 3-3-3z" />
      </svg>
    ),
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
    name: "seditor-vue",
    desc: "Vue 3 bindings: <Editor>, <Toolbar>, useEditor()",
    size: "~6 KB",
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
import "seditor-theme";
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
      <section className="py-12 text-center">
        <div className="mb-6 flex justify-center">
          <Logo size={80} />
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight">Seditor</h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-[var(--docs-text-muted)]">
          A beautiful, lightweight, framework-agnostic rich text editor built on{" "}
          <a href="https://lexical.dev" target="_blank" rel="noreferrer">
            Lexical
          </a>
          . 100% MIT.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/quick-start"
            className="cursor-pointer rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold !text-white transition-colors hover:bg-brand-600"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/sonht113/Seditor"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer rounded-lg border border-[var(--docs-border)] px-6 py-2.5 text-sm font-semibold text-[var(--docs-text)] transition-colors hover:bg-[var(--docs-surface)]"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="py-8">
        <h2>Why Seditor?</h2>
        <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--docs-border)] p-5 transition-colors hover:border-brand-500/50"
            >
              <div className="mb-3 text-brand-400">{f.icon}</div>
              <h3 className="mb-1 font-semibold text-[var(--docs-text)]">
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
          <Link to="/demo" className="font-medium text-brand-400">
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
