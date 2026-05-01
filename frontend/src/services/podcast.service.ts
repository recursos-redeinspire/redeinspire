import { apiFetch } from './api';
import type { PodcastEpisode, PaginatedResult } from '../types';

export async function getEpisodes(page = 1, pageSize = 20): Promise<PaginatedResult<PodcastEpisode>> {
  return apiFetch(`/podcast?page=${page}&pageSize=${pageSize}`);
}

export async function getEpisode(episodeId: string): Promise<PodcastEpisode> {
  return apiFetch(`/podcast/${episodeId}`);
}

export async function getPlaybackProgress(episodeId: string): Promise<number> {
  const res = await apiFetch<{ positionSeconds: number }>(`/podcast/${episodeId}/progress`);
  return res.positionSeconds;
}

export async function savePlaybackProgress(episodeId: string, positionSeconds: number): Promise<void> {
  await apiFetch('/podcast/progress', { method: 'POST', body: JSON.stringify({ episodeId, positionSeconds }) });
}
