import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";
import { ProductImageGallery } from "@/components/common/product-image-gallery";

/* ============================================================
   PRODUCT IMAGE
============================================================ */

interface ProductImage {
  id: number;

  image: string;

  cloudinary_public_id?: string;

  is_primary: boolean;

  display_order: number;

  created_at?: string;

  updated_at?: string;
}

/* ============================================================
   PRODUCT
============================================================ */

interface Product {
  id: number;

  name: string;

  slug: string;

  category: number;

  category_name: string;

  category_slug: string;

  collections?: number[];

  collection_ids: number[];

  collection_slugs: string[];

  collection_names: string[];

  material: string;

  image: string;

  cloudinary_public_id?: string;

  /*
   * Multiple product images.
   */
  images?: ProductImage[];

  description: string;

  featured: boolean;

  active: boolean;

  is_deleted?: boolean;
}

/* ============================================================
   PAGE PROPS
============================================================ */

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;
}

/* ============================================================
   CONFIGURATION
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const SITE_URL =
  "https://meenakshiscreen.com";

const SITE_NAME =
  "Meenakshi Screen";

/* ============================================================
   GET PRODUCT
============================================================ */

async function getProduct(
  slug: string,
): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/${slug}/`,
      {
        cache: "no-store",
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
   CLEAN DESCRIPTION FOR SEO
============================================================ */

function getSeoDescription(
  product: Product,
): string {
  const description =
    product.description?.trim();

  if (description) {
    return description.length > 160
      ? `${description.slice(0, 157)}...`
      : description;
  }

  const category =
    product.category_name?.trim();

  const material =
    product.material?.trim();

  if (category && material) {
    return `${product.name} — a ${material} ${category} from ${SITE_NAME}, featuring premium design and customized printing.`;
  }

  if (category) {
    return `${product.name} — a premium ${category} design from ${SITE_NAME}, with customized printing available.`;
  }

  return `${product.name} — a premium invitation and printing design from ${SITE_NAME}.`;
}

/* ============================================================
   GET ALL PRODUCT IMAGES FOR SEO
============================================================ */

function getProductImages(
  product: Product,
): string[] {
  const images =
    product.images
      ?.filter(
        (item) =>
          item.image &&
          typeof item.image === "string",
      )
      .sort(
        (a, b) =>
          a.display_order -
          b.display_order,
      )
      .map(
        (item) => item.image,
      ) || [];

  /*
   * Fallback for products created before
   * the multiple-image system.
   */
  if (
    images.length === 0 &&
    product.image
  ) {
    return [product.image];
  }

  return images;
}

/* ============================================================
   DYNAMIC PRODUCT SEO
============================================================ */

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product =
    await getProduct(id);

  /* ==========================================================
     PRODUCT NOT FOUND
  ========================================================== */

  if (!product) {
    return {
      title: "Product Not Found",

      description:
        "The requested product could not be found.",

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
    `${product.name} | ${SITE_NAME}`;

  const description =
    getSeoDescription(product);

  const canonicalUrl =
    `${SITE_URL}/catalogue/${encodeURIComponent(
      product.slug,
    )}`;

  const keywords = [
    product.name,
    product.category_name,
    product.material,
    ...(product.collection_names || []),
    "Wedding Invitations",
    "Wedding Cards",
    "Invitation Printing",
    "Premium Wedding Cards",
    "Meenakshi Screen",
  ].filter(Boolean);

  const productImages =
    getProductImages(product);

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
      index:
        product.active !== false &&
        product.is_deleted !== true,

      follow:
        product.active !== false &&
        product.is_deleted !== true,

      googleBot: {
        index:
          product.active !== false &&
          product.is_deleted !== true,

        follow:
          product.active !== false &&
          product.is_deleted !== true,

        "max-image-preview":
          "large",

        "max-snippet": -1,

        "max-video-preview": -1,
      },
    },

    /* ========================================================
       OPEN GRAPH
    ======================================================== */

    openGraph: {
      type: "website",

      url: canonicalUrl,

      siteName: SITE_NAME,

      locale: "en_IN",

      title,

      description,

      ...(productImages.length > 0
        ? {
            images: productImages.map(
              (image, index) => ({
                url: image,

                alt:
                  index === 0
                    ? product.name
                    : `${product.name} - Image ${
                        index + 1
                      }`,

                width: 1200,

                height: 900,
              }),
            ),
          }
        : {}),
    },

    /* ========================================================
       TWITTER
    ======================================================== */

    twitter: {
      card: "summary_large_image",

      title,

      description,

      ...(productImages.length > 0
        ? {
            images: [
              productImages[0],
            ],
          }
        : {}),
    },
  };
}

/* ============================================================
   BACK DESTINATION
============================================================ */

function getBackDestination(
  from?: string,
) {
  switch (from) {
    case "premium":
      return {
        href: "/premium",

        label:
          "Back to Premium Collections",
      };

    case "printing":
      return {
        href: "/printing",

        label:
          "Back to Commercial Printing",
      };

    case "accessories":
      return {
        href: "/accessories",

        label:
          "Back to Accessories",
      };

    case "catalogue":
    default:
      return {
        href: "/catalogue",

        label:
          "Back to Catalogue",
      };
  }
}

/* ============================================================
   PRODUCT BREADCRUMB STRUCTURED DATA
============================================================ */

function ProductBreadcrumbJsonLd({
  product,
}: {
  product: Product;
}) {
  const productUrl =
    `${SITE_URL}/catalogue/${encodeURIComponent(
      product.slug,
    )}`;

  const breadcrumbItems = [
    {
      "@type": "ListItem",

      position: 1,

      name: "Home",

      item: SITE_URL,
    },

    {
      "@type": "ListItem",

      position: 2,

      name: "Catalogue",

      item: `${SITE_URL}/catalogue`,
    },
  ];

  if (product.category_name) {
    breadcrumbItems.push({
      "@type": "ListItem",

      position: 3,

      name: product.category_name,

      item: `${SITE_URL}/catalogue?category=${encodeURIComponent(
        product.category_slug,
      )}`,
    });
  }

  breadcrumbItems.push({
    "@type": "ListItem",

    position:
      breadcrumbItems.length + 1,

    name: product.name,

    item: productUrl,
  });

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement:
      breadcrumbItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          JSON.stringify(jsonLd),
      }}
    />
  );
}

/* ============================================================
   PRODUCT PAGE
============================================================ */

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } =
    await params;

  const { from } =
    await searchParams;

  const product =
    await getProduct(id);

  /* ==========================================================
     PRODUCT NOT FOUND
  ========================================================== */

  if (!product) {
    notFound();
  }

  const backDestination =
    getBackDestination(from);

  return (
    <section className="py-16 lg:py-20">
      <ProductBreadcrumbJsonLd
        product={product}
      />

      <Container>
        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          href={backDestination.href}
          className="
            group
            mb-10
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
          <ArrowLeft
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          />

          {backDestination.label}
        </Link>

        {/* ==================================================
            PRODUCT
        ================================================== */}

        <div
          className="
            grid
            items-start
            gap-12
            lg:grid-cols-2
            lg:gap-16
          "
        >
          {/* =================================================
              PRODUCT IMAGE GALLERY
          ================================================= */}

          <ProductImageGallery
            productName={product.name}
            primaryImage={product.image}
            images={product.images || []}
          />

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="max-w-xl">
            {/* CATEGORY */}

            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.25em]
                text-primary
              "
            >
              {product.category_name}
            </p>

            {/* PRODUCT NAME */}

            <h1
              className="
                mt-3
                font-heading
                text-4xl
                leading-tight
                text-foreground
                lg:text-5xl
              "
            >
              {product.name}
            </h1>

            {/* DESCRIPTION */}

            {product.description && (
              <p
                className="
                  mt-6
                  text-base
                  leading-7
                  text-muted-foreground
                "
              >
                {product.description}
              </p>
            )}

            {/* ==================================================
                INFORMATION
            ================================================== */}

            <div
              className="
                mt-10
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-card
              "
            >
              {/* ==============================================
                  MATERIAL
              ============================================== */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border
                  px-6
                  py-5
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                    text-muted-foreground
                  "
                >
                  Model
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  {product.material || "—"}
                </span>
              </div>

              {/* ==============================================
                  CATEGORY
              ============================================== */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border
                  px-6
                  py-5
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                    text-muted-foreground
                  "
                >
                  Category
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  {product.category_name}
                </span>
              </div>

              {/* ==============================================
                  COLLECTIONS
              ============================================== */}

              {product.collection_names?.length >
                0 && (
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-6
                    px-6
                    py-5
                  "
                >
                  <span
                    className="
                      shrink-0
                      text-sm
                      font-medium
                      text-muted-foreground
                    "
                  >
                    Collection
                  </span>

                  <div
                    className="
                      flex
                      flex-wrap
                      justify-end
                      gap-2
                    "
                  >
                    {product.collection_names.map(
                      (collection) => (
                        <span
                          key={collection}
                          className="
                            rounded-full
                            border
                            border-[#c6a15b]/20
                            bg-[#c6a15b]/10
                            px-3
                            py-1
                            text-xs
                            font-medium
                            text-foreground
                          "
                        >
                          {collection}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                ENQUIRY
            ================================================== */}

            <div className="mt-10">
              <Link
                href={`/enquiry?product=${product.slug}`}
                className="
                  group
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-primary
                  px-8
                  text-sm
                  font-semibold
                  text-primary-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-primary/90
                "
              >
                <MessageCircle
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />

                Send Enquiry

                <span
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </Link>

              <p
                className="
                  mt-4
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Interested in this design?
                Send us an enquiry and we&apos;ll
                help you with the details.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}