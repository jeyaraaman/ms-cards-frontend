"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  function handleLogout() {
    sessionStorage.removeItem(
      "admin_access_token",
    );

    sessionStorage.removeItem(
      "admin_refresh_token",
    );

    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
    >
      <LogOut className="h-4 w-4" />

      Logout
    </button>
  );
}