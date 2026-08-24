"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { adminFetch } from "@/lib/admin-fetch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  is_deleted: boolean;
}

interface CollectionForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  products: number[];
}

interface UploadResponse {
  url: string;
  public_id?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function NewCollectionPage() {
  const [form, setForm] =
    useState<CollectionForm>({
      name: "",
      slug: "",
      description: "",
      image: "",
      active: true,
      products: [],
    });

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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
   * LOAD PRODUCTS
   * ============================================================
   */

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        setError("");

        const token = getAdminToken();

        if (!token) {
          setError(
            "Your admin session has expired. Please login again.",
          );
          return;
        }

        const response = await adminFetch(
          `${API_URL}/api/products/`,
          {
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          sessionStorage.removeItem(
            "admin_access_token",
          );

          setError(
            "Your admin session has expired. Please login again.",
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load products.",
          );
        }

        const data = await response.json();

        const productList: Product[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
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
          "Failed to load products:",
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

    fetchProducts();
  }, []);

  /*
   * ============================================================
   * SLUG
   * ============================================================
   */

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: createSlug(value),
    }));
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

    /*
     * Remove old preview URL.
     */
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
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
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setImageFile(null);
    setImagePreview("");
    setForm((current) => ({
      ...current,
      image: "",
    }));
  }

  /*
   * ============================================================
   * UPLOAD IMAGE TO CLOUDINARY
   * ============================================================
   */

  async function uploadCollectionImage(): Promise<UploadResponse> {
    if (!imageFile) {
      throw new Error(
        "Please select an image.",
      );
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
          `${API_URL}/api/products/collections/upload-image/`,
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
   * PRODUCT SELECTION
   * ============================================================
   */

  function toggleProduct(
    productId: number,
  ) {
    setForm((current) => {
      const selected =
        current.products.includes(
          productId,
        );

      return {
        ...current,
        products: selected
          ? current.products.filter(
              (id) =>
                id !== productId,
            )
          : [
              ...current.products,
              productId,
            ],
      };
    });
  }

  /*
   * ============================================================
   * API ERROR
   * ============================================================
   */

  function getApiErrorMessage(
    data: unknown,
  ): string {
    if (!data) {
      return "Failed to create collection.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const errorData =
        data as Record<
          string,
          unknown
        >;

      if (
        typeof errorData.detail ===
        "string"
      ) {
        return errorData.detail;
      }

      if (
        Array.isArray(
          errorData.slug,
        )
      ) {
        return errorData.slug.join(
          " ",
        );
      }

      if (
        Array.isArray(
          errorData.name,
        )
      ) {
        return errorData.name.join(
          " ",
        );
      }

      if (
        Array.isArray(
          errorData.products,
        )
      ) {
        return errorData.products
          .map((item) =>
            typeof item === "string"
              ? item
              : JSON.stringify(item),
          )
          .join(" ");
      }

      if (
        Array.isArray(
          errorData.image,
        )
      ) {
        return errorData.image.join(
          " ",
        );
      }

      try {
        return JSON.stringify(
          errorData,
          null,
          2,
        );
      } catch {
        return "Failed to create collection.";
      }
    }

    return "Failed to create collection.";
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Collection name is required.",
      );
      return;
    }

    if (!form.slug.trim()) {
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

    try {
      setSaving(true);

      let imageUrl =
        form.image.trim();

      /*
       * Upload selected file first.
       */
      if (imageFile) {
        const uploadResult =
          await uploadCollectionImage();

        imageUrl =
          uploadResult.url;
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug
          .trim()
          .toLowerCase(),
        description:
          form.description.trim(),
        image: imageUrl,
        active: form.active,
        products: form.products,
      };

      console.log(
        "Creating collection:",
        payload,
      );

      const response =
        await adminFetch(
          `${API_URL}/api/products/collections/`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload,
            ),
          },
        );

      const rawResponse =
        await response.text();

      let responseData: unknown =
        rawResponse;

      try {
        responseData =
          rawResponse
            ? JSON.parse(rawResponse)
            : null;
      } catch {
        // Non-JSON response.
      }

      console.log(
        "Collection API status:",
        response.status,
      );

      console.log(
        "Collection API response:",
        responseData,
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        setError(
          "Your admin session has expired. Please login again.",
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            responseData,
          ),
        );
      }

      setSuccess(
        "Collection created successfully.",
      );

      setTimeout(() => {
        window.location.href =
          "/admin/collections";
      }, 500);
    } catch (error) {
      console.error(
        "Failed to create collection:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create collection.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * CLEANUP PREVIEW
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}

        <Link
          href="/admin/collections"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="font-heading text-4xl text-foreground">
            Add Collection
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create a curated collection of
            products.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* ================================================= */}
          {/* COLLECTION INFORMATION */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-border bg-card p-7">

            <div className="mb-7">
              <h2 className="font-heading text-2xl">
                Collection Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Basic information about this
                collection.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Collection Name
                </label>

                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Premium Collection"
                  required
                  disabled={saving}
                />
              </div>

              {/* SLUG */}

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium"
                >
                  Slug
                </label>

                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        slug:
                          event.target.value
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-",
                            ),
                      }),
                    )
                  }
                  placeholder="premium-collection"
                  required
                  disabled={saving}
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Used in the collection URL.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div className="lg:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <Textarea
                  id="description"
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Premium invitation designs for special celebrations."
                  rows={5}
                  disabled={saving}
                />
              </div>

              {/* ================================================= */}
              {/* IMAGE FILE UPLOAD */}
              {/* ================================================= */}

              <div className="lg:col-span-2">

                <label className="mb-3 block text-sm font-medium">
                  Collection Image
                </label>

                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center">

                    {/* PREVIEW */}

                    <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">

                      {imagePreview ? (
                        <img
                          src={
                            imagePreview
                          }
                          alt={
                            form.name ||
                            "Collection preview"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-10 w-10 text-muted-foreground" />
                      )}

                    </div>

                    {/* CONTROLS */}

                    <div className="flex-1">

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
                          disabled={
                            saving
                          }
                          className="ml-3 inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      )}

                      <p className="mt-3 text-xs text-muted-foreground">
                        Select an image from
                        your computer.
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

                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVE */}

              <div className="lg:col-span-2">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          active:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    disabled={saving}
                    className="h-4 w-4 rounded border-border"
                  />

                  <span className="text-sm font-medium">
                    Active collection
                  </span>

                </label>

                <p className="ml-7 mt-1 text-xs text-muted-foreground">
                  Inactive collections will
                  not be displayed on the
                  public website.
                </p>

              </div>

            </div>
          </section>

          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-border bg-card p-7">

            <div className="mb-7">

              <h2 className="font-heading text-2xl">
                Products
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Select the products that belong
                to this collection.
              </p>

            </div>

            {loadingProducts ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading products...
              </div>
            ) : products.length ===
              0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No active products available.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {products.map(
                  (product) => {

                    const selected =
                      form.products.includes(
                        product.id,
                      );

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          toggleProduct(
                            product.id,
                          )
                        }
                        disabled={saving}
                        className={`group overflow-hidden rounded-xl border text-left transition-all ${
                          selected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >

                        <div className="flex items-center gap-4 p-4">

                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">

                            {product.image ? (
                              <img
                                src={
                                  product.image.startsWith(
                                    "http",
                                  )
                                    ? product.image
                                    : `${API_URL}${product.image}`
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-medium">
                              {product.name}
                            </h3>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {product.slug}
                            </p>

                            <div className="mt-2">

                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs ${
                                  selected
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {selected
                                  ? "Selected"
                                  : "Select"}
                              </span>

                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  },
                )}

              </div>
            )}

            <div className="mt-6 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">

              <strong className="text-foreground">
                {form.products.length}
              </strong>{" "}
              product
              {form.products.length ===
              1
                ? ""
                : "s"} selected

            </div>

          </section>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex justify-end gap-3">

            <Button
              type="button"
              variant="outline"
              asChild
              disabled={saving}
            >
              <Link href="/admin/collections">
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                uploadingImage
              }
              className="gap-2"
            >

              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  {uploadingImage
                    ? "Uploading Image..."
                    : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Collection
                </>
              )}

            </Button>

          </div>

        </form>
      </main>
    </div>
  );
}