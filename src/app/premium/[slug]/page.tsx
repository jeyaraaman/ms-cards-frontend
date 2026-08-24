import type { Metadata } from "next";

import { PremiumCollectionPage } from "@/features/premium/premium-collection-page";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const SITE_URL =
  "https://meenakshiscreen.com";

const SITE_NAME =
  "Meenakshi Screen";

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  products: number[];
  product_details: unknown[];
  product_count: number;
  active: boolean;
}

/* ============================================================
   GET COLLECTION FOR SEO
============================================================ */

async function getCollection(
  slug: string,
): Promise<Collection | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/collections/${encodeURIComponent(
        slug,
      )}/`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/* ============================================================
   CLEAN DESCRIPTION
============================================================ */

function getSeoDescription(
  collection: Collection,
): string {
  const description =
    collection.description?.trim();

  if (description) {
    return description.length > 160
      ? `${description.slice(0, 157)}...`
      : description;
  }

  return `${collection.name} — explore premium wedding invitation designs and customized printing from ${SITE_NAME}.`;
}

/* ============================================================
   PREMIUM COLLECTION BREADCRUMB JSON-LD
============================================================ */

function PremiumCollectionBreadcrumbJsonLd({
  collection,
}: {
  collection: Collection;
}) {
  const collectionUrl =
    `${SITE_URL}/premium/${encodeURIComponent(
      collection.slug,
    )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Premium",
        item: `${SITE_URL}/premium`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.name,
        item: collectionUrl,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}

/* ============================================================
   DYNAMIC SEO METADATA
============================================================ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const collection =
    await getCollection(slug);

  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!collection) {
    return {
      title: "Collection Not Found",

      description:
        "The requested premium collection could not be found.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  /* ==========================================================
     INACTIVE COLLECTION
  ========================================================== */

  if (!collection.active) {
    return {
      title: "Collection Not Available",

      description:
        "This premium collection is currently not available.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  /* ==========================================================
     SEO VALUES
  ========================================================== */

  const title =
    `${collection.name} | ${SITE_NAME}`;

  const description =
    getSeoDescription(collection);

  const canonicalUrl =
    `${SITE_URL}/premium/${encodeURIComponent(
      collection.slug,
    )}`;

  const keywords = [
    collection.name,
    "Premium Wedding Invitations",
    "Wedding Invitation Cards",
    "Luxury Wedding Cards",
    "Wedding Cards",
    "Wedding Invitations",
    "Invitation Printing",
    "Customized Wedding Invitations",
    "Meenakshi Screen",
  ];

  /* ==========================================================
     METADATA
  ========================================================== */

  return {
    title,

    description,

    keywords,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",

      url: canonicalUrl,

      siteName: SITE_NAME,

      locale: "en_IN",

      title,

      description,

      ...(collection.image
        ? {
            images: [
              {
                url: collection.image,
                alt: collection.name,
                width: 1200,
                height: 900,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      ...(collection.image
        ? {
            images: [
              collection.image,
            ],
          }
        : {}),
    },
  };
}

/* ============================================================
   PAGE
============================================================ */

export default async function PremiumCollectionRoute({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const collection =
    await getCollection(slug);

  /*
   * The client component still handles the actual
   * page rendering and data loading.
   *
   * We only use this server-side collection fetch
   * for structured SEO data.
   */

  return (
    <>
      {collection &&
        collection.active && (
          <PremiumCollectionBreadcrumbJsonLd
            collection={collection}
          />
        )}

      <PremiumCollectionPage
        slug={slug}
      />
    </>
  );
}