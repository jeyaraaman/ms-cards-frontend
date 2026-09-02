// ============================================================
// MS CARDS PLATFORM
// PRODUCT TYPES
// ============================================================


// ============================================================
// PRODUCT IMAGE
// ============================================================

export interface ProductImage {
  id: number;

  image: string;

  cloudinary_public_id: string;

  is_primary: boolean;

  display_order: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// PRODUCT
// ============================================================

export interface Product {
  id: number;

  name: string;

  slug: string;

  // ==========================================================
  // CATEGORY
  // ==========================================================

  category: number;

  category_name: string;

  category_slug?: string;


  // ==========================================================
  // COLLECTIONS
  // ==========================================================

  collections: number[];

  collection_ids?: number[];

  collection_slugs?: string[];

  collection_names?: string[];


  // ==========================================================
  // PRODUCT INFORMATION
  // ==========================================================

  description?: string;

  short_description?: string;

  price?: string | number | null;

  featured: boolean;

  active: boolean;


  // ==========================================================
  // MAIN / LEGACY IMAGE
  // ==========================================================

  image?: string | null;

  cloudinary_public_id?: string;


  // ==========================================================
  // MULTIPLE PRODUCT IMAGES
  // ==========================================================

  images: ProductImage[];


  // ==========================================================
  // DISPLAY / ORDER
  // ==========================================================

  display_order?: number;


  // ==========================================================
  // DATES
  // ==========================================================

  created_at: string;

  updated_at: string;
}


// ============================================================
// PRODUCT LIST RESPONSE
// ============================================================

export interface ProductListResponse {
  count?: number;

  next?: string | null;

  previous?: string | null;

  results?: Product[];
}


// ============================================================
// CREATE PRODUCT PAYLOAD
// ============================================================

export interface CreateProductPayload {
  name: string;

  category: number;

  description?: string;

  short_description?: string;

  price?: string | number | null;

  featured?: boolean;

  active?: boolean;

  collections?: number[];

  image?: string | null;
}


// ============================================================
// UPDATE PRODUCT PAYLOAD
// ============================================================

export interface UpdateProductPayload
  extends Partial<CreateProductPayload> {

  slug?: string;

  display_order?: number;
}


// ============================================================
// CREATE PRODUCT IMAGE PAYLOAD
// ============================================================

export interface CreateProductImagePayload {
  image: string;

  cloudinary_public_id?: string;

  is_primary?: boolean;
}


// ============================================================
// REORDER PRODUCT IMAGES PAYLOAD
// ============================================================

export interface ReorderProductImagesPayload {
  image_ids: number[];
}