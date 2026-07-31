"use client";

import { navigation } from "@/config/navigation";
import { NavigationItem } from "./navigation-item";

export function DesktopNavigation() {
  return (
    <nav
      aria-label="Main Navigation"
      className="hidden items-center gap-8 lg:flex"
    >
      {navigation
        .filter((item) => item.href)
        .map((item) => (
          <NavigationItem
            key={item.title}
            item={item}
          />
        ))}
    </nav>
  );
}