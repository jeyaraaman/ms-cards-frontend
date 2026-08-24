"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_URL = BACKEND_URL.endsWith("/api")
  ? BACKEND_URL
  : `${BACKEND_URL}/api`;

/* ============================================================
   TYPES
   ============================================================ */

interface SiteSettings {
  id?: number;

  company_name: string;
  address: string;
  phone: string;
  email: string;

  whatsapp_url: string;
  instagram_url: string;
  google_maps_url: string;

  copyright_text: string;

  home_hero_eyebrow: string;
  home_hero_title: string;
  home_hero_description: string;
  home_hero_image: string;
  home_hero_cloudinary_public_id: string;

  about_hero_eyebrow: string;
  about_hero_title: string;
  about_hero_description: string;
  about_hero_image: string;
  about_hero_cloudinary_public_id: string;

  footer_description: string;

  active: boolean;

  created_at?: string;
  updated_at?: string;
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

/* ============================================================
   DEFAULT VALUES
   ============================================================ */

const EMPTY_SETTINGS: SiteSettings = {
  company_name:
    "Meenakshi Screen Printers & Cards",

  address: "",
  phone: "",
  email: "",

  whatsapp_url: "",
  instagram_url: "",
  google_maps_url: "",

  copyright_text:
    "All Rights Reserved.",

  home_hero_eyebrow:
    "Since 1997",

  home_hero_title:
    "",

  home_hero_description:
    "",

  home_hero_image:
    "",

  home_hero_cloudinary_public_id:
    "",

  about_hero_eyebrow:
    "",

  about_hero_title:
    "",

  about_hero_description:
    "",

  about_hero_image:
    "",

  about_hero_cloudinary_public_id:
    "",

  footer_description:
    "",

  active: true,
};

/* ============================================================
   PAGE
   ============================================================ */

export default function SiteSettingsPage() {
  const router = useRouter();

  /* ==========================================================
     FILE INPUTS
     ========================================================== */

  const homeHeroFileInputRef =
    useRef<HTMLInputElement | null>(null);

  const aboutHeroFileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ==========================================================
     STATE
     ========================================================== */

  const [settings, setSettings] =
    useState<SiteSettings>(
      EMPTY_SETTINGS,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [homeHeroUploading, setHomeHeroUploading] =
    useState(false);

  const [aboutHeroUploading, setAboutHeroUploading] =
    useState(false);

  const [homeHeroImageName, setHomeHeroImageName] =
    useState("");

  const [aboutHeroImageName, setAboutHeroImageName] =
    useState("");

  const [homeHeroImageError, setHomeHeroImageError] =
    useState("");

  const [aboutHeroImageError, setAboutHeroImageError] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     AUTH
     ========================================================== */

  function getToken(): string | null {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return sessionStorage.getItem(
      "admin_access_token",
    );
  }

  function clearAuthAndLogin() {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    sessionStorage.removeItem(
      "admin_access_token",
    );

    sessionStorage.removeItem(
      "admin_refresh_token",
    );

    router.replace(
      "/admin/login",
    );
  }

  /* ==========================================================
     API ERROR FORMATTER
     ========================================================== */

  function formatApiError(
    data: unknown,
  ): string {
    if (!data) {
      return "Unknown server error.";
    }

    if (
      typeof data === "string"
    ) {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const errorData =
        data as ApiError;

      return Object.entries(
        errorData,
      )
        .map(
          ([key, value]) => {
            if (
              Array.isArray(value)
            ) {
              return `${key}: ${value.join(
                ", ",
              )}`;
            }

            if (
              typeof value ===
                "object" &&
              value !== null
            ) {
              return `${key}: ${JSON.stringify(
                value,
              )}`;
            }

            return `${key}: ${String(
              value,
            )}`;
          },
        )
        .join(" | ");
    }

    return "Something went wrong.";
  }

  /* ==========================================================
     LOAD SITE SETTINGS
     ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchSiteSettings() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          clearAuthAndLogin();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/site-settings/`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

        if (
          response.status === 401
        ) {
          clearAuthAndLogin();
          return;
        }

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to load Site Settings (${response.status}): ${responseText}`,
          );
        }

        let data: unknown;

        try {
          data =
            JSON.parse(
              responseText,
            );
        } catch {
          throw new Error(
            "Site Settings API returned invalid JSON.",
          );
        }

        if (
          !data ||
          typeof data !==
            "object"
        ) {
          throw new Error(
            "Invalid Site Settings response.",
          );
        }

        if (!cancelled) {
          setSettings({
            ...EMPTY_SETTINGS,
            ...(data as Partial<SiteSettings>),
          });
        }
      } catch (err) {
        console.error(
          "Failed to load Site Settings:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Site Settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSiteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     UPDATE FIELD
     ========================================================== */

  function updateField(
    field: keyof SiteSettings,
    value: string | boolean,
  ) {
    setSettings(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    setError("");
    setSuccess("");
  }

  /* ==========================================================
     OPEN HOME HERO PICKER
     ========================================================== */

  function openHomeHeroFilePicker() {
    if (
      saving ||
      homeHeroUploading
    ) {
      return;
    }

    homeHeroFileInputRef.current?.click();
  }

  /* ==========================================================
     OPEN ABOUT HERO PICKER
     ========================================================== */

  function openAboutHeroFilePicker() {
    if (
      saving ||
      aboutHeroUploading
    ) {
      return;
    }

    aboutHeroFileInputRef.current?.click();
  }

  /* ==========================================================
     UPLOAD IMAGE
     ========================================================== */

  async function uploadHeroImage(
    file: File,
    type:
      | "home"
      | "about",
  ) {
    const token = getToken();

    if (!token) {
      clearAuthAndLogin();
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
      const message =
        "Only JPG, JPEG, PNG, and WEBP images are allowed.";

      if (type === "home") {
        setHomeHeroImageError(
          message,
        );
      } else {
        setAboutHeroImageError(
          message,
        );
      }

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      const message =
        "Image size must be 5 MB or less.";

      if (type === "home") {
        setHomeHeroImageError(
          message,
        );
      } else {
        setAboutHeroImageError(
          message,
        );
      }

      return;
    }

    if (type === "home") {
      setHomeHeroImageError("");
      setHomeHeroImageName(
        file.name,
      );
      setHomeHeroUploading(true);
    } else {
      setAboutHeroImageError("");
      setAboutHeroImageName(
        file.name,
      );
      setAboutHeroUploading(true);
    }

    setError("");
    setSuccess("");

    try {
      const formData =
        new FormData();

      formData.append(
        "image",
        file,
      );

      const response =
        await fetch(
          `${API_URL}/site-settings/upload/`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          },
        );

      if (
        response.status === 401
      ) {
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
          Array.isArray(
            data.image,
          )
        ) {
          throw new Error(
            data.image.join(
              " ",
            ),
          );
        }

        if (data?.detail) {
          throw new Error(
            data.detail,
          );
        }

        throw new Error(
          "Unable to upload image.",
        );
      }

      if (!data?.url) {
        throw new Error(
          "Cloudinary did not return an image URL.",
        );
      }

      if (type === "home") {
        setSettings(
          (previous) => ({
            ...previous,
            home_hero_image:
              data.url || "",
            home_hero_cloudinary_public_id:
              data.public_id ||
              "",
          }),
        );

        setSuccess(
          "Home Hero image uploaded successfully.",
        );
      } else {
        setSettings(
          (previous) => ({
            ...previous,
            about_hero_image:
              data.url || "",
            about_hero_cloudinary_public_id:
              data.public_id ||
              "",
          }),
        );

        setSuccess(
          "About Hero image uploaded successfully.",
        );
      }
    } catch (err) {
      console.error(
        "Site Settings image upload error:",
        err,
      );

      const message =
        err instanceof Error
          ? err.message
          : "Unable to upload image. Please try again.";

      if (type === "home") {
        setHomeHeroImageError(
          message,
        );

        setSettings(
          (previous) => ({
            ...previous,
            home_hero_image:
              previous.home_hero_image,
          }),
        );
      } else {
        setAboutHeroImageError(
          message,
        );

        setSettings(
          (previous) => ({
            ...previous,
            about_hero_image:
              previous.about_hero_image,
          }),
        );
      }
    } finally {
      if (type === "home") {
        setHomeHeroUploading(false);
      } else {
        setAboutHeroUploading(false);
      }
    }
  }

  /* ==========================================================
     HOME HERO IMAGE CHANGE
     ========================================================== */

  async function handleHomeHeroImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadHeroImage(
      file,
      "home",
    );

    event.target.value = "";
  }

