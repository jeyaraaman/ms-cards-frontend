"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { adminFetch } from "@/lib/admin-fetch";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type Category = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
};

type Collection = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  slug: string;

  category: number | null;
  category_name?: string;
  category_slug?: string;

  collection_ids?: number[];
  collection_slugs?: string[];
  collection_names?: string[];

  material: string;
  image: string;
  description: string;

  featured: boolean;
  active: boolean;
  is_deleted?: boolean;
};

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const rawSlug = params?.slug;

  const productSlug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
        ? rawSlug[0]
        : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [category, setCategory] =
    useState("");

  const [collection, setCollection] =
    useState("");

  const [material, setMaterial] =
    useState("");

  const [image, setImage] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [featured, setFeatured] =
    useState(false);

  const [active, setActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Load product, categories and collections
   */
  useEffect(() => {
    if (!productSlug) {
      setError("Product slug is missing.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * Categories and collections are under
         * /api/products/categories/
         * /api/products/collections/
         *
         * Product is under
         * /api/products/<slug>/
         */
        const [
          productResponse,
          categoriesResponse,
          collectionsResponse,
        ] = await Promise.all([
          adminFetch(
            `${API_URL}/api/products/${encodeURIComponent(
              productSlug,
            )}/`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            },
          ),

          adminFetch(
            `${API_URL}/api/products/categories/`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            },
          ),

          adminFetch(
            `${API_URL}/api/products/collections/`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            },
          ),
        ]);

        /*
         * Product
         */
        if (!productResponse.ok) {
          const text =
            await productResponse.text();

          console.error(
            "Product API error:",
            productResponse.status,
            text,
          );

          throw new Error(
            `Failed to load product (${productResponse.status}).`,
          );
        }

        /*
         * Categories
         */
        if (!categoriesResponse.ok) {
          const text =
            await categoriesResponse.text();

          console.error(
            "Categories API error:",
            categoriesResponse.status,
            text,
          );

          throw new Error(
            `Failed to load categories (${categoriesResponse.status}).`,
          );
        }

        /*
         * Collections
         */
        if (!collectionsResponse.ok) {
          const text =
            await collectionsResponse.text();

          console.error(
            "Collections API error:",
            collectionsResponse.status,
            text,
          );

          throw new Error(
            `Failed to load collections (${collectionsResponse.status}).`,
          );
        }

        const productData: Product =
          await productResponse.json();

        const categoriesJson =
          await categoriesResponse.json();

        const collectionsJson =
          await collectionsResponse.json();

        /*
         * Support both normal arrays and
         * DRF pagination.
         */
        const categoriesData: Category[] =
          Array.isArray(categoriesJson)
            ? categoriesJson
            : Array.isArray(
                  categoriesJson?.results,
                )
              ? categoriesJson.results
              : [];

        const collectionsData: Collection[] =
          Array.isArray(collectionsJson)
            ? collectionsJson
            : Array.isArray(
                  collectionsJson?.results,
                )
              ? collectionsJson.results
              : [];

        /*
         * Save product
         */
        setProduct(productData);

        setName(productData.name || "");

        setSlug(productData.slug || "");

        /*
         * Existing category
         */
        setCategory(
          productData.category !== null &&
            productData.category !== undefined
            ? String(productData.category)
            : "",
        );

        /*
         * Existing collection
         *
         * Backend returns:
         *
         * collection_ids: [8]
         * collection_names: ["Commercial Printing"]
         * collection_slugs: ["commercial-printing"]
         *
         * We use collection_ids for the
         * dropdown value.
         */
        const existingCollectionId =
          Array.isArray(
            productData.collection_ids,
          ) &&
          productData.collection_ids.length > 0
            ? productData.collection_ids[0]
            : null;

        setCollection(
          existingCollectionId !== null
            ? String(existingCollectionId)
            : "",
        );

        setMaterial(
          productData.material || "",
        );

        setImage(
          productData.image || "",
        );

        setDescription(
          productData.description || "",
        );

        setFeatured(
          Boolean(productData.featured),
        );

        setActive(
          Boolean(productData.active),
        );

        /*
         * Only active categories/collections
         */
        setCategories(
          categoriesData.filter(
            (item) => item.active,
          ),
        );

        setCollections(
          collectionsData.filter(
            (item) => item.active,
          ),
        );

        console.log(
          "Loaded product:",
          productData,
        );

        console.log(
          "Existing collection:",
          productData.collection_ids,
          productData.collection_names,
        );

        console.log(
          "Available collections:",
          collectionsData,
        );
      } catch (err) {
        console.error(
          "Failed to load edit product:",
          err,
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Unable to load product.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productSlug, router]);

  /*
   * Slug
   */
  function handleSlugChange(
    value: string,
  ) {
    setSlug(generateSlug(value));
  }

  /*
   * Save product
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!productSlug) {
        throw new Error(
          "Product slug is missing.",
        );
      }

      const normalizedSlug =
        generateSlug(slug);

      if (!normalizedSlug) {
        throw new Error(
          "Please enter a valid product slug.",
        );
      }

      /*
       * =====================================================
       * IMPORTANT COLLECTION UPDATE
       * =====================================================
       *
       * collection_ids is a READ representation.
       *
       * For UPDATE we send:
       *
       * collections: [collectionId]
       *
       * Example:
       *
       * Commercial Printing = 8
       *
       * {
       *   collections: [8]
       * }
       *
       * This updates the ManyToMany relationship.
       */
      const collectionIds =
        collection !== ""
          ? [Number(collection)]
          : [];

      const requestBody = {
        name: name.trim(),

        slug: normalizedSlug,

        category:
          category !== ""
            ? Number(category)
            : null,

        /*
         * THIS IS THE IMPORTANT FIX
         */
        collections: collectionIds,

        material: material.trim(),

        image: image.trim(),

        description:
          description.trim(),

        featured,

        active,
      };

      console.log(
        "================================",
      );

      console.log(
        "UPDATING PRODUCT",
      );

      console.log(
        "Product:",
        productSlug,
      );

      console.log(
        "Selected category:",
        category,
      );

      console.log(
        "Selected collection:",
        collection,
      );

      console.log(
        "Collection IDs:",
        collectionIds,
      );

      console.log(
        "Request body:",
        requestBody,
      );

      console.log(
        "================================",
      );

      /*
       * PATCH product
       */
      const response = await adminFetch(
        `${API_URL}/api/products/${encodeURIComponent(
          productSlug,
        )}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            requestBody,
          ),
        },
      );

      const responseText =
        await response.text();

      let responseData: unknown = null;

      try {
        responseData =
          responseText
            ? JSON.parse(responseText)
            : null;
      } catch {
        responseData = responseText;
      }

      console.log(
        "Update status:",
        response.status,
      );

      console.log(
        "Update response:",
        responseData,
      );

      /*
       * Error
       */
      if (!response.ok) {
        console.error(
          "Product update failed:",
          responseData,
        );

        let message =
          "Failed to update product.";

        if (
          responseData &&
          typeof responseData ===
            "object"
        ) {
          const messages =
            Object.entries(
              responseData as Record<
                string,
                unknown
              >,
            ).flatMap(
              ([field, value]) => {
                if (
                  Array.isArray(value)
                ) {
                  return value.map(
                    (item) =>
                      `${field}: ${String(
                        item,
                      )}`,
                  );
                }

                return [
                  `${field}: ${String(
                    value,
                  )}`,
                ];
              },
            );

          if (messages.length > 0) {
            message =
              messages.join(" ");
          }
        } else if (
          typeof responseData === "string" &&
          responseData
        ) {
          message = responseData;
        }

        throw new Error(message);
      }

      /*
       * Success
       */
      console.log(
        "Product updated successfully.",
      );

      setSuccess(
        "Product updated successfully.",
      );

      /*
       * Give the user a moment to see
       * the success message.
       *
       * Then return to products.
       */
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "Update product error:",
        err,
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to update product.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-muted-foreground">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Product not found
   */
  if (!product) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {error ||
              "Product could not be found."}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/products",
              )
            }
            className="mt-5 rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted"
          >
            ← Back to Products
          </button>
        </div>
      </main>
    );
  }

  /*
   * Find selected collection name
   */
  const selectedCollection =
    collections.find(
      (item) =>
        String(item.id) ===
        collection,
    );

  /*
   * Find selected category name
   */
  const selectedCategory =
    categories.find(
      (item) =>
        String(item.id) ===
        category,
    );

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-10 lg:py-12">
        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/products",
            )
          }
          className="mb-6 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Products
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl text-primary lg:text-5xl">
            Edit Product
          </h1>

          <p className="mt-2 text-muted-foreground">
            Update product information,
            collection and settings.
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* ================================================= */}
          {/* PRODUCT INFORMATION */}
          {/* ================================================= */}
          <div className="rounded-2xl border bg-card p-6 lg:p-8">
            <h2 className="font-heading text-xl">
              Product Information
            </h2>

            <div className="mt-7 space-y-6">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  required
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Changing the product name
                  will not automatically
                  change the slug.
                </p>
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="product-slug"
                  className="mb-2 block text-sm font-medium"
                >
                  Slug
                </label>

                <input
                  id="product-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(
                      event.target.value,
                    )
                  }
                  required
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Edit this only when you
                  intentionally want to
                  change the product URL.
                </p>
              </div>

              {/* Category + Collection */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Category */}
                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>

                  <select
                    id="product-category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value,
                      )
                    }
                    required
                    className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>

                  {selectedCategory && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Current category:{" "}
                      <span className="font-medium text-foreground">
                        {
                          selectedCategory.name
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* Collection */}
                <div>
                  <label
                    htmlFor="product-collection"
                    className="mb-2 block text-sm font-medium"
                  >
                    Collection
                  </label>

                  <select
                    id="product-collection"
                    value={collection}
                    onChange={(event) =>
                      setCollection(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      No Collection
                    </option>

                    {collections.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Choose the main website
                    section where this
                    product should appear.
                  </p>

                  {selectedCollection && (
                    <p className="mt-2 text-xs text-primary">
                      Current collection:{" "}
                      <span className="font-semibold">
                        {
                          selectedCollection.name
                        }
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Material */}
              <div>
                <label
                  htmlFor="product-material"
                  className="mb-2 block text-sm font-medium"
                >
                  Material
                </label>

                <input
                  id="product-material"
                  type="text"
                  value={material}
                  onChange={(event) =>
                    setMaterial(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="product-image"
                  className="mb-2 block text-sm font-medium"
                >
                  Image Path
                </label>

                <input
                  id="product-image"
                  type="text"
                  value={image}
                  onChange={(event) =>
                    setImage(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                {image && (
                  <p className="mt-2 break-all text-xs text-muted-foreground">
                    {image}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="product-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={6}
                  className="w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* COLLECTION PREVIEW */}
          {/* ================================================= */}
          <div className="rounded-2xl border bg-card p-6 lg:p-8">
            <h2 className="font-heading text-xl">
              Catalogue Placement
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This determines which section and
              category will display the product
              on the customer-facing website.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </p>

                <p className="mt-2 text-lg font-medium">
                  {selectedCategory?.name ||
                    "Not selected"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collection
                </p>

                <p className="mt-2 text-lg font-medium">
                  {selectedCollection?.name ||
                    "No Collection"}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* SETTINGS */}
          {/* ================================================= */}
          <div className="rounded-2xl border bg-card p-6 lg:p-8">
            <h2 className="font-heading text-xl">
              Product Settings
            </h2>

            <div className="mt-6 space-y-6">
              {/* Featured */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Featured Product
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Show this product as a
                    featured product.
                  </p>
                </div>
              </label>

              {/* Active */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Active Product
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Active products are
                    visible on the public
                    catalogue.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push(
                  "/admin/products",
                )
              }
              className="rounded-lg border bg-background px-6 py-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}