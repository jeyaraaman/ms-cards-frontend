import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <span className="font-heading text-4xl font-semibold tracking-tight text-primary">
        Meenakshi Screen
      </span>
    </Link>
  );
}