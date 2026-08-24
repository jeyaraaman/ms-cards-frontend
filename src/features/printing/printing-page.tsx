"use client";

import { useEffect, useState } from "react";

import { PrintingHero } from "./components/printing-hero";
import { PrintingServices } from "./components/printing-services";
import { PrintingCTA } from "./components/printing-cta";

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   COMMERCIAL PRINTING COLLECTION
============================================================ */

const PRINTING_COLLECTION_SLUG =
  "commercial-printing";

/* ============================================================
   COLLECTION TYPE
============================================================ */

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
   PRINTING PAGE
============================================================ */

export function PrintingPage() {
  const [collection, setCollection] =
    useState<Collection | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* ==========================================================
     FETCH COMMERCIAL PRINTING COLLECTION
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchPrintingCollection() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/products/collections/`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch collections (${response.status})`,
          );
        }

        const data =
          await response.json();

        /* ======================================================
           SUPPORT ARRAY + PAGINATED RESPONSE
        ====================================================== */

        const collections: Collection[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.results,
                )
              ? data.results
              : [];

        /* ======================================================
           FIND COMMERCIAL PRINTING
        ====================================================== */

        const printingCollection =
          collections.find(
            (item) =>
              item.slug ===
                PRINTING_COLLECTION_SLUG &&
              item.active,
          ) ?? null;

        console.log(
          "Commercial Printing Collection:",
          printingCollection,
        );

        if (!cancelled) {
          setCollection(
            printingCollection,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load Commercial Printing collection:",
          error,
        );

        if (!cancelled) {
          setCollection(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrintingCollection();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     HERO IMAGE
     
     This comes directly from:
     
     Django Admin
       ↓
     Commercial Printing Collection
       ↓
     Collection.image
       ↓
     API
       ↓
     PrintingHero
  ============================================================ */

  const heroImage =
    collection?.image || undefined;

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main>
      {/* ======================================================
          HERO
      ======================================================= */}

      <PrintingHero
        image={heroImage}
      />

      {/* ======================================================
          SERVICES
      ======================================================= */}

      <PrintingServices />

      {/* ======================================================
          CTA
      ======================================================= */}

      <PrintingCTA />
    </main>
  );
}