"use client";

import {
  adminFetch,
  redirectToAdminLogin,
} from "@/lib/admin-auth";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  Clock3,
  FolderTree,
  LayoutDashboard,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

// ============================================================
// TYPES
// ============================================================

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

type Category = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  product_count?: number;
  display_order?: number;
};

type Collection = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  product_count?: number;
};

type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  product_id: string;
  product_name: string;
  quantity: number;
  occasion: string;
  message: string;
  status:
    | "new"
    | "contacted"
    | "in_progress"
    | "completed"
    | "cancelled";
  created_at: string;
  updated_at: string;
};

type ActivityLog = {
  id: number;
  action: string;
  entity_type:
    | "product"
    | "category"
    | "collection"
    | "enquiry"
    | "other";
  entity_id: number | null;
  entity_name: string;
  description: string;
  user: number | null;
  user_name: string;
  created_at: string;
};

// ============================================================
// HELPERS
// ============================================================

function getToken() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return sessionStorage.getItem(
    "admin_access_token",
  );
}

function extractList<T>(
  data: unknown,
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray(
      (data as { results?: unknown })
        .results,
    )
  ) {
    return (
      (data as {
        results: T[];
      }).results
    );
  }

  return [];
}

function formatDate(
  date: string,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(date));
  } catch {
    return date;
  }
}

