"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { navigation } from "@/constants/navigation";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  function closeMenu() {
    setOpen(false);
    setOpenMenu(null);
  }

  function toggleSubmenu(title: string) {
    setOpenMenu((current) =>
      current === title ? null : title,
    );
  }

  return (
    <>
      {/* Mobile menu button */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/30"
          />

          {/* Menu panel */}

          <aside className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-2xl">

            {/* Menu header */}

            <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-6">

              <span className="font-heading text-2xl font-semibold">
                Menu
              </span>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Navigation links */}

            <nav className="min-h-0 flex-1 overflow-y-auto px-6 py-4">

              <div className="flex flex-col">

                {navigation.map((item) => {
                  const hasChildren =
                    Boolean(
                      item.children &&
                        item.children.length > 0,
                    );

                  const isOpen =
                    openMenu === item.title;

                  /*
                   * Normal link
                   */

                  if (!hasChildren) {
                    return (
                      <Link
                        key={item.title}
                        href={item.href || "#"}
                        onClick={closeMenu}
                        className="border-b border-border/60 py-4 text-base font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {item.title}
                      </Link>
                    );
                  }

                  /*
                   * Dropdown item
                   */

                  return (
                    <div
                      key={item.title}
                      className="border-b border-border/60"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSubmenu(
                            item.title,
                          )
                        }
                        className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-foreground transition-colors hover:text-primary"
                      >
                        <span>
                          {item.title}
                        </span>

                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="pb-3 pl-4">
                          {item.children?.map(
                            (child) => (
                              <Link
                                key={
                                  child.title
                                }
                                href={
                                  child.href ||
                                  "#"
                                }
                                onClick={
                                  closeMenu
                                }
                                className="block py-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                              >
                                {child.title}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

            </nav>

            {/* Enquiry */}

            <div className="shrink-0 border-t border-border bg-background p-6">

              <Link
                href="/enquiry"
                onClick={closeMenu}
                className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Enquiry
              </Link>

            </div>

          </aside>
        </div>
      )}
    </>
  );
}