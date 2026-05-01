import { apiFetch } from './api';
import type { ChurchPin, ChurchDetail, ChurchRanking } from '../types';

export async function getChurches(): Promise<{ churches: ChurchPin[] }> {
  return apiFetch('/map');
}

export async function getChurchDetail(churchId: string): Promise<ChurchDetail> {
  return apiFetch(`/map/${churchId}`);
}

export async function getTopChurches(month?: string): Promise<{ ranking: ChurchRanking[] }> {
  const params = month ? `?month=${month}` : '';
  return apiFetch(`/map/top${params}`);
}
