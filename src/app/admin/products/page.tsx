"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/image-url";
import { adminFetch, redirectToAdminLogin } from "@/lib/admin-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: number | null;
  category_name: string;
  category_slug: string;
  collection_ids?: number[];
  collection_names?: string[];
  collection_slugs?: string[];
  collection_name?: string | null;
  collection_slug?: string | null;
  material: string;
  image: string;
  description: string;
  featured: boolean;
  active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type StatusFilter = "all" | "active" | "deactivated" | "featured";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

function authError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message === "ADMIN_AUTH_REQUIRED" ||
      error.message === "ADMIN_AUTH_EXPIRED")
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("newest");
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [productToDelete, setProductToDelete] =
    useState<Product | null>(null);
  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    if (
      filter === "active" ||
      filter === "inactive" ||
      filter === "deactivated" ||
      filter === "featured" ||
      filter === "all"
    ) {
      setStatusFilter(
        filter === "inactive" ? "deactivated" : filter,
      );
    }
    const category = params.get("category");
    if (category) setCategoryFilter(category);
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(
        `${API_URL}/api/products/`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to load products.");
      }
      const data = await response.json();
      setProducts(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [],
      );
    } catch (error) {
      console.error("Products error:", error);
      if (authError(error)) {
        redirectToAdminLogin();
        return;
      }
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (statusFilter === "all") params.delete("filter");
    else params.set("filter", statusFilter);
    if (categoryFilter === "all") params.delete("category");
    else params.set("category", categoryFilter);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `/admin/products?${query}` : "/admin/products",
    );
  }, [statusFilter, categoryFilter]);

  function getCollectionNames(product: Product): string[] {
    if (
      Array.isArray(product.collection_names) &&
      product.collection_names.length
    ) {
      return product.collection_names.filter(
        (value): value is string => Boolean(value),
      );
    }
    return product.collection_name
      ? [product.collection_name]
      : [];
  }

  const categoryOptions = useMemo(() => {
    const names = products
      .filter((p) => !p.is_deleted)
      .map((p) => p.category_name?.trim())
      .filter((v): v is string => Boolean(v));
    return Array.from(new Set(names)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [products]);

  const totalProducts = useMemo(
    () => products.filter((p) => !p.is_deleted).length,
    [products],
  );

  const activeProductCount = useMemo(
    () =>
      products.filter((p) => p.active && !p.is_deleted).length,
    [products],
  );

  const deactivatedProductCount = useMemo(
    () =>
      products.filter((p) => !p.active && !p.is_deleted).length,
    [products],
  );

  const featuredProductCount = useMemo(
    () =>
      products.filter((p) => p.featured && !p.is_deleted).length,
    [products],
  );

  const searchedProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const collections = getCollectionNames(product);
      return (
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category_name.toLowerCase().includes(query) ||
        product.material.toLowerCase().includes(query) ||
        collections.some((name) =>
          name.toLowerCase().includes(query),
        )
      );
    });
  }, [products, search]);

  const filteredProducts = useMemo(() => {
    let result = searchedProducts.filter((p) => !p.is_deleted);

    if (statusFilter === "active") {
      result = result.filter((p) => p.active);
    } else if (statusFilter === "deactivated") {
      result = result.filter((p) => !p.active);
    } else if (statusFilter === "featured") {
      result = result.filter((p) => p.featured);
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (p) => p.category_name === categoryFilter,
      );
    }

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });
  }, [
    searchedProducts,
    statusFilter,
    categoryFilter,
    sortOption,
  ]);

  const activeProducts = useMemo(
    () => filteredProducts.filter((p) => p.active),
    [filteredProducts],
  );

  const deactivatedProducts = useMemo(
    () => filteredProducts.filter((p) => !p.active),
    [filteredProducts],
  );

  async function toggleProductActive(product: Product) {
    setUpdatingId(product.id);
    setError("");
    try {
      const response = await adminFetch(
        `${API_URL}/api/products/${product.slug}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !product.active }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.detail || "Failed to update product status.",
        );
      }

      const updatedProduct: Product = await response.json();
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, ...updatedProduct }
            : item,
        ),
      );
    } catch (error) {
      console.error("Product status error:", error);
      if (authError(error)) {
        redirectToAdminLogin();
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update product status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function moveToRecycleBin(product: Product) {
    setDeletingId(product.id);
    setError("");
    try {
      const response = await adminFetch(
        `${API_URL}/api/products/${product.slug}/`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.detail ||
            "Failed to move product to recycle bin.",
        );
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setProductToDelete(null);
    } catch (error) {
      console.error("Recycle bin error:", error);
      if (authError(error)) {
        redirectToAdminLogin();
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function ProductTable({
    productList,
    sectionType,
  }: {
    productList: Product[];
    sectionType: "active" | "deactivated";
  }) {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Collection
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Featured
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => {
                const imageUrl = getImageUrl(product.image);
                const collections = getCollectionNames(product);
                const updating = updatingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        {product.category_name || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {collections.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {collections.map((name, index) => (
                            <span
                              key={`${product.id}-${name}-${index}`}
                              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      {product.material || "—"}
                    </td>

                    <td className="px-6 py-5">
                      {product.featured ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          Featured
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      {product.active ? (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700">
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleProductActive(product)
                          }
                          disabled={updating}
                          className={
                            sectionType === "active"
                              ? "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              : "rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          }
                        >
                          {updating
                            ? "Updating..."
                            : sectionType === "active"
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <Link
                          href={`/admin/products/${product.slug}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="text-sm font-medium text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function FilterCard({
    title,
    count,
    filter,
    description,
  }: {
    title: string;
    count: number;
    filter: StatusFilter;
    description: string;
  }) {
    const selected = statusFilter === filter;

    return (
      <button
        type="button"
        onClick={() => setStatusFilter(filter)}
        className={`group w-full rounded-2xl border p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          selected
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
            : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-sm ${
                selected
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {title}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {loading ? "..." : count}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            View
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {description}
        </p>
      </button>
    );
  }

  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl text-primary">
              Products
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage products displayed in the Meenakshi Screen catalogue.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/products/recycle-bin")
              }
              className="rounded-lg border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Recycle Bin
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products/new")}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              + Add Product
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterCard
            title="Total Products"
            count={totalProducts}
            filter="all"
            description="View all active and deactivated products."
          />
          <FilterCard
            title="Active Products"
            count={activeProductCount}
            filter="active"
            description="View products currently visible on the website."
          />
          <FilterCard
            title="Deactivated Products"
            count={deactivatedProductCount}
            filter="deactivated"
            description="View products hidden from the public website."
          />
          <FilterCard
            title="Featured Products"
            count={featuredProductCount}
            filter="featured"
            description="View products marked as featured."
          />
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name, slug, category, model or collection..."
            className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as SortOption)
            }
            className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>

        {(search ||
          categoryFilter !== "all" ||
          statusFilter !== "all") && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Filters:
            </span>
            {search && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                Search: {search}
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                Category: {categoryFilter}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                Status:{" "}
                {statusFilter === "deactivated"
                  ? "Deactivated"
                  : statusFilter === "featured"
                    ? "Featured"
                    : "Active"}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setSortOption("newest");
              }}
              className="rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Clear filters
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading products...
          </div>
        )}

        {!loading && !error && statusFilter === "all" && (
          <>
            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Active Products
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Products currently visible on the public catalogue.
                  </p>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-700">
                  {activeProducts.length}
                </span>
              </div>
              {activeProducts.length ? (
                <ProductTable
                  productList={activeProducts}
                  sectionType="active"
                />
              ) : (
                <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  No active products found.
                </div>
              )}
            </section>

            <section className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Deactivated Products
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These products are hidden from the public catalogue.
                  </p>
                </div>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-700">
                  {deactivatedProducts.length}
                </span>
              </div>
              {deactivatedProducts.length ? (
                <ProductTable
                  productList={deactivatedProducts}
                  sectionType="deactivated"
                />
              ) : (
                <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  No deactivated products.
                </div>
              )}
            </section>
          </>
        )}

        {!loading && !error && statusFilter === "active" && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Active Products
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Showing only active products.
                </p>
              </div>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-700">
                {activeProducts.length}
              </span>
            </div>
            {activeProducts.length ? (
              <ProductTable
                productList={activeProducts}
                sectionType="active"
              />
            ) : (
              <div className="rounded-2xl border bg-card p-10 text-center">
                <h2 className="text-lg font-semibold">
                  No active products
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No active products match the selected filters.
                </p>
              </div>
            )}
          </section>
        )}

        {!loading && !error && statusFilter === "deactivated" && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Deactivated Products
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Showing only deactivated products.
                </p>
              </div>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-700">
                {deactivatedProducts.length}
              </span>
            </div>
            {deactivatedProducts.length ? (
              <ProductTable
                productList={deactivatedProducts}
                sectionType="deactivated"
              />
            ) : (
              <div className="rounded-2xl border bg-card p-10 text-center">
                <h2 className="text-lg font-semibold">
                  No deactivated products
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  All products are currently active.
                </p>
              </div>
            )}
          </section>
        )}

        {!loading && !error && statusFilter === "featured" && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Featured Products
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Showing only products marked as featured.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {filteredProducts.length}
              </span>
            </div>
            {filteredProducts.length ? (
              <ProductTable
                productList={filteredProducts}
                sectionType={
                  filteredProducts.every((p) => p.active)
                    ? "active"
                    : "deactivated"
                }
              />
            ) : (
              <div className="rounded-2xl border bg-card p-10 text-center">
                <h2 className="text-lg font-semibold">
                  No featured products found
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No active catalogue products are marked as featured.
                </p>
              </div>
            )}
          </section>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 &&
          search && (
            <div className="mt-10 rounded-2xl border bg-card p-10 text-center">
              <h2 className="text-lg font-semibold">
                No products found
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No products match "{search}" in the selected category.
              </p>
            </div>
          )}
      </section>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#171214] p-6 shadow-2xl ring-1 ring-white/5">
            <h2 className="text-xl font-semibold">
              Move to Recycle Bin?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Are you sure you want to move{" "}
              <strong className="text-foreground">
                {productToDelete.name}
              </strong>{" "}
              to the Recycle Bin?
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              The product will disappear from the public catalogue, but it
              can still be restored from the Recycle Bin.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={deletingId !== null}
                className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => moveToRecycleBin(productToDelete)}
                disabled={deletingId !== null}
                className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === productToDelete.id
                  ? "Moving..."
                  : "Move to Recycle Bin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}