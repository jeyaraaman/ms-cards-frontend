import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/data/categories";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.href} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="aspect-[4/3] bg-muted" />

        <CardContent className="space-y-3 p-6">
          <h3 className="text-xl font-semibold">
            {category.title}
          </h3>

          <p className="text-sm leading-6 text-muted-foreground">
            {category.description}
          </p>

          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            Explore
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}