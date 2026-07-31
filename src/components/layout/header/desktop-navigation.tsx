"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { navigation } from "@/config/navigation";

export function DesktopNavigation() {
  return (
    <nav
      className="hidden items-center gap-8 lg:flex"
      aria-label="Main Navigation"
    >
      {navigation.map((item) => (
        <div key={item.title} className="group relative">
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            >
              {item.title}
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}