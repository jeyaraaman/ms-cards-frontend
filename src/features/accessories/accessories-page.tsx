import { AccessoriesHero } from "./components/accessories-hero";
import { AccessoriesServices } from "./components/accessories-services";
import { AccessoriesCTA } from "./components/accessories-cta";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const ACCESSORIES_COLLECTION_SLUG =
  "accessories";

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
   GET PRODUCTS
============================================================ */

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products: ${response.status}`,
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to load products:",
      error,
    );

    return [];
  }
}

/* ============================================================
   GET CATEGORIES
============================================================ */

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/categories/`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status}`,
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to load categories:",
      error,
    );

    return [];
  }
}

/* ============================================================
   GET ACCESSORIES COLLECTION
============================================================ */

async function getAccessoriesCollection(): Promise<Collection | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/collections/`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch collections: ${response.status}`,
      );
    }

    const data =
      await response.json();

    const collections: Collection[] =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

    return (
      collections.find(
        (collection) =>
          collection.slug ===
            ACCESSORIES_COLLECTION_SLUG &&
          collection.active,
      ) ?? null
    );
  } catch (error) {
    console.error(
      "Failed to load Accessories collection:",
      error,
    );

    return null;
  }
}

/* ============================================================
   ACCESSORIES PAGE
============================================================ */

export async function AccessoriesPage() {
  /*
   * Load all required datasets in parallel.
   */
  const [
    allCategories,
    allProducts,
    accessoriesCollection,
  ] = await Promise.all([
    getCategories(),
    getProducts(),
    getAccessoriesCollection(),
  ]);

  /* ==========================================================
     ACCESSORIES CATEGORIES
  ========================================================== */

  const accessoriesCategories =
    allCategories.filter(
      (category) =>
        category.active &&
        category.collection_slug ===
          ACCESSORIES_COLLECTION_SLUG,
    );

  /* ==========================================================
     ATTACH PRODUCTS TO CATEGORIES
  ========================================================== */

  const categoriesWithProducts =
    accessoriesCategories.map(
      (category) => {
        const products =
          allProducts.filter(
            (product) =>
              product.active &&
              !product.is_deleted &&
              product.category_slug ===
                category.slug &&
              Array.isArray(
                product.collection_slugs,
              ) &&
              product.collection_slugs.includes(
                ACCESSORIES_COLLECTION_SLUG,
              ),
          );

        return {
          ...category,
          products,
        };
      },
    );

  /* ==========================================================
     COLLECTION HERO IMAGE
     
     This now comes directly from the
     Accessories Collection in Django Admin.
  ========================================================== */

  const heroImage =
    accessoriesCollection?.image ||
    undefined;

  return (
    <main>
      {/* ======================================================
          HERO
      ======================================================= */}

      <AccessoriesHero
        image={heroImage}
      />

      {/* ======================================================
          ACCESSORIES CATEGORIES
      ======================================================= */}

      <AccessoriesServices
        categories={
          categoriesWithProducts
        }
      />

      {/* ======================================================
          CTA
      ======================================================= */}

      <AccessoriesCTA />
    </main>
  );
}