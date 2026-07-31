import { Logo } from "./logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden lg:block">
          {/* Desktop Navigation */}
        </div>

        <div className="flex items-center gap-4">
          {/* Header Actions */}
          {/* Mobile Navigation */}
        </div>
      </div>
    </header>
  );
}