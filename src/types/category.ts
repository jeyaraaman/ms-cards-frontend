// ============================================================
// MS CARDS PLATFORM
// CATEGORY TYPES
// ============================================================


// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  id: number;

  name: string;

  slug: string;

  description?: string;

  image?: string | null;

  cloudinary_public_id?: string;

  active: boolean;

  display_order: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// CATEGORY LIST RESPONSE
// ============================================================

export interface CategoryListResponse {
  count?: number;

  next?: string | null;

  previous?: string | null;

  results?: Category[];
}


// ============================================================
// CREATE CATEGORY PAYLOAD
// ============================================================

export interface CreateCategoryPayload {
  name: string;

  description?: string;

  image?: string | null;

  active?: boolean;

  display_order?: number;
}


// ============================================================
// UPDATE CATEGORY PAYLOAD
// ============================================================

export interface UpdateCategoryPayload
  extends Partial<CreateCategoryPayload> {

  slug?: string;
}


// ============================================================
// CATEGORY IMAGE UPLOAD RESPONSE
// ============================================================

export interface CategoryImageUploadResponse {
  url: string;

  public_id: string;
}