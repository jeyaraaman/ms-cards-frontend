"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { ProductCard } from "@/components/common/product-card";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  material: string;
  image: string;
  description: string;
  featured: boolean;
  active: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    setCanScrollLeft(container.scrollLeft > 2);
    setCanScrollRight(
      maxScroll > 2 &&
        container.scrollLeft < maxScroll - 2,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/?featured=true`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load featured products.",
          );
        }

        const data = await response.json();

        const list: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        if (!cancelled) {
          setProducts(
            list.filter(
              (product) =>
                product &&
                product.id &&
                product.active !== false,
            ),
          );
        }
      } catch (err) {
        console.error(
          "Featured products error:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load featured products.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || error) {
      return;
    }

    const container = scrollRef.current;

    if (!container) {
      return;
    }

    updateScrollButtons();

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateScrollButtons,
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        updateScrollButtons,
      );
    };
  }, [
    products,
    loading,
    error,
    updateScrollButtons,
  ]);

  function scrollRight() {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-featured-card]",
      );

    if (!firstCard) {
      return;
    }

    const styles =
      window.getComputedStyle(container);

    const gap =
      parseFloat(styles.gap || "0") || 0;

    const amount =
      firstCard.offsetWidth + gap;

    container.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  }

  function scrollLeft() {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-featured-card]",
      );

    if (!firstCard) {
      return;
    }

    const styles =
      window.getComputedStyle(container);

    const gap =
      parseFloat(styles.gap || "0") || 0;

    const amount =
      firstCard.offsetWidth + gap;

    container.scrollBy({
      left: -amount,
      behavior: "smooth",
    });
  }

  const hasMoreProducts =
    products.length > 4;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Featured Products"
          title="Our Most Loved Invitation Designs"
          description="Explore a curated selection of premium invitation designs loved by our customers."
        />

        {loading && (
          <div
            className="
              mt-16
              grid
              gap-8
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    h-80
                    animate-pulse
                    rounded-3xl
                    bg-muted
                  "
                />
              ),
            )}
          </div>
        )}

        {!loading && error && (
          <div className="mt-16 py-12 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="mt-16 py-12 text-center text-muted-foreground">
              No featured products available.
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="relative mt-16">
              {hasMoreProducts &&
                canScrollLeft && (
                  <button
                    type="button"
                    onClick={scrollLeft}
                    aria-label="Previous featured products"
                    className="
                      absolute
                      left-0
                      top-1/2
                      z-20
                      flex
                      h-12
                      w-12
                      -translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      bg-background
                      text-foreground
                      shadow-lg
                      transition
                      hover:scale-105
                      hover:bg-primary
                      hover:text-primary-foreground
                    "
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}

              <div
                ref={scrollRef}
                className="
                  flex
                  gap-8
                  overflow-x-auto
                  overflow-y-hidden
                  scroll-smooth
                  snap-x
                  snap-mandatory
                  pb-2
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    data-featured-card
                    className="
                      w-full
                      shrink-0
                      snap-start
                      md:w-[calc(50%-16px)]
                      xl:w-[calc(25%-24px)]
                    "
                  >
                    <ProductCard
                      product={{
                        id: product.slug,
                        name: product.name,
                        category:
                          product.category_name,
                        material:
                          product.material,
                        image: product.image,
                        featured:
                          product.featured,
                      }}
                    />
                  </div>
                ))}
              </div>

              {hasMoreProducts &&
                canScrollRight && (
                  <button
                    type="button"
                    onClick={scrollRight}
                    aria-label="Next featured products"
                    className="
                      absolute
                      right-0
                      top-1/2
                      z-20
                      flex
                      h-12
                      w-12
                      translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      bg-background
                      text-foreground
                      shadow-lg
                      transition
                      hover:scale-105
                      hover:bg-primary
                      hover:text-primary-foreground
                    "
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
            </div>
          )}
      </Container>
    </Section>
  );
}