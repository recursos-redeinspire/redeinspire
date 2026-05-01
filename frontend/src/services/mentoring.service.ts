import { apiFetch } from './api';
import type { Webinar, MentoringSession } from '../types';

export async function getWebinars(): Promise<{ webinars: Webinar[] }> {
  return apiFetch('/mentoring/webinars');
}

export async function getMentoringSessions(): Promise<{ sessions: MentoringSession[] }> {
  return apiFetch('/mentoring/sessions');
}

export async function registerParticipation(sessionId: string): Promise<void> {
  await apiFetch('/mentoring/register', { method: 'POST', body: JSON.stringify({ sessionId }) });
}
