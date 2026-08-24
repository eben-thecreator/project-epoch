import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { SearchOverlay } from "./SearchOverlay";

/**
 * The site's frame, rebuilt on the Pentagram system:
 * a fixed 60px ground-white bar, wordmark left, flat colour-only
 * navigation right (#767676 at rest, #1A1A1A on hover/current —
 * and the quirk: the current item's hover drops back to gray).
 * Dark tone inverts to white-over-content for immersive screens.
 */

export type HeaderTone = "light" | "dark";

interface NavLinkItem {
  label: string;
  path: string;
}

const primaryNav: NavLinkItem[] = [
  { label: "Catalogue", path: "/case-studies" },
  { label: "Atlas", path: "/map" },
  { label: "Research", path: "/research" },
  { label: "Reconstruction", path: "/reconstruction" },
];

const indexNav: NavLinkItem[] = [
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const mobileNav = [...primaryNav, ...indexNav];

export const Header = ({
  tone = "light",
}: {
  tone?: HeaderTone;
  transparent?: boolean;
}): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Dark-tone pages sit under an immersive surface; settle onto ink after scroll */
  useEffect(() => {
    if (tone !== "dark") {
      setScrolled(false);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 16));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tone]);

  /** Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  /** Close menus on route change */
  useEffect(() => {
    setIsMenuOpen(false);
    setIsIndexOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  /** Close dropdown on outside click */
  useEffect(() => {
    if (!isIndexOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsIndexOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isIndexOpen]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toneIsDark = tone === "dark";
  /*
   * Effective colourway. The mobile sheet and dark-tone pages put the
   * chrome on ink; while the search panel is up everything returns to
   * ground-white so it stays legible against its own overlay.
   */
  const inverted = !isSearchOpen && (isMenuOpen || toneIsDark);

  const surface = isMenuOpen
    ? "bg-black"
    : isSearchOpen
      ? "bg-white"
      : toneIsDark
        ? scrolled
          ? "bg-black/95 backdrop-blur-sm"
          : "bg-transparent"
        : "bg-white";

  /*
   * Nav voice. Rest = gray, hover/current = ink. The current link's
   * hover falls back to gray — the reference site's exact behaviour.
   */
  const navItem = (active: boolean) =>
    cn(
      "transition-colors duration-250 ease-house",
      inverted
        ? active
          ? "text-white hover:text-white/60"
          : "text-white/60 hover:text-white"
        : active
          ? "text-ink hover:text-ink-soft"
          : "text-ink-soft hover:text-ink"
    );

  return (
    <>
      <header
        className={cn(
          "fixed left-0 top-0 w-full z-header transition-colors duration-300 ease-house",
          surface
        )}
        style={{ height: "var(--header-h)" }}
      >
        <div
          className={cn(
            "shell h-full flex items-center justify-between"
          )}
        >
          {/* Wordmark */}
          <Link
            to="/"
            aria-label="Project Work — home"
            className={cn(
              "group relative z-[305] flex items-center gap-2 shrink-0",
              inverted ? "text-white" : "text-ink"
            )}
          >
            {/* Brandmark: a solid block */}
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 bg-current"
            />
            <span className="font-sans font-medium text-[20px] leading-none tracking-[-0.01em]">
              Project Work
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-9 whitespace-nowrap"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={cn(
                  "f-body-1 py-1",
                  navItem(isActive(item.path))
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Search toggle — icon swaps to a close glyph while open */}
            <button
              type="button"
              aria-label={isSearchOpen ? "Close search panel" : "Toggle search panel"}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((p) => !p)}
              className={cn(
                "f-body-1 flex h-5 w-5 items-center justify-center",
                navItem(isSearchOpen)
              )}
            >
              {isSearchOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M14 14l4.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Index — secondary destinations behind a flat toggle */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsIndexOpen((p) => !p)}
                aria-expanded={isIndexOpen}
                aria-label="Site index"
                className={cn(
                  "f-body-1 py-1",
                  navItem(isIndexOpen || indexNav.some((i) => isActive(i.path)))
                )}
              >
                Index
              </button>

              <div
                role="menu"
                className={cn(
                  "absolute right-0 top-full mt-3 w-48 z-[1100] origin-top-right transition-all duration-200 ease-house",
                  "bg-white border border-hairline",
                  isIndexOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                )}
              >
                {indexNav.map(({ label, path }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      role="menuitem"
                      to={path}
                      onClick={() => setIsIndexOpen(false)}
                      className={cn(
                        "group flex items-center gap-2.5 px-4 py-2.5 f-caption",
                        "transition-colors duration-200 ease-house",
                        active ? "text-ink" : "text-ink-soft hover:text-ink"
                      )}
                    >
                      {/* Dot bullet: outlined at rest, fills when live or hovered */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block w-2.5 h-2.5 rounded-full border transition-colors duration-200 ease-house",
                          active
                            ? "border-brand bg-brand"
                            : "border-ink-soft group-hover:border-ink group-hover:bg-ink"
                        )}
                      />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className={cn(
              "md:hidden relative w-10 h-10 -mr-1 flex items-center justify-center transition-colors duration-300 ease-house",
              inverted ? "text-white" : "text-ink"
            )}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="relative block w-5 h-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-[3px] block w-full h-px bg-current transition-transform duration-300 ease-house",
                  isMenuOpen && "top-1/2 -translate-y-1/2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 block w-full h-px bg-current transition-opacity duration-200",
                  isMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 bottom-[3px] block w-full h-px bg-current transition-transform duration-300 ease-house",
                  isMenuOpen && "bottom-auto top-1/2 -translate-y-1/2 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile contents sheet */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[1040] bg-black transition-opacity duration-300 ease-house",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isMenuOpen}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-end px-3 sm:px-4 pb-10 pt-[calc(var(--header-h)+16px)]"
        >
          <div className="space-y-4 overflow-y-auto">
            <button
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className={cn(
                "group flex w-full items-baseline gap-4 py-1 text-left transition-all duration-300 ease-house",
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isMenuOpen ? "80ms" : "0ms" }}
            >
              <span className="f-heading-4 text-white/85">
                Search
              </span>
            </button>
            {mobileNav.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                tabIndex={isMenuOpen ? 0 : -1}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={cn(
                  "group flex items-baseline gap-4 py-1 transition-all duration-300 ease-house",
                  isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: isMenuOpen ? `${120 + i * 40}ms` : "0ms" }}
              >
                {isActive(item.path) && (
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0 self-center" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "f-heading-4 transition-colors duration-200",
                    isActive(item.path) ? "text-white" : "text-white/85"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div
            className={cn(
              "mt-10 pt-5 border-t border-white/15 flex items-center justify-between transition-all duration-300 ease-house",
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: isMenuOpen ? "420ms" : "0ms" }}
          >
            <span className="font-mono text-[9px] tracking-[0.18em] text-white/50" aria-hidden="true">
              07°57′N&nbsp;&nbsp;001°01′W
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] text-white/50">
              © 2026 Project Work
            </span>
          </div>
        </nav>
      </div>

      {/* Search panel */}
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

