import { Logo } from "./logo";
import { DesktopNavigation } from "./desktop-navigation";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Logo />

        <DesktopNavigation />

        <div className="hidden lg:flex items-center gap-4">
          <button className="text-sm font-medium hover:text-primary">
            Contact
          </button>

          <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
            Enquiry
          </button>
        </div>
      </div>
    </header>
  );
}