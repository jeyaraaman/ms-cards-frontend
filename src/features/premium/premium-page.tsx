"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { PremiumHero } from "./components/premium-hero";
import { PremiumServices } from "./components/premium-services";
import { PremiumCTA } from "./components/premium-cta";

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

  featured_on_home: boolean;
  home_display_order: number | null;
}

interface Collection {
  id: number;
  name: string;
  slug: string;

  description: string;

  image: string;

  cloudinary_public_id: string;

  active: boolean;

  product_count: number;
}

/* ============================================================
   PREMIUM PAGE
============================================================ */

export function PremiumPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [collection, setCollection] =
    useState<Collection | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     FETCH PREMIUM DATA
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchPremiumData() {
      try {
        setLoading(true);
        setError("");

        /* ======================================================
           FETCH CATEGORIES, PRODUCTS AND COLLECTION
        ====================================================== */

        const [
          categoriesResponse,
          productsResponse,
          collectionsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/products/categories/`,
            {
              cache: "no-store",
            },
          ),

          fetch(
            `${API_URL}/api/products/`,
            {
              cache: "no-store",
            },
          ),

          fetch(
            `${API_URL}/api/products/collections/`,
            {
              cache: "no-store",
            },
          ),
        ]);

        /* ======================================================
           VALIDATE RESPONSES
        ====================================================== */

        if (!categoriesResponse.ok) {
          throw new Error(
            "Failed to fetch categories.",
          );
        }

        if (!productsResponse.ok) {
          throw new Error(
            "Failed to fetch products.",
          );
        }

        if (!collectionsResponse.ok) {
          throw new Error(
            "Failed to fetch collections.",
          );
        }

        /* ======================================================
           PARSE RESPONSES
        ====================================================== */

        const categoriesData =
          await categoriesResponse.json();

        const productsData =
          await productsResponse.json();

        const collectionsData =
          await collectionsResponse.json();

        /* ======================================================
           NORMALIZE CATEGORIES
        ====================================================== */

        const allCategories: Category[] =
          Array.isArray(categoriesData)
            ? categoriesData
            : Array.isArray(
                  categoriesData?.results,
                )
              ? categoriesData.results
              : [];

        /* ======================================================
           NORMALIZE PRODUCTS
        ====================================================== */

        const allProducts: Product[] =
          Array.isArray(productsData)
            ? productsData
            : Array.isArray(
                  productsData?.results,
                )
              ? productsData.results
              : [];

        /* ======================================================
           NORMALIZE COLLECTIONS
        ====================================================== */

        const allCollections: Collection[] =
          Array.isArray(collectionsData)
            ? collectionsData
            : Array.isArray(
                  collectionsData?.results,
                )
              ? collectionsData.results
              : [];

        /* ======================================================
           FIND PREMIUM COLLECTION
        ====================================================== */

        const premiumCollection =
          allCollections.find(
            (item) =>
              item.slug ===
                PREMIUM_COLLECTION_SLUG &&
              item.active,
          ) ?? null;

        /* ======================================================
           PREMIUM CATEGORIES
        ====================================================== */

        const premiumCategories =
          allCategories
            .filter(
              (category) =>
                category.active &&
                category.collection_slug ===
                  PREMIUM_COLLECTION_SLUG,
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name,
              ),
            );

        /* ======================================================
           PREMIUM PRODUCTS
        ====================================================== */

        const premiumProducts =
          allProducts
            .filter(
              (product) =>
                product.active &&
                !product.is_deleted &&
                Array.isArray(
                  product.collection_slugs,
                ) &&
                product.collection_slugs.includes(
                  PREMIUM_COLLECTION_SLUG,
                ),
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name,
              ),
            );

        /* ======================================================
           DEBUG
        ====================================================== */

        console.log(
          "Premium Collection:",
          premiumCollection,
        );

        console.log(
          "Premium Categories:",
          premiumCategories,
        );

        /* ======================================================
           SAVE DATA
        ====================================================== */

        if (!cancelled) {
          setCollection(
            premiumCollection,
          );

          setCategories(
            premiumCategories,
          );

          setProducts(
            premiumProducts,
          );
        }
      } catch (err) {
        console.error(
          "Failed to load premium page:",
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

    fetchPremiumData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     HERO IMAGE
     
     IMPORTANT:
     
     Use the actual Collection image from
     Django Admin.

     Do NOT use the first category image.
  ============================================================ */

  const heroImage = useMemo(() => {
    return collection?.image || undefined;
  }, [collection]);

  /* ============================================================
     HANDLE HASH NAVIGATION
     
     Example:
     
     /premium#wedding-invitations
     
     Wait until the categories have rendered,
     then scroll to the exact category.
  ============================================================ */

  useEffect(() => {
    if (loading) {
      return;
    }

    if (categories.length === 0) {
      return;
    }

    const rawHash =
      window.location.hash;

    const hash = rawHash
      ? decodeURIComponent(
          rawHash.substring(1),
        )
      : "";

    /* ==========================================================
       NO HASH
       
       /premium
       
       → Premium Hero
    ========================================================== */

    if (!hash) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      return;
    }

    /* ==========================================================
       FIND TARGET CATEGORY
    ========================================================== */

    function scrollToTarget() {
      const element =
        document.getElementById(
          hash,
        );

      if (!element) {
        return false;
      }

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return true;
    }

    /* ==========================================================
       TRY IMMEDIATELY
    ========================================================== */

    if (scrollToTarget()) {
      return;
    }

    /* ==========================================================
       RETRY AFTER RENDER
    ========================================================== */

    const timer =
      window.setTimeout(() => {
        if (scrollToTarget()) {
          return;
        }

        window.setTimeout(() => {
          scrollToTarget();
        }, 150);
      }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    loading,
    categories,
  ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main>
        <PremiumHero />

        <div
          className="
            py-20
            text-center
            text-muted-foreground
          "
        >
          Loading premium collections...
        </div>
      </main>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <main>
        <PremiumHero />

        <div
          className="
            px-6
            py-20
            text-center
            text-destructive
          "
        >
          {error}
        </div>

        <PremiumCTA />
      </main>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (categories.length === 0) {
    return (
      <main>
        <PremiumHero
          image={heroImage}
        />

        <section
          id="premium-collections"
          className="
            px-6
            py-20
          "
        >
          <div
            className="
              mx-auto
              max-w-3xl
              rounded-2xl
              border
              border-dashed
              border-border
              bg-muted/20
              px-6
              py-20
              text-center
            "
          >
            <h2
              className="
                font-heading
                text-3xl
                text-foreground
              "
            >
              Premium Collections
              Coming Soon
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-lg
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Our premium invitation
              collections are currently
              being prepared.
            </p>
          </div>
        </section>

        <PremiumCTA />
      </main>
    );
  }

  /* ============================================================
     MAIN PAGE
  ============================================================ */

  return (
    <main>
      {/* ======================================================
          HERO
      ======================================================= */}

      <PremiumHero
        image={heroImage}
      />

      {/* ======================================================
          PREMIUM CATEGORIES + PRODUCTS
      ======================================================= */}

      <PremiumServices
        categories={categories}
        products={products}
      />

      {/* ======================================================
          CTA
      ======================================================= */}

      <PremiumCTA />
    </main>
  );
}