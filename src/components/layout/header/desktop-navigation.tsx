"use client";

import { NavigationItem } from "./navigation-item";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/catalogue" },
  { label: "Premium Collections", href: "/premium" },
  { label: "Commercial Printing", href: "/printing" },
  { label: "Accessories", href: "/accessories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function DesktopNavigation() {
  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {navigation.map((item) => (
        <NavigationItem
          key={item.label}
          href={item.href}
          label={item.label}
        />
      ))}
    </nav>
  );
}