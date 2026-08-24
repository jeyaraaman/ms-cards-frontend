"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { ProductCard } from "@/components/common/product-card";

interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  category: number;
  category_name: string;
  category_slug: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  products: number[];
  product_details: Product[];
  product_count: number;
  active: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface PremiumCollectionPageProps {
  slug: string;
}

export function PremiumCollectionPage({
  slug,
}: PremiumCollectionPageProps) {
  const [collection, setCollection] =
    useState<Collection | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const productsContainerRef =
    useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  /*
   * ============================================================
   * FETCH COLLECTION
   * ============================================================
   */

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/collections/${slug}/`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "Premium collection not found.",
            );
          }

          throw new Error(
            "Failed to fetch premium collection.",
          );
        }

        const data: Collection =
          await response.json();

        if (!data.active) {
          throw new Error(
            "This premium collection is not available.",
          );
        }

        setCollection(data);
      } catch (error) {
        console.error(
          "Failed to load premium collection:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load premium collection.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [slug]);

  /*
   * ============================================================
   * UPDATE SCROLL STATE
   * ============================================================
   */

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

  /*
   * ============================================================
   * SETUP SCROLL LISTENER
   * ============================================================
   */

  useEffect(() => {
    if (
      !collection ||
      collection.product_details.length === 0
    ) {
      return;
    }

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
  }, [collection]);

  /*
   * ============================================================
   * SCROLL LEFT
   * ============================================================
   */

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

  /*
   * ============================================================
   * SCROLL RIGHT
   * ============================================================
   */

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

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <Section className="py-16">
        <Container>
          <div className="py-20 text-center text-muted-foreground">
            Loading collection...
          </div>
        </Container>
      </Section>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !collection) {
    return (
      <Section className="py-16">
        <Container>
          <div className="py-20 text-center">
            <h1 className="font-heading text-3xl">
              Collection Not Found
            </h1>

            <p className="mt-3 text-muted-foreground">
              {error ||
                "This premium collection is not available."}
            </p>

            <Link
              href="/premium"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-primary
                hover:underline
              "
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Premium Collections
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  /*
   * ============================================================
   * PRODUCT LIST
   * ============================================================
   */

  const products =
    collection.product_details;

  const hasMoreProducts =
    products.length > 4;

  /*
   * ============================================================
   * COLLECTION PAGE
   * ============================================================
   */

  return (
    <Section className="py-16">
      <Container>

        {/* ======================================================
            BACK BUTTON
        ======================================================= */}

        <Link
          href="/premium"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:text-primary
          "
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Premium Collections
        </Link>

        {/* ======================================================
            COLLECTION HEADER
        ======================================================= */}

        <div className="mb-12 max-w-3xl">
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-[0.25em]
              text-primary
            "
          >
            Premium Collection
          </p>

          <h1
            className="
              mt-3
              font-heading
              text-4xl
              font-bold
              lg:text-5xl
            "
          >
            {collection.name}
          </h1>

          {collection.description && (
            <p
              className="
                mt-5
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              {collection.description}
            </p>
          )}
        </div>

        {/* ======================================================
            EMPTY COLLECTION
        ======================================================= */}

        {products.length === 0 && (
          <div
            className="
              py-20
              text-center
              text-muted-foreground
            "
          >
            No products are currently available
            in this collection.
          </div>
        )}

        {/* ======================================================
            PRODUCTS
        ======================================================= */}

        {products.length > 0 && (
          <>
            {/* ==================================================
                PRODUCT COUNT
            ================================================== */}

            <div
              className="
                mb-6
                text-sm
                text-muted-foreground
              "
            >
              Showing{" "}
              <span className="font-medium text-foreground">
                {products.length}
              </span>{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </div>

            {/* ==================================================
                PRODUCT CAROUSEL
            ================================================== */}

            <div className="relative">

              {/* ==================================================
                  LEFT ARROW
              ================================================== */}

              {hasMoreProducts && (
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  aria-label="Scroll premium products left"
                  className={`
                    group/arrow
                    absolute
                    left-2
                    top-1/2
                    z-20
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-background/70
                    text-foreground
                    shadow-lg
                    backdrop-blur-xl
                    transition-all
                    duration-300

                    ${
                      canScrollLeft
                        ? `
                          cursor-pointer
                          opacity-100
                          hover:-translate-x-0.5
                          hover:border-primary/40
                          hover:bg-primary
                          hover:text-primary-foreground
                          hover:shadow-[0_8px_30px_rgba(122,31,43,0.25)]
                        `
                        : `
                          pointer-events-none
                          opacity-0
                        `
                    }
                  `}
                >
                  <ArrowLeft
                    className="
                      h-5
                      w-5
                      transition-transform
                      duration-300
                      group-hover/arrow:-translate-x-0.5
                    "
                  />
                </button>
              )}

              {/* ==================================================
                  PRODUCTS CONTAINER
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

                  {products.map(
                    (product) => (
                      <div
                        key={product.id}
                        className="
                          w-full
                          shrink-0
                          snap-start
                          sm:w-[calc(50%-12px)]
                          lg:w-[calc(25%-18px)]
                        "
                      >
                        <ProductCard
                          backTo="premium"
                          product={{
                            id: product.slug,
                            name: product.name,
                            category:
                              product.category_name,
                            material: "",
                            image:
                              product.image,
                            featured: false,
                          }}
                        />
                      </div>
                    ),
                  )}

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
                  aria-label="Scroll premium products right"
                  className={`
                    group/arrow
                    absolute
                    right-2
                    top-1/2
                    z-20
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-background/70
                    text-foreground
                    shadow-lg
                    backdrop-blur-xl
                    transition-all
                    duration-300

                    ${
                      canScrollRight
                        ? `
                          cursor-pointer
                          opacity-100
                          hover:translate-x-0.5
                          hover:border-primary/40
                          hover:bg-primary
                          hover:text-primary-foreground
                          hover:shadow-[0_8px_30px_rgba(122,31,43,0.25)]
                        `
                        : `
                          pointer-events-none
                          opacity-0
                        `
                    }
                  `}
                >
                  <ArrowRight
                    className="
                      h-5
                      w-5
                      transition-transform
                      duration-300
                      group-hover/arrow:translate-x-0.5
                    "
                  />
                </button>
              )}

            </div>
          </>
        )}

      </Container>
    </Section>
  );
}