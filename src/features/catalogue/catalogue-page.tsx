"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import { Container } from "@/components/common/container";
import { ProductCard } from "@/components/common/product-card";
import { CatalogueToolbar } from "./components/catalogue-toolbar";

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
  description: string;
  image: string;
  active: boolean;
  product_count: number;

  collection?: number | null;
  collection_name?: string | null;
  collection_slug?: string | null;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  product_count: number;
}

interface ApiListResponse<T> {
  results?: T[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

function getArrayResponse<T>(
  data: T[] | ApiListResponse<T>,
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray(data.results)
  ) {
    return data.results;
  }

  return [];
}

export function CataloguePage() {
  const searchParams = useSearchParams();

  const categoryFromUrl =
    searchParams.get("category");

  const collectionFromUrl =
    searchParams.get("collection");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [activeCollection, setActiveCollection] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * READ FILTERS FROM URL
   * ============================================================
   */

  useEffect(() => {
    setActiveCategory(
      categoryFromUrl || "all",
    );

    setActiveCollection(
      collectionFromUrl || "all",
    );
  }, [
    categoryFromUrl,
    collectionFromUrl,
  ]);

  /*
   * ============================================================
   * FETCH CATALOGUE DATA
   * ============================================================
   */

  useEffect(() => {
    async function fetchCatalogueData() {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
          collectionsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/products/`,
            {
              cache: "no-store",
            },
          ),

          fetch(
            `${API_URL}/api/products/categories/`,
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

        /*
         * ========================================================
         * CHECK RESPONSES
         * ========================================================
         */

        if (!productsResponse.ok) {
          throw new Error(
            `Failed to fetch products. Status: ${productsResponse.status}`,
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to fetch categories. Status: ${categoriesResponse.status}`,
          );
        }

        if (!collectionsResponse.ok) {
          throw new Error(
            `Failed to fetch collections. Status: ${collectionsResponse.status}`,
          );
        }

        /*
         * ========================================================
         * PARSE RESPONSES
         * ========================================================
         */

        const productsJson =
          await productsResponse.json();

        const categoriesJson =
          await categoriesResponse.json();

        const collectionsJson =
          await collectionsResponse.json();

        const productsData =
          getArrayResponse<Product>(
            productsJson,
          );

        const categoriesData =
          getArrayResponse<Category>(
            categoriesJson,
          );

        const collectionsData =
          getArrayResponse<Collection>(
            collectionsJson,
          );

        /*
         * ========================================================
         * DEBUG
         * ========================================================
         */

        console.log(
          "Catalogue products:",
          productsData,
        );

        console.log(
          "Catalogue categories:",
          categoriesData,
        );

        console.log(
          "Catalogue collections:",
          collectionsData,
        );

        /*
         * ========================================================
         * ACTIVE CATEGORIES
         * ========================================================
         */

        const activeCategories =
          categoriesData.filter(
            (category) =>
              category.active,
          );

        setCategories(
          activeCategories,
        );

        /*
         * ========================================================
         * ACTIVE COLLECTIONS
         * ========================================================
         */

        const activeCollections =
          collectionsData
            .filter(
              (collection) =>
                collection.active,
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name,
              ),
            );

        setCollections(
          activeCollections,
        );

        /*
         * ========================================================
         * ACTIVE PRODUCTS
         * ========================================================
         */

        const activeProducts =
          productsData.filter(
            (product) =>
              product.active &&
              !product.is_deleted,
          );

        setProducts(
          activeProducts,
        );
      } catch (error) {
        console.error(
          "Failed to load catalogue:",
          error,
        );

        setError(
          "Unable to load catalogue.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogueData();
  }, []);

  /*
   * ============================================================
   * FILTER PRODUCTS
   * ============================================================
   */

  const filteredProducts =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesCategory =
            activeCategory === "all" ||
            product.category_slug ===
              activeCategory;

