import type { MetadataRoute } from "next";

const SITE_URL = "https://meenakshiscreen.com";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type Product = {
  slug?: string;
  updated_at?: string;
  active?: boolean;
  is_deleted?: boolean;
};

type Collection = {
  slug?: string;
  updated_at?: string;
  active?: boolean;
};

/* ============================================================
   API HELPER
============================================================ */

async function fetchJson<T>(
  path: string,
): Promise<T[]> {
  try {
    const response = await fetch(
      `${API_URL}${path}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  } catch {
    return [];
  }
}

/* ============================================================
   SAFE DATE
============================================================ */

function safeDate(
  value?: string,
): Date {
  const date = value
    ? new Date(value)
    : new Date();

  return Number.isNaN(
    date.getTime(),
  )
    ? new Date()
    : date;
}

/* ============================================================
   SITEMAP
============================================================ */

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const [
    products,
    collections,
  ] = await Promise.all([
    fetchJson<Product>(
      "/api/products/",
    ),

    fetchJson<Collection>(
      "/api/products/collections/",
    ),
  ]);

  /* ==========================================================
     STATIC PUBLIC PAGES
  ========================================================== */

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${SITE_URL}/catalogue`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/premium`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/printing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/accessories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${SITE_URL}/enquiry`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  /* ==========================================================
     PRODUCT PAGES
     
     Only active/non-deleted products are included.
  ========================================================== */

  const productRoutes: MetadataRoute.Sitemap =
    products
      .filter(
        (product) =>
          product.slug &&
          product.active !== false &&
          product.is_deleted !== true,
      )
      .map(
        (product) => ({
          url: `${SITE_URL}/catalogue/${encodeURIComponent(
            product.slug!,
          )}`,

          lastModified:
            safeDate(
              product.updated_at,
            ),

          changeFrequency:
            "weekly" as const,

          priority: 0.8,
        }),
      );

  /* ==========================================================
     PREMIUM COLLECTION PAGES
  ========================================================== */

  const collectionRoutes: MetadataRoute.Sitemap =
    collections
      .filter(
        (collection) =>
          collection.slug &&
          collection.active !== false,
      )
      .map(
        (collection) => ({
          url: `${SITE_URL}/premium/${encodeURIComponent(
            collection.slug!,
          )}`,

          lastModified:
            safeDate(
              collection.updated_at,
            ),

          changeFrequency:
            "weekly" as const,

          priority: 0.8,
        }),
      );

  /* ==========================================================
     FINAL SITEMAP
  ========================================================== */

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
  ];
}