"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { getImageUrl } from "@/lib/image-url";

interface Product {
  id: number;
  name: string;
  slug: string;

  category: number | null;
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

  products: Product[];
}

interface AccessoriesProductsProps {
  category: Category;
  products: Product[];
}

/* ============================================================
   CATEGORY PRODUCTS
============================================================ */

function AccessoriesProducts({
  category,
  products,
}: AccessoriesProductsProps) {
  const productsContainerRef =
    useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  /* ==========================================================
     UPDATE SCROLL STATE
  ========================================================== */

  function updateScrollState() {
    const container =
      productsContainerRef.current;

    if (!container) {
      return;
    }

    const maxScrollLeft =
      container.scrollWidth -
      container.clientWidth;

    setCanScrollLeft(
      container.scrollLeft > 5,
    );

    setCanScrollRight(
      container.scrollLeft <
        maxScrollLeft - 5,
    );
  }

  /* ==========================================================
     INITIALIZE SCROLL STATE
  ========================================================== */

  useEffect(() => {
    updateScrollState();

    const container =
      productsContainerRef.current;

    if (!container) {
      return;
    }

    container.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateScrollState,
    );

    return () => {
      container.removeEventListener(
        "scroll",
        updateScrollState,
      );

      window.removeEventListener(
        "resize",
        updateScrollState,
      );
    };
  }, [products]);

  /* ==========================================================
     SCROLL LEFT
  ========================================================== */

  function handleScrollLeft() {
    const container =
      productsContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: -container.clientWidth,
      behavior: "smooth",
    });
  }

  /* ==========================================================
     SCROLL RIGHT
  ========================================================== */

  function handleScrollRight() {
    const container =
      productsContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: container.clientWidth,
      behavior: "smooth",
    });
  }

  const hasMoreProducts =
    products.length > 4;

  return (
    <div className="relative mt-8">
      {/* ==================================================
          LEFT ARROW
      ================================================== */}

      {hasMoreProducts && (
        <button
          type="button"
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          aria-label={`Scroll ${category.name} products left`}
          className={`
            absolute
            left-2
            top-1/2
            z-10
            flex
            h-11
            w-11
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-border
            bg-background
            shadow-md
            transition-all
            duration-200

            ${
              canScrollLeft
                ? `
                  cursor-pointer
                  text-foreground
                  hover:border-primary
                  hover:bg-primary
                  hover:text-primary-foreground
                  hover:shadow-lg
                `
                : `
                  pointer-events-none
                  opacity-0
                `
            }
          `}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <div
        ref={productsContainerRef}
        className="
          overflow-x-auto
          scroll-smooth
          snap-x
          snap-mandatory
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-6 px-1">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/catalogue/${product.slug}?from=accessories`}
              className="
                group
                w-full
                shrink-0
                snap-start
                sm:w-[calc(50%-12px)]
                lg:w-[calc(25%-18px)]
              "
            >
              {/* ==================================================
                  PRODUCT CARD
              ================================================== */}

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
                    aspect-[4/3]
                    overflow-hidden
                    bg-muted
                  "
                >
                  {product.image ? (
                    <Image
                      src={getImageUrl(
                        product.image,
                      )}
                      alt={product.name}
                      fill
                      sizes="
                        (max-width: 640px) 90vw,
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
                  ) : category.image ? (
                    <Image
                      src={getImageUrl(
                        category.image,
                      )}
                      alt={category.name}
                      fill
                      sizes="
                        (max-width: 640px) 90vw,
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
                    Accessories
                  </p>

                  <h4
                    className="
                      mt-3
                      font-heading
                      text-xl
                      text-foreground
                    "
                  >
                    {product.name}
                  </h4>

                  {product.description && (
                    <p
                      className="
                        mt-3
                        line-clamp-2
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
                      {product.material}
                    </p>
                  )}

                  <div
                    className="
                      mt-5
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
          ))}
        </div>
      </div>

      {/* ==================================================
          RIGHT ARROW
      ================================================== */}

      {hasMoreProducts && (
        <button
          type="button"
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          aria-label={`Scroll ${category.name} products right`}
          className={`
            absolute
            right-2
            top-1/2
            z-10
            flex
            h-11
            w-11
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-border
            bg-background
            shadow-md
            transition-all
            duration-200

            ${
              canScrollRight
                ? `
                  cursor-pointer
                  text-foreground
                  hover:border-primary
                  hover:bg-primary
                  hover:text-primary-foreground
                  hover:shadow-lg
                `
                : `
                  pointer-events-none
                  opacity-0
                `
            }
          `}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

/* ============================================================
   ACCESSORIES SERVICES
============================================================ */

export function AccessoriesServices({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <Section
      className="
        relative
        overflow-hidden
        pt-8
        pb-20
        lg:pt-12
        lg:pb-28
      "
    >
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-48
          top-20
          h-96
          w-96
          rounded-full
          bg-primary/6
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-48
          top-1/3
          h-96
          w-96
          rounded-full
          bg-[#c6a15b]/7
          blur-3xl
        "
      />

      <Container>
        {/* ==================================================
            TARGET FOR HERO BUTTON
        ================================================== */}

        <div
          id="accessories-services"
          className="scroll-mt-28"
        >
          {/* ==================================================
              SECTION HEADER
          ================================================== */}

          <div className="mb-12 text-center">
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

            <h2
              className="
                mt-4
                font-heading
                text-4xl
                text-foreground
                lg:text-5xl
              "
            >
              Explore Our Accessories
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              Discover thoughtful accessories
              designed to complement your
              invitations and celebrations.
            </p>
          </div>

          {/* ==================================================
              CATEGORIES
          ================================================== */}

          {categories.length > 0 ? (
            <div className="space-y-20">
              {categories.map(
                (category) => {
                  const activeProducts =
                    category.products.filter(
                      (product) =>
                        product.active &&
                        !product.is_deleted,
                    );

                  return (
                    <section
                      key={category.id}
                      id={category.slug}
                      className="scroll-mt-28"
                    >
                      {/* ==================================================
                          CATEGORY HEADER
                          NO GLASS BOX
                      ================================================== */}

                      <div className="relative">
                        <div
                          className="
                            pointer-events-none
                            absolute
                            -left-16
                            -top-12
                            h-32
                            w-32
                            rounded-full
                            bg-primary/5
                            blur-3xl
                          "
                        />

                        <div className="relative z-10">
                          <p
                            className="
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.25em]
                              text-primary
                            "
                          >
                            Celebration Accessories
                          </p>

                          <h3
                            className="
                              mt-2
                              font-heading
                              text-3xl
                              text-foreground
                              lg:text-4xl
                            "
                          >
                            {category.name}
                          </h3>

                          {category.description && (
                            <p
                              className="
                                mt-3
                                max-w-2xl
                                text-sm
                                leading-6
                                text-muted-foreground
                              "
                            >
                              {
                                category.description
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ==================================================
                          PRODUCTS
                      ================================================== */}

                      {activeProducts.length >
                      0 ? (
                        <AccessoriesProducts
                          category={category}
                          products={
                            activeProducts
                          }
                        />
                      ) : (
                        <div
                          className="
                            glass
                            relative
                            mt-8
                            overflow-hidden
                            rounded-2xl
                            p-10
                            text-center
                          "
                        >
                          {category.image && (
                            <div
                              className="
                                relative
                                mx-auto
                                mb-5
                                h-24
                                w-32
                                overflow-hidden
                                rounded-xl
                              "
                            >
                              <Image
                                src={getImageUrl(
                                  category.image,
                                )}
                                alt={
                                  category.name
                                }
                                fill
                                sizes="128px"
                                className="object-cover"
                              />

                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  inset-0
                                  bg-gradient-to-br
                                  from-white/10
                                  to-primary/10
                                "
                              />
                            </div>
                          )}

                          <h4
                            className="
                              font-heading
                              text-2xl
                              text-foreground
                            "
                          >
                            {category.name}
                          </h4>

                          <p
                            className="
                              mx-auto
                              mt-2
                              max-w-lg
                              text-sm
                              leading-6
                              text-muted-foreground
                            "
                          >
                            Products in this
                            category will
                            appear here soon.
                          </p>

                          <Link
                            href="/enquiry"
                            className="
                              group/enquiry
                              mt-5
                              inline-flex
                              items-center
                              gap-2
                              text-sm
                              font-medium
                              text-primary
                            "
                          >
                            Make an Enquiry

                            <ArrowRight
                              className="
                                h-4
                                w-4
                                transition-transform
                                duration-300
                                group-hover/enquiry:translate-x-1
                              "
                            />
                          </Link>
                        </div>
                      )}
                    </section>
                  );
                },
              )}
            </div>
          ) : (
            <div
              className="
                glass
                rounded-2xl
                p-12
                text-center
              "
            >
              <h3
                className="
                  font-heading
                  text-2xl
                  text-foreground
                "
              >
                Accessories Coming Soon
              </h3>

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
                categories assigned to the
                Accessories collection.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}