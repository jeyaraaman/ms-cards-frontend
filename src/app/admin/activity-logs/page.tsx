"use client";

import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

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

const entityOptions = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "product",
    label: "Products",
  },
  {
    value: "category",
    label: "Categories",
  },
  {
    value: "collection",
    label: "Collections",
  },
  {
    value: "enquiry",
    label: "Enquiries",
  },
];

const actionOptions = [
  {
    value: "all",
    label: "All Actions",
  },
  {
    value: "created",
    label: "Created",
  },
  {
    value: "updated",
    label: "Updated",
  },
  {
    value: "activated",
    label: "Activated",
  },
  {
    value: "deactivated",
    label: "Deactivated",
  },
  {
    value: "deleted",
    label: "Deleted",
  },
  {
    value: "restored",
    label: "Restored",
  },
  {
    value: "permanently_deleted",
    label: "Permanently Deleted",
  },
  {
    value: "status_changed",
    label: "Status Changed",
  },
  {
    value: "reordered",
    label: "Reordered",
  },
];

function extractList<T>(
  data: unknown,
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data
  ) {
    const results = (
      data as {
        results?: unknown;
      }
    ).results;

    if (Array.isArray(results)) {
      return results as T[];
    }
  }

  return [];
}

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem(
      "admin_access_token",
    ) ||
    sessionStorage.getItem(
      "access_token",
    )
  );
}

function formatAction(
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

function formatEntity(
  entity: string,
) {
  return entity
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getActivityHref(
  activity: ActivityLog,
) {
  switch (activity.entity_type) {
    case "product":
      return "/admin/products";

    case "category":
      return "/admin/categories";

    case "collection":
      return "/admin/collections";

    case "enquiry":
      return activity.entity_id
        ? `/admin/enquiries/${activity.entity_id}`
        : "/admin/enquiries";

    default:
      return null;
  }
}

function getActionClass(
  action: string,
) {
  switch (action) {
    case "created":
      return "bg-green-500/10 text-green-700";

    case "activated":
      return "bg-green-500/10 text-green-700";

    case "deactivated":
      return "bg-amber-500/10 text-amber-700";

    case "deleted":
    case "permanently_deleted":
      return "bg-red-500/10 text-red-700";

    case "restored":
      return "bg-blue-500/10 text-blue-700";

    case "status_changed":
      return "bg-purple-500/10 text-purple-700";

    case "reordered":
      return "bg-orange-500/10 text-orange-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function ActivityLogsPage() {
  const [activities, setActivities] =
    useState<ActivityLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [entityFilter, setEntityFilter] =
    useState("all");

  const [actionFilter, setActionFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const pageSize = 15;

  async function loadActivities() {
    const token = getToken();

    if (!token) {
      window.location.href =
        "/admin/login";

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/activity-logs/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          "admin_access_token",
        );

        sessionStorage.removeItem(
          "admin_refresh_token",
        );

        window.location.href =
          "/admin/login";

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load activity logs.",
        );
      }

      const data =
        await response.json();

      setActivities(
        extractList<ActivityLog>(
          data,
        ),
      );
    } catch (err) {
      console.error(
        "Activity logs error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activity logs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActivities();
  }, []);

  const filteredActivities =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return activities.filter(
        (activity) => {
          if (
            entityFilter !==
              "all" &&
            activity.entity_type !==
              entityFilter
          ) {
            return false;
          }

          if (
            actionFilter !==
              "all" &&
            activity.action !==
              actionFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            activity.entity_name,
            activity.description,
            activity.user_name,
            activity.action,
            activity.entity_type,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLowerCase()
                .includes(query),
            );
        },
      );
    }, [
      activities,
      search,
      entityFilter,
      actionFilter,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredActivities.length /
        pageSize,
    ),
  );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedActivities =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      return filteredActivities.slice(
        start,
        start + pageSize,
      );
    }, [
      filteredActivities,
      currentPage,
    ]);

  function handleFilterChange() {
    setCurrentPage(1);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                text-muted-foreground
                transition
                hover:text-foreground
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <h1 className="font-heading text-3xl text-primary">
                  Activity Logs
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Complete history of important admin actions.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadActivities()
            }
            className="
              rounded-xl
              border
              px-4
              py-2.5
              text-sm
              font-medium
              transition
              hover:bg-muted
            "
          >
            Refresh
          </button>
        </div>

        {/* FILTERS */}
        <section className="mt-8 rounded-2xl border bg-card p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
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
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                  handleFilterChange();
                }}
                placeholder="Search activity..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  bg-background
                  pl-11
                  pr-4
                  text-sm
                  outline-none
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/10
                "
              />
            </div>

            <select
              value={entityFilter}
              onChange={(event) => {
                setEntityFilter(
                  event.target.value,
                );
                handleFilterChange();
              }}
              className="
                h-11
                rounded-xl
                border
                bg-background
                px-4
                text-sm
                outline-none
                focus:border-primary
              "
            >
              {entityOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <select
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(
                  event.target.value,
                );
                handleFilterChange();
              }}
              className="
                h-11
                rounded-xl
                border
                bg-background
                px-4
                text-sm
                outline-none
                focus:border-primary
              "
            >
              {actionOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {filteredActivities.length}{" "}
            matching activit
            {filteredActivities.length ===
            1
              ? "y"
              : "ies"}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ACTIVITY LIST */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-card">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading activity logs...
            </div>
          ) : paginatedActivities.length ===
            0 ? (
            <div className="p-12 text-center">
              <Activity className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No activity found
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedActivities.map(
                (activity) => {
                  const href =
                    getActivityHref(
                      activity,
                    );

                  const content = (
                    <div
                      className="
                        flex
                        gap-4
                        p-5
                        transition
                        hover:bg-muted/30
                      "
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-semibold
                              ${getActionClass(
                                activity.action,
                              )}
                            `}
                          >
                            {formatAction(
                              activity.action,
                            )}
                          </span>

                          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {formatEntity(
                              activity.entity_type,
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium">
                          {activity.description}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {activity.entity_name}
                          </span>

                          <span>
                            By{" "}
                            {activity.user_name ||
                              "System"}
                          </span>

                          <span>
                            {new Date(
                              activity.created_at,
                            ).toLocaleString(
                              "en-IN",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      {href && (
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                  );

                  return href ? (
                    <Link
                      key={activity.id}
                      href={href}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={activity.id}
                    >
                      {content}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {!loading &&
          filteredActivities.length >
            0 && (
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of{" "}
                {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    hover:bg-muted
                    disabled:pointer-events-none
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    hover:bg-muted
                    disabled:pointer-events-none
                    disabled:opacity-40
                  "
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>
    </main>
  );
}