"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-auth";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =========================================================
   TYPES
========================================================= */

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;

  image?: string;
  cloudinary_public_id?: string;

  active: boolean;

  product_count?: number;

  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;

  /*
   * Depending on the Django serializer,
   * collection may be:
   *
   * 1. number
   * 2. null
   * 3. object
   */
  collection?:
    | number
    | null
    | {
        id?: number;
        name?: string;
        slug?: string;
      };

  collection_name?: string | null;
  collection_slug?: string | null;

  description?: string;
  image?: string;
  cloudinary_public_id?: string;

  active: boolean;

  product_count?: number;
}

/* =========================================================
   COLLECTION ROW
========================================================= */

interface CollectionRow
  extends Collection {
  categories: Category[];
}

/* =========================================================
   API RESPONSE HELPER
========================================================= */

function getList<T>(
  data: unknown
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray(
      (data as { results?: unknown }).results
    )
  ) {
    return (
      (data as { results: T[] }).results
    );
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function CollectionsPage() {
  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [sortOption, setSortOption] =
    useState<
      "newest" | "oldest" | "name_asc" | "name_desc"
    >("newest");

  /* =======================================================
     FETCH COLLECTIONS + CATEGORIES
  ======================================================= */

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [
        collectionsResponse,
        categoriesResponse,
      ] = await Promise.all([
        adminFetch(
          `${API_URL}/api/products/collections/`,
          {
            cache: "no-store",
          }
        ),

        adminFetch(
          `${API_URL}/api/products/categories/`,
          {
            cache: "no-store",
          }
        ),
      ]);

      /* ---------------------------------------------------
         COLLECTIONS
      --------------------------------------------------- */

      if (!collectionsResponse.ok) {
        throw new Error(
          `Failed to load collections (${collectionsResponse.status})`
        );
      }

      /* ---------------------------------------------------
         CATEGORIES
      --------------------------------------------------- */

      if (!categoriesResponse.ok) {
        throw new Error(
          `Failed to load categories (${categoriesResponse.status})`
        );
      }

      const collectionsData =
        await collectionsResponse.json();

      const categoriesData =
        await categoriesResponse.json();

      const collectionList =
        getList<Collection>(
          collectionsData
        );

      const categoryList =
        getList<Category>(
          categoriesData
        );

      setCollections(
        collectionList
      );

      setCategories(
        categoryList
      );
    } catch (err) {
      console.error(
        "Failed to load collections:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load collections."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchData();
  }, []);

  /* =======================================================
     BUILD COLLECTION ROWS
     
     IMPORTANT:
     
     Categories are NOT derived from products.
     
     Instead:
     
     Category
        ↓
     category.collection
        ↓
     Collection
     
     This means if:
     
     Birthday → All
     
     the Collections page will show:
     
     All
       └── Birthday
  ======================================================= */

  const collectionRows =
    useMemo<CollectionRow[]>(() => {
      return collections.map(
        (collection) => {
          const collectionCategories =
            categories.filter(
              (category) => {
                /*
                 * -----------------------------------------
                 * Match by collection ID
                 * -----------------------------------------
                 */

                if (
                  typeof category.collection ===
                  "number"
                ) {
                  return (
                    category.collection ===
                    collection.id
                  );
                }

                /*
                 * -----------------------------------------
                 * Match if serializer returns object
                 * -----------------------------------------
                 */

                if (
                  category.collection &&
                  typeof category.collection ===
                    "object"
                ) {
                  if (
                    typeof category.collection
                      .id === "number" &&
                    category.collection.id ===
                      collection.id
                  ) {
                    return true;
                  }

                  if (
                    category.collection.slug &&
                    category.collection.slug ===
                      collection.slug
                  ) {
                    return true;
                  }
                }

                /*
                 * -----------------------------------------
                 * Match by collection slug
                 * -----------------------------------------
                 */

                if (
                  category.collection_slug &&
                  category.collection_slug ===
                    collection.slug
                ) {
                  return true;
                }

                /*
                 * -----------------------------------------
                 * Match by collection name
                 * -----------------------------------------
                 */

                if (
                  category.collection_name &&
                  category.collection_name
                    .trim()
                    .toLowerCase() ===
                    collection.name
                      .trim()
                      .toLowerCase()
                ) {
                  return true;
                }

                return false;
              }
            );

          return {
            ...collection,
            categories:
              collectionCategories.sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              ),
          };
        }
      );
    }, [
      collections,
      categories,
    ]);

  /* =======================================================
     FILTER + SORT COLLECTIONS
  ======================================================= */

  const filteredCollectionRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = collectionRows.filter((collection) => {
      const matchesSearch =
        !query ||
        collection.name.toLowerCase().includes(query) ||
        collection.slug.toLowerCase().includes(query) ||
        (collection.description || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? collection.active
          : !collection.active);

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "newest":
        default:
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
      }
    });
  }, [
    collectionRows,
    search,
    statusFilter,
    sortOption,
  ]);

  /* =======================================================
     DELETE COLLECTION
  ======================================================= */

  async function handleDelete(
    collection: Collection
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${collection.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        collection.id
      );

      const response =
        await adminFetch(
          `${API_URL}/api/products/collections/${encodeURIComponent(
            collection.slug
          )}/`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        let message =
          "Failed to delete collection.";

        try {
          const data =
            await response.json();

          if (data?.detail) {
            message =
              data.detail;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(
          message
        );
      }

      /*
       * Remove from UI immediately.
       */
      setCollections(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              collection.id
          )
      );
    } catch (err) {
      console.error(
        "Failed to delete collection:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete collection."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="p-6 lg:p-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl text-primary">
            Collections
          </h1>

          <p className="mt-2 text-base text-muted-foreground">
            Organize products into
            curated collections.
          </p>
        </div>

        <Link
          href="/admin/collections/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />

          Add Collection
        </Link>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_200px_220px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search collections..."
          className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | "all"
                | "active"
                | "inactive"
            )
          }
          className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sortOption}
          onChange={(event) =>
            setSortOption(
              event.target.value as
                | "newest"
                | "oldest"
                | "name_asc"
                | "name_desc"
            )
          }
          className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>

      {(search || statusFilter !== "all") && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Showing {filteredCollectionRows.length} of{" "}
            {collectionRows.length} collections
          </span>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setSortOption("newest");
            }}
            className="rounded-full px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="mt-8 overflow-hidden rounded-2xl border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead>
              <tr className="border-b">
                {/* COLLECTION */}
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                  Collection
                </th>

                {/* PRODUCTS */}
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                  Products
                </th>

                {/* CATEGORIES */}
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                  Categories
                </th>

                {/* STATUS */}
                <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">
                  Status
                </th>

                {/* ACTIONS */}
                <th className="px-6 py-5 text-right text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* =================================================
                  LOADING
              ================================================= */}

              {loading &&
                Array.from({
                  length: 4,
                }).map(
                  (_, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0"
                    >
                      {/* Collection */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 animate-pulse rounded-xl bg-muted" />

                          <div>
                            <div className="h-5 w-40 animate-pulse rounded bg-muted" />

                            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
                          </div>
                        </div>
                      </td>

                      {/* Products */}
                      <td className="px-6 py-6">
                        <div className="h-5 w-8 animate-pulse rounded bg-muted" />
                      </td>

                      {/* Categories */}
                      <td className="px-6 py-6">
                        <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6">
                        <div className="ml-auto h-8 w-32 animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  )
                )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                filteredCollectionRows.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />

                      <h3 className="mt-4 font-heading text-xl text-foreground">
                        {search || statusFilter !== "all"
                          ? "No matching collections"
                          : "No collections found"}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {search || statusFilter !== "all"
                          ? "Try changing your search or filters."
                          : "Create your first collection to get started."}
                      </p>
                    </td>
                  </tr>
                )}

              {/* =================================================
                  COLLECTION ROWS
              ================================================= */}

              {!loading &&
                filteredCollectionRows.map(
                  (collection) => (
                    <tr
                      key={collection.id}
                      className="border-b transition hover:bg-muted/30 last:border-0"
                    >
                      {/* =================================================
                          COLLECTION
                      ================================================= */}

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          {/* IMAGE */}
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                            {collection.image ? (
                              <img
                                src={
                                  collection.image
                                }
                                alt={
                                  collection.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Layers className="h-7 w-7 text-muted-foreground" />
                            )}
                          </div>

                          {/* NAME */}
                          <div>
                            <p className="font-semibold text-foreground">
                              {
                                collection.name
                              }
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              /
                              {
                                collection.slug
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          PRODUCTS
                      ================================================= */}

                      <td className="px-6 py-6 align-middle">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {
                              collection.product_count ??
                              0
                            }
                          </p>

                          {(
                            collection.product_count ??
                            0
                          ) > 0 && (
                            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                              Products assigned
                              to this
                              collection
                            </p>
                          )}
                        </div>
                      </td>

                      {/* =================================================
                          CATEGORIES
                      ================================================= */}

                      <td className="px-6 py-6 align-middle">
                        {collection.categories.length >
                        0 ? (
                          <div className="flex max-w-[480px] flex-wrap gap-2">
                            {collection.categories.map(
                              (category) => (
                                <span
                                  key={
                                    category.id
                                  }
                                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                                >
                                  {
                                    category.name
                                  }
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No categories
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <td className="px-6 py-6 align-middle">
                        {collection.active ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td className="px-6 py-6 align-middle">
                        <div className="flex items-center justify-end gap-3">
                          {/* EDIT */}
                          <Link
                            href={`/admin/collections/${collection.slug}`}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />

                            Edit
                          </Link>

                          {/* DELETE */}
                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              collection.id
                            }
                            onClick={() =>
                              handleDelete(
                                collection
                              )
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />

                            {deletingId ===
                            collection.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}