          const matchesCollection =
            activeCollection === "all" ||
            (
              Array.isArray(
                product.collection_slugs,
              ) &&
              product.collection_slugs.includes(
                activeCollection,
              )
            );

          const searchableValues = [
            product.name,
            product.category_name,
            product.material,
            product.description,
            ...(Array.isArray(
              product.collection_names,
            )
              ? product.collection_names
              : []),
          ];

          const matchesSearch =
            !query ||
            searchableValues.some(
              (value) =>
                typeof value ===
                  "string" &&
                value
                  .toLowerCase()
                  .includes(query),
            );

          return (
            matchesCategory &&
            matchesCollection &&
            matchesSearch
          );
        },
      );
    }, [
      products,
      searchQuery,
      activeCategory,
      activeCollection,
    ]);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section className="relative overflow-hidden py-16 lg:py-20">
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
          top-[35%]
          h-96
          w-96
          rounded-full
          bg-[#c6a15b]/6
          blur-3xl
        "
      />

      <Container>
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            glass
            relative
            mb-10
            overflow-hidden
            rounded-3xl
            px-6
            py-10
            md:px-10
            md:py-12
          "
        >
          {/* Burgundy glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-56
              w-56
              rounded-full
              bg-primary/8
              blur-3xl
            "
          />

          {/* Champagne glow */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-24
              h-56
              w-56
              rounded-full
              bg-[#c6a15b]/8
              blur-3xl
            "
          />

          <div className="relative z-10">
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.3em]
                text-primary
              "
            >
              Our Catalogue
            </p>

            <h1
              className="
                mt-4
                font-heading
                text-4xl
                leading-tight
                text-foreground
                lg:text-5xl
              "
            >
              Discover Your Perfect Invitation
            </h1>

            <p
              className="
                mt-4
                max-w-3xl
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              Explore our curated collection
              of premium wedding invitations,
              crafted with elegant materials and
              refined printing techniques.
            </p>
          </div>
        </div>

        {/* ==================================================
            FILTER TOOLBAR
            NO OUTER GLASS BOX
        ================================================== */}

        <div className="relative mb-10">
          <CatalogueToolbar
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            activeCollection={
              activeCollection
            }
            categories={categories}
            collections={collections}
            onSearchChange={
              setSearchQuery
            }
            onCategoryChange={
              setActiveCategory
            }
            onCollectionChange={
              setActiveCollection
            }
          />
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div
            className="
              glass
              rounded-3xl
              px-6
              py-20
              text-center
              text-muted-foreground
            "
          >
            Loading catalogue...
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (
          <div
            className="
              glass
              rounded-3xl
              px-6
              py-20
              text-center
              text-destructive
            "
          >
            {error}
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length ===
            0 && (
            <div
              className="
                glass
                rounded-3xl
                px-6
                py-20
                text-center
              "
            >
              <h2
                className="
                  font-heading
                  text-2xl
                  text-foreground
                "
              >
                No Products Found
              </h2>

              <p
                className="
                  mt-3
                  text-muted-foreground
                "
              >
                Try changing your search or
                filters.
              </p>
            </div>
          )}

        {/* ==================================================
            PRODUCTS
        ================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length >
            0 && (
            <>
              {/* Product count */}

              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >
                  Showing{" "}
                  <span
                    className="
                      font-medium
                      text-foreground
                    "
                  >
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length ===
                  1
                    ? "product"
                    : "products"}
                </p>
              </div>

              {/* ==================================================
                  PRODUCT GRID — 4 COLUMNS ON DESKTOP
              ================================================== */}

              <div
                className="
                  grid
                  gap-5
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.slug,
                        name: product.name,
                        category:
                          product.category_name,
                        material:
                          product.material,
                        image:
                          product.image,
                        featured:
                          product.featured,
                      }}
                    />
                  ),
                )}
              </div>
            </>
          )}
      </Container>
    </section>
  );
}