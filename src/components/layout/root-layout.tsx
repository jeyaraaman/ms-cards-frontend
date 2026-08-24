"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppLayout } from "./app-layout";

interface RouteLayoutProps {
  children: ReactNode;
}

export function RouteLayout({
  children,
}: RouteLayoutProps) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}