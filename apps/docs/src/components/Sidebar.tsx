import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Getting Started",
    items: [
      { to: "/", label: "Home" },
      { to: "/quick-start", label: "Quick Start" },
      { to: "/demo", label: "Live Demo" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { to: "/core-api", label: "Core API" },
      { to: "/react-api", label: "React API" },
      { to: "/theming", label: "Theming" },
      { to: "/image-plugin", label: "Image Plugin" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--docs-border)] h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto py-6 px-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--docs-text-muted)]">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 font-medium"
                        : "text-[var(--docs-text-muted)] hover:bg-[var(--docs-surface)] hover:text-[var(--docs-text)]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
