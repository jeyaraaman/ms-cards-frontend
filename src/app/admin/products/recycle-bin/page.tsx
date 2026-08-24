"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { getImageUrl } from "@/lib/image-url";
import { adminFetch } from "@/lib/admin-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: number | null;
  category_name: string;
  category_slug: string;
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

export default function RecycleBinPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionId, setActionId] =
    useState<number | null>(null);

  const [restoreProduct, setRestoreProduct] =
    useState<Product | null>(null);

  const [permanentDeleteProduct, setPermanentDeleteProduct] =
    useState<Product | null>(null);

  // ==========================================================
  // Load recycle bin
  // ==========================================================

  async function loadRecycleBin() {
    const token = sessionStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminFetch(
        `${API_URL}/api/products/recycle-bin/`,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        sessionStorage.removeItem(
          "admin_refresh_token",
        );

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load recycle bin.",
        );
      }

      const data: Product[] =
        await response.json();

      setProducts(data);
    } catch (error) {
      console.error(
        "Recycle bin loading error:",
        error,
      );

      setError(
        "Unable to load recycle bin.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecycleBin();
  }, []);

  // ==========================================================
  // Restore
  // ==========================================================

  async function restoreProductFromBin(
    product: Product,
  ) {
    const token = sessionStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setActionId(product.id);
    setError("");

    try {
      const response = await adminFetch(
        `${API_URL}/api/products/recycle-bin/${product.id}/restore/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        sessionStorage.removeItem(
          "admin_refresh_token",
        );

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          data?.detail ||
            "Failed to restore product.",
        );
      }

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id,
        ),
      );

      setRestoreProduct(null);
    } catch (error) {
      console.error(
        "Restore error:",
        error,
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to restore product.",
        );
      }
    } finally {
      setActionId(null);
    }
  }

  // ==========================================================
  // Permanent Delete
  // ==========================================================

  async function permanentlyDeleteProduct(
    product: Product,
  ) {
    const token = sessionStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setActionId(product.id);
    setError("");

    try {
      const response = await adminFetch(
        `${API_URL}/api/products/recycle-bin/${product.id}/permanent-delete/`,
        {
          method: "DELETE",

          headers: {
          },
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        sessionStorage.removeItem(
          "admin_refresh_token",
        );

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          data?.detail ||
            "Failed to permanently delete product.",
        );
      }

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id,
        ),
      );

      setPermanentDeleteProduct(null);
    } catch (error) {
      console.error(
        "Permanent delete error:",
        error,
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to permanently delete product.",
        );
      }
    } finally {
      setActionId(null);
    }
  }

  // ==========================================================
  // Format date
  // ==========================================================

  function formatDeletedDate(
    value: string | null,
  ) {
    if (!value) {
      return "Unknown";
    }

    return new Date(
      value,
    ).toLocaleString();
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/products",
                )
              }
              className="mb-5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to Products
            </button>

            <h1 className="font-heading text-4xl text-primary">
              Recycle Bin
            </h1>

            <p className="mt-2 text-muted-foreground">
              Restore deleted products or
              permanently remove them.
            </p>
          </div>

          <div className="rounded-lg border bg-card px-5 py-3 text-sm">
            Deleted Products:{" "}
            <strong>
              {loading
                ? "..."
                : products.length}
            </strong>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-medium">
            Recycle Bin
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Restored products will become visible
            again. Permanently deleted products
            cannot be recovered.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading recycle bin...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="mt-8 rounded-2xl border bg-card p-12 text-center">
              <div className="text-5xl">
                🗑️
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Recycle Bin is Empty
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Deleted products will appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/products",
                  )
                }
                className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Back to Products
              </button>
            </div>
          )}

        {/* Table */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Product
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Deleted
                      </th>

                      <th className="px-6 py-4 text-right text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map(
                      (product) => {
                        const imageUrl =
                          getImageUrl(
                            product.image,
                          );

                        return (
                          <tr
                            key={product.id}
                            className="border-b last:border-b-0"
                          >
                            {/* Product */}
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
                                  <p className="font-medium">
                                    {product.name}
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {product.slug}
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {product.material ||
                                      "No material"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-5 text-sm">
                              {product.category_name ||
                                "—"}
                            </td>

                            {/* Deleted */}
                            <td className="px-6 py-5 text-sm text-muted-foreground">
                              {formatDeletedDate(
                                product.deleted_at,
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRestoreProduct(
                                      product,
                                    )
                                  }
                                  disabled={
                                    actionId !==
                                    null
                                  }
                                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                                >
                                  Restore
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setPermanentDeleteProduct(
                                      product,
                                    )
                                  }
                                  disabled={
                                    actionId !==
                                    null
                                  }
                                  className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
                                >
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>

      {/* ======================================================
          RESTORE CONFIRMATION
          ====================================================== */}

      {restoreProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#171214] p-6 shadow-2xl ring-1 ring-white/5">
            <h2 className="text-xl font-semibold">
              Restore Product?
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Restore{" "}
              <strong className="text-foreground">
                {restoreProduct.name}
              </strong>{" "}
              back to the active products?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setRestoreProduct(null)
                }
                disabled={
                  actionId !== null
                }
                className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  restoreProductFromBin(
                    restoreProduct,
                  )
                }
                disabled={
                  actionId !== null
                }
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {actionId ===
                restoreProduct.id
                  ? "Restoring..."
                  : "Restore Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          PERMANENT DELETE CONFIRMATION
          ====================================================== */}

      {permanentDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#171214] p-6 shadow-2xl ring-1 ring-white/5">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm font-semibold text-destructive">
                Permanent Deletion
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Delete Permanently?
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Are you sure you want to permanently
              delete{" "}
              <strong className="text-foreground">
                {permanentDeleteProduct.name}
              </strong>
              ?
            </p>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              The product record will be permanently
              removed from the database and cannot
              be restored.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setPermanentDeleteProduct(
                    null,
                  )
                }
                disabled={
                  actionId !== null
                }
                className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  permanentlyDeleteProduct(
                    permanentDeleteProduct,
                  )
                }
                disabled={
                  actionId !== null
                }
                className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionId ===
                permanentDeleteProduct.id
                  ? "Deleting..."
                  : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}