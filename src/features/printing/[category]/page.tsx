import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { getImageUrl } from "@/lib/image-url";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const COMMERCIAL_COLLECTION_SLUG =
  "commercial-printing";

const CATEGORY_NAMES: Record<
  string,
  string
> = {
  "visiting-cards": "Visiting Cards",
  "bill-books": "Bill Books",
  letterheads: "Letterheads",
  flyers: "Flyers",
  pamphlets: "Pamphlets",
  "product-labels": "Product Labels",
  "product-stickers": "Product Stickers",
  "office-covers": "Office Covers",
  calendars: "Calendars",
  "sunpack-boards": "Sunpack Boards",
  "moi-covers": "Moi Covers",
  "viboothi-covers": "Viboothi Covers",
};

interface Product {
  id: number;
  name: string;
  slug: string;

  category: number;
  category_name: string;
  category_slug: string;

  collection_ids: number[];
  collection_slugs: string[];
  collection_names: string[];

  material: string;
  image: string;
  description: string;

  featured: boolean;
  active: boolean;
  is_deleted: boolean;
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

/* ============================================================
   GET PRODUCTS
============================================================ */

async function getProducts(): Promise<
  Product[]
> {
  const response = await fetch(
    `${API_URL}/api/products/`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch products",
    );
  }

  const data =
    await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

/* ============================================================
   PAGE
============================================================ */

export default async function PrintingCategoryPage({
  params,
}: PageProps) {
  const { category } = await params;

  const categoryName =
    CATEGORY_NAMES[category] ||
    category
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");

  let products: Product[] = [];

  try {
    const allProducts =
      await getProducts();

    products =
      allProducts.filter(
        (product) =>
          product.active &&
          !product.is_deleted &&
          product.category_slug ===
            category &&
          Array.isArray(
            product.collection_slugs,
          ) &&
          product.collection_slugs.includes(
            COMMERCIAL_COLLECTION_SLUG,
          ),
      );
  } catch (error) {
    console.error(
      "Failed to load commercial printing category:",
      error,
    );
  }

  return (
    <main>
      <Section
        className="
          pt-16
          lg:pt-24
        "
      >
        <Container>

          {/* ==================================================
              BACK
          ================================================== */}

          <Link
            href="/printing"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-muted-foreground
              transition
              hover:text-foreground
            "
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Commercial Printing
          </Link>

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mt-12">
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.3em]
                text-primary
              "
            >
              Commercial Printing
            </p>

            <h1
              className="
                mt-4
                font-heading
                text-5xl
                text-foreground
                lg:text-6xl
              "
            >
              {categoryName}
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              Explore our{" "}
              {categoryName.toLowerCase()}{" "}
              printing solutions crafted for
              professional business and
              promotional requirements.
            </p>
          </div>

          {/* ==================================================
              PRODUCT COUNT
          ================================================== */}

          <div
            className="
              mt-12
              text-sm
              text-muted-foreground
            "
          >
            Showing {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </div>

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          {products.length > 0 ? (
            <div
              className="
                mt-8
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {products.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/catalogue/${product.slug}?from=printing`}
                    className="group"
                  >
                    <article
                      className="
                        h-full
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

                      <div
                        className="
                          relative
                          aspect-[4/5]
                          overflow-hidden
                          bg-muted
                        "
                      >
                        {product.image ? (
                          <Image
                            src={getImageUrl(
                              product.image,
                            )}
                            alt={
                              product.name
                            }
                            fill
                            sizes="
                              (max-width: 768px) 100vw,
                              (max-width: 1280px) 50vw,
                              33vw
                            "
                            className="
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-105
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              items-center
                              justify-center
                              text-sm
                              text-muted-foreground
                            "
                          >
                            No image available
                          </div>
                        )}
                      </div>

                      {/* ==================================================
                          PRODUCT CONTENT
                      ================================================== */}

                      <div className="p-6">
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-primary
                          "
                        >
                          {categoryName}
                        </p>

                        <h2
                          className="
                            mt-3
                            font-heading
                            text-2xl
                            text-foreground
                          "
                        >
                          {product.name}
                        </h2>

                        {product.description && (
                          <p
                            className="
                              mt-3
                              line-clamp-3
                              text-sm
                              leading-6
                              text-muted-foreground
                            "
                          >
                            {product.description}
                          </p>
                        )}

                        {product.material && (
                          <p
                            className="
                              mt-4
                              text-sm
                            "
                          >
                            <span
                              className="
                                font-semibold
                              "
                            >
                              Material:
                            </span>{" "}
                            {product.material}
                          </p>
                        )}

                        <div
                          className="
                            mt-6
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-primary
                          "
                        >
                          View Product

                          <ArrowRight
                            className="
                              h-4
                              w-4
                              transition-transform
                              duration-200
                              group-hover:translate-x-1
                            "
                          />
                        </div>
                      </div>
                    </article>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-border
                bg-muted/20
                p-12
                text-center
              "
            >
              <h2
                className="
                  font-heading
                  text-2xl
                  text-foreground
                "
              >
                No products available
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-lg
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                There are currently no
                products assigned to the
                Commercial Printing
                collection under{" "}
                {categoryName}.
              </p>

              <Link
                href="/printing"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-primary
                "
              >
                Browse Commercial Printing

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

        </Container>
      </Section>
    </main>
  );
}