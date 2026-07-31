import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PremiumCollection } from "@/data/premium-collections";

interface CollectionCardProps {
  collection: PremiumCollection;
}

export function CollectionCard({
  collection,
}: CollectionCardProps) {
  return (
    <Link
      href={collection.href}
      className="group block h-full"
    >
      <Card className="overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <CardContent className="space-y-4 p-6">
          <h3 className="text-2xl font-semibold">
            {collection.title}
          </h3>

          <p className="text-muted-foreground">
            {collection.description}
          </p>

          <div className="flex items-center gap-2 font-medium text-primary">
            Explore Collection

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}