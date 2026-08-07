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
      { to: "/vue-api", label: "Vue API" },
      { to: "/svelte-api", label: "Svelte API" },
      { to: "/theming", label: "Theming" },
      { to: "/image-plugin", label: "Image Plugin" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-[var(--docs-border)] py-6 pl-4 pr-2">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--docs-text-muted)]">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-500/10 font-medium text-brand-400"
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
