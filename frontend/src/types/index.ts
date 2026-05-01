// =============================================================================
// Plataforma Rede Inspire — Interfaces e DTOs Compartilhados
// =============================================================================

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: 'pastor_presidente' | 'lider' | 'membro';
  churchId: string;
  ministries: string[];
  status: 'active' | 'inactive' | 'blocked';
}

export interface CreateLeaderDTO {
  name: string;
  email: string;
  cpf: string;
  ministries: string[];
  churchId: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userProfile: UserProfile;
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

export interface Content {
  contentId: string;
  title: string;
  description: string;
  categorySlug: string;
  type: 'video' | 'audio' | 'document' | 'link';
  durationMinutes: number;
  thumbnailUrl: string;
  createdAt: string;
  popularity: number;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  subcategories?: Category[];
  contentCount: number;
}

export interface ContentFilterDTO {
  categorySlug?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'relevance' | 'date' | 'popularity';
  page: number;
  pageSize: number;
}

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------

export interface SearchResult {
  items: Content[];
  totalCount: number;
  suggestions: string[];
  facets: Record<string, FacetCount[]>;
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface SearchFilterDTO {
  category?: string;
  type?: string;
  sortBy: 'relevance' | 'date' | 'popularity' | 'category';
  page: number;
  pageSize: number;
}

// -----------------------------------------------------------------------------
// Trails & Academy
// -----------------------------------------------------------------------------

export interface Trail {
  trailId: string;
  title: string;
  description: string;
  modules: TrailModule[];
  totalDurationMinutes: number;
  points: number;
  isMandatory: boolean;
}

export interface TrailModule {
  moduleId: string;
  title: string;
  description: string;
  contentId: string;
  durationMinutes: number;
  order: number;
}

export interface TrailProgress {
  trailId: string;
  userId: string;
  completedModules: string[];
  percentComplete: number;
  startedAt: string;
  completedAt?: string;
}

export interface Certificate {
  certificateId: string;
  trailId: string;
  userId: string;
  issuedAt: string;
  downloadUrl: string;
}

export interface AcademyCourse {
  courseId: string;
  title: string;
  description: string;
  durationHours: number;
  points: number;
  trailId: string;
}

// -----------------------------------------------------------------------------
// Mentoring & Webinars
// -----------------------------------------------------------------------------

export interface Webinar {
  webinarId: string;
  title: string;
  description: string;
  scheduledAt: string;
  meetingUrl: string;
  hostName: string;
}

export interface MentoringSession {
  sessionId: string;
  title: string;
  mentorName: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledAt: string;
  meetingUrl?: string;
}

// -----------------------------------------------------------------------------
// Dashboard & Reports
// -----------------------------------------------------------------------------

export interface ChurchMetrics {
  totalLeaders: number;
  activeLeaders: number;
  totalContentAccessed: number;
  trailsInProgress: number;
  trailsCompleted: number;
  topContent: Content[];
  recentAccesses: LeaderAccess[];
}

export interface LeaderAccess {
  userId: string;
  name: string;
  lastAccessAt: string;
}

export interface LeaderReport {
  leader: UserProfile;
  completedResources: Content[];
  inProgressResources: Content[];
  recentDownloads: Content[];
  trailProgress: TrailProgress[];
  lastAccessAt: string;
}

export interface LeaderRanking {
  leader: UserProfile;
  engagementScore: number;
  rank: number;
}

export interface TimelineEvent {
  eventId: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface ReportFilterDTO {
  dateFrom?: string;
  dateTo?: string;
  leaderId?: string;
}

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------

export interface Message {
  messageId: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageDTO {
  toUserId: string;
  subject: string;
  body: string;
}

// -----------------------------------------------------------------------------
// Map (Rede Inspire Connect)
// -----------------------------------------------------------------------------

export interface ChurchPin {
  churchId: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface ChurchDetail {
  churchId: string;
  name: string;
  city: string;
  state: string;
  pastorName: string;
  cnpj: string;
  memberCount: number;
}

export interface ChurchRanking {
  church: ChurchPin;
  engagementScore: number;
  rank: number;
}

// -----------------------------------------------------------------------------
// Planning
// -----------------------------------------------------------------------------

export interface Plan {
  planId: string;
  userId: string;
  type: 'sunday' | 'annual' | 'ministry';
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Podcast
// -----------------------------------------------------------------------------

export interface PodcastEpisode {
  episodeId: string;
  title: string;
  description: string;
  durationSeconds: number;
  audioUrl: string;
  publishedAt: string;
}

// -----------------------------------------------------------------------------
// Common / Shared
// -----------------------------------------------------------------------------

export interface PaginationDTO {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: Record<string, string>;
  correlationId: string;
  timestamp: string;
}
