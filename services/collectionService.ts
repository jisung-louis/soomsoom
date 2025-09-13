import { apiClient } from './apiClient';
import { environmentConfig } from '../configs/environment';
import { mockCollectionData } from '../data/mockCollectionData';
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

  // 개발 환경 모크
  if (environmentConfig.debug.enabled) {
    // dev: 외부 목 파일 사용 → Summary 형태로 변환, 간단 정렬/페이지 적용
    let list = mockCollectionData.map<CollectionSummary>((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      phrase: d.phrase,
      imageUrl: d.imageUrl,
      lottieUrl: d.lottieUrl,
      basePrice: d.basePrice,
      purchasePrice: d.purchasePrice,
      ownedItemsCount: d.ownedItemsCount,
      totalItemsCount: d.totalItemsCount,
      isOwned: d.isOwned,
      isEquipped: d.isEquipped,
      items: null, // 목록 조회에서는 items를 null로 반환
      createdAt: d.createdAt,
      modifiedAt: d.modifiedAt,
      deletedAt: d.deletedAt,
    }));

    // excludeOwned
    if (excludeOwned) list = list.filter((c) => !c.isOwned);

    // sort
    switch (sort) {
      case 'PRICE_ASC':
        list.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'PRICE_DESC':
        list.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'POPULARITY':
        // popularity 지표 없음 → 가격 내림차순을 근사치로 사용
        list.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'CREATED':
      default:
        list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    const totalElements = list.length;
    const start = (page - 1) * size;
    const end = start + size;
    const content = list.slice(start, end);

    return {
      content,
      page: {
        size,
        number: page,
        totalElements,
        totalPages: Math.max(1, Math.ceil(totalElements / size)),
      },
    };
  }

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
  if (environmentConfig.debug.enabled) {
    // dev: 외부 목 데이터에서 해당 id 검색
    const found = mockCollectionData.find((c) => c.id === collectionId);
    return found ?? mockCollectionData[0];
  }

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

  if (environmentConfig.debug.enabled) {
    // dev: 보유 컬렉션 → 목에서 isOwned가 true인 것만, 없으면 전체를 보유로 간주
    let list = mockCollectionData.filter((c) => c.isOwned);
    if (list.length === 0) list = mockCollectionData.map((c) => ({ ...c, isOwned: true }));
    const summaries: CollectionSummary[] = list.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      phrase: d.phrase,
      imageUrl: d.imageUrl,
      lottieUrl: d.lottieUrl,
      basePrice: d.basePrice,
      purchasePrice: d.purchasePrice,
      ownedItemsCount: d.ownedItemsCount,
      totalItemsCount: d.totalItemsCount,
      isOwned: true,
      isEquipped: d.isEquipped,
      items: null, // 목록 조회에서는 items를 null로 반환
      createdAt: d.createdAt,
      modifiedAt: d.modifiedAt,
      deletedAt: d.deletedAt,
    }));

    const totalElements = summaries.length;
    const start = (page - 1) * size;
    const end = start + size;
    const content = summaries.slice(start, end);
    return {
      content,
      page: { size, number: page, totalElements, totalPages: Math.max(1, Math.ceil(totalElements / size)) },
    };
  }

  const search = new URLSearchParams();
  if (userId) search.set('userId', String(userId));
  if (page) search.set('page', String(page));
  if (size) search.set('size', String(size));
  if (sort) search.set('sort', sort);
  const endpoint = `/users/me/owned-collections?${search.toString()}`;
  const res = await apiClient.get<PagedCollectionsResponse>(endpoint);
  return res;
}


