import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RollingBanner } from "./RollingBanner";

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "About", path: "/about" },
    { name: "Projects", path: "/case-studies" },
    { name: "Exhibition", path: "/exhibition" },
    { name: "Gallery", path: "/gallery" },
    { name: "Restoration", path: "/restoration" },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.includes(path));

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#E33C30] text-white">
        <RollingBanner />

        <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Home"
            className="flex items-center gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-[1.15rem] font-bold tracking-tight text-white">
              PROJ-CULTURE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-[0.82rem] tracking-wide uppercase ${
                  isActive(item.path)
                    ? "text-white font-bold text-sm"
                    : "hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex flex-col justify-between w-6 h-4 focus:outline-none"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={`block h-[2px] bg-white rounded transition-none ${
                isMenuOpen ? "rotate-45 translate-y-[6px]" : ""
              }`}
            ></span>
            <span
              className={`block h-[2px] bg-white rounded transition-none ${
                isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
              }`}
            ></span>
          </button>
        </div>
      </header>
      <div className="h-36"></div>
    </>
    



  );
};
