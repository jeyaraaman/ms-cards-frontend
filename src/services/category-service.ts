// ============================================================
// MS CARDS PLATFORM
// CATEGORY API SERVICE
// ============================================================

import { api } from "@/services/api";

import type {
  Category,
  CategoryImageUploadResponse,
  CategoryListResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";


// ============================================================
// HELPER
// ============================================================

function normalizeCategoryList(
  response: Category[] | CategoryListResponse
): Category[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? [];
}


// ============================================================
// GET ALL CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<
    Category[] | CategoryListResponse
  >("/categories/");

  return normalizeCategoryList(response);
}


// ============================================================
// GET ACTIVE CATEGORIES
// ============================================================

export async function getActiveCategories(): Promise<Category[]> {
  const response = await api.get<
    Category[] | CategoryListResponse
  >("/categories/?active=true");

  return normalizeCategoryList(response);
}


// ============================================================
// GET CATEGORY BY SLUG
// ============================================================

export async function getCategoryBySlug(
  slug: string
): Promise<Category> {
  return api.get<Category>(
    `/categories/${slug}/`
  );
}


// ============================================================
// CREATE CATEGORY
// ============================================================

export async function createCategory(
  data: CreateCategoryPayload
): Promise<Category> {
  return api.post<Category>(
    "/categories/",
    data
  );
}


// ============================================================
// UPDATE CATEGORY
// ============================================================

export async function updateCategory(
  slug: string,
  data: UpdateCategoryPayload
): Promise<Category> {
  return api.patch<Category>(
    `/categories/${slug}/`,
    data
  );
}


// ============================================================
// DELETE CATEGORY
// ============================================================

export async function deleteCategory(
  slug: string
): Promise<void> {
  await api.delete<void>(
    `/categories/${slug}/`
  );
}


// ============================================================
// UPLOAD CATEGORY IMAGE
// ============================================================

export async function uploadCategoryImage(
  file: File
): Promise<CategoryImageUploadResponse> {
  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  return api.post<CategoryImageUploadResponse>(
    "/categories/upload/",
    formData
  );
}


// ============================================================
// COMPLETE CATEGORY IMAGE UPLOAD
// ============================================================

/**
 * Upload category image to Cloudinary through Django.
 *
 * Returns:
 * {
 *   url,
 *   public_id
 * }
 */
export async function uploadCategoryImageToCloudinary(
  file: File
): Promise<CategoryImageUploadResponse> {
  return uploadCategoryImage(file);
}