function formatStatus(
  status: Enquiry["status"],
) {
  switch (status) {
    case "new":
      return "New";

    case "contacted":
      return "Contacted";

    case "in_progress":
      return "In Progress";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function formatActivityAction(
  action: string,
) {
  return action
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

// ============================================================
// DASHBOARD
// ============================================================

export default function AdminDashboardPage() {
  const router = useRouter();

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    collections,
    setCollections,
  ] = useState<Collection[]>([]);

  const [
    enquiries,
    setEnquiries,
  ] = useState<Enquiry[]>([]);

  const [
    activityLogs,
    setActivityLogs,
  ] = useState<ActivityLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    enquiryTrendRange,
    setEnquiryTrendRange,
  ] = useState<7 | 30>(7);

  const [quickSearch, setQuickSearch] =
    useState("");

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  async function loadDashboard(
    showRefresh = false,
  ) {
    const token = getToken();

    if (!token) {
      router.replace(
        "/admin/login",
      );

      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const headers = {
        Authorization:
          `Bearer ${token}`,
        "Content-Type":
          "application/json",
      };

      const [
        productsResponse,
        categoriesResponse,
        collectionsResponse,
        enquiriesResponse,
        activityLogsResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/products/`,
          {
            headers,
            cache: "no-store",
          },
        ),

        fetch(
          `${API_URL}/api/products/categories/`,
          {
            headers,
            cache: "no-store",
          },
        ),

        fetch(
          `${API_URL}/api/products/collections/`,
          {
            headers,
            cache: "no-store",
          },
        ),

        fetch(
          `${API_URL}/api/enquiries/`,
          {
            headers,
            cache: "no-store",
          },
        ),

        fetch(
          `${API_URL}/api/products/activity-logs/`,
          {
            headers,
            cache: "no-store",
          },
        ),
      ]);

      // --------------------------------------------------------
      // AUTHENTICATION
      // --------------------------------------------------------

      const responses = [
        productsResponse,
        categoriesResponse,
        collectionsResponse,
        enquiriesResponse,
        activityLogsResponse,
      ];

      if (
        responses.some(
          (response) =>
            response.status === 401,
        )
      ) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        sessionStorage.removeItem(
          "admin_refresh_token",
        );

        router.replace(
          "/admin/login",
        );

        return;
      }

      if (!productsResponse.ok) {
        throw new Error(
          "Failed to load products.",
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          "Failed to load categories.",
        );
      }

      if (!collectionsResponse.ok) {
        throw new Error(
          "Failed to load collections.",
        );
      }

      if (!enquiriesResponse.ok) {
        throw new Error(
          "Failed to load enquiries.",
        );
      }

      if (!activityLogsResponse.ok) {
        throw new Error(
          "Failed to load activity logs.",
        );
      }

      const [
        productsData,
        categoriesData,
        collectionsData,
        enquiriesData,
        activityLogsData,
      ] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json(),
        collectionsResponse.json(),
        enquiriesResponse.json(),
        activityLogsResponse.json(),
      ]);

      setProducts(
        extractList<Product>(
          productsData,
        ),
      );

      setCategories(
        extractList<Category>(
          categoriesData,
        ),
      );

      setCollections(
        extractList<Collection>(
          collectionsData,
        ),
      );

      setEnquiries(
        extractList<Enquiry>(
          enquiriesData,
        ),
      );

      setActivityLogs(
        extractList<ActivityLog>(
          activityLogsData,
        ),
      );
    } catch (err) {
      console.error(
        "Dashboard error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================================
  // PRODUCT STATISTICS
  // ==========================================================

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.active,
    ).length;

  const inactiveProducts =
    products.filter(
      (product) =>
        !product.active,
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured,
    ).length;

  // ==========================================================
  // CATEGORY STATISTICS
  // ==========================================================

  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter(
      (category) =>
        category.active,
    ).length;

  // ==========================================================
  // COLLECTION STATISTICS
  // ==========================================================

  const totalCollections =
    collections.length;

  const activeCollections =
    collections.filter(
      (collection) =>
        collection.active,
    ).length;

  // ==========================================================
  // ENQUIRY STATISTICS
  // ==========================================================

  const totalEnquiries =
    enquiries.length;

  const newEnquiries =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "new",
    ).length;

  const contactedEnquiries =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "contacted",
    ).length;

  const inProgressEnquiries =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "in_progress",
    ).length;

  const completedEnquiries =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "completed",
    ).length;

  const cancelledEnquiries =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "cancelled",
    ).length;

  // ==========================================================
  // RECENT DATA
  // ==========================================================

  const recentEnquiries =
    useMemo(() => {
      return [
        ...enquiries,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime(),
        )
        .slice(0, 6);
    }, [enquiries]);

  const recentProducts =
    useMemo(() => {
      return [
        ...products,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime(),
        )
        .slice(0, 5);
    }, [products]);

  // ==========================================================
  // ANALYTICS
  // ==========================================================

  const categoryDistribution =
    useMemo(() => {
      const counts = new Map<
        string,
        number
      >();

      products.forEach((product) => {
        if (product.is_deleted) {
          return;
        }

        const name =
          product.category_name?.trim() ||
          "Uncategorized";

        counts.set(
          name,
          (counts.get(name) || 0) + 1,
        );
      });

      return Array.from(
        counts.entries(),
      )
        .sort(
          (a, b) => b[1] - a[1],
        )
        .slice(0, 8);
    }, [products]);

  const maxCategoryProducts =
    categoryDistribution.length
      ? Math.max(
          ...categoryDistribution.map(
            ([, count]) => count,
          ),
        )
      : 1;

  const enquiryDistribution = [
    {
      label: "New",
      value: newEnquiries,
      href: "/admin/enquiries?status=new",
      className:
        "bg-blue-500/10 text-blue-700",
    },
    {
      label: "Contacted",
      value: contactedEnquiries,
      href: "/admin/enquiries?status=contacted",
      className:
        "bg-purple-500/10 text-purple-700",
    },
    {
      label: "In Progress",
      value: inProgressEnquiries,
      href: "/admin/enquiries?status=in_progress",
      className:
        "bg-amber-500/10 text-amber-700",
    },
    {
      label: "Completed",
      value: completedEnquiries,
      href: "/admin/enquiries?status=completed",
      className:
        "bg-green-500/10 text-green-700",
    },
    {
      label: "Cancelled",
      value: cancelledEnquiries,
      href: "/admin/enquiries?status=cancelled",
      className:
        "bg-red-500/10 text-red-700",
    },
  ];

  const productHealth = [
    {
      label: "Active",
      value: activeProducts,
      href: "/admin/products?filter=active",
      className:
        "bg-green-500/10 text-green-700",
    },
    {
      label: "Inactive",
      value: inactiveProducts,
      href: "/admin/products?filter=deactivated",
      className:
        "bg-muted text-muted-foreground",
    },
    {
      label: "Featured",
      value: featuredProducts,
      href: "/admin/products?filter=featured",
      className:
        "bg-primary/10 text-primary",
    },
  ];

  const enquiryTrend = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from(
      { length: enquiryTrendRange },
      (_, index) => {
        const date = new Date(today);

        date.setDate(
          today.getDate() -
            (enquiryTrendRange - 1 - index),
        );

        const nextDate = new Date(date);

        nextDate.setDate(
          date.getDate() + 1,
        );

        const count = enquiries.filter(
          (enquiry) => {
            const created = new Date(
              enquiry.created_at,
            );

            return (
              created >= date &&
              created < nextDate
            );
          },
        ).length;

        return {
          date,
          count,
          label:
            enquiryTrendRange === 7
              ? new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    weekday: "short",
                  },
                ).format(date)
              : new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    day: "2-digit",
                  },
                ).format(date),
          shortDate:
            new Intl.DateTimeFormat(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              },
            ).format(date),
        };
      },
    );
  }, [
    enquiries,
    enquiryTrendRange,
  ]);

  const enquiryTrendTotal =
    enquiryTrend.reduce(
      (sum, item) =>
        sum + item.count,
      0,
    );

  const enquiryTrendMax = Math.max(
    1,
    ...enquiryTrend.map(
      (item) => item.count,
    ),
  );

  const highestEnquiryDay =
    enquiryTrend.reduce(
      (highest, item) =>
        item.count > highest.count
          ? item
          : highest,
      enquiryTrend[0] || {
        date: new Date(),
        count: 0,
        label: "-",
        shortDate: "-",
      },
    );

  // ==========================================================
  // RECENT ACTIVITY
  // ==========================================================

  const recentActivity =
    useMemo(() => {
      return activityLogs
        .slice(0, 8)
        .map((activity) => {
          let href = "/admin";

          switch (
            activity.entity_type
          ) {
            case "product":
              href = "/admin/products";
              break;

            case "category":
              href = "/admin/categories";
              break;

            case "collection":
              href =
                "/admin/collections";
              break;

            case "enquiry":
              href = activity.entity_id
                ? `/admin/enquiries/${activity.entity_id}`
                : "/admin/enquiries";
              break;

            default:
              href = "/admin";
          }

          return {
            id: `activity-${activity.id}`,
            type:
              activity.entity_type ===
              "enquiry"
                ? ("enquiry" as const)
                : ("activity" as const),
            title:
              activity.description ||
              formatActivityAction(
                activity.action,
              ),
            description:
              activity.entity_name ||
              activity.entity_type,
            detail:
              activity.user_name ||
              "System",
            date: new Date(
              activity.created_at,
            ),
            href,
          };
        });
    }, [activityLogs]);
  // ==========================================================
  // QUICK SEARCH
  // ==========================================================

  const quickSearchResults = useMemo(() => {
    const query = quickSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return {
        products: [],
        enquiries: [],
      };
    }

    const productsFound = products
      .filter((product) => {
        if (product.is_deleted) {
          return false;
        }

        return [
          product.name,
          product.category_name,
          product.slug,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              .toLowerCase()
              .includes(query),
          );
      })
      .slice(0, 5);

    const enquiriesFound = enquiries
      .filter((enquiry) =>
        [
          enquiry.name,
          enquiry.email,
          enquiry.phone,
          enquiry.product_name,
          enquiry.status,
        ]
         .filter(
  (value): value is string =>
    Boolean(value),
)
.some((value) =>
  value
    .toLowerCase()
    .includes(query),
)
      ) 
      .slice(0, 5);

    return {
      products: productsFound,
      enquiries: enquiriesFound,
    };
  }, [
    quickSearch,
    products,
    enquiries,
  ]);

  const hasQuickSearchResults =
    quickSearchResults.products
      .length > 0 ||
    quickSearchResults.enquiries
      .length > 0;

  // ==========================================================
  // NEEDS ATTENTION
  // ==========================================================

  const oldUnansweredEnquiries =
    useMemo(() => {
      const now = Date.now();
      const sevenDays =
        7 * 24 * 60 * 60 * 1000;

      return enquiries.filter(
        (enquiry) => {
          const isOpen =
            enquiry.status === "new" ||
            enquiry.status ===
              "contacted" ||
            enquiry.status ===
              "in_progress";

          if (!isOpen) {
            return false;
          }

          return (
            now -
              new Date(
                enquiry.updated_at ||
                  enquiry.created_at,
              ).getTime() >
            sevenDays
          );
        },
      ).length;
    }, [enquiries]);

  const completedToday =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        today.getDate() + 1,
      );

      return enquiries.filter(
        (enquiry) => {
          if (
            enquiry.status !==
            "completed"
          ) {
            return false;
          }

          const updated =
            new Date(
              enquiry.updated_at ||
                enquiry.created_at,
            );

          return (
            updated >= today &&
            updated < tomorrow
          );
        },
      ).length;
    }, [enquiries]);

  const alertItems = useMemo(() => {
    const items: {
      id: string;
      title: string;
      description: string;
      count: number;
      href: string;
      tone:
        | "danger"
        | "warning"
        | "info"
        | "success";
    }[] = [];

    if (newEnquiries > 0) {
      items.push({
        id: "new-enquiries",
        title: "New enquiries need attention",
        description:
          "Customers are waiting for a response.",
        count: newEnquiries,
        href:
          "/admin/enquiries?status=new",
        tone: "danger",
      });
    }

    if (oldUnansweredEnquiries > 0) {
      items.push({
        id: "old-enquiries",
        title: "Older open enquiries",
        description:
          "These enquiries have had no recent update for more than 7 days.",
        count:
          oldUnansweredEnquiries,
        href: "/admin/enquiries",
        tone: "warning",
      });
    }

    const productsWithoutCategory =
      products.filter(
        (product) =>
          !product.is_deleted &&
          !product.category_name,
      ).length;

    if (productsWithoutCategory > 0) {
      items.push({
        id: "products-no-category",
        title: "Products need a category",
        description:
          "Some catalogue products do not have a category assigned.",
        count:
          productsWithoutCategory,
        href:
          "/admin/products",
        tone: "warning",
      });
    }

    const productsWithoutImage =
      products.filter(
        (product) =>
          !product.is_deleted &&
          !product.image,
      ).length;

    if (productsWithoutImage > 0) {
      items.push({
        id: "products-no-image",
        title: "Products need images",
        description:
          "Some catalogue products do not have a product image.",
        count:
          productsWithoutImage,
        href:
          "/admin/products",
        tone: "info",
      });
    }

    if (completedToday > 0) {
      items.push({
        id: "completed-today",
        title: "Enquiries completed today",
        description:
          "Good progress — these enquiries were completed today.",
        count: completedToday,
        href:
          "/admin/enquiries?status=completed",
        tone: "success",
      });
    }

    return items;
  }, [
    enquiries,
    products,
    newEnquiries,
    oldUnansweredEnquiries,
    completedToday,
  ]);

  // ==========================================================
  // ENQUIRY STATUS COMPONENT
  // ==========================================================

  function StatusBadge({
    status,
  }: {
    status: Enquiry["status"];
  }) {
    const classes = {
      new:
        "bg-blue-500/10 text-blue-700",
      contacted:
        "bg-purple-500/10 text-purple-700",
      in_progress:
        "bg-amber-500/10 text-amber-700",
      completed:
        "bg-green-500/10 text-green-700",
      cancelled:
        "bg-red-500/10 text-red-700",
    };

    return (
      <span
        className={`
          inline-flex
          rounded-full
          px-3
          py-1
          text-xs
          font-medium
          ${classes[status]}
        `}
      >
        {formatStatus(status)}
      </span>
    );
  }

  // ==========================================================
  // STAT CARD
  // ==========================================================

  function StatCard({
    title,
    value,
    description,
    icon,
    href,
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    href: string;
  }) {
    return (
      <Link
        href={href}
        className="
          group
          rounded-2xl
          border
          bg-card
          p-6
          transition
          hover:-translate-y-0.5
          hover:border-primary/30
          hover:shadow-md
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              {title}
            </p>

            <p
              className="
                mt-2
                text-3xl
                font-semibold
                tracking-tight
              "
            >
              {loading
                ? "..."
                : value}
            </p>

            <p
              className="
                mt-2
                text-xs
                text-muted-foreground
              "
            >
              {description}
            </p>
          </div>

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
              transition
              group-hover:bg-primary
              group-hover:text-primary-foreground
            "
          >
            {icon}
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main>
      <section
        className="
          mx-auto
          max-w-7xl
          px-6
          py-10
          lg:py-12
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary
                  text-primary-foreground
                "
              >
                <LayoutDashboard
                  className="h-5 w-5"
                />
              </div>

              <div>
                <h1
                  className="
                    font-heading
                    text-4xl
                    text-primary
                  "
                >
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p
              className="
                mt-3
                text-muted-foreground
              "
            >
              Overview of your Meenakshi Screen
              catalogue and enquiries.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={
              loading || refreshing
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              bg-background
              px-4
              text-sm
              font-medium
              transition
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`
                h-4
                w-4
                ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              `}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-destructive/30
              bg-destructive/10
              px-5
              py-4
              text-sm
              text-destructive
            "
          >
            {error}
          </div>
        )}

        {/* ====================================================
            QUICK SEARCH
        ==================================================== */}

        <section className="relative mt-8">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />

              <div>
                <h2 className="font-heading text-xl text-primary">
                  Quick Search
                </h2>

                <p className="text-xs text-muted-foreground">
                  Find products and enquiries without leaving the dashboard.
                </p>
              </div>
            </div>

            <div className="relative mt-4">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                type="search"
                value={quickSearch}
                onChange={(event) =>
                  setQuickSearch(
                    event.target.value,
                  )
                }
                placeholder="Search product, customer, email, phone, category..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  bg-background
                  pl-11
                  pr-11
                  text-sm
                  outline-none
                  transition
                  placeholder:text-muted-foreground
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/10
                "
              />

              {quickSearch && (
                <button
                  type="button"
                  onClick={() =>
                    setQuickSearch("")
                  }
                  aria-label="Clear search"
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-lg
                    p-2
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {quickSearch.trim() && (
              <div className="mt-4 overflow-hidden rounded-xl border bg-background">
                {!hasQuickSearchResults ? (
                  <div className="p-6 text-center">
                    <Search className="mx-auto h-6 w-6 text-muted-foreground" />

                    <p className="mt-2 text-sm font-medium">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a product name, category, customer name, email, or phone number.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {quickSearchResults.products.length > 0 && (
                      <div className="p-3">
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Products
                        </div>

                        {quickSearchResults.products.map(
                          (product) => (
                            <Link
                              key={`search-product-${product.id}`}
                              href={`/admin/products/${product.slug}`}
                              onClick={() =>
                                setQuickSearch("")
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                p-3
                                transition
                                hover:bg-muted/60
                              "
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Package className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {product.name}
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {product.category_name ||
                                    "Uncategorized"}
                                </p>
                              </div>

                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </Link>
                          ),
                        )}
                      </div>
                    )}

                    {quickSearchResults.enquiries.length > 0 && (
                      <div className="p-3">
                        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Enquiries
                        </div>

                        {quickSearchResults.enquiries.map(
                          (enquiry) => (
                            <Link
                              key={`search-enquiry-${enquiry.id}`}
                              href={`/admin/enquiries/${enquiry.id}`}
                              onClick={() =>
                                setQuickSearch("")
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                p-3
                                transition
                                hover:bg-muted/60
                              "
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700">
                                <Users className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {enquiry.name}
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {enquiry.product_name ||
                                    enquiry.email ||
                                    enquiry.phone ||
                                    "General enquiry"}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-medium">
                                {enquiry.status}
                              </span>

                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </Link>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            ADMIN ALERTS
        ==================================================== */}

        {alertItems.length > 0 && (
          <section
            className="
              mt-8
              rounded-2xl
              border
              bg-card
              p-6
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Bell
                    className="
                      h-5
                      w-5
                      text-primary
                    "
                  />

                  <h2
                    className="
                      font-heading
                      text-2xl
                      text-primary
                    "
                  >
                    Admin Alerts
                  </h2>

                  <span
                    className="
                      rounded-full
                      bg-primary/10
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      text-primary
                    "
                  >
                    {alertItems.length}
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Important items detected from
                  your current catalogue and enquiries.
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                grid
                gap-3
                md:grid-cols-2
              "
            >
              {alertItems.map(
                (alert) => {
                  const toneClasses = {
                    danger:
                      "border-red-500/20 bg-red-500/5",
                    warning:
                      "border-amber-500/20 bg-amber-500/5",
                    info:
                      "border-blue-500/20 bg-blue-500/5",
                    success:
                      "border-green-500/20 bg-green-500/5",
                  };

                  const badgeClasses = {
                    danger:
                      "bg-red-500/10 text-red-700",
                    warning:
                      "bg-amber-500/10 text-amber-700",
                    info:
                      "bg-blue-500/10 text-blue-700",
                    success:
                      "bg-green-500/10 text-green-700",
                  };

                  return (
                    <Link
                      key={alert.id}
                      href={alert.href}
                      className={`
                        group
                        rounded-xl
                        border
                        p-4
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-md
                        ${toneClasses[alert.tone]}
                      `}
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              text-sm
                              font-semibold
                            "
                          >
                            {alert.title}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-muted-foreground
                            "
                          >
                            {alert.description}
                          </p>
                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            ${badgeClasses[alert.tone]}
                          `}
                        >
                          {alert.count}
                        </span>
                      </div>

                      <span
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-1
                          text-xs
                          font-medium
                          text-primary
                        "
                      >
                        Review
                        <ArrowRight
                          className="
                            h-3.5
                            w-3.5
                            transition
                            group-hover:translate-x-0.5
                          "
                        />
                      </span>
                    </Link>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            NEEDS ATTENTION
        ==================================================== */}



        <section
          className="
            mt-8
            rounded-2xl
            border
            bg-card
            p-6
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <AlertCircle
                  className="
                    h-5
                    w-5
                    text-primary
                  "
                />

                <h2
                  className="
                    font-heading
                    text-2xl
                    text-primary
                  "
                >
                  Needs Attention
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                Items that may need your
                attention right now.
              </p>
            </div>
          </div>

          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <Link
              href="/admin/enquiries?status=new"
              className="
                group
                rounded-xl
                border
                border-red-500/20
                bg-red-500/5
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  New Enquiries
                </span>

                <span
                  className="
                    rounded-full
                    bg-red-500/10
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-red-700
                  "
                >
                  {loading
                    ? "..."
                    : newEnquiries}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-muted-foreground
                "
              >
                Customers waiting for a
                response.
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-primary
                "
              >
                Review
                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>

            <Link
              href="/admin/enquiries?status=in_progress"
              className="
                group
                rounded-xl
                border
                border-amber-500/20
                bg-amber-500/5
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  In Progress
                </span>

                <span
                  className="
                    rounded-full
                    bg-amber-500/10
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-amber-700
                  "
                >
                  {loading
                    ? "..."
                    : inProgressEnquiries}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-muted-foreground
                "
              >
                Enquiries currently being
                handled.
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-primary
                "
              >
                Review
                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>

            <Link
              href="/admin/enquiries"
              className="
                group
                rounded-xl
                border
                border-orange-500/20
                bg-orange-500/5
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Older Open Enquiries
                </span>

                <span
                  className="
                    rounded-full
                    bg-orange-500/10
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-orange-700
                  "
                >
                  {loading
                    ? "..."
                    : oldUnansweredEnquiries}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-muted-foreground
                "
              >
                Open enquiries with no
                recent update.
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-primary
                "
              >
                Review all
                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>

            <Link
              href="/admin/enquiries?status=completed"
              className="
                group
                rounded-xl
                border
                border-green-500/20
                bg-green-500/5
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Completed Today
                </span>

                <span
                  className="
                    rounded-full
                    bg-green-500/10
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-green-700
                  "
                >
                  {loading
                    ? "..."
                    : completedToday}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-muted-foreground
                "
              >
                Enquiries completed today.
              </p>

              <span
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-primary
                "
              >
                View completed
                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>
          </div>
        </section>

        {/* ====================================================
            MAIN STATISTICS
        ==================================================== */}



        <div
          className="
            mt-8
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <StatCard
            title="Total Products"
            value={totalProducts}
            description="Products in catalogue"
            icon={
              <Package className="h-5 w-5" />
            }
            href="/admin/products"
          />

          <StatCard
            title="Active Products"
            value={activeProducts}
            description="Currently available"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
            href="/admin/products?filter=active"
          />

          <StatCard
            title="Inactive Products"
            value={inactiveProducts}
            description="Can be activated again"
            icon={
              <XCircle className="h-5 w-5" />
            }
            href="/admin/products?filter=deactivated"
          />

          <StatCard
            title="Featured Products"
            value={featuredProducts}
            description="Shown as featured"
            icon={
              <Star className="h-5 w-5" />
            }
            href="/admin/products?filter=featured"
          />
        </div>

        {/* ====================================================
            SECONDARY STATISTICS
        ==================================================== */}

        <div
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <StatCard
            title="Categories"
            value={totalCategories}
            description={`${activeCategories} active categories`}
            icon={
              <FolderTree className="h-5 w-5" />
            }
            href="/admin/categories"
          />

          <StatCard
            title="Collections"
            value={totalCollections}
            description={`${activeCollections} active collections`}
            icon={
              <Boxes className="h-5 w-5" />
            }
            href="/admin/collections"
          />

          <StatCard
            title="Total Enquiries"
            value={totalEnquiries}
            description="All customer enquiries"
            icon={
              <Users className="h-5 w-5" />
            }
            href="/admin/enquiries"
          />

          <StatCard
            title="New Enquiries"
            value={newEnquiries}
            description="Need your attention"
            icon={
              <Clock3 className="h-5 w-5" />
            }
            href="/admin/enquiries?status=new"
          />
        </div>

        {/* ====================================================
            ENQUIRY OVERVIEW
        ==================================================== */}

        <div
          className="
            mt-8
            rounded-2xl
            border
            bg-card
            p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  font-heading
                  text-2xl
                  text-primary
                "
              >
                Enquiry Overview
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                Current status of customer
                enquiries.
              </p>
            </div>

            <Link
              href="/admin/enquiries"
              className="
                inline-flex
                items-center
                gap-1
                text-sm
                font-medium
                text-primary
                hover:underline
              "
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-5
            "
          >
            {/* New */}

            <Link
              href="/admin/enquiries?status=new"
              className="
                rounded-xl
                bg-blue-500/10
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-blue-700
                "
              >
                New
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  text-blue-700
                "
              >
                {loading
                  ? "..."
                  : newEnquiries}
              </p>
            </Link>

            {/* Contacted */}

            <Link
              href="/admin/enquiries?status=contacted"
              className="
                rounded-xl
                bg-purple-500/10
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-purple-700
                "
              >
                Contacted
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  text-purple-700
                "
              >
                {loading
                  ? "..."
                  : contactedEnquiries}
              </p>
            </Link>

            {/* In Progress */}

            <Link
              href="/admin/enquiries?status=in_progress"
              className="
                rounded-xl
                bg-amber-500/10
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-amber-700
                "
              >
                In Progress
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  text-amber-700
                "
              >
                {loading
                  ? "..."
                  : inProgressEnquiries}
              </p>
            </Link>

            {/* Completed */}

            <Link
              href="/admin/enquiries?status=completed"
              className="
                rounded-xl
                bg-green-500/10
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-green-700
                "
              >
                Completed
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  text-green-700
                "
              >
                {loading
                  ? "..."
                  : completedEnquiries}
              </p>
            </Link>

            {/* Cancelled */}

            <Link
              href="/admin/enquiries?status=cancelled"
              className="
                rounded-xl
                bg-red-500/10
                p-4
                transition
                hover:-translate-y-0.5
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-red-700
                "
              >
                Cancelled
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  text-red-700
                "
              >
                {loading
                  ? "..."
                  : cancelledEnquiries}
              </p>
            </Link>
          </div>
        </div>

        {/* ====================================================
            RECENT ENQUIRIES + RECENT PRODUCTS
        ==================================================== */}

        <div
          className="
            mt-8
            grid
            gap-6
            xl:grid-cols-[1.5fr_1fr]
          "
        >
          {/* ==================================================
              RECENT ENQUIRIES
          ================================================== */}

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              bg-card
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-6
                py-5
              "
            >
              <div>
                <h2
                  className="
                    font-heading
                    text-2xl
                    text-primary
                  "
                >
                  Recent Enquiries
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Latest customer requests
                </p>
              </div>

              <Link
                href="/admin/enquiries"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-medium
                  text-primary
                  hover:underline
                "
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                Loading enquiries...
              </div>
            ) : recentEnquiries.length ===
              0 ? (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                No enquiries yet.
              </div>
            ) : (
              <div
                className="
                  divide-y
                "
              >
                {recentEnquiries.map(
                  (enquiry) => (
                    <Link
                      key={
                        enquiry.id
                      }
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="
                        block
                        px-6
                        py-4
                        transition
                        hover:bg-muted/30
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div
                          className="
                            min-w-0
                          "
                        >
                          <p
                            className="
                              truncate
                              font-medium
                            "
                          >
                            {enquiry.name}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-sm
                              text-muted-foreground
                            "
                          >
                            {enquiry.product_name ||
                              "General Enquiry"}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-muted-foreground
                            "
                          >
                            Qty:{" "}
                            {
                              enquiry.quantity
                            }{" "}
                            ·{" "}
                            {
                              enquiry.occasion
                            }
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            flex-col
                            items-start
                            gap-2
                            sm:items-end
                          "
                        >
                          <StatusBadge
                            status={
                              enquiry.status
                            }
                          />

                          <span
                            className="
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {formatDate(
                              enquiry.created_at,
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>

          {/* ==================================================
              RECENT PRODUCTS
          ================================================== */}

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              bg-card
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-6
                py-5
              "
            >
              <div>
                <h2
                  className="
                    font-heading
                    text-2xl
                    text-primary
                  "
                >
                  Recent Products
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Recently added products
                </p>
              </div>

              <Link
                href="/admin/products"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-medium
                  text-primary
                  hover:underline
                "
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                Loading products...
              </div>
            ) : recentProducts.length ===
              0 ? (
              <div
                className="
                  px-6
                  py-12
                  text-center
                  text-sm
                  text-muted-foreground
                "
              >
                No products yet.
              </div>
            ) : (
              <div
                className="
                  divide-y
                "
              >
                {recentProducts.map(
                  (product) => (
                    <Link
                      key={
                        product.id
                      }
                      href={`/admin/products/${product.slug}`}
                      className="
                        block
                        px-6
                        py-4
                        transition
                        hover:bg-muted/30
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            min-w-0
                          "
                        >
                          <p
                            className="
                              truncate
                              font-medium
                            "
                          >
                            {product.name}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {product.category_name ||
                              "No category"}
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            flex-col
                            items-end
                            gap-2
                          "
                        >
                          {product.featured && (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-primary/10
                                px-2.5
                                py-1
                                text-[11px]
                                font-medium
                                text-primary
                              "
                            >
                              <Star className="h-3 w-3" />
                              Featured
                            </span>
                          )}

                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-medium
                              ${
                                product.active
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                          >
                            {product.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            ANALYTICS
        ==================================================== */}

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                className="
                  font-heading
                  text-2xl
                  text-primary
                "
              >
                Analytics
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A quick view of your catalogue and enquiry activity.
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* Product health */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Product Overview
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Active, inactive and featured products.
                  </p>
                </div>

                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-6 space-y-4">
                {productHealth.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
                      >
                        {loading ? "..." : item.value}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width:
                            totalProducts > 0
                              ? `${Math.min(
                                  100,
                                  (item.value /
                                    totalProducts) *
                                    100,
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Enquiry distribution */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Enquiry Status
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Distribution of customer enquiries.
                  </p>
                </div>

                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-6 space-y-4">
                {enquiryDistribution.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
                      >
                        {loading ? "..." : item.value}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width:
                            totalEnquiries > 0
                              ? `${Math.min(
                                  100,
                                  (item.value /
                                    totalEnquiries) *
                                    100,
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category distribution */}
            <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Products by Category
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Categories with the highest number of catalogue products.
                  </p>
                </div>

                <Link
                  href="/admin/categories"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Manage categories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Loading category analytics...
                </div>
              ) : categoryDistribution.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No product category data available.
                </div>
              ) : (
                <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
                  {categoryDistribution.map(
                    ([categoryName, count]) => (
                      <div key={categoryName}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-sm font-medium">
                            {categoryName}
                          </span>

                          <span className="shrink-0 text-xs text-muted-foreground">
                            {count} product
                            {count === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.max(
                                4,
                                (count /
                                  maxCategoryProducts) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            ENQUIRY TREND
        ==================================================== */}

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />

                <h2 className="font-heading text-2xl text-primary">
                  Enquiry Trend
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Customer enquiries received during the selected period.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="
                  flex
                  rounded-xl
                  border
                  bg-muted/30
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setEnquiryTrendRange(7)
                  }
                  className={`
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    ${
                      enquiryTrendRange === 7
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  7 Days
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEnquiryTrendRange(30)
                  }
                  className={`
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    ${
                      enquiryTrendRange === 30
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  30 Days
                </button>
              </div>

              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {enquiryTrendRange} days
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {loading
                    ? "..."
                    : enquiryTrendTotal}
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 px-4 py-3">
                <p className="text-xs text-primary/70">
                  Highest day
                </p>

                <p className="mt-1 text-xl font-semibold text-primary">
                  {loading
                    ? "..."
                    : highestEnquiryDay.count}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 flex h-56 items-center justify-center text-sm text-muted-foreground">
              Loading enquiry trend...
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <div
                className={`
                  flex
                  h-56
                  items-end
                  gap-2
                  sm:gap-4
                  ${
                    enquiryTrendRange === 30
                      ? "min-w-[900px]"
                      : "min-w-0"
                  }
                `}
              >
                {enquiryTrend.map(
                  (item) => (
                    <Link
                      key={item.date.toISOString()}
                      href="/admin/enquiries"
                      className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                      title={`${item.shortDate}: ${item.count} enquiries`}
                    >
                      <div className="flex h-full items-end justify-center">
                        <div
                          className="
                            relative
                            w-full
                            max-w-14
                            rounded-t-lg
                            bg-primary/70
                            transition-all
                            duration-200
                            group-hover:bg-primary
                          "
                          style={{
                            height:
                              item.count === 0
                                ? "4px"
                                : `${Math.max(
                                    8,
                                    (item.count /
                                      enquiryTrendMax) *
                                      100,
                                  )}%`,
                          }}
                        >
                          <span
                            className="
                              absolute
                              -top-7
                              left-1/2
                              -translate-x-1/2
                              text-xs
                              font-medium
                              opacity-0
                              transition
                              group-hover:opacity-100
                            "
                          >
                            {item.count}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-center">
                        <p className="text-xs font-medium">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {item.shortDate}
                        </p>
                      </div>
                    </Link>
                  ),
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                <span>
                  Click a day to view all enquiries.
                </span>

                <span>
                  Peak:{" "}
                  {highestEnquiryDay.shortDate}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ====================================================
            RECENT ACTIVITY
        ==================================================== */}

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />

                <h2 className="font-heading text-2xl text-primary">
                  Recent Activity
                </h2>
            <Link
              href="/admin/activity-logs"
              className="
                inline-flex
                items-center
                gap-1
                text-sm
                font-medium
                text-primary
                transition
                hover:opacity-80
              "
            >
              View All Activity
              <ArrowRight className="h-4 w-4" />
            </Link>

              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest activity across your catalogue and enquiries.
              </p>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {loading
                ? "..."
                : `${recentActivity.length} recent actions`}
            </span>
          </div>

          {loading ? (
            <div className="mt-8 py-8 text-center text-sm text-muted-foreground">
              Loading recent activity...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No recent activity
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Product, category, collection, and enquiry actions will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y">
              {recentActivity.map(
                (activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      py-4
                      transition
                      first:pt-0
                      last:pb-0
                      hover:bg-muted/20
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${
                          activity.type ===
                          "enquiry"
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-primary/10 text-primary"
                        }
                      `}
                    >
                      {activity.type ===
                      "enquiry" ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {activity.description}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {activity.detail}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.date.toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          },
                        )}
                      </span>

                      <ArrowRight
                        className="
                          h-4
                          w-4
                          text-muted-foreground
                          transition
                          group-hover:translate-x-0.5
                          group-hover:text-primary
                        "
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}





        <div
          className="
            mt-8
            rounded-2xl
            border
            bg-card
            p-6
          "
        >
          <div>
            <h2
              className="
                font-heading
                text-2xl
                text-primary
              "
            >
              Quick Actions
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Quickly manage your Meenakshi Screen
              catalogue.
            </p>
          </div>

          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <Link
              href="/admin/products/new"
              className="
                group
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-4
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <Plus className="h-4 w-4" />
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Add Product
                </span>
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-muted-foreground
                  transition
                  group-hover:text-primary
                "
              />
            </Link>

            <Link
              href="/admin/categories/new"
              className="
                group
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-4
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <FolderTree className="h-4 w-4" />
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Add Category
                </span>
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-muted-foreground
                  transition
                  group-hover:text-primary
                "
              />
            </Link>

            <Link
              href="/admin/collections/new"
              className="
                group
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-4
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <Boxes className="h-4 w-4" />
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Add Collection
                </span>
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-muted-foreground
                  transition
                  group-hover:text-primary
                "
              />
            </Link>

            <Link
              href="/admin/enquiries"
              className="
                group
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-4
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <Users className="h-4 w-4" />
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >
                  View Enquiries
                </span>
              </span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  text-muted-foreground
                  transition
                  group-hover:text-primary
                "
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}