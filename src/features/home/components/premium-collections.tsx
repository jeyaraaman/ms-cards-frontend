"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

import { getImageUrl } from "@/lib/image-url";

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   PREMIUM COLLECTION
============================================================ */

const PREMIUM_COLLECTION_SLUG =
  "premium-collection";

/* ============================================================
   TYPES
============================================================ */

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

  /*
   * Admin-controlled Home page settings
   */
  featured_on_home: boolean;

  home_display_order: number | null;
}

/* ============================================================
   PREMIUM COLLECTIONS
============================================================ */

export function PremiumCollections() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     FETCH HOME PREMIUM CATEGORIES
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchPremiumCategories() {
      try {
        setLoading(true);

        setError("");

        /*
         * IMPORTANT
         *
         * The correct Category API endpoint is:
         *
         * /api/products/categories/
         *
         * NOT:
         *
         * /api/categories/
         */

        const response =
          await fetch(
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

        /* ======================================================
           SUPPORT ARRAY + PAGINATED RESPONSE
        ======================================================= */

        const categoryList: Category[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.results,
                )
              ? data.results
              : [];

        /* ======================================================
           FILTER HOME PREMIUM CATEGORIES
        ======================================================= */

        const premiumCategories =
          categoryList
            .filter(
              (category) =>
                /*
                 * 1. Category must be active
                 */
                category.active &&

                /*
                 * 2. Category must belong to the
                 *    Premium Collection
                 */
                category.collection_slug ===
                  PREMIUM_COLLECTION_SLUG &&

                /*
                 * 3. Client must explicitly select
                 *    Featured on Home
                 */
                category.featured_on_home ===
                  true,
            )

            /* ==================================================
               SORT USING ADMIN DISPLAY ORDER
            ================================================== */

            .sort(
              (a, b) =>
                (
                  a.home_display_order ??
                  999
                ) -
                (
                  b.home_display_order ??
                  999
                ),
            )

            /*
             * Only the first 4 are allowed to appear.
             *
             * Backend already enforces the maximum,
             * but this protects the frontend too.
             */
            .slice(0, 4);

        /* ======================================================
           DEBUG
        ======================================================= */

        console.log(
          "Home Premium Categories:",
          premiumCategories,
        );

        /* ======================================================
           SAVE
        ======================================================= */

        if (!cancelled) {
          setCategories(
            premiumCategories,
          );
        }
      } catch (err) {
        console.error(
          "Failed to load Home Premium Collection:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load premium collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPremiumCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Section
      className="
        relative
        overflow-hidden
        pt-20
        pb-20
        lg:pt-28
        lg:pb-28
      "
    >
      {/* ======================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-48
          top-20
          h-96
          w-96
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-48
          bottom-20
          h-96
          w-96
          rounded-full
          bg-[#c6a15b]/7
          blur-3xl
        "
      />

      <Container>

        {/* ==================================================
            SECTION HEADER
        ================================================== */}

        <div
          className="
            relative
            mb-12
            min-h-[170px]
            lg:mb-14
          "
        >
          {/* ==================================================
              CENTERED HEADING

              This is centered relative to the entire
              Container/page.

              View More does NOT affect its position.
          ================================================== */}

          <div
            className="
              mx-auto
              max-w-3xl
              text-center
            "
          >
            <SectionHeading
              eyebrow="Luxury Collection"
              title="Premium Invitation Collections"
              description="Discover our finest invitation collections crafted with premium materials and exceptional finishes."
            />
          </div>

          {/* ==================================================
              VIEW MORE

              IMPORTANT:
              This remains on the right side.

              It is absolutely positioned so it does
              not push the heading away from the center.
          ================================================== */}

          {!loading &&
            !error &&
            categories.length > 0 && (
              <Link
  href="/premium"
  className="
    group
    absolute
    right-0
    top-1/2
    inline-flex
    -translate-y-1/2
    items-center
    gap-2
    rounded-full
    bg-primary
    px-6
    py-3
    text-sm
    font-semibold
    text-white
    shadow-lg
    transition-all
    duration-300
    hover:bg-primary/90
    hover:shadow-xl
    hover:-translate-y-1/2
  "
>
  View More

  <ArrowRight
    className="
      h-4
      w-4
      transition-transform
      duration-200
      group-hover:translate-x-1
    "
  />
</Link>
            )}
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div
            className="
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border
                    bg-card
                  "
                >
                  {/* Image skeleton */}

                  <div
                    className="
                      aspect-[4/5]
                      animate-pulse
                      bg-muted
                    "
                  />

                  {/* Content skeleton */}

                  <div className="space-y-4 p-6">
                    <div
                      className="
                        h-3
                        w-28
                        animate-pulse
                        rounded
                        bg-muted
                      "
                    />

                    <div
                      className="
                        h-6
                        w-3/4
                        animate-pulse
                        rounded
                        bg-muted
                      "
                    />

                    <div
                      className="
                        h-4
                        w-full
                        animate-pulse
                        rounded
                        bg-muted
                      "
                    />

                    <div
                      className="
                        h-4
                        w-2/3
                        animate-pulse
                        rounded
                        bg-muted
                      "
                    />

                    <div
                      className="
                        h-4
                        w-28
                        animate-pulse
                        rounded
                        bg-muted
                      "
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {!loading &&
          error && (
            <div
              className="
                rounded-2xl
                border
                border-destructive/30
                bg-destructive/5
                p-8
                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {error}
              </p>
            </div>
          )}

        {/* ====================================================
            FEATURED PREMIUM CATEGORIES
        ==================================================== */}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {categories.map(
                (category) => (
                  <Link
                    key={category.id}
                    href={`/premium#${category.slug}`}
                    className="
                      group
                      block
                    "
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
                      {/* ==========================================
                          IMAGE
                      ========================================== */}

                      <div
                        className="
                          relative
                          aspect-[4/5]
                          overflow-hidden
                          bg-muted
                        "
                      >
                        {category.image ? (
                          <Image
                            src={getImageUrl(
                              category.image,
                            )}
                            alt={
                              category.name
                            }
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

                      {/* ==========================================
                          CONTENT
                      ========================================== */}

                      <div
                        className="
                          flex
                          min-h-[150px]
                          flex-col
                          p-5
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-primary
                          "
                        >
                          Premium Collection
                        </p>

                        <h3
                          className="
                            mt-3
                            font-heading
                            text-xl
                            text-foreground
                          "
                        >
                          {category.name}
                        </h3>

                        {category.description && (
                          <p
                            className="
                              mt-2
                              line-clamp-2
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

                        {/* ========================================
                            VIEW CATEGORY
                        ======================================== */}

                        <div
                          className="
                            mt-auto
                            flex
                            items-center
                            gap-2
                            pt-4
                            text-sm
                            font-medium
                            text-primary
                          "
                        >
                          Explore Category

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
          )}

        {/* ====================================================
            NO FEATURED CATEGORIES
        ==================================================== */}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-border
                bg-muted/10
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
                Premium Collections
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
                Premium Collection categories
                selected for the Home page will
                appear here.
              </p>

              <Link
                href="/premium"
                className="
                  group
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-primary
                "
              >
                Explore Premium Collection

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          )}
      </Container>
    </Section>
  );
}