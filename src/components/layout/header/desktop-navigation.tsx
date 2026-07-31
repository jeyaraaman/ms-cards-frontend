"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { navigation } from "@/constants/navigation";

export function DesktopNavigation() {
  return (
    <nav
      aria-label="Primary Navigation"
      className="hidden lg:flex items-center gap-8"
    >
      {navigation.map((item) => (
        <div key={item.title}>
          {item.children ? (
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            >
              <span>{item.title}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={item.href!}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}