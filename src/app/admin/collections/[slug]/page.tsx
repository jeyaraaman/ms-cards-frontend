"use client";

import { adminFetch } from "@/lib/admin-fetch";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Package,
  Save,
  Upload,
  X,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  material: string;
  image: string;
  description: string;
  featured: boolean;
  active: boolean;
  is_deleted: boolean;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  cloudinary_public_id: string;
  products: number[];
  product_details: {
    id: number;
    name: string;
    slug: string;
    image: string;
    category: number;
    category_name: string;
    category_slug: string;
  }[];
  product_count: number;
  active: boolean;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface UploadResponse {
  url: string;
  public_id?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function EditCollectionPage({
  params,
}: PageProps) {
  const [slugParam, setSlugParam] =
    useState("");

  const [collection, setCollection] =
    useState<Collection | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [active, setActive] =
    useState(true);

  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState<number[]>([]);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * TOKEN
   * ============================================================
   */

  function getAdminToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem(
      "admin_access_token",
    );
  }

  /*
   * ============================================================
   * ROUTE PARAM
   * ============================================================
   */

  useEffect(() => {
    async function loadParams() {
      const resolvedParams =
        await params;

      setSlugParam(
        resolvedParams.slug,
      );
    }

    loadParams();
  }, [params]);

  /*
   * ============================================================
   * LOAD COLLECTION
   * ============================================================
   */

  useEffect(() => {
    if (!slugParam) {
      return;
    }

    async function loadCollection() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/products/collections/${encodeURIComponent(
              slugParam,
            )}/`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load collection.",
          );
        }

        const data =
          await response.json();

        setCollection(data);

        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(
          data.description || "",
        );

        setActive(
          data.active ?? true,
        );

        setSelectedProducts(
          Array.isArray(
            data.products,
          )
            ? data.products
            : [],
        );

        setImagePreview(
          data.image || "",
        );
      } catch (error) {
        console.error(
          "Collection loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load collection.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [slugParam]);

  /*
   * ============================================================
   * LOAD PRODUCTS
   * ============================================================
   */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);

        const token =
          getAdminToken();

        if (!token) {
          setError(
            "Your admin session has expired. Please login again.",
          );

          return;
        }

        const response =
          await adminFetch(
            `${API_BASE_URL}/api/products/`,
            {
              cache: "no-store",
            },
          );

        if (response.status === 401) {
          sessionStorage.removeItem(
            "admin_access_token",
          );

          throw new Error(
            "Your admin session has expired. Please login again.",
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load products.",
          );
        }

        const data =
          await response.json();

        const productList: Product[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.results,
                )
              ? data.results
              : [];

        setProducts(
          productList.filter(
            (product) =>
              product.active &&
              !product.is_deleted,
          ),
        );
      } catch (error) {
        console.error(
          "Products loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load products.",
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  /*
   * ============================================================
   * SLUG
   * ============================================================
   */

  function generateSlug(
    value: string,
  ) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "");
  }

  function handleNameChange(
    value: string,
  ) {
    setName(value);
    setSlug(
      generateSlug(value),
    );
  }

  /*
   * ============================================================
   * IMAGE SELECTION
   * ============================================================
   */

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Only JPG, PNG, and WEBP images are allowed.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be 5 MB or less.",
      );

      event.target.value = "";

      return;
    }

    setError("");

    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setImageFile(null);

    setImagePreview(
      collection?.image || "",
    );
  }

  /*
   * ============================================================
   * PRODUCT SELECTION
   * ============================================================
   */

  function toggleProduct(
    productId: number,
  ) {
    setSelectedProducts(
      (current) => {
        if (
          current.includes(
            productId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== productId,
          );
        }

        return [
          ...current,
          productId,
        ];
      },
    );
  }

  function selectAllProducts() {
    setSelectedProducts(
      products.map(
        (product) =>
          product.id,
      ),
    );
  }

  function clearAllProducts() {
    setSelectedProducts([]);
  }

  /*
   * ============================================================
   * GROUP PRODUCTS
   * ============================================================
   */

  const groupedProducts =
    useMemo(() => {
      const groups: Record<
        string,
        Product[]
      > = {};

      products.forEach(
        (product) => {
          const category =
            product.category_name ||
            "Uncategorized";

          if (!groups[category]) {
            groups[category] = [];
          }

          groups[category].push(
            product,
          );
        },
      );

      return groups;
    }, [products]);

  /*
   * ============================================================
   * UPLOAD IMAGE
   * ============================================================
   */

  async function uploadImage(): Promise<UploadResponse | null> {
    if (!imageFile) {
      return null;
    }

    const token =
      getAdminToken();

    if (!token) {
      throw new Error(
        "Your admin session has expired. Please login again.",
      );
    }

    const formData =
      new FormData();

    formData.append(
      "image",
      imageFile,
    );

    setUploadingImage(true);

    try {
      const response =
        await adminFetch(
          `${API_BASE_URL}/api/products/collections/upload-image/`,
          {
            method: "POST",
            body: formData,
          },
        );

      const rawResponse =
        await response.text();

      let data: any = null;

      try {
        data = rawResponse
          ? JSON.parse(rawResponse)
          : null;
      } catch {
        data = null;
      }

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        throw new Error(
          "Your admin session has expired. Please login again.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.image?.[0] ||
            "Unable to upload collection image.",
        );
      }

      if (!data?.url) {
        throw new Error(
          "Image upload succeeded but no Cloudinary URL was returned.",
        );
      }

      return data;
    } finally {
      setUploadingImage(false);
    }
  }

  /*
   * ============================================================
   * SAVE
   * ============================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!collection) {
      return;
    }

    if (!name.trim()) {
      setError(
        "Collection name is required.",
      );

      return;
    }

    if (!slug.trim()) {
      setError(
        "Slug is required.",
      );

      return;
    }

    const token =
      getAdminToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again.",
      );

      return;
    }

    setSaving(true);

    try {
      let imageUrl =
        collection.image || "";

      /*
       * Upload only if user selected
       * a replacement image.
       */

      if (imageFile) {
        const uploadResult =
          await uploadImage();

        if (
          uploadResult?.url
        ) {
          imageUrl =
            uploadResult.url;
        }
      }

      const response =
        await adminFetch(
          `${API_BASE_URL}/api/products/collections/${encodeURIComponent(
            collection.slug,
          )}/`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: name.trim(),

              slug: slug.trim(),

              description:
                description.trim(),

              image: imageUrl,

              products:
                selectedProducts,

              active,
            }),
          },
        );

      const rawResponse =
        await response.text();

      let data: any = null;

      try {
        data = rawResponse
          ? JSON.parse(rawResponse)
          : null;
      } catch {
        data = null;
      }

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        throw new Error(
          "Your admin session has expired. Please login again.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.slug?.[0] ||
            data?.name?.[0] ||
            "Unable to update collection.",
        );
      }

      window.location.href =
        "/admin/collections";
    } catch (error) {
      console.error(
        "Update collection error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update collection.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading collection...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * NOT FOUND
   * ============================================================
   */

  if (!collection) {
    return (
      <div className="p-6 md:p-8">

        <Link
          href="/admin/collections"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">

          <p className="text-sm text-destructive">
            {error ||
              "Collection not found."}
          </p>

        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8">

        <Link
          href="/admin/collections"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Collection
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update collection details and products.
        </p>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">

          <p className="text-sm text-destructive">
            {error}
          </p>

        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* ================================================== */}
        {/* COLLECTION INFORMATION */}
        {/* ================================================== */}

        <section className="rounded-xl border bg-background p-6">

          <div className="mb-6">

            <h2 className="text-lg font-semibold">
              Collection Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update the basic collection information.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* NAME */}

            <div className="space-y-2">

              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Collection Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value,
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* SLUG */}

            <div className="space-y-2">

              <label
                htmlFor="slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value,
                    ),
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="text-xs text-muted-foreground">
                Used in the collection URL.
              </p>

            </div>

            {/* DESCRIPTION */}

            <div className="space-y-2 md:col-span-2">

              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={5}
                disabled={saving}
                className="w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* ACTIVE */}

            <div className="flex items-center gap-3 md:col-span-2">

              <input
                id="active"
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(
                    event.target.checked,
                  )
                }
                disabled={saving}
                className="h-4 w-4"
              />

              <label
                htmlFor="active"
                className="text-sm font-medium"
              >
                Active collection
              </label>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* IMAGE */}
        {/* ================================================== */}

        <section className="rounded-xl border bg-background p-6">

          <div className="mb-6">

            <h2 className="text-lg font-semibold">
              Collection Image
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose an image from your computer
              to replace the current image.
            </p>

          </div>

          <div className="rounded-xl border border-dashed bg-muted/20 p-5">

            <div className="flex flex-col gap-6 md:flex-row md:items-center">

              {/* PREVIEW */}

              <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                )}

              </div>

              {/* CONTROLS */}

              <div>

                <input
                  id="collection-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  disabled={saving}
                  className="hidden"
                />

                <label
                  htmlFor="collection-image"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />

                  {imageFile
                    ? "Change Image"
                    : "Choose Image"}
                </label>

                {imageFile && (
                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    disabled={saving}
                    className="ml-3 inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  JPG, PNG or WEBP.
                  Maximum 5 MB.
                </p>

                {imageFile && (
                  <div className="mt-3 rounded-lg bg-background px-4 py-3">

                    <p className="text-sm font-medium">
                      {imageFile.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {(
                        imageFile.size /
                        1024 /
                        1024
                      ).toFixed(
                        2,
                      )}{" "}
                      MB
                    </p>

                  </div>
                )}

                {!imageFile &&
                  collection.image && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Current image will
                      remain unchanged
                      unless you choose
                      a new image.
                    </p>
                  )}

              </div>

            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* PRODUCTS */}
        {/* ================================================== */}

        <section className="rounded-xl border bg-background p-6">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold">
                Products
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Add or remove products from this collection.
              </p>

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={
                  selectAllProducts
                }
                disabled={
                  loadingProducts ||
                  products.length ===
                    0 ||
                  saving
                }
                className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={
                  clearAllProducts
                }
                disabled={
                  selectedProducts.length ===
                    0 ||
                  saving
                }
                className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear All
              </button>

            </div>

          </div>

          {/* SELECTED COUNT */}

          <div className="mb-5 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">

            <Package className="h-4 w-4" />

            <span className="text-sm font-medium">
              {selectedProducts.length}{" "}
              product
              {selectedProducts.length ===
              1
                ? ""
                : "s"}{" "}
              selected
            </span>

          </div>

          {/* LOADING */}

          {loadingProducts && (
            <div className="flex items-center gap-3 py-8">

              <Loader2 className="h-5 w-5 animate-spin" />

              <p className="text-sm text-muted-foreground">
                Loading products...
              </p>

            </div>
          )}

          {/* NO PRODUCTS */}

          {!loadingProducts &&
            products.length ===
              0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">

                <p className="text-sm text-muted-foreground">
                  No active products are
                  available.
                </p>

              </div>
            )}

          {/* PRODUCTS */}

          {!loadingProducts &&
            products.length > 0 && (
              <div className="space-y-6">

                {Object.entries(
                  groupedProducts,
                ).map(
                  ([
                    categoryName,
                    categoryProducts,
                  ]) => (

                    <div
                      key={
                        categoryName
                      }
                    >

                      <h3 className="mb-3 text-sm font-semibold">
                        {categoryName}
                      </h3>

                      <div className="grid gap-3 md:grid-cols-2">

                        {categoryProducts.map(
                          (product) => {

                            const selected =
                              selectedProducts.includes(
                                product.id,
                              );

                            return (
                              <label
                                key={
                                  product.id
                                }
                                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                  selected
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted/40"
                                }`}
                              >

                                <input
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  onChange={() =>
                                    toggleProduct(
                                      product.id,
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className="h-4 w-4"
                                />

                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">

                                  {product.image ? (
                                    <img
                                      src={
                                        product.image
                                      }
                                      alt={
                                        product.name
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="font-medium">
                                    {
                                      product.name
                                    }
                                  </p>

                                  {product.material && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {
                                        product.material
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    /
                                    {
                                      product.slug
                                    }
                                  </p>

                                </div>

                              </label>
                            );
                          },
                        )}

                      </div>

                    </div>

                  ),
                )}

              </div>
            )}

        </section>

        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Link
            href="/admin/collections"
            className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              uploadingImage ||
              loadingProducts
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                {uploadingImage
                  ? "Uploading Image..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}

          </button>

        </div>

      </form>
    </div>
  );
}