import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: "Catalogue", path: "/case-studies" },
    { name: "Map", path: "/map" },
    { name: "Reconstruction", path: "/reconstruction" },
    { name: "Gallery", path: "/gallery" },
  ];

  const secondaryNav = [
    { label: "Research", to: "/research" },
    { label: "Blog", to: "/blog" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Admin Panel", to: "/admin/media" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

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

  /** Close dropdown on outside click */
  useEffect(() => {
    if (!isMenuDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuDropdownOpen]);

  return (
    <>
      <header
        className="fixed left-0 top-0 w-full z-[1050] bg-[#E4002B] transition-all duration-300"
        style={{ height: "64px" }}
      >
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" aria-label="Home" className="flex items-center gap-3 shrink-0 group">
            {/* Dot-grid spatial mark */}
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* 2×2 dot grid — animates on hover via CSS group classes */}
                <rect x="0" y="0" width="9" height="9" fill="white" className="transition-all duration-300 group-hover:translate-x-[13px] group-hover:translate-y-0 group-hover:opacity-0" style={{ transformOrigin: "4.5px 4.5px" }} />
                <rect x="13" y="0" width="9" height="9" fill="white" className="transition-all duration-300 group-hover:opacity-0" style={{ transformOrigin: "17.5px 4.5px" }} />
                <rect x="0" y="13" width="9" height="9" fill="white" className="transition-all duration-300 group-hover:opacity-0" style={{ transformOrigin: "4.5px 17.5px" }} />
                <rect x="13" y="13" width="9" height="9" fill="white" className="transition-all duration-300 group-hover:translate-x-[-13px] group-hover:opacity-0" style={{ transformOrigin: "17.5px 17.5px" }} />
                {/* X cross — fades in on hover */}
                <line x1="1" y1="1" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="square" className="transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <line x1="21" y1="1" x2="1" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="square" className="transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </svg>
            </div>

            {/* Thin vertical divider */}
            <div className="hidden sm:block w-[1px] h-8 bg-white/30 shrink-0" />

            {/* Wordmark */}
            <div className="hidden sm:flex flex-col leading-none gap-[4px]">
              <span className="font-black text-[16px] text-white tracking-[0.18em] uppercase leading-none">
                SCHIS
              </span>
              <span className="text-[7px] uppercase font-semibold tracking-[0.22em] text-white/55 leading-none">
                Spatial Cultural Heritage Information System
              </span>
            </div>
          </Link>

          {/* Desktop Nav + Hamburger */}
          <div className="hidden md:flex items-center gap-8">
            {/* Primary Nav */}
            <nav className="flex items-center gap-6 whitespace-nowrap">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-[12px] uppercase font-bold text-white py-1 group"
                >
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {item.name}
                  </span>
                  <span
                    className={`absolute left-0 -bottom-[2px] h-[2px] transition-all duration-300 ${isActive(item.path)
                        ? "bg-white w-full"
                        : "bg-black w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="w-[1px] h-5 bg-white/30" />

            {/* Hamburger / More */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMenuDropdownOpen((prev) => !prev)}
                className="relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] text-white bg-white/10 hover:bg-black focus:outline-none transition-colors duration-300"
                aria-label="More menu"
              >
                <span
                  className={`block w-4 h-[2px] bg-white transition-all duration-300 ${isMenuDropdownOpen ? "translate-y-[7px] rotate-45" : ""
                    }`}
                />
                <span
                  className={`block w-4 h-[2px] bg-white transition-all duration-300 ${isMenuDropdownOpen ? "opacity-0" : "opacity-100"
                    }`}
                />
                <span
                  className={`block w-4 h-[2px] bg-white transition-all duration-300 ${isMenuDropdownOpen ? "-translate-y-[7px] -rotate-45" : ""
                    }`}
                />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-full mt-1 w-44 bg-[#060606] border border-white/10 z-[1001] transition-all duration-200 origin-top-right ${isMenuDropdownOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                  }`}
              >
                {secondaryNav.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block px-5 py-3 text-[10px] font-bold uppercase text-white/80 hover:text-white hover:bg-[#E4002B] transition-colors duration-200"
                    onClick={() => setIsMenuDropdownOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] z-50 focus:outline-none bg-white/10 hover:bg-black transition-colors duration-300"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={`block w-5 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
            />
            <span
              className={`block w-5 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`block w-5 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[1001] bg-[#E4002B] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <nav className="flex flex-col justify-center items-start h-full px-8 gap-6">
          {navigation.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-2xl font-black uppercase text-white tracking-wide transition-all duration-300 hover:text-black ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              style={{ transitionDelay: isMenuOpen ? `${80 + i * 50}ms` : "0ms" }}
            >
              {item.name}
            </Link>
          ))}

          <div
            className={`w-12 h-[2px] bg-white/30 my-2 transition-all duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            style={{ transitionDelay: isMenuOpen ? "280ms" : "0ms" }}
          />

          {secondaryNav.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-bold uppercase text-white/70 hover:text-black transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              style={{ transitionDelay: isMenuOpen ? `${320 + i * 50}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};
