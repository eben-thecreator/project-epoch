// components/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export interface NavigationItem {
  name: string;
  path: string;
}

export interface NavigationColumn {
  column: number;
  items: NavigationItem[];
}

export const Header = (): JSX.Element => {
  const location = useLocation();

  const navigationItems: NavigationColumn[] = [
    {
      column: 1,
      items: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "News", path: "/news" },
      ],
    },
    {
      column: 2,
      items: [
        { name: "Case Studies", path: "/case-studies" },
        { name: "Reconstruction", path: "/reconstruction" },
        { name: "Gallery", path: "/gallery" },
      ],
    },
    {
      column: 3,
      items: [
        { name: "Map", path: "/map" },
        { name: "Research", path: "/research" },
        { name: "Partners", path: "/partners" },
      ],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.includes(path));

  const Dropdown = ({
    title,
    items,
  }: {
    title: string;
    items: NavigationItem[];
  }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const anyActive = items.some((i) => isActive(i.path));

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    };

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 150);
    };

    const handleClick = () => {
      setOpen((prev) => !prev);
    };

    return (
      <div
        className="relative"
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={`font-inter font-bold text-sm lg:text-base transition-all duration-300 focus:outline-none px-2 py-1 text-white hover:rotate-2 mix-blend-difference`}
          onClick={handleClick}
        >
          {title}
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-auto z-50 animate-fadeIn mix-blend-difference">
            <ul className="flex flex-col items-start">
              {items.map((item) => (
                <li key={item.path} className="w-full animate-slideDown">
                  <Link
                    to={item.path}
                    className={`block w-full font-inter font-bold text-sm lg:text-base px-2 py-1 transition-colors duration-150 focus:outline-none text-white mix-blend-difference`}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="w-full sticky top-0 z-50 mix-blend-difference pointer-events-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 lg:py-6">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Home"
          className="flex items-center gap-8 focus:outline-none mix-blend-difference"
        >
          <div className="w-8 h-8 lg:w-[30px] lg:h-[30px] grid grid-cols-2 gap-0.5">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="bg-white rounded-full mix-blend-difference" />
              ))}
          </div>
          <span className="sr-only">Epoch Project Logo</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex justify-center">
          <div className="inline-flex items-center gap-12 md:pl-[calc(1/4*100%-0.5rem)]">
            <Dropdown title="Menu" items={navigationItems[0].items} />
            <Dropdown title="Projects" items={navigationItems[1].items} />
            <Dropdown title="Resources" items={navigationItems[2].items} />
          </div>
        </nav>
      </div>
    </header>
  );
};