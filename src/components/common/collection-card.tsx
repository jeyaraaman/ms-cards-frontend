import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

interface CollectionCardProps {
  collection: Collection;
}

function getImageUrl(image: string): string {
  if (!image) {
    return "";
  }

  const value = image.trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

export function CollectionCard({
  collection,
}: CollectionCardProps) {
  const imageUrl = getImageUrl(collection.image);

  return (
    <Link
      href={collection.href}
      className="group block h-full"
    >
      <article
        className="
          glass
          h-full
          overflow-hidden
          rounded-2xl
        "
      >
        {/* ================================================== */}
        {/* IMAGE */}
        {/* ================================================== */}

        <div
          className="
            glass-image
            relative
            aspect-[4/5]
            overflow-hidden
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={collection.title}
              className="
                h-full
                w-full
                object-cover
              "
              loading="lazy"
            />
          ) : (
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                gap-2
                text-sm
                text-muted-foreground
              "
            >
              <ImageIcon className="h-8 w-8" />

              <span>
                No image available
              </span>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="space-y-3 p-6">
          <h3
            className="
              font-heading
              text-xl
              text-foreground
            "
          >
            {collection.title}
          </h3>

          {collection.description && (
            <p
              className="
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              {collection.description}
            </p>
          )}

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-primary
            "
          >
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