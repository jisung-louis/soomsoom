import { apiClient } from './apiClient';
// DEV 모킹은 apiClient + mockRoutes에서 일괄 처리합니다.
import { Item } from './itemService';

export type CollectionSort = 'POPULARITY' | 'PRICE_ASC' | 'PRICE_DESC' | 'CREATED';
export type DeletionStatus = 'ACTIVE' | 'DELETED' | 'ALL';

export interface PageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface CollectionSummary {
  id: number;
  name: string;
  description: string[];
  phrase: string;
  imageUrl: string | null;
  lottieUrl: string | null;
  basePrice: number;
  purchasePrice: number;
  ownedItemsCount: number;
  totalItemsCount: number;
  isOwned: boolean;
  isEquipped: boolean;
  items: null; // 백엔드에서 컬렉션 목록 조회 시 items는 null로 반환
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

export interface CollectionDetail {
  id: number;
  name: string;
  description: string[];
  phrase: string;
  imageUrl: string | null;
  lottieUrl: string | null;
  basePrice: number;
  purchasePrice: number;
  ownedItemsCount: number;
  totalItemsCount: number;
  isOwned: boolean;
  isEquipped: boolean;
  items: Item[];
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
}

export interface PagedCollectionsResponse {
  content: CollectionSummary[];
  page: PageMeta;
}

export interface GetCollectionsParams {
  sort?: CollectionSort; // default: CREATED
  excludeOwned?: boolean; // default: false
  page?: number; // default: 1
  size?: number; // default: 12
  deletionStatus?: DeletionStatus; // default: ACTIVE
}

export async function getCollections(params: GetCollectionsParams = {}): Promise<PagedCollectionsResponse> {
  const {
    sort = 'CREATED',
    excludeOwned = false,
    page = 1,
    size = 12,
    deletionStatus = 'ACTIVE',
  } = params;

  const search = new URLSearchParams();
  search.set('sort', sort);
  if (excludeOwned) search.set('excludeOwned', String(excludeOwned));
  if (page) search.set('page', String(page));
  if (size) search.set('size', String(size));
  if (deletionStatus) search.set('deletionStatus', deletionStatus);

  const endpoint = `/collections?${search.toString()}`;
  const res = await apiClient.get<PagedCollectionsResponse>(endpoint);
  return res;
}

export async function getCollectionDetail(collectionId: number, deletionStatus: DeletionStatus = 'ACTIVE'): Promise<CollectionDetail> {
  const search = new URLSearchParams();
  if (deletionStatus) search.set('deletionStatus', deletionStatus);
  const endpoint = `/collections/${collectionId}?${search.toString()}`;
  const res = await apiClient.get<CollectionDetail>(endpoint);
  return res;
}

export interface GetOwnedCollectionsParams {
  userId?: number; // ADMIN 용
  page?: number; // default 1
  size?: number; // default 12
  sort?: string; // e.g., 'createdAt,desc'
}

export async function getOwnedCollections(params: GetOwnedCollectionsParams = {}): Promise<PagedCollectionsResponse> {
  const { userId, page = 1, size = 12, sort = 'createdAt,desc' } = params;
  const search = new URLSearchParams();
  if (userId) search.set('userId', String(userId));
  if (page) search.set('page', String(page));
  if (size) search.set('size', String(size));
  if (sort) search.set('sort', sort);
  const endpoint = `/users/me/owned-collections?${search.toString()}`;
  const res = await apiClient.get<PagedCollectionsResponse>(endpoint);
  return res;
}


