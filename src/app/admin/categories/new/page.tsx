"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { adminFetch, redirectToAdminLogin } from "@/lib/admin-auth";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";

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

interface ApiError {
  [key: string]: unknown;
}

interface UploadResponse {
  url?: string;
  public_id?: string;
  image?: string[];
  detail?: string;
}

export default function NewCategoryPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [loadingCollections, setLoadingCollections] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [imageUploading, setImageUploading] =
    useState(false);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem(
      "admin_access_token",
    );
  }

  function clearAuthAndLogin() {
    sessionStorage.removeItem(
      "admin_access_token",
    );

    sessionStorage.removeItem(
      "admin_refresh_token",
    );

    router.replace("/admin/login");
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

  /*
   * Load collections
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      try {
        setLoadingCollections(true);
        setError("");

        const token = getToken();

        if (!token) {
          clearAuthAndLogin();
          return;
        }

        const url =
          `${API_URL}/products/collections/`;

        const response = await adminFetch(
          url,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
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
   * Generate slug from name
   */
  function handleNameChange(
    value: string,
  ) {
    setName(value);

    if (!slug.trim()) {
      const generatedSlug =
        value
          .toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "");

      setSlug(generatedSlug);
    }
  }

  /*
   * Open Windows File Explorer
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

    /*
     * Validate file type
     */
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
        "Only JPG, JPEG, PNG, and WEBP images are allowed.",
      );

      event.target.value = "";
      return;
    }

    /*
     * Validate file size
     */
    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setImageError(
        "Image size must be 5 MB or less.",
      );

      event.target.value = "";
      return;
    }

    const token = getToken();

    if (!token) {
      clearAuthAndLogin();
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
        "Category image uploaded successfully.",
      );
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "ADMIN_AUTH_REQUIRED" ||
          err.message === "ADMIN_AUTH_EXPIRED")
      ) {
        redirectToAdminLogin();
        return;
      }

      console.error(
        "Category image upload error:",
        err,
      );

      setImage("");
      setImagePublicId("");
      setImageName("");

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
   * Remove selected image
   *
   * This only removes the image from the form.
   * Since the category has not been created yet,
   * there is no database record to update.
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
   * Submit form
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(
        "Category name is required.",
      );
      return;
    }

    if (!slug.trim()) {
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

    const token = getToken();

    if (!token) {
      clearAuthAndLogin();
      return;
    }

    try {
      setSaving(true);

      const url =
        `${API_URL}/products/categories/`;

      const payload = {
        name: name.trim(),

        slug: slug
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9-]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            ""),

        collection:
          Number(collection),

        description:
          description.trim(),

        image: image.trim(),

        active,
      };

      console.log(
        "Creating category:",
        payload,
      );

      const response = await adminFetch(
        url,
        {
          method: "POST",
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

      setSuccess(
        "Category created successfully.",
      );

      setTimeout(() => {
        router.push(
          "/admin/categories",
        );

        router.refresh();
      }, 800);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "ADMIN_AUTH_REQUIRED" ||
          err.message === "ADMIN_AUTH_EXPIRED")
      ) {
        redirectToAdminLogin();
        return;
      }

      console.error(
        "Failed to create category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create category.",
      );
    } finally {
      setSaving(false);
    }
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
          Add Category
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a category and link it to
          a collection.
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
                  handleNameChange(
                    event.target.value,
                  )
                }
                placeholder="e.g. Flyers"
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
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9-]/g,
                        "-",
                      ),
                  )
                }
                placeholder="e.g. flyers"
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Use lowercase letters,
                numbers and hyphens.
              </p>
            </div>
          </div>
        </section>

        {/* Collection */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Collection Type
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            This determines which main section
            the category belongs to.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Collection *
            </label>

            <select
              value={collection}
              onChange={(event) =>
                setCollection(
                  event.target.value,
                )
              }
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

            {!loadingCollections &&
              collections.length === 0 && (
                <p className="mt-2 text-xs text-destructive">
                  No active collections were
                  found.
                </p>
              )}
          </div>
        </section>

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
            placeholder="Describe this category..."
            className="mt-6 w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </section>

        {/* Category Image */}
        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-lg font-semibold">
            Category Image
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select an image from your computer.
            It will be uploaded to Cloudinary.
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
            {!image ? (
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
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <div className="relative bg-muted">
                  <img
                    src={image}
                    alt="Category preview"
                    className="max-h-80 w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 border-t p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {imageName ||
                        "Category image"}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Uploaded to Cloudinary
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
                      <Upload className="h-4 w-4" />
                      Change
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
            )}

            {imageError && (
              <p className="mt-3 text-sm text-destructive">
                {imageError}
              </p>
            )}

            {imagePublicId && (
              <p className="mt-2 text-xs text-muted-foreground">
                Cloudinary image uploaded successfully.
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
              imageUploading
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {saving
              ? "Creating..."
              : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}