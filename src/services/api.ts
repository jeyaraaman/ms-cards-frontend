// ============================================================
// MS CARDS PLATFORM
// CENTRAL API SERVICE
// ============================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000/api";


// ============================================================
// API ERROR
// ============================================================

export class ApiError extends Error {
  public status: number;
  public data: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}


// ============================================================
// GET ACCESS TOKEN
// ============================================================

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}


// ============================================================
// API REQUEST OPTIONS
// ============================================================

interface ApiRequestOptions
  extends RequestInit {
  token?: string | null;
}


// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    token,
    headers,
    ...fetchOptions
  } = options;

  const accessToken =
    token !== undefined
      ? token
      : getAccessToken();

  const isFormData =
    fetchOptions.body instanceof FormData;

  const requestHeaders = new Headers(
    headers
  );

  // ==========================================================
  // CONTENT TYPE
  // ==========================================================

  if (
    !isFormData &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }


  // ==========================================================
  // AUTHORIZATION
  // ==========================================================

  if (
    accessToken &&
    !requestHeaders.has("Authorization")
  ) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }


  // ==========================================================
  // API REQUEST
  // ==========================================================

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers: requestHeaders,
    }
  );


  // ==========================================================
  // RESPONSE DATA
  // ==========================================================

  let data: unknown = null;

  const contentType =
    response.headers.get("content-type");

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = text || null;
  }


  // ==========================================================
  // ERROR HANDLING
  // ==========================================================

  if (!response.ok) {
    let message =
      "Something went wrong. Please try again.";

    if (
      data &&
      typeof data === "object"
    ) {
      const errorData =
        data as Record<string, unknown>;

      if (
        typeof errorData.detail ===
        "string"
      ) {
        message = errorData.detail;
      } else if (
        typeof errorData.message ===
        "string"
      ) {
        message = errorData.message;
      } else {
        const firstError =
          Object.values(errorData)[0];

        if (
          Array.isArray(firstError) &&
          typeof firstError[0] ===
            "string"
        ) {
          message = firstError[0];
        }
      }
    }

    throw new ApiError(
      message,
      response.status,
      data
    );
  }


  return data as T;
}


// ============================================================
// HTTP METHODS
// ============================================================

export const api = {
  // ==========================================================
  // GET
  // ==========================================================

  get: <T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    ),


  // ==========================================================
  // POST
  // ==========================================================

  post: <T>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),


  // ==========================================================
  // PUT
  // ==========================================================

  put: <T>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),


  // ==========================================================
  // PATCH
  // ==========================================================

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }
    ),


  // ==========================================================
  // DELETE
  // ==========================================================

  delete: <T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    ),
};


// ============================================================
// EXPORT API BASE URL
// ============================================================

export {
  API_BASE_URL,
};