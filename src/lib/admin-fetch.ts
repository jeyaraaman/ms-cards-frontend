/**
 * Centralized admin API authentication helper.
 *
 * Responsibilities:
 * - Reads the admin access token from sessionStorage.
 * - Adds the Bearer token to authenticated requests.
 * - If the access token has expired (401), uses the refresh token.
 * - Stores the rotated refresh token returned by SimpleJWT.
 * - Retries the original request once with the new access token.
 * - Clears the admin session and redirects to the login page if refresh fails.
 *
 * Admin tokens are intentionally kept in sessionStorage for this project,
 * matching the existing admin login implementation.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

let refreshPromise: Promise<string | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearAdminSession(): void {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

function redirectToLogin(): void {
  if (!isBrowser()) {
    return;
  }

  if (window.location.pathname === "/admin/login") {
    return;
  }

  window.location.replace("/admin/login");
}

/**
 * Refresh the JWT access token.
 *
 * SimpleJWT returns:
 * {
 *   access: "...",
 *   refresh: "..."
 * }
 *
 * Because ROTATE_REFRESH_TOKENS is enabled on the backend,
 * the returned refresh token must replace the old one.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAdminSession();
    redirectToLogin();
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/auth/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      clearAdminSession();
      redirectToLogin();
      return null;
    }

    const data = (await response.json()) as {
      access?: string;
      refresh?: string;
    };

    if (!data.access) {
      clearAdminSession();
      redirectToLogin();
      return null;
    }

    sessionStorage.setItem(
      ACCESS_TOKEN_KEY,
      data.access,
    );

    /*
     * With ROTATE_REFRESH_TOKENS=True, SimpleJWT may return
     * a new refresh token. Always store it when present.
     */
    if (data.refresh) {
      sessionStorage.setItem(
        REFRESH_TOKEN_KEY,
        data.refresh,
      );
    }

    return data.access;
  } catch (error) {
    console.error(
      "Admin token refresh failed:",
      error,
    );

    clearAdminSession();
    redirectToLogin();

    return null;
  }
}

/**
 * Prevent several simultaneous API calls from refreshing the token
 * independently. All callers share the same refresh request.
 */
async function getFreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * Fetch an admin API endpoint with automatic JWT refresh.
 *
 * Usage:
 *
 * await adminFetch("/api/products/");
 *
 * or:
 *
 * await adminFetch("/api/products/123/", {
 *   method: "DELETE",
 * });
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (!isBrowser()) {
    throw new Error(
      "adminFetch can only be used in the browser.",
    );
  }

  let accessToken = getAccessToken();

  if (!accessToken) {
    clearAdminSession();
    redirectToLogin();

    /*
     * Return a synthetic 401 response so callers that already
     * check response.ok/status do not crash before navigation.
     */
    return new Response(
      JSON.stringify({
        detail: "Admin authentication required.",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const headers = new Headers(
    init.headers,
  );

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`,
  );

  const firstRequest: RequestInit = {
    ...init,
    headers,
  };

  let response = await fetch(
    input,
    firstRequest,
  );

  /*
   * Access token expired.
   *
   * Refresh once, then retry the original request exactly once.
   */
  if (response.status !== 401) {
    return response;
  }

  accessToken = await getFreshAccessToken();

  if (!accessToken) {
    return response;
  }

  const retryHeaders = new Headers(
    init.headers,
  );

  retryHeaders.set(
    "Authorization",
    `Bearer ${accessToken}`,
  );

  response = await fetch(
    input,
    {
      ...init,
      headers: retryHeaders,
    },
  );

  /*
   * If the refreshed token is still rejected, do not loop.
   * Clear the session and send the admin back to login.
   */
  if (response.status === 401) {
    clearAdminSession();
    redirectToLogin();
  }

  return response;
}