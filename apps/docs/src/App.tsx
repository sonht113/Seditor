import { Routes, Route } from "react-router-dom";
import { Logo } from "./components/Logo";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { QuickStart } from "./pages/QuickStart";
import { CoreAPI } from "./pages/CoreAPI";
import { ReactAPI } from "./pages/ReactAPI";
import { VueAPI } from "./pages/VueAPI";
import { SvelteAPI } from "./pages/SvelteAPI";
import { Theming } from "./pages/Theming";
import { ImagePlugin } from "./pages/ImagePlugin";
import { Demo } from "./pages/Demo";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--docs-bg)]">
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--docs-border)] bg-[var(--docs-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <a href="/Seditor" className="flex items-center gap-2.5 no-underline">
            <Logo size={32} withWordmark />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/sonht113/Seditor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--docs-border)] px-3 py-1.5 text-sm font-medium text-[var(--docs-text-muted)] hover:bg-[var(--docs-surface)] hover:text-[var(--docs-text)] transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-[var(--docs-text-muted)]"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quick-start" element={<QuickStart />} />
              <Route path="/core-api" element={<CoreAPI />} />
              <Route path="/react-api" element={<ReactAPI />} />
              <Route path="/vue-api" element={<VueAPI />} />
              <Route path="/svelte-api" element={<SvelteAPI />} />
              <Route path="/theming" element={<Theming />} />
              <Route path="/image-plugin" element={<ImagePlugin />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
