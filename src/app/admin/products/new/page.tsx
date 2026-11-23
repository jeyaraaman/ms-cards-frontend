"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  GripVertical,
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
  public_id: string;
};

type SelectedProductImage = {
  file: File;
  preview: string;
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
      (data as {
        results?: unknown;
      }).results,
    )
  ) {
    return (
      data as {
        results: T[];
      }
    ).results;
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

  const [
    productImages,
    setProductImages,
  ] = useState<SelectedProductImage[]>([]);

  const [
    draggedImageIndex,
    setDraggedImageIndex,
  ] = useState<number | null>(null);

  const [
    dragOverImageIndex,
    setDragOverImageIndex,
  ] = useState<number | null>(null);

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
     CLEAN UP IMAGE PREVIEWS ON UNMOUNT
  ========================================================== */

  useEffect(() => {
    return () => {
      productImages.forEach(
        (productImage) => {
          if (
            productImage.preview.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              productImage.preview,
            );
          }
        },
      );
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
    const files =
      Array.from(
        event.target.files || [],
      );

    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles: File[] = [];

    const errors: string[] = [];

    for (const file of files) {
      if (
        !allowedTypes.includes(
          file.type,
        )
      ) {
        errors.push(
          `${file.name}: Only JPG, PNG, and WEBP images are allowed.`,
        );

        continue;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        errors.push(
          `${file.name}: Image size must be 5 MB or less.`,
        );

        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setError(
        errors.join(" "),
      );

      event.target.value = "";

      return;
    }

    setError(
      errors.join(" "),
    );

    const newImages =
      validFiles.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }));

    setProductImages(
      (current) => [
        ...current,
        ...newImages,
      ],
    );

    event.target.value = "";
  }

  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

  function removeImage(
    index: number,
  ) {
    if (
      saving ||
      uploadingImage
    ) {
      return;
    }

    setProductImages(
      (current) => {
        const removedImage =
          current[index];

        if (
          removedImage?.preview.startsWith(
            "blob:",
          )
        ) {
          URL.revokeObjectURL(
            removedImage.preview,
          );
        }

        return current.filter(
          (_, currentIndex) =>
            currentIndex !== index,
        );
      },
    );
  }

  /* ==========================================================
     DRAG AND DROP IMAGE REORDERING
  ========================================================== */

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) {
    if (
      saving ||
      uploadingImage
    ) {
      event.preventDefault();

      return;
    }

    setDraggedImageIndex(index);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      String(index),
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) {
    if (
      saving ||
      uploadingImage
    ) {
      return;
    }

    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    if (
      dragOverImageIndex !== index
    ) {
      setDragOverImageIndex(index);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    dropIndex: number,
  ) {
    event.preventDefault();

    if (
      saving ||
      uploadingImage ||
      draggedImageIndex === null
    ) {
      setDraggedImageIndex(null);
      setDragOverImageIndex(null);

      return;
    }

    if (
      draggedImageIndex === dropIndex
    ) {
      setDraggedImageIndex(null);
      setDragOverImageIndex(null);

      return;
    }

    setProductImages(
      (current) => {
        const updatedImages =
          [...current];

        const [
          draggedImage,
        ] = updatedImages.splice(
          draggedImageIndex,
          1,
        );

        updatedImages.splice(
          dropIndex,
          0,
          draggedImage,
        );

        return updatedImages;
      },
    );

    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  }

  function handleDragEnd() {
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  }

  /* ==========================================================
     UPLOAD PRODUCT IMAGE
  ========================================================== */

  async function uploadProductImage(
    file: File,
  ): Promise<UploadResponse> {
    const formData =
      new FormData();

    formData.append(
      "image",
      file,
    );

    const response =
      await adminFetch(
        `${API_URL}/api/products/images/upload/`,
        {
          method: "POST",
          body: formData,
        },
      );

    const rawResponse =
      await response.text();

    let data: unknown =
      null;

    try {
      data =
        rawResponse
          ? JSON.parse(rawResponse)
          : null;
    } catch {
      data = rawResponse;
    }

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(data),
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

    if (
      !("public_id" in data) ||
      typeof (
        data as {
          public_id?: unknown;
        }
      ).public_id !== "string"
    ) {
      throw new Error(
        "Image upload succeeded but Cloudinary did not return a public ID.",
      );
    }

    return data as UploadResponse;
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

    if (
      productImages.length === 0 &&
      !image
    ) {
      setError(
        "Please select at least one product image.",
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
      setUploadingImage(true);

      let imageUrl = image;

      let primaryPublicId = "";

      /* ------------------------------------------------------
         UPLOAD PRIMARY IMAGE
      ------------------------------------------------------ */

      if (
        productImages.length > 0
      ) {
        const uploadResult =
          await uploadProductImage(
            productImages[0].file,
          );

        imageUrl =
          uploadResult.url;

        primaryPublicId =
          uploadResult.public_id;
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

        collections:
          collectionIds,

        material,

        image: imageUrl,

        cloudinary_public_id:
          primaryPublicId,

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
         GET PRODUCT ID
      ------------------------------------------------------ */

      if (
        !responseData ||
        typeof responseData !== "object" ||
        !("id" in responseData)
      ) {
        throw new Error(
          "Product was created but the product ID was not returned.",
        );
      }

      const productId =
        Number(
          (
            responseData as {
              id: number;
            }
          ).id,
        );

      /* ------------------------------------------------------
         ATTACH REMAINING IMAGES
      ------------------------------------------------------ */

      for (
        let index = 1;
        index < productImages.length;
        index++
      ) {
        const selectedImage =
          productImages[index];

        const uploadResult =
          await uploadProductImage(
            selectedImage.file,
          );

        const attachResponse =
          await adminFetch(
            `${API_URL}/api/products/${productId}/images/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                image:
                  uploadResult.url,

                cloudinary_public_id:
                  uploadResult.public_id,

                is_primary:
                  false,

                display_order:
                  index,
              }),
            },
          );

        const attachRawResponse =
          await attachResponse.text();

        let attachData: unknown =
          null;

        try {
          attachData =
            attachRawResponse
              ? JSON.parse(
                  attachRawResponse,
                )
              : null;
        } catch {
          attachData =
            attachRawResponse;
        }

        if (!attachResponse.ok) {
          throw new Error(
            `Product was created, but image ${
              index + 1
            } could not be attached: ${getApiErrorMessage(
              attachData,
            )}`,
          );
        }
      }

      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setSuccess(
        "Product created successfully.",
      );

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
      setUploadingImage(false);
    }
  }

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

              <div className="grid gap-6 lg:grid-cols-2">

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
                </div>

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
                </div>

              </div>

              <div>
                <label
                  htmlFor="product-material"
                  className="mb-2 block text-sm font-medium"
                >
                  Model
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
                  placeholder="Example: Premium Paper, Acrylic, Wood"
                  disabled={saving}
                  className="h-12 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Write a description about this product..."
                  rows={5}
                  disabled={saving}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

            </div>

          </section>

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">

            <div>
              <h2 className="font-heading text-xl">
                Product Images
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Drag and drop images to rearrange
                them. The first image will be the
                primary product image.
              </p>
            </div>

            {productImages.length > 0 ? (

              <>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">

                  <div className="flex items-center gap-2">

                    <GripVertical className="h-4 w-4 text-primary" />

                    <span>
                      Drag an image and drop it
                      in a new position to rearrange
                      the product images.
                    </span>

                  </div>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {productImages.map(
                    (
                      productImage,
                      index,
                    ) => {

                      const isDragging =
                        draggedImageIndex ===
                        index;

                      const isDragOver =
                        dragOverImageIndex ===
                          index &&
                        draggedImageIndex !==
                          index;

                      return (

                        <div
                          key={
                            productImage.preview
                          }

                          draggable={
                            !saving &&
                            !uploadingImage
                          }

                          onDragStart={(event) =>
                            handleDragStart(
                              event,
                              index,
                            )
                          }

                          onDragOver={(event) =>
                            handleDragOver(
                              event,
                              index,
                            )
                          }

                          onDrop={(event) =>
                            handleDrop(
                              event,
                              index,
                            )
                          }

                          onDragEnd={
                            handleDragEnd
                          }

                          className={`relative cursor-grab overflow-hidden rounded-xl border bg-muted/20 transition-all duration-200 active:cursor-grabbing ${
                            isDragging
                              ? "scale-[0.98] opacity-40"
                              : ""
                          } ${
                            isDragOver
                              ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                              : ""
                          } ${
                            saving ||
                            uploadingImage
                              ? "cursor-default"
                              : "hover:border-primary/50 hover:shadow-lg"
                          }`}
                        >

                          {/* DRAG HANDLE */}

                          <div className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">

                            <GripVertical className="h-4 w-4" />

                          </div>

                          {/* IMAGE */}

                          <img
                            src={
                              productImage.preview
                            }
                            alt={`Product image ${
                              index + 1
                            }`}
                            draggable={false}
                            className="aspect-square w-full select-none object-cover"
                          />

                          {/* PRIMARY */}

                          {index === 0 && (

                            <div className="absolute left-3 top-14 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">

                              Primary

                            </div>

                          )}

                          {/* REMOVE */}

                          <button
                            type="button"

                            onClick={() =>
                              removeImage(index)
                            }

                            disabled={
                              saving ||
                              uploadingImage
                            }

                            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"

                            aria-label={`Remove image ${
                              index + 1
                            }`}
                          >

                            <X className="h-4 w-4" />

                          </button>

                          {/* FOOTER */}

                          <div className="border-t bg-background px-3 py-3">

                            <div className="flex items-center justify-between gap-3">

                              <div>

                                <p className="text-sm font-medium">
                                  Image {index + 1}
                                </p>

                                {index === 0 && (

                                  <p className="mt-1 text-xs text-primary">
                                    Primary product image
                                  </p>

                                )}

                              </div>

                              <span className="text-xs text-muted-foreground">
                                Drag to move
                              </span>

                            </div>

                          </div>

                        </div>

                      );
                    },
                  )}

                </div>
              </>

            ) : (

              <div className="mt-6 flex aspect-[16/9] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20">

                <ImagePlus className="h-10 w-10 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No images selected
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Select one or more product
                  images.
                </p>

              </div>

            )}

            {/* ADD IMAGES */}

            <div className="mt-6">

              <label
                htmlFor="product-image-file"

                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-background px-5 py-5 text-sm font-medium transition hover:border-primary hover:bg-primary/5"
              >

                <Upload className="h-5 w-5" />

                Add Product Images

                <input
                  id="product-image-file"

                  type="file"

                  multiple

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

            <p className="mt-3 text-xs text-muted-foreground">
              JPG, PNG and WEBP supported.
              Maximum size: 5 MB per image.
            </p>

          </section>

          {/* =================================================
              STATUS
          ================================================= */}

          <section className="rounded-2xl border bg-card p-6 lg:p-8">

            <div>
              <h2 className="font-heading text-xl">
                Product Status
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Control how this product appears
                on the website.
              </p>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">

              <label className="flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition hover:bg-muted/30">

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

                  className="mt-1 h-4 w-4"
                />

                <div>

                  <p className="font-medium">
                    Featured Product
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Display this product in
                    featured sections.
                  </p>

                </div>

              </label>

              <label className="flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition hover:bg-muted/30">

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

                  className="mt-1 h-4 w-4"
                />

                <div>

                  <p className="font-medium">
                    Active Product
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Active products are visible
                    in the catalogue.
                  </p>

                </div>

              </label>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">

            <Link
              href="/admin/products"

              className="inline-flex h-12 items-center justify-center rounded-lg border px-6 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
            >
              Cancel
            </Link>

            <button
              type="submit"

              disabled={
                saving ||
                loadingData ||
                uploadingImage
              }

              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Creating Product...
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