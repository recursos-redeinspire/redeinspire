import { apiFetch } from './api';
import type { Message, CreateMessageDTO, PaginatedResult } from '../types';

export async function getInbox(page = 1, pageSize = 20): Promise<PaginatedResult<Message>> {
  return apiFetch(`/messages?page=${page}&pageSize=${pageSize}`);
}

export async function sendMessage(dto: CreateMessageDTO): Promise<Message> {
  return apiFetch('/messages', { method: 'POST', body: JSON.stringify(dto) });
}

export async function markAsRead(messageId: string): Promise<void> {
  await apiFetch('/messages/read', { method: 'POST', body: JSON.stringify({ messageId }) });
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiFetch<{ count: number }>('/messages/unread-count');
  return res.count;
}
