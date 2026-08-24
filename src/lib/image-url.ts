const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function getImageUrl(
  image: string | null | undefined,
): string {
  if (!image) {
    return "";
  }

  const value = image.trim();

  if (!value) {
    return "";
  }

  // Already an absolute URL.
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  /*
   * Existing catalogue images are stored in
   * the Next.js public folder.
   *
   * Example:
   *
   * /images/premium/box.jpg
   *
   * Next.js serves this as:
   *
   * http://localhost:3000/images/premium/box.jpg
   */
  if (
    value.startsWith("/images/")
  ) {
    return value;
  }

  /*
   * Future Django-served media files can use
   * another relative path such as /media/...
   */
  if (
    value.startsWith("/media/")
  ) {
    return `${API_URL}${value}`;
  }

  /*
   * Fallback for other backend-relative paths.
   */
  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
}