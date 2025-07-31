import React from "react";
import { NavigationMenu, NavigationMenuList } from "../components/ui/navigation-menu";
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

  // Navigation menu items organized by columns
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

  // Function to check if a path is active
  const isActive = (path: string) => {
    // Special case for home path
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    // For other paths, check if they match or are part of the current path
    if (path !== "/" && location.pathname.includes(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 w-full">
      <header className="flex items-start justify-between py-6 lg:py-8">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 lg:w-[30px] lg:h-[30px] grid grid-cols-2 gap-0.8">
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 flex items-start justify-center">
          <NavigationMenu className="w-full lg:w-auto">
            <NavigationMenuList className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-24">
              {navigationItems.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  className="flex flex-col items-start lg:items-start gap-4"
                >
                  {column.items.map((item, itemIndex) => (
                    <Link
                      to={item.path}
                      key={`item-${columnIndex}-${itemIndex}`}
                      className={`font-inter font-bold text-sm lg:text-base transition-colors ${
                        isActive(item.path)
                          ? "text-black"
                          : "text-[#7d7d7d] hover:text-black"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </header>
    </div>
  );
};