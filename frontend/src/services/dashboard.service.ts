import { apiFetch } from './api';
import type { ChurchMetrics, LeaderRanking, TimelineEvent, LeaderReport } from '../types';

export async function getChurchMetrics(): Promise<ChurchMetrics> {
  return apiFetch('/dashboard/metrics');
}

export async function getLeaderRanking(): Promise<{ ranking: LeaderRanking[] }> {
  return apiFetch('/dashboard/ranking');
}

export async function getChurchTimeline(): Promise<{ timeline: TimelineEvent[] }> {
  return apiFetch('/dashboard/timeline');
}

export async function getLeaderReport(leaderId: string): Promise<LeaderReport> {
  return apiFetch(`/dashboard/leader/${leaderId}`);
}

export async function exportReport(format: 'excel' | 'pdf'): Promise<{ downloadUrl: string }> {
  return apiFetch(`/dashboard/export?format=${format}`);
}
