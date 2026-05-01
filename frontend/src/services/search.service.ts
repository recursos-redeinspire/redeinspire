import { apiFetch } from './api';
import type { SearchResult } from '../types';

export async function searchContent(query: string, filters?: Record<string, string>): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query, ...filters });
  return apiFetch<SearchResult>(`/search?${params}`);
}

export async function autocomplete(query: string): Promise<string[]> {
  const res = await apiFetch<{ suggestions: string[] }>(`/search/autocomplete?q=${encodeURIComponent(query)}`);
  return res.suggestions;
}
