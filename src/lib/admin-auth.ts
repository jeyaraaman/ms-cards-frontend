const ACCESS_TOKEN_KEY =
  "admin_access_token";

const REFRESH_TOKEN_KEY =
  "admin_refresh_token";

let refreshPromise:
  | Promise<string | null>
  | null = null;

function getApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  return apiUrl.replace(
    /\/+$/,
    "",
  );
}

export function getAccessToken():
  | string
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return sessionStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
}

export function getRefreshToken():
  | string
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return sessionStorage.getItem(
    REFRESH_TOKEN_KEY,
  );
}

export function setAdminTokens(
  accessToken: string,
  refreshToken?: string,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  if (refreshToken) {
    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    );
  }
}

export function clearAdminSession(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  sessionStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );
}

export async function refreshAdminAccessToken(): Promise<
  string | null
> {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    clearAdminSession();

    return null;
  }

  refreshPromise =
    (async () => {
      try {
        const response =
          await fetch(
            `${getApiUrl()}/api/auth/token/refresh/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                refresh:
                  refreshToken,
              }),
            },
          );

        if (!response.ok) {
          clearAdminSession();

          return null;
        }

        const data =
          await response.json();

        if (
          typeof data.access !==
          "string"
        ) {
          clearAdminSession();

          return null;
        }

        setAdminTokens(
          data.access,
          typeof data.refresh ===
            "string"
            ? data.refresh
            : undefined,
        );

        return data.access;
      } catch (error) {
        console.error(
          "Admin token refresh failed:",
          error,
        );

        clearAdminSession();

        return null;
      } finally {
        refreshPromise = null;
      }
    })();

  return refreshPromise;
}

export async function getValidAdminAccessToken(): Promise<
  string | null
> {
  const accessToken =
    getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  return refreshAdminAccessToken();
}

export async function adminFetch(
  input:
    | RequestInfo
    | URL,
  init: RequestInit = {},
): Promise<Response> {
  let accessToken =
    await getValidAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "ADMIN_AUTH_REQUIRED",
    );
  }

  const headers =
    new Headers(
      init.headers,
    );

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`,
  );

  if (
    init.body &&
    !headers.has(
      "Content-Type",
    ) &&
    !(init.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response =
    await fetch(
      input,
      {
        ...init,
        headers,
      },
    );

  if (
    response.status ===
    401
  ) {
    accessToken =
      await refreshAdminAccessToken();

    if (!accessToken) {
      throw new Error(
        "ADMIN_AUTH_EXPIRED",
      );
    }

    const retryHeaders =
      new Headers(
        init.headers,
      );

    retryHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );

    if (
      init.body &&
      !retryHeaders.has(
        "Content-Type",
      ) &&
      !(init.body instanceof FormData)
    ) {
      retryHeaders.set(
        "Content-Type",
        "application/json",
      );
    }

    response =
      await fetch(
        input,
        {
          ...init,
          headers:
            retryHeaders,
        },
      );
  }

  return response;
}

export function redirectToAdminLogin(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  clearAdminSession();

  const currentPath =
    `${window.location.pathname}${window.location.search}`;

  window.location.href =
    `/admin/login?next=${encodeURIComponent(
      currentPath,
    )}`;
}