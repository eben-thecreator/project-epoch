import { cn } from "../../lib/utils";
import type { AdminTab } from "./types";

interface SidebarNavItem {
  tab: AdminTab;
  label: string;
  countKey?: "assets" | "trash";
}

const navItems: SidebarNavItem[] = [
  { tab: "dashboard", label: "Dashboard" },
  { tab: "assets", label: "Assets", countKey: "assets" },
  { tab: "media", label: "Media" },
  { tab: "trash", label: "Trash", countKey: "trash" },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts?: { assets: number; trash: number };
}

export const AdminSidebar = ({ activeTab, onTabChange, counts }: AdminSidebarProps): JSX.Element => {
  return (
    <aside className="hidden lg:flex w-56 bg-white h-full flex-col border-r border-hairline">
      <nav aria-label="Admin sections" className="flex-1 py-5 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const count = item.countKey ? counts?.[item.countKey] : undefined;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange(item.tab)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 px-6 py-[7px] text-left f-body-2",
                "transition-colors duration-200 ease-house",
                isActive ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] transition-opacity duration-200 ease-house",
                  isActive ? "bg-brand opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{item.label}</span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={cn(
                    "ml-auto text-[12px] tabular-nums transition-colors duration-200 ease-house",
                    isActive ? "text-brand" : "text-ink/35 group-hover:text-ink"
                  )}
                >
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-hairline">
        <p className="text-[12px] text-ink/40 leading-none">SCHIS Admin v1.0</p>
      </div>
    </aside>
  );
};

interface AdminTabBarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts?: { assets: number; trash: number };
  className?: string;
}

export const AdminTabBar = ({ activeTab, onTabChange, counts, className }: AdminTabBarProps): JSX.Element => {
  return (
    <div
      className={cn(
        "lg:hidden sticky top-0 z-30 bg-white border-b border-hairline overflow-x-auto scrollbar-hide",
        className
      )}
    >
      <nav aria-label="Admin sections" className="flex min-w-max px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const count = item.countKey ? counts?.[item.countKey] : undefined;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange(item.tab)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative px-3.5 py-3.5 f-caption whitespace-nowrap transition-colors duration-200 ease-house",
                isActive ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
              )}
            >
              <span className="inline-flex items-baseline gap-1.5">
                {item.label}
                {typeof count === "number" && count > 0 && (
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      isActive ? "text-brand" : "text-ink/35"
                    )}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 bottom-0 h-[2px] transition-opacity duration-200 ease-house",
                  isActive ? "bg-brand opacity-100" : "opacity-0"
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
