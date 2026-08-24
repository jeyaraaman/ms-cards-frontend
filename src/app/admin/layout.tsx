import type { ReactNode } from "react";
import Link from "next/link";

import {
  LayoutDashboard,
  MessageSquareText,
  Package,
  Trash2,
  Layers,
  Tags,
  Settings,
} from "lucide-react";

import { LogoutButton } from "@/components/admin/logout-button";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquareText,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Recycle Bin",
    href: "/admin/products/recycle-bin",
    icon: Trash2,
  },
  {
    name: "Collections",
    href: "/admin/collections",
    icon: Layers,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Site Settings",
    href: "/admin/site-settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Brand */}
          <Link
            href="/admin"
            className="font-heading text-2xl font-semibold text-primary"
          >
            Meenakshi Screen Admin
          </Link>

          {/* Logout */}
          <LogoutButton />
        </div>
      </header>

      {/* Admin Body */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
          <nav className="sticky top-16 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />

                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}