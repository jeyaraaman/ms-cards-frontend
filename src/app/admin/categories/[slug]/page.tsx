"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  adminFetch,
} from "@/lib/admin-auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_URL = BACKEND_URL.endsWith("/api")
  ? BACKEND_URL
  : `${BACKEND_URL}/api`;

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  cloudinary_public_id?: string;
  active: boolean;
  product_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;

  collection: number | null;
  collection_name: string | null;
  collection_slug: string | null;

  description: string;

  image: string;
  cloudinary_public_id: string;

  active: boolean;
  product_count: number;

  /*
   * Home page premium collection settings
   */
  featured_on_home: boolean;
  home_display_order: number | null;

  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_name?: string;
  image?: string;
  active?: boolean;
  collections?: number[];
  collection_ids?: number[];
}

interface ApiError {
  [key: string]: unknown;
}

interface UploadResponse {
  url?: string;
  public_id?: string;
  image?: string[];
  detail?: string;
}

function formatApiError(
  data: unknown,
): string {
  if (!data) {
    return "Unknown server error.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const errorData =
      data as ApiError;

    return Object.entries(errorData)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (
          typeof value === "object" &&
          value !== null
        ) {
          return `${key}: ${JSON.stringify(
            value,
          )}`;
        }

        return `${key}: ${String(value)}`;
      })
      .join(" | ");
  }

  return "Something went wrong.";
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(
    "admin_access_token",
  );
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const rawSlug = params?.slug;

  const slug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
        ? rawSlug[0] ?? ""
        : "";

  const [category, setCategory] =
    useState<Category | null>(null);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingCollections, setLoadingCollections] =
    useState(true);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [selectedProductIds, setSelectedProductIds] =
    useState<number[]>([]);

  const [productSearch, setProductSearch] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [imageUploading, setImageUploading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [categorySlug, setCategorySlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [collection, setCollection] =
    useState("");

  const [image, setImage] =
    useState("");

  const [imagePublicId, setImagePublicId] =
    useState("");

  const [imageName, setImageName] =
    useState("");

  const [imageError, setImageError] =
    useState("");

  const [active, setActive] =
    useState(true);

  /*
   * Home page premium collection settings
   */
  const [featuredOnHome, setFeaturedOnHome] =
    useState(false);

  const [homeDisplayOrder, setHomeDisplayOrder] =
    useState("1");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Check whether selected collection
   * is Premium Collection.
   */
  const isPremiumCollection =
    collections.find(
      (item) =>
        String(item.id) === collection,
    )?.slug === "premium-collection";

  function clearAuthAndLogin() {
    sessionStorage.removeItem(
      "admin_access_token",
    );

    sessionStorage.removeItem(
      "admin_refresh_token",
    );

    router.replace("/admin/login");
  }

  /*
   * Load category
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchCategory() {
      if (!slug) {
        if (!cancelled) {
          setLoading(false);
          setError(
            "Category slug is missing.",
          );
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const encodedSlug =
          encodeURIComponent(
            String(slug),
          );

        const url =
          `${API_URL}/products/categories/${encodedSlug}/`;

        const response = await adminFetch(
          url,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          clearAuthAndLogin();
          return;
        }

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to load category (${response.status}): ${responseText}`,
          );
        }

        let data: Category;

        try {
          data =
            JSON.parse(
              responseText,
            ) as Category;
        } catch {
          throw new Error(
            "Category API returned invalid JSON.",
          );
        }

        if (cancelled) {
          return;
        }

        setCategory(data);

        setName(
          data.name || "",
        );

        setCategorySlug(
          data.slug || "",
        );

        setDescription(
          data.description || "",
        );

        setCollection(
          data.collection !== null &&
            data.collection !== undefined
            ? String(
                data.collection,
              )
            : "",
        );

        setImage(
          data.image || "",
        );

        setImagePublicId(
          data.cloudinary_public_id ||
            "",
        );

        setImageName(
          data.image
            ? "Current category image"
            : "",
        );

        setActive(
          Boolean(data.active),
        );

        /*
         * Load home page settings
         */
        setFeaturedOnHome(
          Boolean(
            data.featured_on_home,
          ),
        );

        setHomeDisplayOrder(
          data.home_display_order !==
            null &&
          data.home_display_order !==
            undefined
            ? String(
                data.home_display_order,
              )
            : "1",
        );
      } catch (err) {
        console.error(
          "Failed to load category:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load category.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCategory();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
   * Load products for category assignment.
   * Product.category is a single foreign key, so selecting a product
   * here moves it from its previous category when saved.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      if (!category?.id) return;

      try {
        setLoadingProducts(true);

        const response = await adminFetch(
          `${API_URL}/products/`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          clearAuthAndLogin();
          return;
        }

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(
            `Failed to load products (${response.status}): ${responseText}`,
          );
        }

        const parsed = JSON.parse(responseText) as
          | Product[]
          | { results?: Product[] };
        const productList = Array.isArray(parsed)
          ? parsed
          : parsed.results || [];

        if (cancelled) return;

        setProducts(productList);
        setSelectedProductIds(
          productList
            .filter((product) => Number(product.category) === category.id)
            .map((product) => product.id),
        );
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load products.",
          );
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [category?.id]);

  /*
   * Load collections
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      try {
        setLoadingCollections(true);

        const url =
          `${API_URL}/products/collections/`;

        const response = await adminFetch(
          url,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          clearAuthAndLogin();
          return;
        }

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to load collections (${response.status}): ${responseText}`,
          );
        }

        let data: unknown;

        try {
          data =
            JSON.parse(responseText);
        } catch {
          throw new Error(
            "Collections API returned invalid JSON.",
          );
        }

        let collectionList: Collection[] =
          [];

        if (Array.isArray(data)) {
          collectionList =
            data as Collection[];
        } else if (
          typeof data === "object" &&
          data !== null &&
          "results" in data &&
          Array.isArray(
            (
              data as {
                results: unknown;
              }
            ).results,
          )
        ) {
          collectionList =
            (
              data as {
                results: Collection[];
              }
            ).results;
        }

        if (!cancelled) {
          setCollections(
            collectionList.filter(
              (item) => item.active,
            ),
          );
        }
      } catch (err) {
        console.error(
          "Failed to load collections:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCollections(false);
        }
      }
    }

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * If the selected collection is
   * changed away from Premium Collection,
   * automatically disable Home featuring.
   */
  useEffect(() => {
    if (
      !isPremiumCollection &&
      featuredOnHome
    ) {
      setFeaturedOnHome(false);
    }
  }, [
    isPremiumCollection,
    featuredOnHome,
  ]);

  /*
   * Open File Explorer
   */
  function openFilePicker() {
    if (saving || imageUploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  /*
   * Upload category image
   */
  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");
    setError("");
    setSuccess("");

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
      setImageError(
        "Only JPG, JPEG, and WEBP images are allowed.",
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setImageError(
        "Image size must be 5 MB or less.",
      );

      event.target.value = "";
      return;
    }

    setImageName(file.name);
    setImageUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        file,
      );

      const response =
        await adminFetch(
          `${API_URL}/products/categories/upload-image/`,
          {
            method: "POST",
            body: formData,
          },
        );

      if (response.status === 401) {
        clearAuthAndLogin();
        return;
      }

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | UploadResponse
          | null;

      if (!response.ok) {
        if (
          data?.image &&
          Array.isArray(data.image)
        ) {
          throw new Error(
            data.image.join(" "),
          );
        }

        if (data?.detail) {
          throw new Error(
            data.detail,
          );
        }

        throw new Error(
          "Unable to upload category image.",
        );
      }

      if (!data?.url) {
        throw new Error(
          "Cloudinary did not return an image URL.",
        );
      }

      setImage(data.url);

      setImagePublicId(
        data.public_id || "",
      );

      setSuccess(
        "New category image uploaded successfully. Click Save Changes to keep it.",
      );
    } catch (err) {
      console.error(
        "Category image upload error:",
        err,
      );

      setImageError(
        err instanceof Error
          ? err.message
          : "Unable to upload image. Please try again.",
      );
    } finally {
      setImageUploading(false);

      event.target.value = "";
    }
  }

  /*
   * Remove image
   */
  function removeImage() {
    if (saving || imageUploading) {
      return;
    }

    setImage("");
    setImagePublicId("");
    setImageName("");
    setImageError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * Save category
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!slug) {
      setError(
        "Category slug is missing.",
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Category name is required.",
      );
      return;
    }

    if (!categorySlug.trim()) {
      setError(
        "Category slug is required.",
      );
      return;
    }

    if (!collection) {
      setError(
        "Please select a collection type.",
      );
      return;
    }

    if (imageUploading) {
      setError(
        "Please wait until the image upload is complete.",
      );
      return;
    }

    /*
     * Premium Home validation
     */
    if (
      featuredOnHome &&
      !isPremiumCollection
    ) {
      setError(
        "Only categories assigned to Premium Collection can be featured on the Home page.",
      );
      return;
    }

    if (
      featuredOnHome &&
      !["1", "2", "3", "4"].includes(
        homeDisplayOrder,
      )
    ) {
      setError(
        "Home display order must be between 1 and 4.",
      );
      return;
    }

    try {
      setSaving(true);

      const encodedSlug =
        encodeURIComponent(
          String(slug),
        );

      const url =
        `${API_URL}/products/categories/${encodedSlug}/`;

      const finalSlug =
        categorySlug
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9-]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "");

      const payload = {
        name: name.trim(),

        slug: finalSlug,

        collection:
          Number(collection),

        description:
          description.trim(),

        image: image.trim(),

        active,

        /*
         * Only Premium Collection categories
         * can be featured on Home.
         */
        featured_on_home:
          isPremiumCollection
            ? featuredOnHome
            : false,

        home_display_order:
          isPremiumCollection &&
          featuredOnHome
            ? Number(
                homeDisplayOrder,
              )
            : null,
      };

      console.log(
        "Updating category:",
        payload,
      );

      const response = await adminFetch(
        url,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

      if (response.status === 401) {
        clearAuthAndLogin();
        return;
      }

      const responseText =
        await response.text();

      let data: unknown = null;

      try {
        data =
          JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          formatApiError(data),
        );
      }

      if (
        typeof data === "object" &&
        data !== null
      ) {
        setCategory(
          data as Category,
        );
      }

      // Checked products are controlled by this category.
      // Sync both their category and their collection to the
      // collection currently selected for this category.
      // Unchecked products are deliberately left unchanged.
      const currentCategoryId = category?.id;

      if (currentCategoryId === undefined || currentCategoryId === null) {
        throw new Error(
          "Category information is unavailable. Please refresh the page and try again.",
        );
      }

      const targetCollectionId = Number(collection);

      const productsToSync = products.filter((product) => {
        if (!selectedProductIds.includes(product.id)) {
          return false;
        }

        const assignedCollectionIds =
          product.collection_ids ?? product.collections ?? [];

        const collectionNeedsSync =
          assignedCollectionIds.length !== 1 ||
          Number(assignedCollectionIds[0]) !== targetCollectionId;

        const categoryNeedsSync =
          Number(product.category) !== currentCategoryId;

        return categoryNeedsSync || collectionNeedsSync;
      });

      for (const product of productsToSync) {
        const productResponse = await adminFetch(
          `${API_URL}/products/${encodeURIComponent(product.slug)}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              category: currentCategoryId,
              collections: [targetCollectionId],
            }),
          },
        );

        if (productResponse.status === 401) {
          clearAuthAndLogin();
          return;
        }

        if (!productResponse.ok) {
          const productErrorText = await productResponse.text();
          throw new Error(
            `Category details were saved, but moving product "${product.name}" failed: ${productErrorText}`,
          );
        }
      }

      setCategorySlug(finalSlug);

      setSuccess(
        productsToSync.length > 0
          ? `Category updated and ${productsToSync.length} product(s) synchronized to this category and its collection.`
          : "Category updated successfully.",
      );

      setTimeout(() => {
        router.push(
          `/admin/categories/${encodeURIComponent(
            finalSlug,
          )}`,
        );

        router.refresh();
      }, 800);
    } catch (err) {
      console.error(
        "Failed to update category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update category.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading category...
        </div>
      </div>
    );
  }

  /*
   * Not found
   */
  if (!category) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">
            {error ||
              "Category not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/categories"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        <h1 className="text-3xl font-semibold">
          Edit Category
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Update the category and its
          collection relationship.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-700">
            {success}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-8"
      >
        {/* Basic Information */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category Name *
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Slug *
              </label>

              <input
                type="text"
                value={categorySlug}
                onChange={(event) =>
                  setCategorySlug(
                    event.target.value
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9-]/g,
                        "-",
                      ),
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Collection */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Collection Type
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select the main section this
            category belongs to.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Collection *
            </label>

            <select
              value={collection}
              onChange={(event) => {
                const value =
                  event.target.value;

                setCollection(value);

                /*
                 * Determine whether the newly
                 * selected collection is Premium.
                 */
                const selectedCollection =
                  collections.find(
                    (item) =>
                      String(item.id) ===
                      value,
                  );

                const isPremium =
                  selectedCollection
                    ?.slug ===
                  "premium-collection";

                /*
                 * If moving away from Premium,
                 * automatically remove Home
                 * featuring.
                 */
                if (!isPremium) {
                  setFeaturedOnHome(
                    false,
                  );

                  setHomeDisplayOrder(
                    "1",
                  );
                }
              }}
              disabled={
                saving ||
                loadingCollections
              }
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">
                {loadingCollections
                  ? "Loading collections..."
                  : "Select a collection"}
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

            {category.collection_name && (
              <p className="mt-2 text-xs text-muted-foreground">
                Current collection:{" "}
                <span className="font-semibold text-foreground">
                  {
                    category.collection_name
                  }
                </span>
              </p>
            )}

            {!loadingCollections &&
              collections.length === 0 && (
                <p className="mt-2 text-xs text-destructive">
                  No active collections
                  were found.
                </p>
              )}
          </div>
        </section>

        {/* Premium Home Feature */}
        {isPremiumCollection && (
          <section className="rounded-xl border border-primary/20 bg-background p-6">
            <h2 className="text-lg font-semibold">
              Premium Collection — Home Page
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose whether this Premium
              Collection category should appear
              in the 4 hand-picked categories on
              the Home page.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={featuredOnHome}
                onChange={(event) =>
                  setFeaturedOnHome(
                    event.target.checked,
                  )
                }
                disabled={saving}
                className="mt-1 h-4 w-4 rounded border"
              />

              <span>
                <span className="block text-sm font-medium">
                  Feature this category on
                  Home page
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Only 4 Premium Collection
                  categories should be selected
                  for the Home page.
                </span>
              </span>
            </label>

            {featuredOnHome && (
              <div className="mt-6 max-w-xs">
                <label className="mb-2 block text-sm font-medium">
                  Home Display Order
                </label>

                <select
                  value={homeDisplayOrder}
                  onChange={(event) =>
                    setHomeDisplayOrder(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="1">
                    1 — First
                  </option>

                  <option value="2">
                    2 — Second
                  </option>

                  <option value="3">
                    3 — Third
                  </option>

                  <option value="4">
                    4 — Fourth
                  </option>
                </select>

                <p className="mt-2 text-xs text-muted-foreground">
                  This determines the position
                  of the category in the Home
                  page Premium Collection section.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Description */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Description
          </h2>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={5}
            disabled={saving}
            className="mt-6 w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </section>

        {/* Category Image */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Category Image
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a new image from your
            computer to replace the current
            category image.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
            disabled={
              saving ||
              imageUploading
            }
          />

          <div className="mt-6">
            {image ? (
              <div className="overflow-hidden rounded-xl border">
                <div className="relative bg-muted">
                  <img
                    src={image}
                    alt={
                      name ||
                      "Category image"
                    }
                    className="max-h-80 w-full object-contain"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {imageName ||
                        "Category image"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {imagePublicId
                        ? "Cloudinary image"
                        : "Current category image"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      disabled={
                        saving ||
                        imageUploading
                      }
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                    >
                      {imageUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      {imageUploading
                        ? "Uploading..."
                        : "Change Image"}
                    </button>

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={
                        saving ||
                        imageUploading
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={
                  saving ||
                  imageUploading
                }
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 transition hover:border-primary hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />

                    <span className="mt-3 text-sm font-medium">
                      Uploading image...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />

                    <span className="mt-3 text-sm font-medium">
                      Choose Image
                    </span>

                    <span className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG or WEBP · Max 5 MB
                    </span>
                  </>
                )}
              </button>
            )}

            {imageError && (
              <p className="mt-3 text-sm text-destructive">
                {imageError}
              </p>
            )}
          </div>
        </section>

        {/* Status */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Status
          </h2>

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) =>
                setActive(
                  event.target.checked,
                )
              }
              disabled={saving}
              className="h-4 w-4 rounded border"
            />

            <span className="text-sm font-medium">
              Active Category
            </span>
          </label>
        </section>

        {/* Products */}
        <section className="rounded-xl border bg-muted/30 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select products to include in this category. Selecting a product assigned elsewhere will move it here when you save.
              </p>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {selectedProductIds.length} selected
            </span>
          </div>

          <input
            type="search"
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search products..."
            disabled={saving || loadingProducts}
            className="mt-5 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {loadingProducts ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              No products were found.
            </p>
          ) : (
            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
              {products
                .filter((product) =>
                  product.name.toLowerCase().includes(productSearch.trim().toLowerCase()),
                )
                .map((product) => {
                  const checked = selectedProductIds.includes(product.id);
                  const belongsHere = Number(product.category) === category.id;

                  return (
                    <label
                      key={product.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 transition hover:border-border hover:bg-muted/50"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setSelectedProductIds((current) =>
                              event.target.checked
                                ? [...current, product.id]
                                : current.filter((id) => id !== product.id),
                            );
                          }}
                          disabled={saving}
                          className="h-4 w-4 shrink-0 rounded border"
                        />
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-14 w-14 shrink-0 rounded-lg border border-border bg-muted object-cover"
                          />
                        ) : (
                          <span
                            aria-label="No product image"
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-[10px] text-muted-foreground"
                          >
                            No image
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {product.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {belongsHere
                              ? "Currently in this category"
                              : `Currently in: ${product.category_name || "another category"}`}
                          </span>
                        </span>
                      </span>
                      {!belongsHere && checked && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Will move here
                        </span>
                      )}
                    </label>
                  );
                })}
              {products.filter((product) =>
                product.name.toLowerCase().includes(productSearch.trim().toLowerCase()),
              ).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No products match your search.
                </p>
              )}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Unchecking a product does not remove it from its current category. It stays there until you select it in another category.
          </p>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/categories"
            className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              loadingCollections ||
              loadingProducts ||
              imageUploading
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}