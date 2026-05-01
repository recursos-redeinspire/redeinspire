import type { Content, Category, ContentFilterDTO, PaginatedResult } from '../types';
import { apiFetch } from './api';

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/content/categories');
}

export async function listByCategory(slug: string, page = 1, pageSize = 20): Promise<PaginatedResult<Content>> {
  return apiFetch<PaginatedResult<Content>>(`/content/category/${slug}?page=${page}&pageSize=${pageSize}`);
}

export async function getContent(contentId: string): Promise<Content> {
  return apiFetch<Content>(`/content/${contentId}`);
}

export async function getTrending(limit = 20): Promise<Content[]> {
  return apiFetch<Content[]>(`/content/trending?limit=${limit}`);
}

export async function getNewReleases(limit = 20): Promise<Content[]> {
  return apiFetch<Content[]>(`/content/releases?limit=${limit}`);
}

export async function getTop10(): Promise<Content[]> {
  return apiFetch<Content[]>('/content/top10');
}

export async function searchContent(filters: ContentFilterDTO): Promise<PaginatedResult<Content>> {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters.type) params.set('type', filters.type);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  params.set('sortBy', filters.sortBy);
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  return apiFetch<PaginatedResult<Content>>(`/content?${params.toString()}`);
}
