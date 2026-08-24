import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  image: string;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  backTo?:
    | "catalogue"
    | "premium"
    | "printing"
    | "accessories";
}

export function ProductCard({
  product,
  backTo = "catalogue",
}: ProductCardProps) {
  const productHref =
    `/catalogue/${product.id}?from=${backTo}`;

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* ==================================================
          PRODUCT IMAGE
      ================================================== */}

      <Link
        href={productHref}
        className="
          relative
          block
          aspect-[4/3]
          overflow-hidden
          bg-muted
        "
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            25vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {product.featured && (
          <span
            className="
              absolute
              left-4
              top-4
              rounded-full
              border
              border-white/20
              bg-primary/90
              px-3
              py-1.5
              text-xs
              font-medium
              text-primary-foreground
              shadow-lg
              backdrop-blur-md
            "
          >
            Featured
          </span>
        )}
      </Link>

      {/* ==================================================
          PRODUCT INFORMATION
      ================================================== */}

      <div
        className="
          relative
          z-10
          flex
          flex-1
          flex-col
          p-6
        "
      >
        {product.material && (
          <p
            className="
              mb-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-primary
            "
          >
            {product.material}
          </p>
        )}

        <h3
          className="
            font-heading
            text-2xl
            leading-tight
            text-foreground
            transition-colors
            duration-300
            group-hover:text-primary
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          {product.category}
        </p>

        <div className="mt-auto pt-6">
          <Link
            href={productHref}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-primary
              transition-all
              duration-300
              hover:gap-3
            "
          >
            View Details

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
}