// ============================================================
// MS CARDS PLATFORM
// COLLECTION TYPES
// ============================================================


// ============================================================
// COLLECTION
// ============================================================

export interface Collection {
  id: number;

  name: string;

  slug: string;

  description?: string;

  image?: string | null;

  cloudinary_public_id?: string;

  active: boolean;

  featured?: boolean;

  display_order: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// COLLECTION LIST RESPONSE
// ============================================================

export interface CollectionListResponse {
  count?: number;

  next?: string | null;

  previous?: string | null;

  results?: Collection[];
}


// ============================================================
// CREATE COLLECTION PAYLOAD
// ============================================================

export interface CreateCollectionPayload {
  name: string;

  description?: string;

  image?: string | null;

  active?: boolean;

  featured?: boolean;

  display_order?: number;
}


// ============================================================
// UPDATE COLLECTION PAYLOAD
// ============================================================

export interface UpdateCollectionPayload
  extends Partial<CreateCollectionPayload> {

  slug?: string;
}


// ============================================================
// COLLECTION IMAGE UPLOAD RESPONSE
// ============================================================

export interface CollectionImageUploadResponse {
  url: string;

  public_id: string;
}