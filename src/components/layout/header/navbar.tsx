import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Logo } from "./logo";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";

export function Navbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-white/10
        bg-background/55
        backdrop-blur-2xl
        supports-[backdrop-filter]:bg-background/45
        transition-all
        duration-300
      "
    >
      {/* ======================================================
          SUBTLE GLASS HIGHLIGHT
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/25
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
        "
      />

      {/* ======================================================
          NAVBAR CONTENT
      ======================================================= */}

      <div
        className="
          relative
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-6
        "
      >
        {/* ====================================================
            LOGO
        ===================================================== */}

        <Logo />

        {/* ====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <DesktopNavigation />

        {/* ====================================================
            ACTIONS
        ===================================================== */}

        <div className="flex items-center gap-3">
          {/* Desktop enquiry */}

          <Button
            asChild
            className="
              hidden
              rounded-full
              border
              border-primary/20
              bg-primary
              px-6
              shadow-[0_0_0_rgba(122,31,43,0)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-primary/90
              hover:shadow-[0_8px_25px_rgba(122,31,43,0.28)]
              lg:inline-flex
            "
          >
            <Link href="/enquiry">
              Enquiry
            </Link>
          </Button>

          {/* Mobile menu */}

          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}