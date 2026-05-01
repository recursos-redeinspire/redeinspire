import { apiFetch } from './api';
import type { Trail, TrailProgress, Certificate, AcademyCourse } from '../types';

export async function getTrails(): Promise<{ trails: Trail[]; progress: TrailProgress[] }> {
  return apiFetch('/trails');
}

export async function startTrail(trailId: string): Promise<TrailProgress> {
  return apiFetch(`/trails/${trailId}/start`, { method: 'POST' });
}

export async function completeModule(trailId: string, moduleId: string): Promise<TrailProgress> {
  return apiFetch(`/trails/${trailId}/complete-module`, { method: 'POST', body: JSON.stringify({ moduleId }) });
}

export async function getCertificate(trailId: string): Promise<Certificate> {
  return apiFetch(`/trails/${trailId}/certificate`);
}

export async function getAcademyCourses(): Promise<{ courses: AcademyCourse[] }> {
  return apiFetch('/trails/academy');
}