  /* ==========================================================
     ABOUT HERO IMAGE CHANGE
     ========================================================== */

  async function handleAboutHeroImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadHeroImage(
      file,
      "about",
    );

    event.target.value = "";
  }

  /* ==========================================================
     REMOVE HOME HERO IMAGE
     ========================================================== */

  function removeHomeHeroImage() {
    if (
      saving ||
      homeHeroUploading
    ) {
      return;
    }

    setSettings(
      (previous) => ({
        ...previous,
        home_hero_image: "",
        home_hero_cloudinary_public_id:
          "",
      }),
    );

    setHomeHeroImageName("");
    setHomeHeroImageError("");
    setSuccess("");
  }

  /* ==========================================================
     REMOVE ABOUT HERO IMAGE
     ========================================================== */

  function removeAboutHeroImage() {
    if (
      saving ||
      aboutHeroUploading
    ) {
      return;
    }

    setSettings(
      (previous) => ({
        ...previous,
        about_hero_image: "",
        about_hero_cloudinary_public_id:
          "",
      }),
    );

    setAboutHeroImageName("");
    setAboutHeroImageError("");
    setSuccess("");
  }

  /* ==========================================================
     SAVE SETTINGS
     ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      homeHeroUploading ||
      aboutHeroUploading
    ) {
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

      const payload = {
        company_name:
          settings.company_name.trim(),

        address:
          settings.address.trim(),

        phone:
          settings.phone.trim(),

        email:
          settings.email.trim(),

        whatsapp_url:
          settings.whatsapp_url.trim(),

        instagram_url:
          settings.instagram_url.trim(),

        google_maps_url:
          settings.google_maps_url.trim(),

        copyright_text:
          settings.copyright_text.trim(),

        home_hero_eyebrow:
          settings.home_hero_eyebrow.trim(),

        home_hero_title:
          settings.home_hero_title.trim(),

        home_hero_description:
          settings.home_hero_description.trim(),

        home_hero_image:
          settings.home_hero_image.trim(),

        home_hero_cloudinary_public_id:
          settings.home_hero_cloudinary_public_id.trim(),

        about_hero_eyebrow:
          settings.about_hero_eyebrow.trim(),

        about_hero_title:
          settings.about_hero_title.trim(),

        about_hero_description:
          settings.about_hero_description.trim(),

        about_hero_image:
          settings.about_hero_image.trim(),

        about_hero_cloudinary_public_id:
          settings.about_hero_cloudinary_public_id.trim(),

        footer_description:
          settings.footer_description.trim(),

        active:
          settings.active,
      };

      const response =
        await fetch(
          `${API_URL}/site-settings/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify(
              payload,
            ),
          },
        );

      if (
        response.status === 401
      ) {
        clearAuthAndLogin();
        return;
      }

      const responseText =
        await response.text();

      let data: unknown = null;

      try {
        data =
          JSON.parse(
            responseText,
          );
      } catch {
        data =
          responseText;
      }

      if (!response.ok) {
        throw new Error(
          formatApiError(data),
        );
      }

      if (
        data &&
        typeof data === "object"
      ) {
        setSettings(
          (previous) => ({
            ...previous,
            ...(data as Partial<SiteSettings>),
          }),
        );
      }

      setSuccess(
        "Site Settings saved successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to save Site Settings:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save Site Settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Site Settings...
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <div className="p-6 lg:p-8">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-semibold">
          Site Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage the content displayed across
          your public Meenakshi Screen website.
        </p>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          SUCCESS
          ====================================================== */}

      {success && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-8"
      >
        {/* ====================================================
            HOME HERO
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Home Hero
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              This content controls the main hero
              section on the Home page.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {/* Eyebrow */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Eyebrow
              </label>

              <input
                type="text"
                value={
                  settings.home_hero_eyebrow
                }
                onChange={(event) =>
                  updateField(
                    "home_hero_eyebrow",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Since 1997"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={
                  settings.home_hero_title
                }
                onChange={(event) =>
                  updateField(
                    "home_hero_title",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Your Home Hero Title"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={
                  settings.home_hero_description
                }
                onChange={(event) =>
                  updateField(
                    "home_hero_description",
                    event.target.value,
                  )
                }
                disabled={saving}
                rows={5}
                placeholder="Enter the Home Hero description..."
                className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Home Hero Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Hero Image
              </label>

              <p className="mb-4 text-xs text-muted-foreground">
                JPG, PNG or WEBP · Maximum 5 MB
              </p>

              <input
                ref={
                  homeHeroFileInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleHomeHeroImageChange
                }
                className="hidden"
                disabled={
                  saving ||
                  homeHeroUploading
                }
              />

              {!settings.home_hero_image ? (
                <button
                  type="button"
                  onClick={
                    openHomeHeroFilePicker
                  }
                  disabled={
                    saving ||
                    homeHeroUploading
                  }
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-12 transition hover:border-primary hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {homeHeroUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />

                      <span className="mt-3 text-sm font-medium">
                        Uploading Home Hero image...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />

                      <span className="mt-3 text-sm font-medium">
                        Choose Home Hero Image
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        Select an image from your computer
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="overflow-hidden rounded-xl border">
                  <div className="relative bg-muted">
                    <img
                      src={
                        settings.home_hero_image
                      }
                      alt="Home Hero preview"
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {homeHeroImageName ||
                          "Home Hero image"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Cloudinary image
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={
                          openHomeHeroFilePicker
                        }
                        disabled={
                          saving ||
                          homeHeroUploading
                        }
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        Change
                      </button>

                      <button
                        type="button"
                        onClick={
                          removeHomeHeroImage
                        }
                        disabled={
                          saving ||
                          homeHeroUploading
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

              {homeHeroImageError && (
                <p className="mt-3 text-sm text-destructive">
                  {homeHeroImageError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            ABOUT HERO
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              About Hero
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              This content controls the hero section
              on the About page.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {/* Eyebrow */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Eyebrow
              </label>

              <input
                type="text"
                value={
                  settings.about_hero_eyebrow
                }
                onChange={(event) =>
                  updateField(
                    "about_hero_eyebrow",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Our Story"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={
                  settings.about_hero_title
                }
                onChange={(event) =>
                  updateField(
                    "about_hero_title",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="About Hero Title"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={
                  settings.about_hero_description
                }
                onChange={(event) =>
                  updateField(
                    "about_hero_description",
                    event.target.value,
                  )
                }
                disabled={saving}
                rows={5}
                placeholder="Enter the About Hero description..."
                className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* About Hero Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Hero Image
              </label>

              <p className="mb-4 text-xs text-muted-foreground">
                JPG, PNG or WEBP · Maximum 5 MB
              </p>

              <input
                ref={
                  aboutHeroFileInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleAboutHeroImageChange
                }
                className="hidden"
                disabled={
                  saving ||
                  aboutHeroUploading
                }
              />

              {!settings.about_hero_image ? (
                <button
                  type="button"
                  onClick={
                    openAboutHeroFilePicker
                  }
                  disabled={
                    saving ||
                    aboutHeroUploading
                  }
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-12 transition hover:border-primary hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aboutHeroUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />

                      <span className="mt-3 text-sm font-medium">
                        Uploading About Hero image...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />

                      <span className="mt-3 text-sm font-medium">
                        Choose About Hero Image
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        Select an image from your computer
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="overflow-hidden rounded-xl border">
                  <div className="relative bg-muted">
                    <img
                      src={
                        settings.about_hero_image
                      }
                      alt="About Hero preview"
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {aboutHeroImageName ||
                          "About Hero image"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Cloudinary image
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={
                          openAboutHeroFilePicker
                        }
                        disabled={
                          saving ||
                          aboutHeroUploading
                        }
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        Change
                      </button>

                      <button
                        type="button"
                        onClick={
                          removeAboutHeroImage
                        }
                        disabled={
                          saving ||
                          aboutHeroUploading
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

              {aboutHeroImageError && (
                <p className="mt-3 text-sm text-destructive">
                  {aboutHeroImageError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            FOOTER
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Footer
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage the description shown in the
              website footer.
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Footer Description
            </label>

            <textarea
              value={
                settings.footer_description
              }
              onChange={(event) =>
                updateField(
                  "footer_description",
                  event.target.value,
                )
              }
              disabled={saving}
              rows={5}
              placeholder="Enter the footer description..."
              className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </section>

        {/* ====================================================
            COMPANY INFORMATION
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Company Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Existing company information used
              throughout the website.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {/* Company Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Name
              </label>

              <input
                type="text"
                value={
                  settings.company_name
                }
                onChange={(event) =>
                  updateField(
                    "company_name",
                    event.target.value,
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Address
              </label>

              <textarea
                value={
                  settings.address
                }
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value,
                  )
                }
                disabled={saving}
                rows={4}
                className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            CONTACT INFORMATION
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Contact Information
            </h2>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                type="text"
                value={
                  settings.phone
                }
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="+91..."
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={
                  settings.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="info@example.com"
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            SOCIAL & LOCATION
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <div>
            <h2 className="text-xl font-semibold">
              Social & Location
            </h2>
          </div>

          <div className="mt-6 space-y-6">
            {/* WhatsApp */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                WhatsApp URL
              </label>

              <input
                type="url"
                value={
                  settings.whatsapp_url
                }
                onChange={(event) =>
                  updateField(
                    "whatsapp_url",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="https://wa.me/..."
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Instagram URL
              </label>

              <input
                type="url"
                value={
                  settings.instagram_url
                }
                onChange={(event) =>
                  updateField(
                    "instagram_url",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Google Maps */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Google Maps URL
              </label>

              <input
                type="url"
                value={
                  settings.google_maps_url
                }
                onChange={(event) =>
                  updateField(
                    "google_maps_url",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            COPYRIGHT
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-xl font-semibold">
            Copyright
          </h2>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Copyright Text
            </label>

            <input
              type="text"
              value={
                settings.copyright_text
              }
              onChange={(event) =>
                updateField(
                  "copyright_text",
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="All Rights Reserved."
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </section>

        {/* ====================================================
            STATUS
            ==================================================== */}

        <section className="rounded-xl border bg-background p-6">
          <h2 className="text-xl font-semibold">
            Status
          </h2>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={
                settings.active
              }
              onChange={(event) =>
                updateField(
                  "active",
                  event.target.checked,
                )
              }
              disabled={saving}
              className="mt-1 h-4 w-4 rounded border"
            />

            <span>
              <span className="block text-sm font-medium">
                Active
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Allow the public website to use
                these Site Settings.
              </span>
            </span>
          </label>
        </section>

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="sticky bottom-0 z-20 -mx-6 border-t bg-background/95 px-6 py-4 backdrop-blur lg:-mx-8 lg:px-8">
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                homeHeroUploading ||
                aboutHeroUploading
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : "Save Site Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}