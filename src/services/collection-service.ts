// ============================================================
// MS CARDS PLATFORM
// COLLECTION API SERVICE
// ============================================================

import { api } from "@/services/api";

import type {
  Collection,
  CollectionImageUploadResponse,
  CollectionListResponse,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "@/types/collection";


// ============================================================
// HELPER
// ============================================================

function normalizeCollectionList(
  response: Collection[] | CollectionListResponse
): Collection[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? [];
}


// ============================================================
// GET ALL COLLECTIONS
// ============================================================

export async function getCollections(): Promise<Collection[]> {
  const response = await api.get<
    Collection[] | CollectionListResponse
  >("/collections/");

  return normalizeCollectionList(response);
}


// ============================================================
// GET ACTIVE COLLECTIONS
// ============================================================

export async function getActiveCollections(): Promise<Collection[]> {
  const response = await api.get<
    Collection[] | CollectionListResponse
  >("/collections/?active=true");

  return normalizeCollectionList(response);
}


// ============================================================
// GET COLLECTION BY SLUG
// ============================================================

export async function getCollectionBySlug(
  slug: string
): Promise<Collection> {
  return api.get<Collection>(
    `/collections/${slug}/`
  );
}


// ============================================================
// CREATE COLLECTION
// ============================================================

export async function createCollection(
  data: CreateCollectionPayload
): Promise<Collection> {
  return api.post<Collection>(
    "/collections/",
    data
  );
}


// ============================================================
// UPDATE COLLECTION
// ============================================================

export async function updateCollection(
  slug: string,
  data: UpdateCollectionPayload
): Promise<Collection> {
  return api.patch<Collection>(
    `/collections/${slug}/`,
    data
  );
}


// ============================================================
// DELETE COLLECTION
// ============================================================

export async function deleteCollection(
  slug: string
): Promise<void> {
  await api.delete<void>(
    `/collections/${slug}/`
  );
}


// ============================================================
// UPLOAD COLLECTION IMAGE
// ============================================================

export async function uploadCollectionImage(
  file: File
): Promise<CollectionImageUploadResponse> {
  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  return api.post<CollectionImageUploadResponse>(
    "/collections/upload/",
    formData
  );
}