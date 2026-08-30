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

const ACCESSORIES_COLLECTION_SLUG =
  "accessories";

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

interface Category {
  id: number;
  name: string;
  slug: string;

  collection: number | null;
  collection_name: string | null;
  collection_slug: string | null;

  description: string;
  image: string;
  cloudinary_public_id: string;

  active: boolean;
  product_count: number;
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

/* ============================================================
   NORMALIZE API LIST RESPONSE
============================================================ */

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray(
      (data as { results?: unknown }).results,
    )
  ) {
    return (
      data as {
        results: T[];
      }
    ).results;
  }

  return [];
}

/* ============================================================
   GET CATEGORIES
============================================================ */

async function getCategories(): Promise<
  Category[]
> {
  const response = await fetch(
    `${API_URL}/api/products/categories/`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch categories (${response.status})`,
    );
  }

  const data =
    await response.json();

  return getList<Category>(data);
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
      `Failed to fetch products (${response.status})`,
    );
  }

  const data =
    await response.json();

  return getList<Product>(data);
}

/* ============================================================
   ACCESSORIES CATEGORY PAGE
============================================================ */

export default async function AccessoriesCategoryPage({
  params,
}: PageProps) {
  const { category } = await params;

  let categoryData: Category | null =
    null;

  let products: Product[] = [];

  try {
    /*
     * ==========================================================
     * STEP 1
     *
     * Find the requested category.
     * ==========================================================
     */

    const categories =
      await getCategories();

    categoryData =
      categories.find(
        (item) =>
          item.slug === category &&
          item.active &&
          item.collection_slug ===
            ACCESSORIES_COLLECTION_SLUG,
      ) || null;

    /*
     * ==========================================================
     * STEP 2
     *
     * Only retrieve products when this category
     * actually belongs to Accessories.
     * ==========================================================
     */

    if (categoryData) {
      const allProducts =
        await getProducts();

      /*
       * Product belongs to this page when:
       *
       * 1. Product is active
       * 2. Product isn't deleted
       * 3. Product category matches this category
       */

      products =
        allProducts.filter(
          (product) =>
            product.active &&
            !product.is_deleted &&
            product.category_slug ===
              categoryData!.slug,
        );
    }
  } catch (error) {
    console.error(
      "Failed to load accessories category:",
      error,
    );
  }

  /*
   * ==========================================================
   * CATEGORY NAME
   * ==========================================================
   */

  const categoryName =
    categoryData?.name ||
    category
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");

  return (
    <main>
      <Section className="pt-16 lg:pt-24">
        <Container>

          {/* ==================================================
              BACK
          ================================================== */}

          <Link
            href="/accessories"
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

            Back to Accessories
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
              Celebration Accessories
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
              {categoryData?.description ||
                `Explore our ${categoryName.toLowerCase()} collection and find the perfect finishing touches for your celebration.`}
            </p>
          </div>

          {/* ==================================================
              INVALID CATEGORY
          ================================================== */}

          {!categoryData && (
            <div
              className="
                mt-12
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
                Category Not Available
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
                This category does not belong
                to the Accessories collection
                or is currently inactive.
              </p>

              <Link
                href="/accessories"
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
                Browse Accessories

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* ==================================================
              VALID CATEGORY
          ================================================== */}

          {categoryData && (
            <>
              {/* ==================================================
                  COUNT
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
                        href={`/catalogue/${product.slug}?from=accessories`}
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
                              IMAGE
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
                              CONTENT
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
                                {
                                  product.description
                                }
                              </p>
                            )}

                            {product.material && (
                              <p
                                className="
                                  mt-4
                                  text-sm
                                  text-muted-foreground
                                "
                              >
                                <span
                                  className="
                                    font-medium
                                    text-foreground
                                  "
                                >
                                  Material:
                                </span>{" "}
                                {
                                  product.material
                                }
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
                    No Products Available
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
                    products assigned to{" "}
                    {categoryName}.
                  </p>

                  <Link
                    href="/accessories"
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
                    Browse Accessories

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}

        </Container>
      </Section>
    </main>
  );
}