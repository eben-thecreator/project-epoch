import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RollingBanner } from "./RollingBanner";

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Map", path: "/case-studies/museums" },
    { name: "Catalogue", path: "/case-studies" },
    { name: "Reconstruction", path: "/reconstruction" },
    { name: "Exhibition", path: "/exhibition" },
    { name: "Gallery", path: "/gallery" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  /** Scroll listener to apply white background on scroll */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    // Run once on mount
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    setIsMenuDropdownOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";
  const showWhiteText = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-transparent"
          }`}
        style={{ height: "48px" }}
      >
        {/* Left column(s) — Logo only */}
        <div className="col-span-1 md:col-span-4 flex items-center">
          <Link to="/" aria-label="Home" className="flex items-center gap-3 shrink-0">
            <span className={`font-black text-xl tracking-tighter transition-colors duration-300 ${showWhiteText ? "text-white" : "text-black"
              }`}>
              SCHIS
            </span>
            <span className={`text-[9px] uppercase tracking-widest font-medium hidden lg:inline-block transition-colors duration-300 ${showWhiteText ? "text-white/80" : "text-black/60"
              }`}>
              Spatial Cultural Heritage Information System
            </span>
          </Link>
        </div>

        {/* Right column(s) — Nav and Hamburger */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 md:col-span-8 md:col-start-5 items-center w-full">
          {/* Sub-col 1: Empty */}
          <div></div>

          {/* Sub-col 2: Navigation Links */}
          <nav className="flex items-center gap-6 whitespace-nowrap">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] tracking-widest uppercase font-bold text-black ${isActive(item.path) ? "underline" : "hover:underline"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Sub-col 3: Hamburger */}
          <div className="relative flex justify-end">
            <button
              onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
              className="relative p-1 -mr-1 text-black hover:text-black/70 transition-colors flex items-center justify-center focus:outline-none"
              aria-label="Open menu dropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {isMenuDropdownOpen && (
              <div className="absolute right-0 mt-8 w-32 bg-white py-1">
                {[
                  { label: "Research", to: "/research" },
                  { label: "Blog", to: "/blog" },
                  { label: "About", to: "/about" },
                  { label: "Contact", to: "/contact" },
                ].map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black hover:underline"
                    onClick={() => setIsMenuDropdownOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="md:hidden relative w-6 h-5 flex flex-col justify-between z-50 focus:outline-none ml-auto"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className={`h-[2px] w-full transition-transform duration-300 ${showWhiteText ? "bg-white" : "bg-black"} ${isMenuOpen ? "translate-y-[9px] rotate-45" : ""}`} />
          <span className={`h-[2px] w-full transition-opacity duration-300 ${showWhiteText ? "bg-white" : "bg-black"} ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`h-[2px] w-full transition-transform duration-300 ${showWhiteText ? "bg-white" : "bg-black"} ${isMenuOpen ? "-translate-y-[9px] -rotate-45" : ""}`} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-x-0 z-40 bg-white border-b border-gray-200 transition-transform duration-300 ${isMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        style={{ top: "72px" }}
      >
        <nav className="flex flex-col px-6 py-6 gap-5">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-xs font-bold uppercase tracking-widest text-black ${isActive(item.path) ? "underline" : "hover:underline"
                }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-[1px] bg-gray-100 my-1" />
          {[
            { label: "Research", to: "/research" },
            { label: "Blog", to: "/blog" },
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-bold uppercase tracking-widest text-black hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Rolling banner — bottom of viewport on all pages */}
      <RollingBanner />
    </>
  );
};
