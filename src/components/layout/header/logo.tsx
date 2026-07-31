import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="MS Cards Home"
      className="inline-flex items-center"
    >
      <span className="text-2xl font-bold tracking-tight text-primary">
        MS Cards
      </span>
    </Link>
  );
}