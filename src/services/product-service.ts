// ============================================================
// MS CARDS PLATFORM
// PRODUCT API SERVICE
// ============================================================

import { api } from "@/services/api";

import type {
  CreateProductImagePayload,
  CreateProductPayload,
  Product,
  ProductImage,
  ProductListResponse,
  ReorderProductImagesPayload,
  UpdateProductPayload,
} from "@/types/product";


// ============================================================
// HELPER
// ============================================================

function normalizeProductList(
  response: Product[] | ProductListResponse
): Product[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? [];
}


// ============================================================
// GET ALL PRODUCTS
// ============================================================

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<
    Product[] | ProductListResponse
  >("/products/");

  return normalizeProductList(response);
}


// ============================================================
// GET ACTIVE PRODUCTS
// ============================================================

export async function getActiveProducts(): Promise<Product[]> {
  const response = await api.get<
    Product[] | ProductListResponse
  >("/products/?active=true");

  return normalizeProductList(response);
}


// ============================================================
// GET PRODUCT BY SLUG
// ============================================================

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  return api.get<Product>(
    `/products/${slug}/`
  );
}


// ============================================================
// CREATE PRODUCT
// ============================================================

export async function createProduct(
  data: CreateProductPayload
): Promise<Product> {
  return api.post<Product>(
    "/products/",
    data
  );
}


// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(
  slug: string,
  data: UpdateProductPayload
): Promise<Product> {
  return api.patch<Product>(
    `/products/${slug}/`,
    data
  );
}


// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(
  slug: string
): Promise<void> {
  await api.delete<void>(
    `/products/${slug}/`
  );
}


// ============================================================
// GET RECYCLE BIN PRODUCTS
// ============================================================

export async function getRecycleBinProducts(): Promise<Product[]> {
  const response = await api.get<
    Product[] | ProductListResponse
  >("/products/recycle-bin/");

  return normalizeProductList(response);
}


// ============================================================
// RESTORE PRODUCT
// ============================================================

export async function restoreProduct(
  id: number
): Promise<Product> {
  return api.post<Product>(
    `/products/recycle-bin/${id}/restore/`
  );
}


// ============================================================
// PERMANENTLY DELETE PRODUCT
// ============================================================

export async function permanentlyDeleteProduct(
  id: number
): Promise<void> {
  await api.delete<void>(
    `/products/recycle-bin/${id}/permanent-delete/`
  );
}


// ============================================================
// UPLOAD PRODUCT IMAGE TO CLOUDINARY
// ============================================================

export interface ProductImageUploadResponse {
  url: string;

  public_id: string;
}


export async function uploadProductImage(
  file: File
): Promise<ProductImageUploadResponse> {
  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  return api.post<ProductImageUploadResponse>(
    "/products/images/upload/",
    formData
  );
}


// ============================================================
// ATTACH IMAGE TO PRODUCT
// ============================================================

export async function addProductImage(
  productId: number,
  data: CreateProductImagePayload
): Promise<ProductImage> {
  return api.post<ProductImage>(
    `/products/${productId}/images/`,
    data
  );
}


// ============================================================
// DELETE PRODUCT IMAGE
// ============================================================

export async function deleteProductImage(
  imageId: number
): Promise<void> {
  await api.delete<void>(
    `/products/images/${imageId}/`
  );
}


// ============================================================
// SET PRIMARY PRODUCT IMAGE
// ============================================================

export async function setPrimaryProductImage(
  imageId: number
): Promise<ProductImage> {
  return api.post<ProductImage>(
    `/products/images/${imageId}/set-primary/`
  );
}


// ============================================================
// REORDER PRODUCT IMAGES
// ============================================================

export async function reorderProductImages(
  productId: number,
  imageIds: number[]
): Promise<ProductImage[]> {
  const payload: ReorderProductImagesPayload = {
    image_ids: imageIds,
  };

  return api.post<ProductImage[]>(
    `/products/${productId}/images/reorder/`,
    payload
  );
}


// ============================================================
// COMPLETE PRODUCT IMAGE UPLOAD
// ============================================================

/**
 * Uploads an image to Cloudinary and then attaches
 * the uploaded image to the specified product.
 */
export async function uploadAndAttachProductImage(
  productId: number,
  file: File,
  isPrimary = false
): Promise<ProductImage> {
  // Step 1: Upload to Cloudinary
  const uploadResult =
    await uploadProductImage(file);

  // Step 2: Attach to product
  return addProductImage(
    productId,
    {
      image: uploadResult.url,

      cloudinary_public_id:
        uploadResult.public_id,

      is_primary: isPrimary,
    }
  );
}