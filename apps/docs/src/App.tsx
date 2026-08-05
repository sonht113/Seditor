import { Routes, Route } from "react-router-dom";
import { Logo } from "./components/Logo";
import { Sidebar } from "./components/Sidebar";
import { DarkToggle } from "./components/DarkToggle";
import { Home } from "./pages/Home";
import { QuickStart } from "./pages/QuickStart";
import { CoreAPI } from "./pages/CoreAPI";
import { ReactAPI } from "./pages/ReactAPI";
import { Theming } from "./pages/Theming";
import { ImagePlugin } from "./pages/ImagePlugin";
import { Demo } from "./pages/Demo";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--docs-bg)]">
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--docs-border)] bg-[var(--docs-bg)]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <a href="/Seditor/" className="flex items-center gap-2.5 no-underline">
          <Logo size={32} withWordmark />
        </a>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/sonht113/Seditor"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--docs-border)] px-3 py-1.5 text-sm font-medium text-[var(--docs-text-muted)] hover:bg-[var(--docs-surface)] transition-colors"
          >
            GitHub
          </a>
          <DarkToggle />
        </div>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 sm:px-10 py-8 max-w-5xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quick-start" element={<QuickStart />} />
            <Route path="/core-api" element={<CoreAPI />} />
            <Route path="/react-api" element={<ReactAPI />} />
            <Route path="/theming" element={<Theming />} />
            <Route path="/image-plugin" element={<ImagePlugin />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
