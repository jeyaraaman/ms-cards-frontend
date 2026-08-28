"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import { adminFetch } from "@/lib/admin-fetch";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   TYPES
============================================================ */

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

type UploadResponse = {
  url: string;
  public_id?: string;
};

type ProductForm = {
  name: string;
  slug: string;
  category: string;
  collection: string;
  material: string;
  image: string;
  description: string;
  featured: boolean;
  active: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray(
      (data as { results?: unknown }).results,
    )
  ) {
    return (
      (data as { results: T[] }).results
    );
  }

  return [];
}

function getApiErrorMessage(
  data: unknown,
): string {
  if (!data) {
    return "Failed to create product.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const errorData =
      data as Record<string, unknown>;

    if (
      typeof errorData.detail === "string"
    ) {
      return errorData.detail;
    }

    const messages: string[] = [];

    Object.entries(errorData).forEach(
      ([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            messages.push(
              `${field}: ${String(item)}`,
            );
          });

          return;
        }

        if (
          typeof value === "string" ||
          typeof value === "number"
        ) {
          messages.push(
            `${field}: ${String(value)}`,
          );
        }
      },
    );

    if (messages.length > 0) {
      return messages.join(" ");
    }

    try {
      return JSON.stringify(
        errorData,
        null,
        2,
      );
    } catch {
      return "Failed to create product.";
    }
  }

  return "Failed to create product.";
}

/* ============================================================
   PAGE
============================================================ */

