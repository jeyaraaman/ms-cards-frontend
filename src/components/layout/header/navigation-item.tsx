"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItemProps {
  href: string;
  label: string;
}

export function NavigationItem({
  href,
  label,
}: NavigationItemProps) {
  const pathname = usePathname();

  /* ============================================================
     DETERMINE ACTIVE STATE
     ============================================================ */

  let isActive = false;

  if (href === "/") {
    // Home is active only on the homepage.
    isActive = pathname === "/";
  } else if (href === "/catalogue") {
    // Collections is active for:
    // /catalogue
    // /catalogue/[id]
    isActive =
      pathname === "/catalogue" ||
      pathname.startsWith("/catalogue/");
  } else {
    // Other navigation items are active
    // when the current route starts with their path.
    isActive =
      pathname === href ||
      pathname.startsWith(`${href}/`);
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`
        group
        relative
        inline-flex
        items-center
        text-sm
        font-medium
        transition-all
        duration-300
        ease-out

        ${
          isActive
            ? `
              text-primary
              drop-shadow-[0_0_8px_rgba(122,31,43,0.30)]
            `
            : `
              text-foreground
              hover:text-primary
            `
        }
      `}
    >
      {/* ========================================================
          NAVIGATION TEXT
      ======================================================== */}

      <span
        className={`
          relative
          transition-all
          duration-300

          ${
            isActive
              ? `
                drop-shadow-[0_0_6px_rgba(122,31,43,0.25)]
              `
              : `
                group-hover:drop-shadow-[0_0_5px_rgba(122,31,43,0.18)]
              `
          }
        `}
      >
        {label}
      </span>

      {/* ========================================================
          ACTIVE / HOVER UNDERLINE
      ======================================================== */}

      <span
        className={`
          absolute
          -bottom-2
          left-0
          h-[2px]
          rounded-full
          bg-primary
          transition-all
          duration-300
          ease-out

          ${
            isActive
              ? `
                w-full
                shadow-[0_0_5px_rgba(122,31,43,0.75)]
                shadow-[0_0_12px_rgba(122,31,43,0.45)]
              `
              : `
                w-0
                group-hover:w-full
                group-hover:shadow-[0_0_8px_rgba(122,31,43,0.35)]
              `
          }
        `}
      />

      {/* ========================================================
          SUBTLE ACTIVE GLOW
          NO BACKGROUND
          NO ROUNDED BOX
      ======================================================== */}

      {isActive && (
        <span
          className="
            pointer-events-none
            absolute
            -bottom-2
            left-1/2
            h-3
            w-16
            -translate-x-1/2
            rounded-full
            bg-primary/20
            blur-md
          "
        />
      )}
    </Link>
  );
}