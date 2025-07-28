import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "../components/ui/navigation-menu";

export interface NavigationItem {
  name: string;
  active: boolean;
}

export interface NavigationColumn {
  column: number;
  items: NavigationItem[];
}

export const Header = (): JSX.Element => {
  // Navigation menu items organized by columns
  const navigationItems: NavigationColumn[] = [
    {
      column: 1,
      items: [
        { name: "Home", active: true },
        { name: "About", active: false },
        { name: "Contact", active: false },
        { name: "News", active: false },
      ],
    },
    {
      column: 2,
      items: [
        { name: "Case Studies", active: false },
        { name: "Reconstruction", active: false },
        { name: "Gallery", active: false },
      ],
    },
    {
      column: 3,
      items: [
        { name: "Map", active: false },
        { name: "Research", active: false },
        { name: "Partners", active: false },
      ],
    },
  ];

  return (
    <div className="mx-auto px-4 sm:px-2 lg:px-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 lg:py-8">
        {/* Logo */}
        <div className="flex items-center mb-6 lg:mb-0">
          <div className="w-8 h-8 lg:w-[30px] lg:h-[30px] grid grid-cols-2 gap-0.1">
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
            <div className="bg-black rounded-full" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 flex items-center justify-center">
  <NavigationMenu className="w-full lg:w-auto">
    <NavigationMenuList className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-24">
      {navigationItems.map((column, columnIndex) => (
        <div
          key={`column-${columnIndex}`}
          className="flex flex-col items-center lg:items-start gap-2"
        >
          {column.items.map((item, itemIndex) => (
            <div
              key={`item-${columnIndex}-${itemIndex}`}
              className={`font-inter font-bold text-sm lg:text-base cursor-pointer transition-colors ${
                item.active
                  ? "text-black"
                  : "text-[#7d7d7d] hover:text-black"
              }`}
            >
              {item.name}
            </div>
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