export default function NewProductPage() {
  const router = useRouter();

  /* ==========================================================
     FORM
  ========================================================== */

  const [form, setForm] =
    useState<ProductForm>({
      name: "",
      slug: "",
      category: "",
      collection: "",
      material: "",
      image: "",
      description: "",
      featured: false,
      active: true,
    });

  /* ==========================================================
     DATA
  ========================================================== */

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [loadingData, setLoadingData] =
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

  /* ==========================================================
     LOAD CATEGORIES + COLLECTIONS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        const [
          categoriesResponse,
          collectionsResponse,
        ] = await Promise.all([
          adminFetch(
            `${API_URL}/api/products/categories/`,
            {
              method: "GET",
              cache: "no-store",
            },
          ),

          adminFetch(
            `${API_URL}/api/products/collections/`,
            {
              method: "GET",
              cache: "no-store",
            },
          ),
        ]);

        if (cancelled) {
          return;
        }

        if (
          !categoriesResponse.ok
        ) {
          const text =
            await categoriesResponse.text();

          throw new Error(
            `Failed to load categories (${categoriesResponse.status}). ${
              text || ""
            }`,
          );
        }

        if (
          !collectionsResponse.ok
        ) {
          const text =
            await collectionsResponse.text();

          throw new Error(
            `Failed to load collections (${collectionsResponse.status}). ${
              text || ""
            }`,
          );
        }

        const categoriesData =
          await categoriesResponse.json();

        const collectionsData =
          await collectionsResponse.json();

        const categoryList =
          getList<Category>(
            categoriesData,
          );

        const collectionList =
          getList<Collection>(
            collectionsData,
          );

        setCategories(
          categoryList.filter(
            (item) => item.active,
          ),
        );

        setCollections(
          collectionList.filter(
            (item) => item.active,
          ),
        );
      } catch (err) {
        console.error(
          "Failed to load product form data:",
          err,
        );

        if (
          err instanceof Error
        ) {
          setError(err.message);
        } else {
          setError(
            "Unable to load categories and collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  function updateForm(
    field: keyof ProductForm,
    value:
      | string
      | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ==========================================================
     PRODUCT NAME
  ========================================================== */

  function handleNameChange(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  }

  /* ==========================================================
     SLUG
  ========================================================== */

  function handleSlugChange(
    value: string,
  ) {
    updateForm(
      "slug",
      generateSlug(value),
    );
  }

  /* ==========================================================
     IMAGE SELECTION
  ========================================================== */

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

    const preview =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
  }

  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

  function removeImage() {
    if (saving || uploadingImage) {
      return;
    }

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
    setImagePreview("");

    setForm((current) => ({
      ...current,
      image: "",
    }));

    const input =
      document.getElementById(
        "product-image-file",
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /* ==========================================================
     UPLOAD IMAGE
  ========================================================== */

  async function uploadProductImage(): Promise<UploadResponse> {
    if (!imageFile) {
      throw new Error(
        "Please select an image.",
      );
    }

    setUploadingImage(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        imageFile,
      );

      /*
       * IMPORTANT:
       *
       * Do NOT manually set Content-Type
       * for FormData.
       *
       * The browser will add the correct
       * multipart boundary.
       */

      const response =
        await adminFetch(
          `${API_URL}/api/products/upload-image/`,
          {
            method: "POST",
            body: formData,
          },
        );

      const rawResponse =
        await response.text();

      let data: unknown = null;

      try {
        data = rawResponse
          ? JSON.parse(rawResponse)
          : null;
      } catch {
        data = rawResponse;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
          ),
        );
      }

      if (
        !data ||
        typeof data !== "object" ||
        !("url" in data) ||
        typeof (
          data as {
            url?: unknown;
          }
        ).url !== "string"
      ) {
        throw new Error(
          "Image upload succeeded but Cloudinary did not return an image URL.",
        );
      }

      return data as UploadResponse;
    } finally {
      setUploadingImage(false);
    }
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    const name =
      form.name.trim();

    const slug =
      generateSlug(form.slug);

    const material =
      form.material.trim();

    const image =
      form.image.trim();

    const description =
      form.description.trim();

    if (!name) {
      setError(
        "Product name is required.",
      );

      return;
    }

    if (!slug) {
      setError(
        "Product slug is required.",
      );

      return;
    }

    if (!form.category) {
      setError(
        "Please select a category.",
      );

      return;
    }

    if (uploadingImage) {
      setError(
        "Please wait until the image upload is complete.",
      );

      return;
    }

    try {
      setSaving(true);

      let imageUrl = image;

      /* ------------------------------------------------------
         UPLOAD IMAGE FIRST
      ------------------------------------------------------ */

      if (imageFile) {
        const uploadResult =
          await uploadProductImage();

        imageUrl =
          uploadResult.url;
      }

      /* ------------------------------------------------------
         PRODUCT PAYLOAD
      ------------------------------------------------------ */

      const collectionIds =
        form.collection
          ? [Number(form.collection)]
          : [];

      const payload = {
        name,

        slug,

        category:
          Number(form.category),

        /*
         * Backend ProductSerializer expects
         * a writable ManyToMany field called
         * "collections".
         */
        collections:
          collectionIds,

        material,

        image: imageUrl,

        description,

        featured:
          form.featured,

        active:
          form.active,
      };

      console.log(
        "================================",
      );

      console.log(
        "CREATING PRODUCT",
      );

      console.log(
        "Payload:",
        payload,
      );

      console.log(
        "================================",
      );

      /* ------------------------------------------------------
         CREATE PRODUCT
      ------------------------------------------------------ */

      const response =
        await adminFetch(
          `${API_URL}/api/products/`,
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
        null;

      try {
        responseData =
          rawResponse
            ? JSON.parse(rawResponse)
            : null;
      } catch {
        responseData =
          rawResponse;
      }

      console.log(
        "Product API status:",
        response.status,
      );

      console.log(
        "Product API response:",
        responseData,
      );

      /* ------------------------------------------------------
         ERROR
      ------------------------------------------------------ */

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            responseData,
          ),
        );
      }

      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setSuccess(
        "Product created successfully.",
      );

      /*
       * Give the user a moment to see
       * the success state before going
       * back to the product list.
       */

      setTimeout(() => {
        router.push(
          "/admin/products",
        );

        router.refresh();
      }, 500);
    } catch (err) {
      console.error(
        "Create product error:",
        err,
      );

      if (
        err instanceof Error
      ) {
        setError(err.message);
      } else {
        setError(
          "Unable to create product.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     PREVIEW URL
  ========================================================== */

  const imageToShow =
    imagePreview ||
    form.image.trim();

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-10 lg:py-12">
        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          href="/admin/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Products
        </Link>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <h1 className="font-heading text-4xl text-primary lg:text-5xl">
            Add Product
          </h1>

          <p className="mt-2 text-muted-foreground">
            Add a new product to the
            MS Cards catalogue.
          </p>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm leading-6 text-destructive">
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm leading-6 text-green-700">
            {success}
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">
            <div>
              <h2 className="font-heading text-xl">
                Product Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Basic information about the
                product.
              </p>
            </div>

            <div className="mt-7 space-y-6">
              {/* ---------------------------------------------
                  PRODUCT NAME
              --------------------------------------------- */}

              <div>
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Product Name
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Royal Velvet Wedding Invitation"
                  required
                  disabled={saving}
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  The slug will be generated
                  automatically from the
                  product name.
                </p>
              </div>

              {/* ---------------------------------------------
                  SLUG
              --------------------------------------------- */}

              <div>
                <label
                  htmlFor="product-slug"
                  className="mb-2 block text-sm font-medium"
                >
                  Slug
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <input
                  id="product-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    handleSlugChange(
                      event.target.value,
                    )
                  }
                  placeholder="royal-velvet-wedding-invitation"
                  required
                  disabled={saving}
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Used for the product URL.
                  Only letters, numbers and
                  hyphens are used.
                </p>
              </div>

              {/* ---------------------------------------------
                  CATEGORY + COLLECTION
              --------------------------------------------- */}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* CATEGORY */}

                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                    <span className="ml-1 text-destructive">
                      *
                    </span>
                  </label>

                  <select
                    id="product-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        "category",
                        event.target.value,
                      )
                    }
                    required
                    disabled={
                      saving ||
                      loadingData
                    }
                    className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingData
                        ? "Loading categories..."
                        : "Select Category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>

                  {!loadingData &&
                    categories.length ===
                      0 && (
                      <p className="mt-2 text-xs text-destructive">
                        No active categories
                        are available.
                      </p>
                    )}
                </div>

                {/* COLLECTION */}

                <div>
                  <label
                    htmlFor="product-collection"
                    className="mb-2 block text-sm font-medium"
                  >
                    Collection
                  </label>

                  <select
                    id="product-collection"
                    value={
                      form.collection
                    }
                    onChange={(event) =>
                      updateForm(
                        "collection",
                        event.target.value,
                      )
                    }
                    disabled={
                      saving ||
                      loadingData
                    }
                    className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingData
                        ? "Loading collections..."
                        : "No Collection"}
                    </option>

                    {collections.map(
                      (collection) => (
                        <option
                          key={
                            collection.id
                          }
                          value={
                            collection.id
                          }
                        >
                          {collection.name}
                        </option>
                      ),
                    )}
                  </select>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Choose the main website
                    section where this
                    product should appear.
                  </p>
                </div>
              </div>

              {/* ---------------------------------------------
                  MATERIAL
              --------------------------------------------- */}

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
                  value={form.material}
                  onChange={(event) =>
                    updateForm(
                      "material",
                      event.target.value,
                    )
                  }
                  placeholder="Example: Velvet, Acrylic, Handmade Paper"
                  disabled={saving}
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* ---------------------------------------------
                  DESCRIPTION
              --------------------------------------------- */}

              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="product-description"
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                  rows={6}
                  placeholder="Describe the product, finish, design and important details..."
                  disabled={saving}
                  className="w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">
            <div>
              <h2 className="font-heading text-xl">
                Product Image
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload the product image to
                Cloudinary.
              </p>
            </div>

            <div className="mt-7">
              {/* IMAGE PREVIEW */}

              {imageToShow ? (
                <div className="relative overflow-hidden rounded-2xl border bg-muted">
                  <div className="aspect-[16/9] w-full">
                    <img
                      src={imageToShow}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    disabled={
                      saving ||
                      uploadingImage
                    }
                    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No product image selected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or WEBP up to
                    5 MB
                  </p>
                </div>
              )}

              {/* FILE INPUT */}

              <div className="mt-5">
                <label
                  htmlFor="product-image-file"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-5 py-4 text-sm font-medium transition hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="h-4 w-4" />

                  {imageFile
                    ? "Choose Different Image"
                    : "Choose Product Image"}

                  <input
                    id="product-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      saving ||
                      uploadingImage
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* MANUAL URL */}

              <div className="mt-6">
                <label
                  htmlFor="product-image-url"
                  className="mb-2 block text-sm font-medium"
                >
                  Or enter an image URL
                </label>

                <input
                  id="product-image-url"
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    updateForm(
                      "image",
                      event.target.value,
                    )
                  }
                  placeholder="https://res.cloudinary.com/..."
                  disabled={
                    saving ||
                    Boolean(imageFile)
                  }
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {imageFile && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    A selected file will
                    be uploaded to
                    Cloudinary when you
                    save the product.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              PRODUCT SETTINGS
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">
            <div>
              <h2 className="font-heading text-xl">
                Product Settings
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Control how the product
                appears on the website.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {/* FEATURED */}

              <label className="flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <input
                  type="checkbox"
                  checked={
                    form.featured
                  }
                  onChange={(event) =>
                    updateForm(
                      "featured",
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                  className="mt-1 h-4 w-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Featured Product
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Show this product in
                    the Featured Products
                    section when enabled.
                  </span>
                </span>
              </label>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <input
                  type="checkbox"
                  checked={
                    form.active
                  }
                  onChange={(event) =>
                    updateForm(
                      "active",
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                  className="mt-1 h-4 w-4 accent-primary"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Active Product
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Active products are
                    visible on the public
                    catalogue.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* =================================================
              CATALOGUE PREVIEW
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">
            <h2 className="font-heading text-xl">
              Catalogue Placement
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              This is where the product will
              appear on the customer-facing
              website.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </p>

                <p className="mt-2 text-lg font-medium">
                  {categories.find(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                      form.category,
                  )?.name ||
                    "Not selected"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collection
                </p>

                <p className="mt-2 text-lg font-medium">
                  {collections.find(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                      form.collection,
                  )?.name ||
                    "No Collection"}
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="inline-flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-medium transition hover:bg-muted"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingImage ||
                loadingData
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Creating Product...
                </>
              ) : uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Uploading Image...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />

                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}