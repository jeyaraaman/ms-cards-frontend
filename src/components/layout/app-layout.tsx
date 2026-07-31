import type { ReactNode } from "react";
import { Navbar } from "./header/navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {children}
      </main>
    </>
  );
}