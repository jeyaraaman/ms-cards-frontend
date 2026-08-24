"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

const statuses = [
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
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

export default function EnquiryDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [enquiry, setEnquiry] =
    useState<Enquiry | null>(null);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem(
      "admin_access_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    async function fetchEnquiry() {
      try {
        const response = await fetch(
          `${API_URL}/api/enquiries/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            "Failed to load enquiry.",
          );
        }

        const data: Enquiry =
          await response.json();

        setEnquiry(data);
        setStatus(data.status);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load this enquiry.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEnquiry();
  }, [id, router]);

  function handleCall() {
    if (enquiry?.phone) {
      window.location.href = `tel:${enquiry.phone}`;
    }
  }

  function handleEmail() {
    if (enquiry?.email) {
      window.location.href = `mailto:${enquiry.email}`;
    }
  }

  async function handleStatusUpdate() {
    const token = sessionStorage.getItem(
      "admin_access_token",
    );

    if (!token || !enquiry) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/enquiries/${enquiry.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
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
          "Failed to update enquiry.",
        );
      }

      const updated: Enquiry =
        await response.json();

      setEnquiry(updated);
      setStatus(updated.status);
      setSuccess(
        "Enquiry status updated successfully.",
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update the enquiry status.",
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">
          Loading enquiry...
        </p>
      </main>
    );
  }

  if (error && !enquiry) {
    return (
      <main className="min-h-screen bg-muted/30 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>

          <button
            onClick={() =>
              router.push(
                "/admin/enquiries",
              )
            }
            className="mt-5 rounded-lg border bg-background px-5 py-3 text-sm font-medium"
          >
            ← Back to Enquiries
          </button>
        </div>
      </main>
    );
  }

  if (!enquiry) {
    return null;
  }

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
            onClick={() =>
              router.push(
                "/admin/enquiries",
              )
            }
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            ← Enquiries
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h2 className="font-heading text-4xl text-primary">
            Enquiry #{enquiry.id}
          </h2>

          <p className="mt-2 text-muted-foreground">
            View and manage customer enquiry details.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Customer */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">
            Customer Details
          </h3>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Name
              </p>

              <p className="mt-1 font-medium">
                {enquiry.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Phone
              </p>

              <button
                type="button"
                onClick={handleCall}
                className="mt-1 text-left font-medium text-primary hover:underline"
              >
                {enquiry.phone}
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Email
              </p>

              {enquiry.email ? (
                <button
                  type="button"
                  onClick={handleEmail}
                  className="mt-1 break-all text-left font-medium text-primary hover:underline"
                >
                  {enquiry.email}
                </button>
              ) : (
                <p className="mt-1 font-medium">
                  Not provided
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Submitted
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  enquiry.created_at,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Enquiry Details */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">
            Enquiry Details
          </h3>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Product
              </p>

              <p className="mt-1 font-medium">
                {enquiry.product_name ||
                  "General Enquiry"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Quantity
              </p>

              <p className="mt-1 font-medium">
                {enquiry.quantity}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Occasion
              </p>

              <p className="mt-1 font-medium">
                {enquiry.occasion}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Product ID
              </p>

              <p className="mt-1 font-medium">
                {enquiry.product_id || "—"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground">
              Customer Message
            </p>

            <div className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-6">
              {enquiry.message}
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        {(enquiry.phone || enquiry.email) && (
          <div className="mt-6 rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-semibold">
              Quick Contact
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Contact the customer directly from this enquiry.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {enquiry.phone && (
                <button
                  type="button"
                  onClick={handleCall}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Call Customer
                </button>
              )}

              {enquiry.email && (
                <button
                  type="button"
                  onClick={handleEmail}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Email Customer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">
            Enquiry Status
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Update the current status of this enquiry.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-11 flex-1 rounded-lg border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {statuses.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleStatusUpdate}
              disabled={
                saving ||
                status === enquiry.status
              }
              className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Status"}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() =>
              router.push(
                "/admin/enquiries",
              )
            }
            className="rounded-lg border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted"
          >
            ← Back to Enquiries
          </button>
        </div>
      </section>
    </main>
  );
}