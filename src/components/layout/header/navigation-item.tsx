import Link from "next/link";
import type { NavigationItem as NavigationItemType } from "@/config/navigation";

interface NavigationItemProps {
  item: NavigationItemType;
}

export function NavigationItem({ item }: NavigationItemProps) {
  return (
    <Link
      href={item.href ?? "#"}
      className="text-sm font-medium transition-colors hover:text-primary"
    >
      {item.title}
    </Link>
  );
}