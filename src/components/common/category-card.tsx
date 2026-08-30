import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({
  category,
}: CategoryCardProps) {
  return (
    <Link
      href={category.href}
      className="group relative block h-full"
    >
      <div
        className="
          pointer-events-none
          absolute
          -inset-1
          rounded-[1.15rem]
          bg-primary/10
          opacity-0
          blur-xl
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />

      <article
        className="
          glass
          relative
          h-full
          overflow-hidden
          rounded-2xl
          transition-all
          duration-500
          group-hover:-translate-y-2
          group-hover:border-primary/20
          group-hover:shadow-[0_20px_50px_rgba(122,31,43,0.14)]
        "
      >
        <div
          className="
            relative
            aspect-[4/5]
            overflow-hidden
            bg-muted/40
          "
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.05]
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image available
            </div>
          )}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-white/10
              via-transparent
              to-primary/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              h-px
              w-2/3
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-white/30
              to-transparent
            "
          />
        </div>

        <div className="relative z-10 space-y-3 p-6">
          <h3
            className="
              font-heading
              text-xl
              text-foreground
              transition-colors
              duration-300
              group-hover:text-primary
            "
          >
            {category.title}
          </h3>

          {category.description && (
            <p className="text-sm leading-6 text-muted-foreground">
              {category.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            Explore

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </div>
        </div>
      </article>
    </Link>
  );
}