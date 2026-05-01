import { apiFetch } from './api';
import type { Plan } from '../types';

export async function getUserPlans(): Promise<{ plans: Plan[] }> {
  return apiFetch('/planning');
}

export async function createPlan(type: 'sunday' | 'annual' | 'ministry', title: string, data: Record<string, unknown> = {}): Promise<Plan> {
  return apiFetch('/planning', { method: 'POST', body: JSON.stringify({ type, title, data }) });
}

export async function updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan> {
  return apiFetch(`/planning/${planId}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deletePlan(planId: string): Promise<void> {
  await apiFetch(`/planning/${planId}`, { method: 'DELETE' });
}
