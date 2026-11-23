"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  GripVertical,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
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


type ProductImage = {
  id: number;
  image: string;
  cloudinary_public_id?: string;
  is_primary: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};


type Product = {
  id: number;

  name: string;
  slug: string;

  category: number | null;

  category_name?: string;
  category_slug?: string;

  collections?: number[];

  collection_ids?: number[];

  collection_slugs?: string[];

  collection_names?: string[];

  material: string;

  image?: string | null;

  cloudinary_public_id?: string;

  images?: ProductImage[];

  description: string;

  featured: boolean;

  active: boolean;

  is_deleted?: boolean;
};


type UploadResponse = {
  url: string;
  public_id?: string;
};


type SelectedImage = {
  file: File;
  preview: string;
};


/* ============================================================
   HELPERS
============================================================ */

function generateSlug(
  value: string,
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function getApiErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (!data) {
    return fallback;
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
  }

  return fallback;
}


/* ============================================================
   PAGE
============================================================ */

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


  /* ==========================================================
     PRODUCT DATA
  ========================================================== */

  const [product, setProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [collections, setCollections] =
    useState<Collection[]>([]);


  /* ==========================================================
     FORM
  ========================================================== */

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [collection, setCollection] =
    useState("");

  const [material, setMaterial] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [featured, setFeatured] =
    useState(false);

  const [active, setActive] =
    useState(true);


  /* ==========================================================
     IMAGES
  ========================================================== */

  const [productImages, setProductImages] =
    useState<ProductImage[]>([]);

  const [selectedImages, setSelectedImages] =
    useState<SelectedImage[]>([]);

  const [draggingImageId, setDraggingImageId] =
    useState<number | null>(null);

  const [dropTargetImageId, setDropTargetImageId] =
    useState<number | null>(null);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [deletingImageId, setDeletingImageId] =
    useState<number | null>(null);

  const [settingPrimaryId, setSettingPrimaryId] =
    useState<number | null>(null);

  const [savingOrder, setSavingOrder] =
    useState(false);


  /* ==========================================================
     PAGE STATE
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingProduct, setDeletingProduct] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ==========================================================
     LOAD DATA
  ========================================================== */

  async function loadData() {
    if (!productSlug) {
      setError("Product slug is missing.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

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
            cache: "no-store",
          },
        ),

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


      /* ------------------------------------------------------
         PRODUCT
      ------------------------------------------------------ */

      if (!productResponse.ok) {
        const text =
          await productResponse.text();

        throw new Error(
          text ||
            `Failed to load product (${productResponse.status}).`,
        );
      }


      /* ------------------------------------------------------
         CATEGORIES
      ------------------------------------------------------ */

      if (!categoriesResponse.ok) {
        throw new Error(
          `Failed to load categories (${categoriesResponse.status}).`,
        );
      }


      /* ------------------------------------------------------
         COLLECTIONS
      ------------------------------------------------------ */

      if (!collectionsResponse.ok) {
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


      const categoriesData: Category[] =
        Array.isArray(categoriesJson)
          ? categoriesJson
          : Array.isArray(categoriesJson?.results)
            ? categoriesJson.results
            : [];


      const collectionsData: Collection[] =
        Array.isArray(collectionsJson)
          ? collectionsJson
          : Array.isArray(collectionsJson?.results)
            ? collectionsJson.results
            : [];


      setProduct(productData);


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


      /* ------------------------------------------------------
         FORM VALUES
      ------------------------------------------------------ */

      setName(
        productData.name || "",
      );

      setSlug(
        productData.slug || "",
      );

      setCategory(
        productData.category
          ? String(productData.category)
          : "",
      );


      const productCollectionId =
        productData.collection_ids?.[0] ??
        productData.collections?.[0] ??
        "";

      setCollection(
        productCollectionId
          ? String(productCollectionId)
          : "",
      );


      setMaterial(
        productData.material || "",
      );

      setDescription(
        productData.description || "",
      );

      setFeatured(
        productData.featured ?? false,
      );

      setActive(
        productData.active ?? true,
      );


      /* ------------------------------------------------------
         PRODUCT IMAGES
      ------------------------------------------------------ */

      const backendImages =
        Array.isArray(productData.images)
          ? productData.images
          : [];


      /*
       * Sort images using display_order.
       */
      const sortedImages =
        [...backendImages].sort(
          (a, b) =>
            a.display_order -
            b.display_order,
        );


      /*
       * Fallback for older products.
       */
      if (
        sortedImages.length === 0 &&
        productData.image
      ) {
        setProductImages([
          {
            id: 0,
            image: productData.image,
            cloudinary_public_id:
              productData.cloudinary_public_id,
            is_primary: true,
            display_order: 0,
          },
        ]);
      } else {
        setProductImages(
          sortedImages,
        );
      }
    } catch (err) {
      console.error(
        "Product loading error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load product.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadData();
  }, [productSlug]);


  /* ==========================================================
     SELECTED CATEGORY / COLLECTION
  ========================================================== */

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (item) =>
            String(item.id) ===
            category,
        ),
      [
        categories,
        category,
      ],
    );


  const selectedCollection =
    useMemo(
      () =>
        collections.find(
          (item) =>
            String(item.id) ===
            collection,
        ),
      [
        collections,
        collection,
      ],
    );


  /* ==========================================================
     PRODUCT NAME
  ========================================================== */

  function handleNameChange(
    value: string,
  ) {
    setName(value);

    setSlug(
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


    files.forEach((file) => {
      if (
        !allowedTypes.includes(
          file.type,
        )
      ) {
        errors.push(
          `${file.name}: Only JPG, PNG, and WEBP images are allowed.`,
        );

        return;
      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {
        errors.push(
          `${file.name}: Maximum image size is 5 MB.`,
        );

        return;
      }


      validFiles.push(file);
    });


    if (validFiles.length > 0) {
      const newImages =
        validFiles.map((file) => ({
          file,
          preview:
            URL.createObjectURL(file),
        }));

      setSelectedImages(
        (current) => [
          ...current,
          ...newImages,
        ],
      );
    }


    if (errors.length > 0) {
      setError(
        errors.join(" "),
      );
    } else {
      setError("");
    }


    event.target.value = "";
  }


  /* ==========================================================
     REMOVE NEW IMAGE BEFORE UPLOAD
  ========================================================== */

  function removeSelectedImage(
    index: number,
  ) {
    setSelectedImages(
      (current) => {
        const image =
          current[index];

        if (
          image?.preview.startsWith(
            "blob:",
          )
        ) {
          URL.revokeObjectURL(
            image.preview,
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
     UPLOAD IMAGE TO CLOUDINARY
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
          "Unable to upload image.",
        ),
      );
    }


    if (
      !data ||
      typeof data !== "object" ||
      !("url" in data)
    ) {
      throw new Error(
        "Cloudinary did not return an image URL.",
      );
    }


    return data as UploadResponse;
  }


  /* ==========================================================
     ATTACH IMAGE TO PRODUCT
  ========================================================== */

  async function attachImageToProduct(
    productId: number,
    imageUrl: string,
    publicId: string,
    isPrimary: boolean,
  ) {
    const response =
      await adminFetch(
        `${API_URL}/api/products/${productId}/images/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            image: imageUrl,

            cloudinary_public_id:
              publicId,

            is_primary:
              isPrimary,
          }),
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
          "Unable to attach image to product.",
        ),
      );
    }


    return data as ProductImage;
  }


  /* ==========================================================
     UPLOAD ALL NEW IMAGES
  ========================================================== */

  async function uploadSelectedImages() {
    if (
      !product ||
      selectedImages.length === 0
    ) {
      return;
    }


    try {
      setUploadingImages(true);

      setError("");

      const uploadedImages: ProductImage[] =
        [];


      for (
        let index = 0;
        index < selectedImages.length;
        index += 1
      ) {
        const selected =
          selectedImages[index];


        const uploadResult =
          await uploadProductImage(
            selected.file,
          );


        const attachedImage =
          await attachImageToProduct(
            product.id,
            uploadResult.url,
            uploadResult.public_id || "",
            productImages.length === 0 &&
              index === 0,
          );


        uploadedImages.push(
          attachedImage,
        );
      }


      setProductImages(
        (current) =>
          [
            ...current.filter(
              (image) => image.id !== 0,
            ),
            ...uploadedImages,
          ].sort(
            (a, b) =>
              a.display_order -
              b.display_order,
          ),
      );


      selectedImages.forEach(
        (item) => {
          if (
            item.preview.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              item.preview,
            );
          }
        },
      );


      setSelectedImages([]);


      setSuccess(
        `${uploadedImages.length} image${
          uploadedImages.length === 1
            ? ""
            : "s"
        } added successfully.`,
      );


      await loadData();
    } catch (err) {
      console.error(
        "Image upload error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload images.",
      );
    } finally {
      setUploadingImages(false);
    }
  }


  /* ==========================================================
     DELETE IMAGE
  ========================================================== */

  async function deleteProductImage(
    imageItem: ProductImage,
  ) {
    if (imageItem.id === 0) {
      setError(
        "This legacy image cannot be deleted individually.",
      );

      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this image?",
      );

    if (!confirmed) {
      return;
    }


    try {
      setDeletingImageId(
        imageItem.id,
      );

      setError("");

      setSuccess("");


      const response =
        await adminFetch(
          `${API_URL}/api/products/images/${imageItem.id}/`,
          {
            method: "DELETE",
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
            "Unable to delete image.",
          ),
        );
      }


      setProductImages(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              imageItem.id,
          ),
      );


      setSuccess(
        "Image deleted successfully.",
      );


      await loadData();
    } catch (err) {
      console.error(
        "Image delete error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete image.",
      );
    } finally {
      setDeletingImageId(null);
    }
  }


  /* ==========================================================
     SET PRIMARY IMAGE
  ========================================================== */

  async function setPrimaryImage(
    imageItem: ProductImage,
  ) {
    if (imageItem.id === 0) {
      return;
    }


    try {
      setSettingPrimaryId(
        imageItem.id,
      );

      setError("");

      setSuccess("");


      const response =
        await adminFetch(
          `${API_URL}/api/products/images/${imageItem.id}/set-primary/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },
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
            "Unable to set primary image.",
          ),
        );
      }


      setProductImages(
        (current) =>
          current.map(
            (item) => ({
              ...item,

              is_primary:
                item.id ===
                imageItem.id,
            }),
          ),
      );


      setSuccess(
        "Primary image updated.",
      );


      await loadData();
    } catch (err) {
      console.error(
        "Primary image error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to set primary image.",
      );
    } finally {
      setSettingPrimaryId(null);
    }
  }


  /* ==========================================================
     SAVE IMAGE ORDER
  ========================================================== */

  async function saveImageOrder(
    orderedImages: ProductImage[],
  ) {
    if (!product) {
      return;
    }


    /*
     * Ignore legacy fallback image.
     */
    const realImages =
      orderedImages.filter(
        (item) => item.id !== 0,
      );


    if (realImages.length === 0) {
      return;
    }


    const response =
      await adminFetch(
        `${API_URL}/api/products/${product.id}/images/reorder/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            image_ids:
              realImages.map(
                (item) => item.id,
              ),
          }),
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
          "Unable to save image order.",
        ),
      );
    }


    if (Array.isArray(data)) {
      setProductImages(
        [...data].sort(
          (a, b) =>
            a.display_order -
            b.display_order,
        ),
      );
    }
  }


  /* ==========================================================
     DRAG START
  ========================================================== */

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    imageId: number,
  ) {
    if (
      imageId === 0 ||
      savingOrder
    ) {
      event.preventDefault();

      return;
    }


    setDraggingImageId(
      imageId,
    );

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      String(imageId),
    );
  }


  /* ==========================================================
     DRAG OVER
  ========================================================== */

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
    imageId: number,
  ) {
    event.preventDefault();

    if (
      imageId !==
      draggingImageId
    ) {
      setDropTargetImageId(
        imageId,
      );
    }
  }


  /* ==========================================================
     DRAG LEAVE
  ========================================================== */

  function handleDragLeave() {
    setDropTargetImageId(null);
  }


  /* ==========================================================
     DRAG END
  ========================================================== */

  function handleDragEnd() {
    setDraggingImageId(null);

    setDropTargetImageId(null);
  }


  /* ==========================================================
     DROP
  ========================================================== */

  async function handleDrop(
    event: DragEvent<HTMLDivElement>,
    targetId: number,
  ) {
    event.preventDefault();


    if (
      draggingImageId === null ||
      draggingImageId === targetId ||
      savingOrder
    ) {
      setDraggingImageId(null);

      setDropTargetImageId(null);

      return;
    }


    const sourceIndex =
      productImages.findIndex(
        (item) =>
          item.id ===
          draggingImageId,
      );


    const targetIndex =
      productImages.findIndex(
        (item) =>
          item.id ===
          targetId,
      );


    if (
      sourceIndex === -1 ||
      targetIndex === -1
    ) {
      setDraggingImageId(null);

      setDropTargetImageId(null);

      return;
    }


    const previousImages =
      [...productImages];


    const reorderedImages =
      [...productImages];


    const [movedImage] =
      reorderedImages.splice(
        sourceIndex,
        1,
      );


    if (!movedImage) {
      return;
    }


    reorderedImages.splice(
      targetIndex,
      0,
      movedImage,
    );


    /*
     * Optimistic UI update.
     */
    const normalizedImages =
      reorderedImages.map(
        (item, index) => ({
          ...item,

          display_order:
            index,

          /*
           * First image becomes primary.
           */
          is_primary:
            index === 0,
        }),
      );


    setProductImages(
      normalizedImages,
    );

    setDraggingImageId(null);

    setDropTargetImageId(null);

    setSavingOrder(true);


    try {
      await saveImageOrder(
        normalizedImages,
      );

      setSuccess(
        "Image order updated successfully.",
      );
    } catch (err) {
      console.error(
        "Image reorder error:",
        err,
      );

      /*
       * Restore old order.
       */
      setProductImages(
        previousImages,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save image order.",
      );
    } finally {
      setSavingOrder(false);
    }
  }


  /* ==========================================================
     SAVE PRODUCT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    setSuccess("");


    const finalName =
      name.trim();

    const finalSlug =
      generateSlug(slug);

    const finalMaterial =
      material.trim();

    const finalDescription =
      description.trim();


    if (!finalName) {
      setError(
        "Product name is required.",
      );

      return;
    }


    if (!finalSlug) {
      setError(
        "Product slug is required.",
      );

      return;
    }


    if (!category) {
      setError(
        "Please select a category.",
      );

      return;
    }


    try {
      setSaving(true);


      const payload = {
        name: finalName,

        slug: finalSlug,

        category:
          Number(category),

        collections:
          collection
            ? [Number(collection)]
            : [],

        material:
          finalMaterial,

        description:
          finalDescription,

        featured,

        active,
      };


      const response =
        await adminFetch(
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
              payload,
            ),
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
            "Unable to update product.",
          ),
        );
      }


      const updatedProduct =
        data as Product;


      setProduct(
        updatedProduct,
      );


      setSuccess(
        "Product updated successfully.",
      );


      /*
       * If slug changed, move to new URL.
       */
      if (
        finalSlug !==
        productSlug
      ) {
        router.replace(
          `/admin/products/${encodeURIComponent(
            finalSlug,
          )}`,
        );
      }


      router.refresh();
    } catch (err) {
      console.error(
        "Product update error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product.",
      );
    } finally {
      setSaving(false);
    }
  }


  /* ==========================================================
     DELETE PRODUCT
  ========================================================== */

  async function handleDeleteProduct() {
    if (!product) {
      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`,
      );


    if (!confirmed) {
      return;
    }


    try {
      setDeletingProduct(true);

      setError("");

      setSuccess("");


      const response =
        await adminFetch(
          `${API_URL}/api/products/${encodeURIComponent(
            productSlug,
          )}/`,
          {
            method: "DELETE",
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
            "Unable to delete product.",
          ),
        );
      }


      router.push(
        "/admin/products",
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Product delete error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product.",
      );
    } finally {
      setDeletingProduct(false);
    }
  }


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </section>
      </main>
    );
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-12">


        {/* ====================================================
            BACK
        ==================================================== */}

        <Link
          href="/admin/products"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-muted-foreground
            transition
            hover:text-foreground
          "
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Products
        </Link>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">
          <h1
            className="
              font-heading
              text-4xl
              text-primary
              lg:text-5xl
            "
          >
            Edit Product
          </h1>

          <p className="mt-2 text-muted-foreground">
            Update product information and manage
            all product images.
          </p>
        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-destructive/30
              bg-destructive/10
              px-4
              py-3
              text-sm
              text-destructive
            "
          >
            {error}
          </div>
        )}


        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-green-500/30
              bg-green-500/10
              px-4
              py-3
              text-sm
              text-green-700
            "
          >
            {success}
          </div>
        )}


        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >


          {/* ==================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              bg-card
              p-6
              lg:p-8
            "
          >
            <div className="mb-6">
              <h2 className="font-heading text-xl">
                Product Information
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Basic information displayed for
                this product.
              </p>
            </div>


            <div className="space-y-6">


              {/* PRODUCT NAME */}

              <div>
                <label
                  htmlFor="product-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                  "
                >
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  required
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />
              </div>


              {/* SLUG */}

              <div>
                <label
                  htmlFor="product-slug"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                  "
                >
                  Slug
                </label>

                <input
                  id="product-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      generateSlug(
                        event.target.value,
                      ),
                    )
                  }
                  required
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-muted-foreground
                  "
                >
                  Changing the slug changes the
                  product URL.
                </p>
              </div>


              {/* CATEGORY + COLLECTION */}

              <div
                className="
                  grid
                  gap-6
                  lg:grid-cols-2
                "
              >


                {/* CATEGORY */}

                <div>
                  <label
                    htmlFor="product-category"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                    "
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
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
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
                    <p
                      className="
                        mt-2
                        text-xs
                        text-muted-foreground
                      "
                    >
                      Current category:{" "}

                      <span className="font-medium text-foreground">
                        {selectedCategory.name}
                      </span>
                    </p>
                  )}
                </div>


                {/* COLLECTION */}

                <div>
                  <label
                    htmlFor="product-collection"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                    "
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
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
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

                  {selectedCollection && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-primary
                      "
                    >
                      Current collection:{" "}

                      <span className="font-semibold">
                        {selectedCollection.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>


              {/* MATERIAL */}

              <div>
                <label
                  htmlFor="product-material"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                  "
                >
                  Model
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
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />
              </div>


              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="product-description"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                  "
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
                  className="
                    w-full
                    resize-y
                    rounded-lg
                    border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />
              </div>
            </div>
          </div>


          {/* ==================================================
              PRODUCT IMAGES
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              bg-card
              p-6
              lg:p-8
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div>
                <h2 className="font-heading text-xl">
                  Product Images
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    text-muted-foreground
                  "
                >
                  Drag and drop images to change their
                  position. The first image becomes the
                  primary image shown on the website.
                </p>
              </div>

              <div
                className="
                  shrink-0
                  rounded-full
                  bg-primary/10
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-primary
                "
              >
                {productImages.length} saved image
                {productImages.length === 1
                  ? ""
                  : "s"}
              </div>
            </div>


            {/* ================================================
                SAVED IMAGES
            ================================================ */}

            {productImages.length > 0 && (
              <div
                className="
                  mt-6
                  grid
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {productImages.map(
                  (imageItem, index) => {
                    const isDragging =
                      draggingImageId ===
                      imageItem.id;

                    const isDropTarget =
                      dropTargetImageId ===
                      imageItem.id;

                    return (
                      <div
                        key={imageItem.id}
                        draggable={
                          imageItem.id !== 0 &&
                          !savingOrder
                        }
                        onDragStart={(event) =>
                          handleDragStart(
                            event,
                            imageItem.id,
                          )
                        }
                        onDragOver={(event) =>
                          handleDragOver(
                            event,
                            imageItem.id,
                          )
                        }
                        onDragLeave={
                          handleDragLeave
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        onDrop={(event) =>
                          handleDrop(
                            event,
                            imageItem.id,
                          )
                        }
                        className={`
                          relative
                          overflow-hidden
                          rounded-xl
                          border
                          bg-muted/20
                          transition-all
                          duration-200
                          ${
                            isDragging
                              ? "scale-95 opacity-50"
                              : ""
                          }
                          ${
                            isDropTarget
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border"
                          }
                        `}
                      >


                        {/* IMAGE */}

                        <div
                          className="
                            relative
                            aspect-[4/3]
                            w-full
                            overflow-hidden
                            bg-muted
                          "
                        >
                          <Image
                            src={imageItem.image}
                            alt={`${name} image ${
                              index + 1
                            }`}
                            fill
                            sizes="
                              (max-width: 640px) 100vw,
                              (max-width: 1024px) 50vw,
                              33vw
                            "
                            className="object-cover"
                          />
                        </div>


                        {/* IMAGE NUMBER */}

                        <div
                          className="
                            absolute
                            left-3
                            top-3
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              rounded-full
                              bg-black/70
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              text-white
                              backdrop-blur
                            "
                          >
                            {index + 1}
                          </span>

                          {imageItem.is_primary && (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-primary
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-primary-foreground
                              "
                            >
                              <Star className="h-3 w-3 fill-current" />

                              Primary
                            </span>
                          )}
                        </div>


                        {/* DRAG HANDLE */}

                        {imageItem.id !== 0 && (
                          <div
                            className="
                              absolute
                              right-3
                              top-3
                              rounded-full
                              bg-black/70
                              p-2
                              text-white
                              backdrop-blur
                              cursor-grab
                              active:cursor-grabbing
                            "
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                        )}


                        {/* ACTIONS */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            border-t
                            bg-card
                            p-3
                          "
                        >
                          <span
                            className="
                              text-xs
                              text-muted-foreground
                            "
                          >
                            Position {index + 1}
                          </span>

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >


                            {/* SET PRIMARY */}

                            {!imageItem.is_primary &&
                              imageItem.id !== 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void setPrimaryImage(
                                      imageItem,
                                    )
                                  }
                                  disabled={
                                    settingPrimaryId ===
                                    imageItem.id
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    transition
                                    hover:bg-muted
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  {settingPrimaryId ===
                                  imageItem.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Star className="h-3.5 w-3.5" />
                                  )}

                                  Primary
                                </button>
                              )}


                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                void deleteProductImage(
                                  imageItem,
                                )
                              }
                              disabled={
                                deletingImageId ===
                                imageItem.id
                              }
                              className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-destructive/30
                                p-2
                                text-destructive
                                transition
                                hover:bg-destructive/10
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                              title="Delete image"
                            >
                              {deletingImageId ===
                              imageItem.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}


            {savingOrder && (
              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-muted-foreground
                "
              >
                <Loader2 className="h-4 w-4 animate-spin" />

                Saving image order...
              </div>
            )}


            {/* ================================================
                ADD NEW IMAGES
            ================================================ */}

            <div
              className="
                mt-8
                border-t
                pt-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <h3 className="font-semibold">
                    Add More Images
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Select multiple JPG, PNG, or WEBP
                    images. Maximum 5 MB per image.
                  </p>
                </div>

                <label
                  htmlFor="product-images"
                  className="
                    inline-flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    transition
                    hover:bg-muted
                  "
                >
                  <ImagePlus className="h-4 w-4" />

                  Select Images
                </label>

                <input
                  id="product-images"
                  type="file"
                  multiple
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp
                  "
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>


              {/* ============================================
                  SELECTED NEW IMAGES
              ============================================ */}

              {selectedImages.length > 0 && (
                <>
                  <div
                    className="
                      mt-6
                      grid
                      gap-4
                      sm:grid-cols-2
                      lg:grid-cols-4
                    "
                  >
                    {selectedImages.map(
                      (item, index) => (
                        <div
                          key={item.preview}
                          className="
                            relative
                            overflow-hidden
                            rounded-xl
                            border
                            bg-muted/20
                          "
                        >
                          <div
                            className="
                              relative
                              aspect-square
                              overflow-hidden
                            "
                          >
                            <Image
                              src={item.preview}
                              alt={`New image ${
                                index + 1
                              }`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(
                                index,
                              )
                            }
                            className="
                              absolute
                              right-2
                              top-2
                              rounded-full
                              bg-black/70
                              p-2
                              text-white
                              transition
                              hover:bg-destructive
                            "
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>


                          <div
                            className="
                              border-t
                              bg-card
                              px-3
                              py-2
                            "
                          >
                            <p
                              className="
                                truncate
                                text-xs
                                text-muted-foreground
                              "
                            >
                              {item.file.name}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      void uploadSelectedImages()
                    }
                    disabled={uploadingImages}
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      bg-primary
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-primary-foreground
                      transition
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Uploading Images...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />

                        Upload {selectedImages.length} Image
                        {selectedImages.length === 1
                          ? ""
                          : "s"}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>


          {/* ==================================================
              SETTINGS
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              bg-card
              p-6
              lg:p-8
            "
          >
            <h2 className="font-heading text-xl">
              Product Settings
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              Control how this product appears on
              the website.
            </p>


            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
              "
            >


              {/* FEATURED */}

              <label
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                  rounded-xl
                  border
                  p-4
                  transition
                  hover:bg-muted/30
                "
              >
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked,
                    )
                  }
                  className="
                    mt-1
                    h-4
                    w-4
                  "
                />

                <span>
                  <span className="block font-medium">
                    Featured Product
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Show this product in featured
                    product sections.
                  </span>
                </span>
              </label>


              {/* ACTIVE */}

              <label
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                  rounded-xl
                  border
                  p-4
                  transition
                  hover:bg-muted/30
                "
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(
                      event.target.checked,
                    )
                  }
                  className="
                    mt-1
                    h-4
                    w-4
                  "
                />

                <span>
                  <span className="block font-medium">
                    Active Product
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Active products are visible on
                    the customer website.
                  </span>
                </span>
              </label>
            </div>
          </div>


          {/* ==================================================
              SAVE
          ================================================== */}

          <div
            className="
              flex
              flex-col-reverse
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <button
              type="button"
              onClick={() =>
                void handleDeleteProduct()
              }
              disabled={
                deletingProduct ||
                saving
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-destructive/30
                px-5
                py-3
                text-sm
                font-semibold
                text-destructive
                transition
                hover:bg-destructive/10
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {deletingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />

                  Delete Product
                </>
              )}
            </button>


            <button
              type="submit"
              disabled={
                saving ||
                uploadingImages ||
                savingOrder
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-primary
                px-6
                py-3
                text-sm
                font-semibold
                text-primary-foreground
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Saving...
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
      </section>
    </main>
  );
}