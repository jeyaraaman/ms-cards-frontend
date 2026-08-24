"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

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
  status: string;
  created_at: string;
  updated_at: string;
};

type StatusFilter =
  | "all"
  | "new"
  | "contacted"
  | "in_progress"
  | "completed"
  | "cancelled";

type SortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc";

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusOptions: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

export default function AdminEnquiriesPage() {
  const router = useRouter();

  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  // ==========================================================
  // READ URL FILTER
  // ==========================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const status = params.get("status");

    if (
      status === "new" ||
      status === "contacted" ||
      status === "in_progress" ||
      status === "completed" ||
      status === "cancelled"
    ) {
      setStatusFilter(status);
    }
  }, []);

  // ==========================================================
  // KEEP URL IN SYNC
  // ==========================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    if (statusFilter === "all") {
      params.delete("status");
    } else {
      params.set("status", statusFilter);
    }

    const query = params.toString();

    window.history.replaceState(
      null,
      "",
      query
        ? `/admin/enquiries?${query}`
        : "/admin/enquiries",
    );
  }, [statusFilter]);

  // ==========================================================
  // LOAD ENQUIRIES
  // ==========================================================

  async function fetchEnquiries(
    showRefresh = false,
  ) {
    const token =
      sessionStorage.getItem(
        "admin_access_token",
      );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load enquiries.",
        );
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setEnquiries(list);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "Unable to load enquiries. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // ==========================================================
  // HELPERS
  // ==========================================================

  function formatDate(
    dateString: string,
  ) {
    try {
      return new Date(
        dateString,
      ).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateString;
    }
  }

  function getStatusClass(
    status: string,
  ) {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700";

      case "contacted":
        return "bg-yellow-50 text-yellow-700";

      case "in_progress":
        return "bg-purple-50 text-purple-700";

      case "completed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  function openEnquiry(
    id: number,
  ) {
    router.push(
      `/admin/enquiries/${id}`,
    );
  }

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalEnquiries =
    enquiries.length;

  const newEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "new",
    ).length;

  const contactedEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "contacted",
    ).length;

  const inProgressEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "in_progress",
    ).length;

  const completedEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "completed",
    ).length;

  const cancelledEnquiries =
    enquiries.filter(
      (item) =>
        item.status === "cancelled",
    ).length;

  // ==========================================================
  // FILTER + SEARCH + SORT
  // ==========================================================

  const filteredEnquiries =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      let result =
        enquiries.filter(
          (item) => {
            const matchesSearch =
              !query ||
              [
                item.name,
                item.phone,
                item.email,
                item.product_name,
                item.product_id,
                item.occasion,
                item.message,
                statusLabels[
                  item.status
                ] || item.status,
              ]
                .filter(Boolean)
                .some((value) =>
                  String(value)
                    .toLowerCase()
                    .includes(query),
                );

            const matchesStatus =
              statusFilter === "all" ||
              item.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          switch (sortOption) {
            case "oldest":
              return (
                new Date(
                  a.created_at,
                ).getTime() -
                new Date(
                  b.created_at,
                ).getTime()
              );

            case "name_asc":
              return a.name.localeCompare(
                b.name,
              );

            case "name_desc":
              return b.name.localeCompare(
                a.name,
              );

            case "newest":
            default:
              return (
                new Date(
                  b.created_at,
                ).getTime() -
                new Date(
                  a.created_at,
                ).getTime()
              );
          }
        },
      );
    }, [
      enquiries,
      search,
      statusFilter,
      sortOption,
    ]);

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all";

  // ==========================================================
  // STAT CARD
  // ==========================================================

  function SummaryCard({
    label,
    count,
    filter,
  }: {
    label: string;
    count: number;
    filter: StatusFilter;
  }) {
    const selected =
      statusFilter === filter;

    return (
      <button
        type="button"
        onClick={() =>
          setStatusFilter(filter)
        }
        className={`
          rounded-2xl
          border
          bg-card
          p-5
          text-left
          transition
          hover:-translate-y-0.5
          hover:border-primary/40
          hover:shadow-md
          ${
            selected
              ? "border-primary bg-primary/5 shadow-sm"
              : ""
          }
        `}
      >
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <p className="mt-2 text-3xl font-semibold">
          {count}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Click to filter
        </p>
      </button>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="font-heading text-2xl text-primary">
              Meenakshi Screen
            </h1>

            <p className="text-sm text-muted-foreground">
              Admin Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="
              rounded-lg
              border
              px-4
              py-2
              text-sm
              font-medium
              transition
              hover:bg-muted
            "
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-4xl text-primary">
              Enquiries
            </h2>

            <p className="mt-2 text-muted-foreground">
              Manage customer enquiries received from
              the website.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchEnquiries(true)
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
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Total Enquiries"
            count={totalEnquiries}
            filter="all"
          />

          <SummaryCard
            label="New"
            count={newEnquiries}
            filter="new"
          />

          <SummaryCard
            label="Contacted"
            count={contactedEnquiries}
            filter="contacted"
          />

          <SummaryCard
            label="In Progress"
            count={inProgressEnquiries}
            filter="in_progress"
          />

          <SummaryCard
            label="Completed"
            count={completedEnquiries}
            filter="completed"
          />

          <SummaryCard
            label="Cancelled"
            count={cancelledEnquiries}
            filter="cancelled"
          />
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_210px_210px]">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search name, phone, email, product, occasion..."
              className="
                h-12
                w-full
                rounded-xl
                border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-2
                focus:ring-primary/10
              "
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter,
                )
              }
              className="
                h-12
                rounded-xl
                border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                focus:border-primary
              "
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target
                    .value as SortOption,
                )
              }
              className="
                h-12
                rounded-xl
                border
                bg-background
                px-4
                text-sm
                outline-none
                transition
                focus:border-primary
              "
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="name_asc">
                Name A–Z
              </option>

              <option value="name_desc">
                Name Z–A
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredEnquiries.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {totalEnquiries}
              </span>{" "}
              enquiries
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "all",
                  );
                  setSortOption(
                    "newest",
                  );
                }}
                className="
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-primary
                  transition
                  hover:bg-primary/10
                "
              >
                Clear filters
              </button>
            )}
          </div>

          {(search ||
            statusFilter !== "all" ||
            sortOption !== "newest") && (
            <div className="mt-3 flex flex-wrap gap-2">
              {search && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  Search: {search}
                </span>
              )}

              {statusFilter !==
                "all" && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  Status:{" "}
                  {
                    statusLabels[
                      statusFilter
                    ]
                  }
                </span>
              )}

              {sortOption !==
                "newest" && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  Sort:{" "}
                  {sortOption ===
                  "oldest"
                    ? "Oldest"
                    : sortOption ===
                        "name_asc"
                      ? "Name A–Z"
                      : "Name Z–A"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              Loading enquiries...
            </p>
          </div>
        ) : filteredEnquiries.length ===
          0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
            <h3 className="text-lg font-semibold">
              {totalEnquiries === 0
                ? "No enquiries yet"
                : "No matching enquiries"}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {totalEnquiries === 0
                ? "Customer enquiries will appear here."
                : "Try changing your search or filters."}
            </p>

            {totalEnquiries > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "all",
                  );
                }}
                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border bg-card lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/40">
                    <tr className="text-left text-sm">
                      <th className="px-5 py-4 font-medium">
                        Customer
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Product
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Quantity
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Occasion
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEnquiries.map(
                      (enquiry) => (
                        <tr
                          key={
                            enquiry.id
                          }
                          onClick={() =>
                            openEnquiry(
                              enquiry.id,
                            )
                          }
                          className="
                            cursor-pointer
                            border-b
                            transition
                            hover:bg-muted/40
                            last:border-0
                          "
                        >
                          {/* Customer */}
                          <td className="px-5 py-4">
                            <div className="font-medium">
                              {
                                enquiry.name
                              }
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              {
                                enquiry.phone
                              }
                            </div>

                            {enquiry.email && (
                              <div className="text-xs text-muted-foreground">
                                {
                                  enquiry.email
                                }
                              </div>
                            )}
                          </td>

                          {/* Product */}
                          <td className="px-5 py-4">
                            {enquiry.product_name ||
                              "General Enquiry"}
                          </td>

                          {/* Quantity */}
                          <td className="px-5 py-4">
                            {enquiry.quantity}
                          </td>

                          {/* Occasion */}
                          <td className="px-5 py-4">
                            {
                              enquiry.occasion
                            }
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-medium
                                ${getStatusClass(
                                  enquiry.status,
                                )}
                              `}
                            >
                              {
                                statusLabels[
                                  enquiry.status
                                ] ||
                                enquiry.status
                              }
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {formatDate(
                              enquiry.created_at,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="mt-6 space-y-4 lg:hidden">
              {filteredEnquiries.map(
                (enquiry) => (
                  <div
                    key={
                      enquiry.id
                    }
                    onClick={() =>
                      openEnquiry(
                        enquiry.id,
                      )
                    }
                    className="
                      cursor-pointer
                      rounded-2xl
                      border
                      bg-card
                      p-5
                      transition
                      hover:bg-muted/40
                    "
                  >
                    {/* Customer + Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {
                            enquiry.name
                          }
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            enquiry.phone
                          }
                        </p>

                        {enquiry.email && (
                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {
                              enquiry.email
                            }
                          </p>
                        )}
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-medium
                          ${getStatusClass(
                            enquiry.status,
                          )}
                        `}
                      >
                        {
                          statusLabels[
                            enquiry.status
                          ] ||
                          enquiry.status
                        }
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        <span className="font-medium">
                          Product:
                        </span>{" "}
                        {enquiry.product_name ||
                          "General Enquiry"}
                      </p>

                      <p>
                        <span className="font-medium">
                          Quantity:
                        </span>{" "}
                        {
                          enquiry.quantity
                        }
                      </p>

                      <p>
                        <span className="font-medium">
                          Occasion:
                        </span>{" "}
                        {
                          enquiry.occasion
                        }
                      </p>

                      <p>
                        <span className="font-medium">
                          Date:
                        </span>{" "}
                        {formatDate(
                          enquiry.created_at,
                        )}
                      </p>
                    </div>

                    {enquiry.message && (
                      <div className="mt-4 rounded-xl bg-muted/50 p-3">
                        <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                          {
                            enquiry.message
                          }
                        </p>
                      </div>
                    )}

                    <div className="mt-4 text-xs font-medium text-primary">
                      View enquiry →
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}