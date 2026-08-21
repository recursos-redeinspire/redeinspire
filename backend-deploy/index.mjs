// =============================================================================
// Rede Inspire — Single Lambda Backend (all routes)
// =============================================================================
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import JSZip from 'jszip';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const s3 = new S3Client({ region: 'us-east-1' });
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const UPLOAD_BUCKET = 'rede-inspire-uploads-danilo';

const JWT_SECRET = process.env.JWT_SECRET || 'rede-inspire-secret-2026';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

// Conexa.app integration
const CONEXA_SUBDOMAIN = 'redeinspire';
const CONEXA_API_TOKEN = '010fda7225ba32f944950e20bf909226975a69880d0d8675bb3a1d8bba867e55';
const CONEXA_BASE_URL = `https://${CONEXA_SUBDOMAIN}.conexa.app/index.php/api/v2`;

// Table names
const T = {
  USERS: 'RedeInspire-Users',
  CONTENT: 'RedeInspire-Content',
  TRAILS: 'RedeInspire-Trails',
  TRAIL_PROGRESS: 'RedeInspire-TrailProgress',
  MESSAGES: 'RedeInspire-Messages',
  CHURCHES: 'RedeInspire-Churches',
  PLANS: 'RedeInspire-Plans',
  MENTORING: 'RedeInspire-Mentoring',
  PODCAST: 'RedeInspire-Podcast',
  PODCAST_PROGRESS: 'RedeInspire-PodcastProgress',
  WEBINARS: 'RedeInspire-Webinars',
  TIMELINE: 'RedeInspire-Timeline',
  MINISTRIES: 'RedeInspire-Ministries',
  MATERIALS: 'RedeInspire-Materials',
  COMMENTS: 'RedeInspire-Comments',
  VIDEO_TAGS: 'RedeInspire-VideoTags',
  VIDEO_RECS: 'RedeInspire-VideoRecommendations',
  DOWNLOADS: 'RedeInspire-Downloads',
  CONEXA_CACHE: 'RedeInspire-ConexaCache',
};

function res(statusCode, body) {
  return { statusCode, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function getUserFromToken(event) {
  try {
    const auth = event.headers?.authorization || event.headers?.Authorization || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

function route(event) {
  const method = event.requestContext?.http?.method || event.httpMethod || '';
  const path = event.requestContext?.http?.path || event.path || '';
  return `${method} ${path}`;
}

function body(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return {}; }
}

function qs(event) {
  return event.queryStringParameters || {};
}

// Role helpers
function isAdmin(user) { return user && user.role === 'admin'; }
function isAdminOrPastor(user) { return user && (user.role === 'admin' || user.role === 'pastor_presidente'); }

// =============================================================================
// HANDLER
// =============================================================================
export async function handler(event) {
  const r = route(event);
  const method = r.split(' ')[0];
  const path = r.split(' ').slice(1).join(' ');

  // OPTIONS (CORS preflight)
  if (method === 'OPTIONS') return res(200, {});

  try {
    // ---- Health ----
    if (path === '/health') return res(200, { status: 'ok', timestamp: new Date().toISOString() });

    // ---- Auth ----
    if (path === '/auth/login' && method === 'POST') return await authLogin(body(event));
    if (path === '/auth/register' && method === 'POST') return await authRegister(body(event), getUserFromToken(event));
    if (path === '/auth/change-password' && method === 'POST') return await authChangePassword(body(event), getUserFromToken(event));
    if (path === '/auth/profile' && method === 'GET') return await authProfile(getUserFromToken(event));
    if (path === '/auth/leaders' && method === 'GET') return await authLeaders(getUserFromToken(event));
    if (path.match(/^\/auth\/leader\/[^/]+\/reset-password$/) && method === 'POST') return await authResetPassword(path.split('/')[3], getUserFromToken(event));
    if (path.match(/^\/auth\/leader\/[^/]+\/block$/) && method === 'PUT') return await authBlockLeader(path.split('/')[3], body(event), getUserFromToken(event));
    if (path.match(/^\/auth\/leader\/[^/]+$/) && method === 'PUT') return await authUpdateUser(path.split('/')[3], body(event), getUserFromToken(event));
    if (path.match(/^\/auth\/leader\/[^/]+$/) && method === 'DELETE') return await authDeleteLeader(path.split('/')[3], getUserFromToken(event));

    // ---- Content ----
    if (path === '/content' && method === 'GET') return await contentList(qs(event));
    if (path === '/content' && method === 'POST') return await contentCreate(body(event), getUserFromToken(event));
    if (path === '/content/trending' && method === 'GET') return await contentTrending();
    if (path === '/content/top10' && method === 'GET') return await contentTop10();
    if (path === '/content/releases' && method === 'GET') return await contentReleases();
    if (path.startsWith('/content/') && method === 'GET') return await contentById(path.split('/')[2]);
    if (path === '/content/access' && method === 'POST') return await contentAccess(body(event), getUserFromToken(event));
    if (path.match(/^\/content\/category\/[^/]+$/) && method === 'DELETE') return await contentDeleteByCategory(path.split('/')[3], getUserFromToken(event));
    if (path.match(/^\/content\/[^/]+$/) && method === 'PUT') return await contentUpdate(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/content\/[^/]+$/) && method === 'DELETE') return await contentDelete(path.split('/')[2], getUserFromToken(event));

    // ---- Search ----
    if (path === '/search' && method === 'GET') return await searchContent(qs(event));

    // ---- Trails ----
    if (path === '/trails' && method === 'GET') return await trailsList(getUserFromToken(event));
    if (path === '/trails' && method === 'POST') return await trailCreate(body(event), getUserFromToken(event));
    if (path === '/trails/academy' && method === 'GET') return await trailsAcademy();
    if (path.match(/^\/trails\/[^/]+\/enroll$/) && method === 'POST') return await trailEnroll(path.split('/')[2], getUserFromToken(event));
    if (path.match(/^\/trails\/[^/]+\/start$/) && method === 'POST') return await trailStart(path.split('/')[2], getUserFromToken(event));
    if (path.match(/^\/trails\/[^/]+\/complete-module$/) && method === 'POST') return await trailCompleteModule(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/trails\/[^/]+\/approve$/) && method === 'POST') return await trailApprove(path.split('/')[2], getUserFromToken(event));
    if (path.match(/^\/trails\/[^/]+$/) && method === 'DELETE') return await trailDelete(path.split('/')[2], getUserFromToken(event));

    // ---- Mentoring ----
    if (path === '/mentoring/webinars' && method === 'GET') return await mentoringWebinars();
    if (path === '/mentoring/webinars' && method === 'POST') return await mentoringCreateWebinar(body(event), getUserFromToken(event));
    if (path.match(/^\/mentoring\/webinars\/[^/]+\/enroll$/) && method === 'POST') return await mentoringEnrollWebinar(path.split('/')[3], getUserFromToken(event));
    if (path.match(/^\/mentoring\/webinars\/[^/]+$/) && method === 'DELETE') return await mentoringDeleteWebinar(path.split('/')[3], getUserFromToken(event));
    if (path === '/mentoring/sessions' && method === 'GET') return await mentoringSessions(getUserFromToken(event));
    if (path === '/mentoring/sessions' && method === 'POST') return await mentoringCreateSession(body(event), getUserFromToken(event));
    if (path.match(/^\/mentoring\/sessions\/[^/]+$/) && method === 'DELETE') return await mentoringDeleteSession(path.split('/')[3], getUserFromToken(event));
    if (path === '/mentoring/complete' && method === 'POST') return await mentoringCompleteSession(body(event), getUserFromToken(event));

    // ---- Dashboard ----
    if (path === '/dashboard/metrics' && method === 'GET') return await dashboardMetrics(getUserFromToken(event));
    if (path === '/dashboard/ranking' && method === 'GET') return await dashboardRanking(getUserFromToken(event));
    if (path === '/dashboard/timeline' && method === 'GET') return await dashboardTimeline();
    if (path === '/dashboard/recent' && method === 'GET') return await dashboardRecent();

    // ---- Messages ----
    if (path === '/messages/recipients' && method === 'GET') return await messagesRecipients(getUserFromToken(event));
    if (path === '/messages' && method === 'GET') return await messagesList(getUserFromToken(event));
    if (path === '/messages' && method === 'POST') return await messagesSend(body(event), getUserFromToken(event));
    if (path === '/messages/read' && method === 'POST') return await messagesMarkRead(body(event));
    if (path === '/messages/unread-count' && method === 'GET') return await messagesUnreadCount(getUserFromToken(event));

    // ---- Map ----
    if (path === '/map' && method === 'GET') return await mapList();
    if (path === '/map' && method === 'POST') return await mapCreateChurch(body(event), getUserFromToken(event));
    if (path === '/map/top' && method === 'GET') return await mapTop();
    if (path.match(/^\/map\/[^/]+$/) && method === 'PUT') return await mapUpdateChurch(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/map\/[^/]+$/) && method === 'DELETE') return await mapDeleteChurch(path.split('/')[2], getUserFromToken(event));

    // ---- Ministries ----
    if (path === '/ministries' && method === 'GET') return await ministriesList();
    if (path === '/ministries' && method === 'POST') return await ministriesCreate(body(event), getUserFromToken(event));
    if (path.match(/^\/ministries\/[^/]+$/) && method === 'PUT') return await ministriesUpdate(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/ministries\/[^/]+$/) && method === 'DELETE') return await ministriesDelete(path.split('/')[2], getUserFromToken(event));

    // ---- Planning ----
    if (path === '/planning' && method === 'GET') return await planningList(getUserFromToken(event));
    if (path === '/planning' && method === 'POST') return await planningSave(body(event), getUserFromToken(event));
    if (path.match(/^\/planning\/[^/]+$/) && method === 'PUT') return await planningUpdate(path.split('/')[2], body(event));
    if (path.match(/^\/planning\/[^/]+$/) && method === 'DELETE') return await planningDelete(path.split('/')[2]);

    // ---- Podcast ----
    if (path === '/podcast' && method === 'GET') return await podcastList();
    if (path === '/podcast' && method === 'POST') return await podcastCreate(body(event), getUserFromToken(event));
    if (path === '/podcast/progress' && method === 'POST') return await podcastSaveProgress(body(event), getUserFromToken(event));
    if (path.match(/^\/podcast\/[^/]+\/progress$/) && method === 'GET') return await podcastGetProgress(path.split('/')[2], getUserFromToken(event));
    if (path.match(/^\/podcast\/[^/]+$/) && method === 'PUT') return await podcastUpdate(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/podcast\/[^/]+$/) && method === 'DELETE') return await podcastDelete(path.split('/')[2], getUserFromToken(event));

    // ---- Materials ----
    if (path === '/materials' && method === 'GET') return await materialsList(getUserFromToken(event));
    if (path === '/materials' && method === 'POST') return await materialsCreate(body(event), getUserFromToken(event));
    if (path.match(/^\/materials\/[^/]+$/) && method === 'PUT') return await materialsUpdate(path.split('/')[2], body(event), getUserFromToken(event));
    if (path.match(/^\/materials\/[^/]+$/) && method === 'DELETE') return await materialsDelete(path.split('/')[2], getUserFromToken(event));
    if (path === '/upload/presign' && method === 'POST') return await uploadPresign(body(event), getUserFromToken(event));

    // ---- Points ----
    if (path === '/points/me' && method === 'GET') return await getMyPoints(getUserFromToken(event));
    if (path === '/points/ranking' && method === 'GET') return await getPointsRanking(getUserFromToken(event));

    // ---- Banner/Announcements ----
    if (path === '/banner' && method === 'GET') return await bannerGet(getUserFromToken(event));
    if (path === '/banner' && method === 'POST') return await bannerSave(body(event), getUserFromToken(event));

    // ---- Admin Analytics ----
    if (path === '/admin/analytics' && method === 'GET') return await adminAnalytics(getUserFromToken(event));
    if (path === '/admin/reports' && method === 'GET') return await adminReports(qs(event), getUserFromToken(event));

    // ---- Dropbox ----
    if (path === '/dropbox/sync' && method === 'POST') return await dropboxSync(getUserFromToken(event));
    if (path === '/dropbox/browse' && method === 'GET') return await dropboxBrowse(qs(event), getUserFromToken(event));
    if (path === '/dropbox/download' && method === 'POST') return await dropboxDownload(body(event), getUserFromToken(event));
    if (path === '/dropbox/smart-search' && method === 'GET') return await dropboxSmartSearch(qs(event), getUserFromToken(event));
    if (path === '/dropbox/track-download' && method === 'POST') return await dropboxTrackDownload(body(event), getUserFromToken(event));
    if (path === '/dropbox/top-downloads' && method === 'GET') return await dropboxTopDownloads(getUserFromToken(event));

    // ---- YouTube ----
    if (path === '/youtube/videos' && method === 'GET') return await youtubeListVideos(qs(event), getUserFromToken(event));
    if (path === '/youtube/search' && method === 'GET') return await youtubeSearch(qs(event), getUserFromToken(event));
    if (path === '/youtube/smart-search' && method === 'GET') return await youtubeSmartSearch(qs(event), getUserFromToken(event));

    // ---- Comments ----
    if (path === '/comments' && method === 'GET') return await commentsList(qs(event), getUserFromToken(event));
    if (path === '/comments' && method === 'POST') return await commentsCreate(body(event), getUserFromToken(event));

    // ---- Video Tags ----
    if (path === '/video-tags' && method === 'GET') return await videoTagsGet(qs(event), getUserFromToken(event));
    if (path === '/video-tags' && method === 'POST') return await videoTagsSave(body(event), getUserFromToken(event));
    if (path === '/video-tags/all' && method === 'GET') return await videoTagsAll(getUserFromToken(event));
    if (path === '/video-thumbnail' && method === 'POST') return await videoThumbnailSave(body(event), getUserFromToken(event));
    if (path === '/video-thumbnail' && method === 'DELETE') return await videoThumbnailDelete(body(event), getUserFromToken(event));
    if (path === '/video-thumbnails' && method === 'GET') return await videoThumbnailsAll(getUserFromToken(event));

    // ---- Video Categories (catalog rows) ----
    if (path === '/video-categories' && method === 'GET') return await videoCategoriesGetAll(getUserFromToken(event));
    if (path === '/video-categories' && method === 'POST') return await videoCategoriesSave(body(event), getUserFromToken(event));

    // ---- Folder Videos (admin links videos to material folders) ----
    if (path === '/folder-videos' && method === 'GET') return await folderVideosGet(qs(event), getUserFromToken(event));
    if (path === '/folder-videos' && method === 'POST') return await folderVideosSave(body(event), getUserFromToken(event));
    if (path === '/dropbox/file-text' && method === 'POST') return await dropboxFileText(body(event), getUserFromToken(event));
    if (path === '/folder-thumbnails' && method === 'GET') return await folderThumbnailsGet(getUserFromToken(event));
    if (path === '/folder-thumbnails' && method === 'POST') return await folderThumbnailSave(body(event), getUserFromToken(event));
    if (path === '/folder-tags' && method === 'GET') return await folderTagsGet(qs(event), getUserFromToken(event));
    if (path === '/folder-tags' && method === 'POST') return await folderTagsSave(body(event), getUserFromToken(event));
    if (path === '/folder-tags/all' && method === 'GET') return await folderTagsAll(getUserFromToken(event));
    if (path === '/folder-tags/generate' && method === 'POST') return await folderTagsGenerate(getUserFromToken(event));

    // ---- Video Recommendations ----
    if (path === '/video-recs' && method === 'GET') return await videoRecsGet(qs(event), getUserFromToken(event));
    if (path === '/video-recs' && method === 'POST') return await videoRecsSave(body(event), getUserFromToken(event));
    if (path.match(/^\/video-recs\/[^/]+$/) && method === 'DELETE') return await videoRecsDeleteItem(path.split('/')[2], qs(event), getUserFromToken(event));

    // ---- Conexa.app ----
    if (path === '/conexa/sync' && method === 'POST') return await conexaSync(getUserFromToken(event));
    if (path === '/conexa/status' && method === 'GET') return await conexaStatus(getUserFromToken(event));

    // ---- AI Assistant ----
    if (path === '/assistant/chat' && method === 'POST') return await assistantChat(body(event), getUserFromToken(event));

    return res(404, { message: 'Rota não encontrada', path, method });
  } catch (err) {
    console.error('Error:', err);
    return res(500, { message: 'Erro interno', error: err.message });
  }
}


// =============================================================================
// AUTH
// =============================================================================
async function authLogin({ email, password }) {
  if (!email || !password) return res(400, { message: 'E-mail e senha obrigatórios' });
  const data = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'email = :e', ExpressionAttributeValues: { ':e': email.toLowerCase() } }));
  const user = data.Items?.[0];
  if (!user || user.password !== password) return res(401, { message: 'E-mail ou senha incorretos.' });
  if (user.status === 'blocked') return res(403, { message: 'blocked', blockedMessage: '🚗 Sua conta está bloqueada. Para voltar a ter acesso, lave o carro do pastor!' });

  // Check Conexa.app payment status
  const conexaBlock = await checkConexaBlocked(email.toLowerCase());
  if (conexaBlock.blocked) {
    return res(403, { message: 'blocked', blockedMessage: conexaBlock.message });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, churchId: user.churchId, ministries: user.ministries, birthDate: user.birthDate || '', permissions: user.permissions || null }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = user;
  return res(200, { token, user: safe, firstLogin: !!user.firstLogin });
}

async function authRegister(data, currentUser) {
  if (!currentUser || !isAdminOrPastor(currentUser)) return res(403, { message: 'Apenas administradores ou pastores podem cadastrar usuários.' });
  if (!data.password || data.password.length < 6) return res(400, { message: 'Senha obrigatória (mínimo 6 caracteres).' });
  const existing = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'email = :e', ExpressionAttributeValues: { ':e': data.email.toLowerCase() } }));
  if (existing.Items?.length) return res(409, { message: 'E-mail já cadastrado.' });
  // Admin can set any role; pastor can ONLY create 'lider' in their own church
  let role = 'lider';
  if (isAdmin(currentUser)) {
    role = ['admin', 'pastor_presidente', 'lider'].includes(data.role) ? data.role : 'lider';
  } else {
    // Pastor can only create lider
    role = 'lider';
  }
  const churchId = isAdmin(currentUser) ? (data.churchId || currentUser.churchId) : currentUser.churchId;
  const newUser = { id: uuid(), name: data.name, email: data.email.toLowerCase(), password: data.password, role, churchId, ministries: data.ministries || [], photoUrl: data.photoUrl || '', birthDate: data.birthDate || '', preferredLang: data.preferredLang || 'pt', status: 'active', firstLogin: true };
  await ddb.send(new PutCommand({ TableName: T.USERS, Item: newUser }));
  const { password: _, ...safe } = newUser;
  return res(201, safe);
}

async function authChangePassword({ newPassword }, currentUser) {
  if (!currentUser) return res(401, { message: 'Não autenticado' });
  if (!newPassword || newPassword.length < 6) return res(400, { message: 'Nova senha deve ter no mínimo 6 caracteres.' });
  await ddb.send(new UpdateCommand({
    TableName: T.USERS, Key: { id: currentUser.id },
    UpdateExpression: 'SET password = :p, firstLogin = :f',
    ExpressionAttributeValues: { ':p': newPassword, ':f': false },
  }));
  return res(200, { ok: true });
}

async function authProfile(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: user.id } }));
  if (!data.Item) return res(404, { message: 'Usuário não encontrado' });
  const { password: _, ...safe } = data.Item;
  return res(200, safe);
}

async function authLeaders(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  if (!isAdminOrPastor(user)) return res(403, { message: 'Apenas administradores e pastores podem ver usuários.' });
  let data;
  if (isAdmin(user)) {
    // Admin sees ALL users
    data = await ddb.send(new ScanCommand({ TableName: T.USERS }));
  } else {
    // Pastor sees only users from their church
    data = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'churchId = :c', ExpressionAttributeValues: { ':c': user.churchId } }));
  }
  const leaders = (data.Items || []).map(({ password: _, ...rest }) => rest);
  return res(200, leaders);
}

async function authBlockLeader(leaderId, { blocked }, currentUser) {
  if (!currentUser || !isAdminOrPastor(currentUser)) return res(403, { message: 'Apenas administradores ou pastores podem bloquear usuários.' });
  // Pastor can only block lider in their church
  if (!isAdmin(currentUser)) {
    const target = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: leaderId } }));
    if (!target.Item) return res(404, { message: 'Usuário não encontrado.' });
    if (target.Item.role !== 'lider') return res(403, { message: 'Pastores só podem bloquear líderes.' });
    if (target.Item.churchId !== currentUser.churchId) return res(403, { message: 'Você só pode bloquear usuários da sua igreja.' });
  }
  const newStatus = blocked ? 'blocked' : 'active';
  await ddb.send(new UpdateCommand({
    TableName: T.USERS, Key: { id: leaderId },
    UpdateExpression: 'SET #s = :s',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': newStatus },
  }));
  return res(200, { ok: true, status: newStatus });
}

async function authDeleteLeader(leaderId, currentUser) {
  if (!currentUser || !isAdminOrPastor(currentUser)) return res(403, { message: 'Apenas administradores ou pastores podem excluir usuários.' });
  // Pastor can only delete lider in their church
  if (!isAdmin(currentUser)) {
    const target = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: leaderId } }));
    if (!target.Item) return res(404, { message: 'Usuário não encontrado.' });
    if (target.Item.role !== 'lider') return res(403, { message: 'Pastores só podem excluir líderes.' });
    if (target.Item.churchId !== currentUser.churchId) return res(403, { message: 'Você só pode excluir usuários da sua igreja.' });
  }
  await ddb.send(new DeleteCommand({ TableName: T.USERS, Key: { id: leaderId } }));
  return res(200, { ok: true, deleted: leaderId });
}

async function authUpdateUser(userId, data, currentUser) {
  if (!currentUser || !isAdminOrPastor(currentUser)) return res(403, { message: 'Apenas administradores ou pastores podem editar usuários.' });
  // Pastor can only update lider in their church
  if (!isAdmin(currentUser)) {
    const target = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: userId } }));
    if (!target.Item) return res(404, { message: 'Usuário não encontrado.' });
    if (target.Item.role !== 'lider') return res(403, { message: 'Pastores só podem editar líderes.' });
    if (target.Item.churchId !== currentUser.churchId) return res(403, { message: 'Você só pode editar usuários da sua igreja.' });
    // Pastor cannot change role or churchId
    delete data.role;
    delete data.churchId;
  }
  const updates = [];
  const names = {};
  const values = {};
  if (data.name !== undefined) { updates.push('#n = :n'); names['#n'] = 'name'; values[':n'] = data.name; }
  if (data.email !== undefined) { updates.push('email = :e'); values[':e'] = data.email.toLowerCase(); }
  if (data.role !== undefined) { updates.push('#r = :r'); names['#r'] = 'role'; values[':r'] = data.role; }
  if (data.churchId !== undefined) { updates.push('churchId = :c'); values[':c'] = data.churchId; }
  if (data.ministries !== undefined) { updates.push('ministries = :m'); values[':m'] = data.ministries; }
  if (data.permissions !== undefined) { updates.push('permissions = :perm'); values[':perm'] = data.permissions; }
  if (data.photoUrl !== undefined) { updates.push('photoUrl = :p'); values[':p'] = data.photoUrl; }
  if (data.birthDate !== undefined) { updates.push('birthDate = :bd'); values[':bd'] = data.birthDate; }
  if (updates.length === 0) return res(400, { message: 'Nenhum campo para atualizar.' });
  await ddb.send(new UpdateCommand({
    TableName: T.USERS, Key: { id: userId },
    UpdateExpression: 'SET ' + updates.join(', '),
    ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    ExpressionAttributeValues: values,
  }));
  return res(200, { ok: true });
}

async function authResetPassword(userId, currentUser) {
  if (!currentUser || !isAdminOrPastor(currentUser)) return res(403, { message: 'Sem permissão.' });
  // Pastor can only reset lider in their church
  if (!isAdmin(currentUser)) {
    const target = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: userId } }));
    if (!target.Item) return res(404, { message: 'Usuário não encontrado.' });
    if (target.Item.role !== 'lider') return res(403, { message: 'Pastores só podem resetar senha de líderes.' });
    if (target.Item.churchId !== currentUser.churchId) return res(403, { message: 'Você só pode resetar senha de usuários da sua igreja.' });
  }
  const defaultPassword = '123456';
  await ddb.send(new UpdateCommand({
    TableName: T.USERS, Key: { id: userId },
    UpdateExpression: 'SET password = :p, firstLogin = :f',
    ExpressionAttributeValues: { ':p': defaultPassword, ':f': true },
  }));
  return res(200, { ok: true, message: 'Senha resetada. O usuário deverá trocar no próximo login.' });
}

// =============================================================================
// CONEXA.APP INTEGRATION
// =============================================================================

// Cache of Conexa customers in memory (refreshed every 1h)
let _conexaCache = null;
let _conexaCacheExpiry = 0;
const CONEXA_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function checkConexaBlocked(email) {
  try {
    // 1. Direct lookup in DynamoDB cache (fastest)
    try {
      const cached = await ddb.send(new GetCommand({ TableName: T.CONEXA_CACHE, Key: { email } }));
      if (cached.Item && cached.Item.email !== '__sync_position__') {
        if (cached.Item.isBlocked) {
          return { blocked: true, message: '⚠️ Seu acesso está suspenso por pendência financeira. Entre em contato com a administração para regularizar sua situação.' };
        }
        return { blocked: false };
      }
    } catch (e) {
      console.log('ConexaCache lookup error:', e.message);
    }

    // 2. If not in cache, do a quick live check (first 5 pages)
    for (let page = 1; page <= 5; page++) {
      const r = await fetch(`${CONEXA_BASE_URL}/customers?page=${page}`, {
        headers: { 'Authorization': `Bearer ${CONEXA_API_TOKEN}`, 'Content-Type': 'application/json' },
      });
      const data = await r.json();
      if (!data.data) break;
      
      for (const customer of data.data) {
        const loginEmail = (customer.login || '').toLowerCase();
        const financialEmails = (customer.emailsFinancialMessages || []).map(e => e.toLowerCase());
        const messageEmails = (customer.emailsMessage || []).map(e => e.toLowerCase());
        const allEmails = [loginEmail, ...financialEmails, ...messageEmails].filter(Boolean);
        
        if (allEmails.includes(email)) {
          // Cache this result for future lookups
          try {
            await ddb.send(new PutCommand({
              TableName: T.CONEXA_CACHE,
              Item: { email, customerId: customer.customerId, customerName: customer.name || '', isBlocked: !!customer.isBlocked, isActive: !!customer.isActive, updatedAt: new Date().toISOString() },
            }));
          } catch {}
          
          if (customer.isBlocked) {
            return { blocked: true, message: '⚠️ Seu acesso está suspenso por pendência financeira. Entre em contato com a administração para regularizar sua situação.' };
          }
          return { blocked: false };
        }
      }
    }

    // 3. Not found anywhere — allow access (user might not be a Conexa customer)
    return { blocked: false };
  } catch (err) {
    console.error('Conexa check error:', err.message);
    // On error, allow access (don't block users due to API issues)
    return { blocked: false };
  }
}

// Admin: Full sync of all Conexa customers to DynamoDB cache
async function conexaSync(user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem sincronizar Conexa.' });

  try {
    const MAX_PAGES_PER_CALL = 10;
    let startPage = 1;
    let totalPages = 126; // default, will be updated

    // Check if there's a previous sync position stored
    try {
      const pos = await ddb.send(new GetCommand({ TableName: T.CONEXA_CACHE, Key: { email: '__sync_position__' } }));
      if (pos.Item && pos.Item.nextPage && !pos.Item.completed) {
        startPage = pos.Item.nextPage;
        totalPages = pos.Item.totalPages || 126;
      }
    } catch {}

    let page = startPage;
    let synced = 0;
    let blocked = 0;
    let totalCustomers = 0;
    const endPage = Math.min(startPage + MAX_PAGES_PER_CALL - 1, totalPages);

    while (page <= endPage) {
      const r = await fetch(`${CONEXA_BASE_URL}/customers?page=${page}`, {
        headers: { 'Authorization': `Bearer ${CONEXA_API_TOKEN}`, 'Content-Type': 'application/json' },
      });
      const data = await r.json();
      if (!data.data || data.data.length === 0) break;
      
      totalPages = data.pagination?.totalPages || totalPages;
      totalCustomers = data.pagination?.totalItems || 0;

      for (const customer of data.data) {
        const loginEmail = (customer.login || '').toLowerCase();
        const financialEmails = (customer.emailsFinancialMessages || []).map(e => e.toLowerCase());
        const messageEmails = (customer.emailsMessage || []).map(e => e.toLowerCase());
        const allEmails = [...new Set([loginEmail, ...financialEmails, ...messageEmails].filter(Boolean))];

        const writes = allEmails.map(email => ddb.send(new PutCommand({
          TableName: T.CONEXA_CACHE,
          Item: { email, customerId: customer.customerId, customerName: customer.name || '', isBlocked: !!customer.isBlocked, isActive: !!customer.isActive, updatedAt: new Date().toISOString() },
        })));
        await Promise.all(writes);
        synced += allEmails.length;
        if (customer.isBlocked) blocked++;
      }
      page++;
    }

    // Save sync position
    const completed = page > totalPages;
    await ddb.send(new PutCommand({
      TableName: T.CONEXA_CACHE,
      Item: {
        email: '__sync_position__',
        nextPage: completed ? 1 : page,
        totalPages,
        completed,
        updatedAt: new Date().toISOString(),
      },
    }));

    // Clear memory cache
    _conexaCache = null;
    _conexaCacheExpiry = 0;

    return res(200, {
      ok: true,
      message: completed
        ? `Sincronização Conexa concluída! Todos os ${totalCustomers} clientes foram sincronizados.`
        : `Sincronização parcial (páginas ${startPage} a ${page - 1} de ${totalPages}). Execute novamente para continuar.`,
      totalCustomers,
      emailsSynced: synced,
      blockedCustomers: blocked,
      completed,
      currentPage: page - 1,
      totalPages,
    });
  } catch (err) {
    console.error('Conexa sync error:', err);
    return res(500, { message: 'Erro ao sincronizar Conexa', error: err.message });
  }
}

// Admin: Check Conexa status summary
async function conexaStatus(user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores.' });

  try {
    // Get first page to check connection and get totals
    const r = await fetch(`${CONEXA_BASE_URL}/customers?page=1`, {
      headers: { 'Authorization': `Bearer ${CONEXA_API_TOKEN}`, 'Content-Type': 'application/json' },
    });
    const data = await r.json();
    
    if (!data.data) return res(500, { message: 'Erro ao conectar com Conexa', details: data });

    // Check cache status
    let cacheCount = 0;
    try {
      const cached = await ddb.send(new ScanCommand({ TableName: T.CONEXA_CACHE, Select: 'COUNT' }));
      cacheCount = cached.Count || 0;
    } catch {}

    return res(200, {
      connected: true,
      totalCustomers: data.pagination?.totalItems || 0,
      cacheEntries: cacheCount,
      subdomain: CONEXA_SUBDOMAIN,
    });
  } catch (err) {
    return res(500, { message: 'Erro ao verificar Conexa', error: err.message });
  }
}

// =============================================================================
// POINTS
// =============================================================================
async function addPoints(userId, amount, reason) {
  if (!userId || !amount) return;
  try {
    await ddb.send(new UpdateCommand({
      TableName: T.USERS, Key: { id: userId },
      UpdateExpression: 'SET points = if_not_exists(points, :zero) + :pts',
      ExpressionAttributeValues: { ':zero': 0, ':pts': amount },
    }));
  } catch (e) { console.error('addPoints error:', e.message); }
}

// =============================================================================
// MATERIALS
// =============================================================================
async function materialsList(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.MATERIALS }));
  const items = (data.Items || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return res(200, items);
}

async function materialsCreate(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem criar materiais.' });
  if (!data.title) return res(400, { message: 'Título é obrigatório.' });
  const item = { id: uuid(), title: data.title, description: data.description || '', category: data.category || 'mensagem', fileUrl: data.fileUrl || '', fileName: data.fileName || '', createdAt: new Date().toISOString(), createdBy: user.id };
  await ddb.send(new PutCommand({ TableName: T.MATERIALS, Item: item }));
  return res(201, item);
}

async function materialsUpdate(id, data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem editar materiais.' });
  const existing = await ddb.send(new GetCommand({ TableName: T.MATERIALS, Key: { id } }));
  if (!existing.Item) return res(404, { message: 'Material não encontrado' });
  const fields = ['title', 'description', 'category', 'fileUrl', 'fileName'];
  let expr = 'SET '; const names = {}; const vals = {};
  fields.forEach(f => { if (data[f] !== undefined) { expr += `#${f} = :${f}, `; names[`#${f}`] = f; vals[`:${f}`] = data[f]; } });
  if (Object.keys(vals).length === 0) return res(200, { ok: true });
  expr = expr.slice(0, -2);
  await ddb.send(new UpdateCommand({ TableName: T.MATERIALS, Key: { id }, UpdateExpression: expr, ExpressionAttributeNames: names, ExpressionAttributeValues: vals }));
  return res(200, { ok: true });
}

async function materialsDelete(id, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir materiais.' });
  await ddb.send(new DeleteCommand({ TableName: T.MATERIALS, Key: { id } }));
  return res(200, { ok: true });
}

async function uploadPresign(data, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  if (!data.fileName || !data.contentType) return res(400, { message: 'fileName e contentType obrigatórios' });
  const key = `uploads/${uuid()}_${data.fileName}`;
  const putCmd = new PutObjectCommand({ Bucket: UPLOAD_BUCKET, Key: key, ContentType: data.contentType });
  const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 600 });
  const fileUrl = `https://${UPLOAD_BUCKET}.s3.amazonaws.com/${key}`;
  return res(200, { uploadUrl, fileUrl, key });
}

async function getMyPoints(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const userData = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: user.id } }));
  const u = userData.Item;
  if (!u) return res(404, { message: 'Usuário não encontrado' });
  return res(200, { points: u.points || 0 });
}

async function getPointsRanking(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.USERS }));
  const all = (data.Items || []).filter(u => u.churchId === user.churchId && (u.points || 0) > 0);
  all.sort((a, b) => (b.points || 0) - (a.points || 0));
  const top = all.slice(0, 10).map((u, i) => ({ rank: i + 1, name: u.name, points: u.points || 0 }));
  return res(200, top);
}

// =============================================================================
// CONTENT
// =============================================================================
async function contentList(query) {
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  let items = data.Items || [];
  if (query.categorySlug) items = items.filter(c => c.categorySlug === query.categorySlug);
  if (query.type) items = items.filter(c => c.type === query.type);
  if (query.sortBy === 'date') items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  else items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return res(200, items);
}

async function contentCreate(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem criar conteúdo.' });
  if (!data.title || !data.categorySlug || !data.type) return res(400, { message: 'Título, categoria e tipo são obrigatórios.' });
  const item = {
    id: uuid(),
    title: data.title,
    description: data.description || '',
    categorySlug: data.categorySlug,
    type: data.type,
    durationMinutes: data.durationMinutes || 0,
    thumbnailUrl: data.thumbnailUrl || '',
    contentUrl: data.contentUrl || '',
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    createdByName: user.name,
    popularity: 0,
    views: 0,
  };
  await ddb.send(new PutCommand({ TableName: T.CONTENT, Item: item }));
  return res(201, item);
}

async function contentUpdate(contentId, data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem editar conteúdo.' });
  const existing = await ddb.send(new GetCommand({ TableName: T.CONTENT, Key: { id: contentId } }));
  if (!existing.Item) return res(404, { message: 'Conteúdo não encontrado.' });
  const updates = [];
  const values = {};
  const names = {};
  if (data.title !== undefined) { updates.push('title = :t'); values[':t'] = data.title; }
  if (data.description !== undefined) { updates.push('description = :d'); values[':d'] = data.description; }
  if (data.categorySlug !== undefined) { updates.push('categorySlug = :cs'); values[':cs'] = data.categorySlug; }
  if (data.type !== undefined) { updates.push('#tp = :tp'); names['#tp'] = 'type'; values[':tp'] = data.type; }
  if (data.durationMinutes !== undefined) { updates.push('durationMinutes = :dm'); values[':dm'] = data.durationMinutes; }
  if (data.thumbnailUrl !== undefined) { updates.push('thumbnailUrl = :tu'); values[':tu'] = data.thumbnailUrl; }
  if (data.contentUrl !== undefined) { updates.push('contentUrl = :cu'); values[':cu'] = data.contentUrl; }
  if (updates.length === 0) return res(400, { message: 'Nenhum campo para atualizar.' });
  await ddb.send(new UpdateCommand({
    TableName: T.CONTENT, Key: { id: contentId },
    UpdateExpression: 'SET ' + updates.join(', '),
    ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    ExpressionAttributeValues: values,
  }));
  return res(200, { ok: true });
}

async function contentTrending() {
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  const items = (data.Items || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5);
  return res(200, items);
}

async function contentTop10() {
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  const items = (data.Items || []).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  return res(200, items);
}

async function contentReleases() {
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  const items = (data.Items || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 4);
  return res(200, items);
}

async function contentById(id) {
  const data = await ddb.send(new GetCommand({ TableName: T.CONTENT, Key: { id } }));
  if (!data.Item) return res(404, { message: 'Conteúdo não encontrado' });
  return res(200, data.Item);
}

async function contentAccess({ contentId }, user) {
  if (!user || !contentId) return res(400, { message: 'Dados inválidos' });
  try {
    await ddb.send(new UpdateCommand({
      TableName: T.CONTENT, Key: { id: contentId },
      UpdateExpression: 'SET #v = if_not_exists(#v, :zero) + :one',
      ExpressionAttributeNames: { '#v': 'views' },
      ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
    }));
  } catch {}
  return res(200, { ok: true });
}

async function contentDelete(contentId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir conteúdo.' });
  await ddb.send(new DeleteCommand({ TableName: T.CONTENT, Key: { id: contentId } }));
  return res(200, { ok: true, deleted: contentId });
}

async function contentDeleteByCategory(categorySlug, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir conteúdo.' });
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT, FilterExpression: 'categorySlug = :c', ExpressionAttributeValues: { ':c': categorySlug } }));
  const items = data.Items || [];
  for (const item of items) {
    await ddb.send(new DeleteCommand({ TableName: T.CONTENT, Key: { id: item.id } }));
  }
  return res(200, { ok: true, deleted: items.length, categorySlug });
}

// =============================================================================
// SEARCH
// =============================================================================
async function searchContent(query) {
  const q = (query.q || '').toLowerCase();
  if (!q) return res(200, []);
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  let items = (data.Items || []).filter(c =>
    (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q) || (c.categorySlug || '').toLowerCase().includes(q)
  );
  if (query.type) items = items.filter(c => c.type === query.type);
  if (query.sortBy === 'date') items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  else items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return res(200, items);
}


// =============================================================================
// TRAILS
// =============================================================================
async function trailsList(user) {
  const data = await ddb.send(new ScanCommand({ TableName: T.TRAILS }));
  const trails = data.Items || [];
  if (!user) return res(200, trails.filter(t => t.isMandatory).map(t => ({ ...t, progress: null })));
  const prog = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS, FilterExpression: 'userId = :u', ExpressionAttributeValues: { ':u': user.id } }));
  const progressMap = {};
  (prog.Items || []).forEach(p => { progressMap[p.trailId] = p; });
  // Pastor sees all trails; others see only mandatory + enrolled (has progress)
  const isPastor = isAdminOrPastor(user);
  const filtered = isPastor ? trails : trails.filter(t => t.isMandatory || progressMap[t.id]);
  return res(200, filtered.map(t => ({ ...t, progress: progressMap[t.id] || null })));
}

async function trailCreate(data, user) {
  if (!user || !isAdminOrPastor(user)) return res(403, { message: 'Apenas administradores e pastores podem criar trilhas.' });
  if (!data.title) return res(400, { message: 'Título é obrigatório.' });
  const modules = (data.modules || []).map((m, i) => ({
    moduleId: m.moduleId || uuid(),
    title: m.title,
    order: m.order ?? (i + 1),
    durationMinutes: m.durationMinutes || 0,
    contentId: m.contentId || null,
    externalUrl: m.externalUrl || null,
  }));
  const totalDurationMinutes = modules.reduce((s, m) => s + (m.durationMinutes || 0), 0);
  const isPastor = user.role === 'pastor_presidente';
  const item = {
    id: uuid(),
    title: data.title,
    description: data.description || '',
    modules,
    points: data.points || 0,
    isMandatory: !!data.isMandatory,
    totalDurationMinutes,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    createdByName: user.name,
    createdByChurchId: user.churchId || '',
    status: isPastor ? 'pending' : 'approved',
  };
  await ddb.send(new PutCommand({ TableName: T.TRAILS, Item: item }));
  return res(201, item);
}

async function trailDelete(trailId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir trilhas.' });
  await ddb.send(new DeleteCommand({ TableName: T.TRAILS, Key: { id: trailId } }));
  return res(200, { ok: true, deleted: trailId });
}

async function trailsAcademy() {
  // Dynamic: return all trails as academy courses
  const data = await ddb.send(new ScanCommand({ TableName: T.TRAILS }));
  const trails = data.Items || [];
  return res(200, trails.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    durationHours: Math.round((t.totalDurationMinutes || 0) / 60 * 10) / 10,
    points: t.points || 0,
    isMandatory: t.isMandatory || false,
    modulesCount: (t.modules || []).length,
    trailId: t.id,
  })));
}

async function trailEnroll(trailId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Same as trailStart — creates progress entry
  const existing = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS, FilterExpression: 'trailId = :t AND userId = :u', ExpressionAttributeValues: { ':t': trailId, ':u': user.id } }));
  if (existing.Items?.length) return res(200, { ok: true, alreadyEnrolled: true, progress: existing.Items[0] });
  const progress = { id: uuid(), trailId, userId: user.id, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() };
  await ddb.send(new PutCommand({ TableName: T.TRAIL_PROGRESS, Item: progress }));
  return res(201, { ok: true, progress });
}

async function trailStart(trailId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const existing = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS, FilterExpression: 'trailId = :t AND userId = :u', ExpressionAttributeValues: { ':t': trailId, ':u': user.id } }));
  if (existing.Items?.length) return res(200, existing.Items[0]);
  const progress = { id: uuid(), trailId, userId: user.id, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() };
  await ddb.send(new PutCommand({ TableName: T.TRAIL_PROGRESS, Item: progress }));
  return res(201, progress);
}

async function trailCompleteModule(trailId, { moduleId }, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Get trail to know total modules
  const trailData = await ddb.send(new GetCommand({ TableName: T.TRAILS, Key: { id: trailId } }));
  const trail = trailData.Item;
  // Get or create progress
  const existing = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS, FilterExpression: 'trailId = :t AND userId = :u', ExpressionAttributeValues: { ':t': trailId, ':u': user.id } }));
  let progress = existing.Items?.[0];
  if (!progress) {
    progress = { id: uuid(), trailId, userId: user.id, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() };
  }
  if (!progress.completedModules) progress.completedModules = [];
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  const totalModules = trail?.modules?.length || 1;
  progress.percentComplete = Math.round((progress.completedModules.length / totalModules) * 100);
  if (progress.percentComplete >= 100) progress.completedAt = new Date().toISOString();
  await ddb.send(new PutCommand({ TableName: T.TRAIL_PROGRESS, Item: progress }));
  // Award points: 10 per module completed
  await addPoints(user.id, 10, 'module_complete');
  // Bonus 50 points when trail is fully completed
  if (progress.percentComplete >= 100 && !progress._bonusAwarded) {
    await addPoints(user.id, 50, 'trail_complete_bonus');
    progress._bonusAwarded = true;
    await ddb.send(new PutCommand({ TableName: T.TRAIL_PROGRESS, Item: progress }));
  }
  return res(200, progress);
}

// =============================================================================
// MENTORING
// =============================================================================
async function mentoringWebinars() {
  const data = await ddb.send(new ScanCommand({ TableName: T.WEBINARS }));
  return res(200, data.Items || []);
}

async function mentoringCreateWebinar(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem criar webinars.' });
  if (!data.title || !data.scheduledAt) return res(400, { message: 'Título e data são obrigatórios.' });
  const item = {
    id: uuid(), title: data.title, description: data.description || '',
    scheduledAt: data.scheduledAt, meetingUrl: data.meetingUrl || '',
    hostName: data.hostName || user.name, createdBy: user.id,
    enrolledUsers: [], enrolledCount: 0,
  };
  await ddb.send(new PutCommand({ TableName: T.WEBINARS, Item: item }));
  return res(201, item);
}

async function mentoringDeleteWebinar(webinarId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir webinars.' });
  await ddb.send(new DeleteCommand({ TableName: T.WEBINARS, Key: { id: webinarId } }));
  return res(200, { ok: true, deleted: webinarId });
}

async function mentoringEnrollWebinar(webinarId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const webinarData = await ddb.send(new GetCommand({ TableName: T.WEBINARS, Key: { id: webinarId } }));
  const webinar = webinarData.Item;
  if (!webinar) return res(404, { message: 'Webinar não encontrado' });
  const enrolled = webinar.enrolledUsers || [];
  if (enrolled.includes(user.id)) return res(200, { ok: true, alreadyEnrolled: true });
  enrolled.push(user.id);
  await ddb.send(new UpdateCommand({
    TableName: T.WEBINARS, Key: { id: webinarId },
    UpdateExpression: 'SET enrolledUsers = :eu, enrolledCount = :ec',
    ExpressionAttributeValues: { ':eu': enrolled, ':ec': enrolled.length },
  }));
  // Also add to user's planning
  const now = new Date().toISOString().split('T')[0];
  await ddb.send(new PutCommand({ TableName: T.PLANS, Item: {
    id: uuid(), userId: user.id, type: 'webinar', title: `Webinar: ${webinar.title}`,
    data: { webinarId, title: webinar.title, description: webinar.description, scheduledAt: webinar.scheduledAt, meetingUrl: webinar.meetingUrl, hostName: webinar.hostName },
    createdAt: now, updatedAt: now,
  }}));
  return res(200, { ok: true });
}

async function mentoringSessions(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Return ALL sessions (not just user's) so the page can show all
  const data = await ddb.send(new ScanCommand({ TableName: T.MENTORING }));
  return res(200, data.Items || []);
}

async function mentoringCreateSession(data, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  if (user.role !== 'admin' && user.role !== 'pastor_presidente' && user.role !== 'lider') return res(403, { message: 'Apenas administradores, pastores ou líderes podem criar mentorias.' });
  if (!data.title || !data.scheduledAt) return res(400, { message: 'Título e data são obrigatórios.' });
  const item = {
    id: uuid(), title: data.title, description: data.description || '',
    scheduledAt: data.scheduledAt, meetingUrl: data.meetingUrl || '',
    mentorName: data.mentorName, mentorId: data.mentorId,
    pastorName: data.pastorName, pastorId: data.pastorId,
    status: 'scheduled', createdBy: user.id,
  };
  await ddb.send(new PutCommand({ TableName: T.MENTORING, Item: item }));
  // Notify the other party via messages
  const notifyUserId = user.id === data.pastorId ? data.mentorId : data.pastorId;
  const msg = {
    id: uuid(), fromUserId: user.id, fromName: user.name, toUserId: notifyUserId,
    subject: `Nova mentoria agendada: ${data.title}`,
    body: `Você tem uma nova mentoria agendada: "${data.title}" em ${data.scheduledAt}. ${data.meetingUrl ? 'Link: ' + data.meetingUrl : ''}`,
    isRead: false, createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: T.MESSAGES, Item: msg }));
  return res(201, item);
}

async function mentoringDeleteSession(sessionId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Check if session is completed — completed sessions cannot be deleted (historical record)
  const sessionData = await ddb.send(new GetCommand({ TableName: T.MENTORING, Key: { id: sessionId } }));
  if (sessionData.Item?.status === 'completed') return res(403, { message: 'Mentorias concluídas não podem ser excluídas. Elas ficam como registro histórico.' });
  await ddb.send(new DeleteCommand({ TableName: T.MENTORING, Key: { id: sessionId } }));
  return res(200, { ok: true, deleted: sessionId });
}

async function mentoringCompleteSession({ sessionId }, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem concluir mentorias.' });
  if (!sessionId) return res(400, { message: 'sessionId obrigatório' });
  const sessionData = await ddb.send(new GetCommand({ TableName: T.MENTORING, Key: { id: sessionId } }));
  const session = sessionData.Item;
  if (!session) return res(404, { message: 'Mentoria não encontrada' });
  if (session.status === 'completed') return res(200, { ok: true, alreadyCompleted: true });
  await ddb.send(new UpdateCommand({
    TableName: T.MENTORING, Key: { id: sessionId },
    UpdateExpression: 'SET #s = :s',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': 'completed' },
  }));
  // Award 100 points to both mentor and pastor for completing mentoring
  if (session.mentorId) await addPoints(session.mentorId, 100, 'mentoring_complete');
  if (session.pastorId) await addPoints(session.pastorId, 100, 'mentoring_complete');
  return res(200, { ok: true });
}

// =============================================================================
// DASHBOARD
// =============================================================================
async function dashboardMetrics(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const usersData = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'churchId = :c', ExpressionAttributeValues: { ':c': user.churchId } }));
  const users = usersData.Items || [];
  const contentData = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  const contents = contentData.Items || [];
  const progData = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS }));
  const progress = progData.Items || [];
  return res(200, {
    totalLeaders: users.length,
    activeLeaders: users.filter(u => u.status === 'active').length,
    totalContentAccessed: contents.reduce((sum, c) => sum + (c.views || 0), 0),
    trailsInProgress: progress.filter(p => !p.completedAt).length,
    trailsCompleted: progress.filter(p => !!p.completedAt).length,
  });
}

async function dashboardRanking(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const usersData = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'churchId = :c', ExpressionAttributeValues: { ':c': user.churchId } }));
  const users = usersData.Items || [];
  const progData = await ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS }));
  const progress = progData.Items || [];
  const ranking = users.map(u => {
    const userProg = progress.filter(p => p.userId === u.id);
    const completed = userProg.filter(p => !!p.completedAt).length;
    const score = completed * 20 + userProg.reduce((s, p) => s + (p.percentComplete || 0), 0) / Math.max(userProg.length, 1);
    return { name: u.name, score: Math.round(score), trails: completed };
  }).sort((a, b) => b.score - a.score);
  return res(200, ranking);
}

async function dashboardTimeline() {
  const data = await ddb.send(new ScanCommand({ TableName: T.TIMELINE }));
  return res(200, (data.Items || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
}

async function dashboardRecent() {
  // Return recent content accesses (simplified)
  const data = await ddb.send(new ScanCommand({ TableName: T.CONTENT }));
  const items = (data.Items || []).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  return res(200, items.map(c => ({ contentId: c.id, contentTitle: c.title, name: 'Líder', lastAccessAt: c.createdAt })));
}


// =============================================================================
// MESSAGES
// =============================================================================
async function messagesList(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.MESSAGES, FilterExpression: 'toUserId = :u', ExpressionAttributeValues: { ':u': user.id } }));
  const items = (data.Items || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return res(200, items);
}

async function messagesSend({ toUserId, subject, body: msgBody }, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Any authenticated user can send messages (lider only to same church)

  const now = new Date().toISOString();

  // Special case: sending to "Administradores" group
  if (toUserId === '__ADMIN_GROUP__') {
    if (user.role !== 'pastor_presidente') return res(403, { message: 'Apenas pastores podem enviar mensagens para o grupo Administradores.' });
    // Find all admin users
    const allUsers = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: '#r = :admin', ExpressionAttributeNames: { '#r': 'role' }, ExpressionAttributeValues: { ':admin': 'admin' } }));
    const admins = allUsers.Items || [];
    if (admins.length === 0) return res(404, { message: 'Nenhum administrador encontrado.' });
    const msgs = [];
    for (const admin of admins) {
      const msg = { id: uuid(), fromUserId: user.id, fromName: user.name, toUserId: admin.id, subject, body: msgBody, isRead: false, createdAt: now, groupName: 'Administradores' };
      await ddb.send(new PutCommand({ TableName: T.MESSAGES, Item: msg }));
      msgs.push(msg);
    }
    return res(201, { ok: true, sent: msgs.length, message: `Mensagem enviada para ${msgs.length} administrador(es).` });
  }

  // Normal send: pastor sends to member of same church
  // Verify target user exists and is in the same church
  const target = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: toUserId } }));
  if (!target.Item) return res(404, { message: 'Usuário destinatário não encontrado.' });

  // Admin can send to anyone; pastor/lider can only send to users in their church
  if (!isAdmin(user)) {
    if (target.Item.churchId !== user.churchId) return res(403, { message: 'Você só pode enviar mensagens para membros da sua igreja.' });
  }

  const msg = { id: uuid(), fromUserId: user.id, fromName: user.name, toUserId, subject, body: msgBody, isRead: false, createdAt: now };
  await ddb.send(new PutCommand({ TableName: T.MESSAGES, Item: msg }));
  return res(201, msg);
}

async function messagesRecipients(user) {
  if (!user) return res(401, { message: 'Não autenticado' });

  let recipients = [];

  if (isAdmin(user)) {
    // Admin can send to anyone
    const allUsers = await ddb.send(new ScanCommand({ TableName: T.USERS }));
    recipients = (allUsers.Items || []).filter(u => u.id !== user.id).map(u => ({ id: u.id, name: u.name, role: u.role, churchId: u.churchId }));
  } else {
    // Pastor/Lider: only users from their church
    const churchUsers = await ddb.send(new ScanCommand({ TableName: T.USERS, FilterExpression: 'churchId = :c', ExpressionAttributeValues: { ':c': user.churchId } }));
    recipients = (churchUsers.Items || []).filter(u => u.id !== user.id).map(u => ({ id: u.id, name: u.name, role: u.role, churchId: u.churchId }));
  }

  // If pastor, add the "Administradores" group option
  if (user.role === 'pastor_presidente') {
    recipients.unshift({ id: '__ADMIN_GROUP__', name: '👥 Administradores (Grupo)', role: 'group', churchId: '' });
  }

  return res(200, recipients);
}

async function messagesMarkRead({ messageId }) {
  if (!messageId) return res(400, { message: 'messageId obrigatório' });
  await ddb.send(new UpdateCommand({
    TableName: T.MESSAGES, Key: { id: messageId },
    UpdateExpression: 'SET isRead = :t', ExpressionAttributeValues: { ':t': true },
  }));
  return res(200, { ok: true });
}

async function messagesUnreadCount(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.MESSAGES, FilterExpression: 'toUserId = :u AND isRead = :f', ExpressionAttributeValues: { ':u': user.id, ':f': false } }));
  return res(200, { count: data.Items?.length || 0 });
}

// =============================================================================
// MAP
// =============================================================================
async function mapList() {
  const data = await ddb.send(new ScanCommand({ TableName: T.CHURCHES }));
  return res(200, data.Items || []);
}

async function mapTop() {
  const data = await ddb.send(new ScanCommand({ TableName: T.CHURCHES }));
  const items = (data.Items || []).sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0)).slice(0, 5);
  return res(200, items);
}

async function mapCreateChurch(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem cadastrar igrejas.' });
  if (!data.name || !data.city || !data.state) return res(400, { message: 'Nome, cidade e estado são obrigatórios.' });
  if (!data.pastorId) return res(400, { message: 'Selecione um pastor responsável cadastrado no sistema.' });
  // Validate pastor exists and is a pastor
  const pastorData = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: data.pastorId } }));
  if (!pastorData.Item || (pastorData.Item.role !== 'pastor_presidente' && pastorData.Item.role !== 'admin')) return res(400, { message: 'O pastor selecionado não é válido.' });
  const item = {
    id: uuid(), name: data.name, pastorName: pastorData.Item.name, pastorId: data.pastorId,
    cep: data.cep || '', address: data.address || '',
    city: data.city, state: data.state,
    lat: data.lat || 0, lng: data.lng || 0,
    memberCount: data.memberCount || 0, phone: data.phone || '',
    logoUrl: data.logoUrl || '', themeColor: data.themeColor || '',
    engagementScore: 0,
  };
  await ddb.send(new PutCommand({ TableName: T.CHURCHES, Item: item }));
  return res(201, item);
}

async function mapDeleteChurch(churchId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir igrejas.' });
  await ddb.send(new DeleteCommand({ TableName: T.CHURCHES, Key: { id: churchId } }));
  return res(200, { ok: true, deleted: churchId });
}

async function mapUpdateChurch(churchId, data, user) {
  if (!user || !isAdminOrPastor(user)) return res(403, { message: 'Apenas administradores ou pastores podem editar igrejas.' });
  // Pastor can only edit their own church
  if (!isAdmin(user) && user.churchId !== churchId) return res(403, { message: 'Você só pode editar a sua própria igreja.' });
  const updates = [];
  const values = {};
  const names = {};
  if (data.name !== undefined) { updates.push('#n = :n'); names['#n'] = 'name'; values[':n'] = data.name; }
  if (data.pastorName !== undefined) { updates.push('pastorName = :pn'); values[':pn'] = data.pastorName; }
  if (data.cep !== undefined) { updates.push('cep = :cep'); values[':cep'] = data.cep; }
  if (data.address !== undefined) { updates.push('address = :addr'); values[':addr'] = data.address; }
  if (data.city !== undefined) { updates.push('city = :city'); values[':city'] = data.city; }
  if (data.state !== undefined) { updates.push('#st = :st'); names['#st'] = 'state'; values[':st'] = data.state; }
  if (data.lat !== undefined) { updates.push('lat = :lat'); values[':lat'] = data.lat; }
  if (data.lng !== undefined) { updates.push('lng = :lng'); values[':lng'] = data.lng; }
  if (data.memberCount !== undefined) { updates.push('memberCount = :mc'); values[':mc'] = data.memberCount; }
  if (data.phone !== undefined) { updates.push('phone = :ph'); values[':ph'] = data.phone; }
  if (data.logoUrl !== undefined) { updates.push('logoUrl = :lu'); values[':lu'] = data.logoUrl; }
  if (data.themeColor !== undefined) { updates.push('themeColor = :tc'); values[':tc'] = data.themeColor; }
  if (updates.length === 0) return res(400, { message: 'Nenhum campo para atualizar.' });
  await ddb.send(new UpdateCommand({
    TableName: T.CHURCHES, Key: { id: churchId },
    UpdateExpression: 'SET ' + updates.join(', '),
    ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    ExpressionAttributeValues: values,
  }));
  return res(200, { ok: true });
}

// =============================================================================
// MINISTRIES
// =============================================================================
async function ministriesList() {
  const data = await ddb.send(new ScanCommand({ TableName: T.MINISTRIES }));
  return res(200, (data.Items || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
}

async function ministriesCreate(data, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  if (!data.name) return res(400, { message: 'Nome do ministério é obrigatório.' });
  const item = {
    id: uuid(), name: data.name, description: data.description || '',
    leaderId: data.leaderId || '', leaderName: data.leaderName || '',
    churchId: user.churchId || '',
    createdAt: new Date().toISOString(), createdBy: user.id,
  };
  await ddb.send(new PutCommand({ TableName: T.MINISTRIES, Item: item }));
  return res(201, item);
}

async function ministriesDelete(ministryId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Non-admin: can only delete ministries from their church
  if (!isAdmin(user)) {
    const ministry = await ddb.send(new GetCommand({ TableName: T.MINISTRIES, Key: { id: ministryId } }));
    if (ministry.Item && ministry.Item.churchId && ministry.Item.churchId !== user.churchId) {
      return res(403, { message: 'Você só pode excluir ministérios da sua igreja.' });
    }
  }
  await ddb.send(new DeleteCommand({ TableName: T.MINISTRIES, Key: { id: ministryId } }));
  return res(200, { ok: true, deleted: ministryId });
}

async function ministriesUpdate(ministryId, data, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Non-admin: can only update ministries from their church
  if (!isAdmin(user)) {
    const ministry = await ddb.send(new GetCommand({ TableName: T.MINISTRIES, Key: { id: ministryId } }));
    if (ministry.Item && ministry.Item.churchId && ministry.Item.churchId !== user.churchId) {
      return res(403, { message: 'Você só pode editar ministérios da sua igreja.' });
    }
  }
  const updates = [];
  const values = {};
  const names = {};
  if (data.name !== undefined) { updates.push('#n = :n'); names['#n'] = 'name'; values[':n'] = data.name; }
  if (data.description !== undefined) { updates.push('description = :d'); values[':d'] = data.description; }
  if (data.leaderId !== undefined) { updates.push('leaderId = :li'); values[':li'] = data.leaderId; }
  if (data.leaderName !== undefined) { updates.push('leaderName = :ln'); values[':ln'] = data.leaderName; }
  if (updates.length === 0) return res(400, { message: 'Nenhum campo para atualizar.' });
  await ddb.send(new UpdateCommand({
    TableName: T.MINISTRIES, Key: { id: ministryId },
    UpdateExpression: 'SET ' + updates.join(', '),
    ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    ExpressionAttributeValues: values,
  }));
  return res(200, { ok: true });
}

// =============================================================================
// PLANNING
// =============================================================================
async function planningList(user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.PLANS, FilterExpression: 'userId = :u', ExpressionAttributeValues: { ':u': user.id } }));
  return res(200, data.Items || []);
}

async function planningSave({ type, title, data: planData }, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const now = new Date().toISOString().split('T')[0];
  const plan = { id: uuid(), userId: user.id, type, title, data: planData, createdAt: now, updatedAt: now };
  await ddb.send(new PutCommand({ TableName: T.PLANS, Item: plan }));
  return res(201, plan);
}

async function planningUpdate(planId, { title, data: planData }) {
  const now = new Date().toISOString().split('T')[0];
  await ddb.send(new UpdateCommand({
    TableName: T.PLANS, Key: { id: planId },
    UpdateExpression: 'SET title = :t, #d = :d, updatedAt = :u',
    ExpressionAttributeNames: { '#d': 'data' },
    ExpressionAttributeValues: { ':t': title, ':d': planData, ':u': now },
  }));
  return res(200, { ok: true });
}

async function planningDelete(planId) {
  await ddb.send(new DeleteCommand({ TableName: T.PLANS, Key: { id: planId } }));
  return res(200, { ok: true });
}

// =============================================================================
// PODCAST
// =============================================================================
async function podcastList() {
  const data = await ddb.send(new ScanCommand({ TableName: T.PODCAST }));
  return res(200, (data.Items || []).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')));
}

async function podcastGetProgress(episodeId, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.PODCAST_PROGRESS, FilterExpression: 'episodeId = :e AND userId = :u', ExpressionAttributeValues: { ':e': episodeId, ':u': user.id } }));
  return res(200, data.Items?.[0] || null);
}

async function podcastSaveProgress({ episodeId, currentTime, completed }, user) {
  if (!user) return res(401, { message: 'Não autenticado' });
  // Check if exists
  const existing = await ddb.send(new ScanCommand({ TableName: T.PODCAST_PROGRESS, FilterExpression: 'episodeId = :e AND userId = :u', ExpressionAttributeValues: { ':e': episodeId, ':u': user.id } }));
  const item = existing.Items?.[0];
  if (item) {
    await ddb.send(new UpdateCommand({
      TableName: T.PODCAST_PROGRESS, Key: { id: item.id },
      UpdateExpression: 'SET currentTime = :ct, completed = :c',
      ExpressionAttributeValues: { ':ct': currentTime, ':c': completed || false },
    }));
    return res(200, { ...item, currentTime, completed: completed || false });
  }
  const newItem = { id: uuid(), episodeId, userId: user.id, currentTime, completed: completed || false };
  await ddb.send(new PutCommand({ TableName: T.PODCAST_PROGRESS, Item: newItem }));
  return res(201, newItem);
}

async function podcastCreate(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem criar episódios.' });
  if (!data.title) return res(400, { message: 'Título é obrigatório.' });
  const item = {
    id: uuid(), title: data.title, description: data.description || '',
    durationSeconds: data.durationSeconds || 0, audioUrl: data.audioUrl || '',
    publishedAt: data.publishedAt || new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: T.PODCAST, Item: item }));
  return res(201, item);
}

async function podcastUpdate(episodeId, data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem editar episódios.' });
  const existing = await ddb.send(new GetCommand({ TableName: T.PODCAST, Key: { id: episodeId } }));
  if (!existing.Item) return res(404, { message: 'Episódio não encontrado.' });
  const updated = { ...existing.Item };
  if (data.title !== undefined) updated.title = data.title;
  if (data.description !== undefined) updated.description = data.description;
  if (data.durationSeconds !== undefined) updated.durationSeconds = data.durationSeconds;
  if (data.audioUrl !== undefined) updated.audioUrl = data.audioUrl;
  if (data.publishedAt !== undefined) updated.publishedAt = data.publishedAt;
  await ddb.send(new PutCommand({ TableName: T.PODCAST, Item: updated }));
  return res(200, { ok: true });
}

async function podcastDelete(episodeId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem excluir episódios.' });
  await ddb.send(new DeleteCommand({ TableName: T.PODCAST, Key: { id: episodeId } }));
  return res(200, { ok: true, deleted: episodeId });
}


// =============================================================================
// DROPBOX SYNC

// =============================================================================
// DROPBOX SYNC
// =============================================================================
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY || '';
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET || '';
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN || '';
const DROPBOX_FOLDER = process.env.DROPBOX_FOLDER || '';
const DROPBOX_NAMESPACE_ID = process.env.DROPBOX_NAMESPACE_ID || '';
const SYNC_BATCH = 100;

let _dbxToken = '';
let _dbxTokenExpiry = 0;
async function getDropboxToken() {
  if (_dbxToken && Date.now() < _dbxTokenExpiry) return _dbxToken;
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${DROPBOX_REFRESH_TOKEN}&client_id=${DROPBOX_APP_KEY}&client_secret=${DROPBOX_APP_SECRET}`,
  });
  const data = await r.json();
  _dbxToken = data.access_token;
  _dbxTokenExpiry = Date.now() + ((data.expires_in || 14400) - 300) * 1000;
  return _dbxToken;
}

function dbxHeaders(token) {
  const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (DROPBOX_NAMESPACE_ID) h['Dropbox-API-Path-Root'] = JSON.stringify({".tag": "namespace_id", "namespace_id": DROPBOX_NAMESPACE_ID});
  return h;
}

async function dropboxSync(user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas admin pode sincronizar.' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });

  try {
    const folderPath = DROPBOX_FOLDER || '';
    let allFiles = [];
    let hasMore = true;
    let cursor = null;

    while (hasMore) {
      const url = cursor
        ? 'https://api.dropboxapi.com/2/files/list_folder/continue'
        : 'https://api.dropboxapi.com/2/files/list_folder';
      const payload = cursor
        ? { cursor }
        : { path: folderPath, recursive: true, limit: 2000 };
      const r = await fetch(url, {
        method: 'POST',
        headers: dbxHeaders(await getDropboxToken()),
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.error) return res(400, { message: 'Erro Dropbox', error: data.error_summary });
      const files = (data.entries || []).filter(e => e['.tag'] === 'file');
      allFiles = allFiles.concat(files);
      hasMore = data.has_more;
      cursor = data.cursor;
    }

    if (allFiles.length === 0) return res(200, { message: 'Nenhum arquivo encontrado.', synced: 0 });

    const existing = await ddb.send(new ScanCommand({ TableName: T.MATERIALS }));
    const existingPaths = new Set((existing.Items || []).map(m => m.dropboxPath).filter(Boolean));

    const newFiles = allFiles.filter(f => !existingPaths.has(f.path_lower));
    if (newFiles.length === 0) return res(200, { message: `Todos os ${allFiles.length} arquivos ja sincronizados.`, synced: 0, total: allFiles.length });

    const batch = newFiles.slice(0, SYNC_BATCH);
    let synced = 0;
    const errors = [];

    for (const file of batch) {
      try {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        let category = 'documento';
        if (['mp4','mov','avi','mkv','webm'].includes(ext)) category = 'video';
        else if (['mp3','wav','ogg','m4a','aac'].includes(ext)) category = 'audio';
        else if (ext === 'pdf') category = 'pdf';
        else if (['ppt','pptx'].includes(ext)) category = 'apresentacao';
        else if (['xls','xlsx','csv'].includes(ext)) category = 'planilha';
        else if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) category = 'imagem';

        const rel = file.path_display.substring(1);
        const parts = rel.split('/');
        const subfolder = parts.length > 1 ? parts.slice(0, -1).join(' / ') : '';

        const material = {
          id: uuid(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: subfolder || 'Dropbox',
          category,
          fileUrl: '',
          fileName: file.name,
          fileSize: file.size || 0,
          dropboxPath: file.path_lower,
          dropboxId: file.id,
          source: 'dropbox',
          createdAt: file.server_modified || new Date().toISOString(),
          createdBy: user.id,
        };
        await ddb.send(new PutCommand({ TableName: T.MATERIALS, Item: material }));
        synced++;
      } catch (e) {
        errors.push({ file: file.name, error: e.message });
      }
    }

    const remaining = newFiles.length - synced;
    let msg = `${synced} material(is) importado(s).`;
    if (remaining > 0) msg += ` Restam ${remaining}. Clique novamente.`;
    else msg += ' Completo!';

    return res(200, { message: msg, synced, total: allFiles.length, remaining, errors: errors.length ? errors : undefined });
  } catch (err) {
    console.error('Dropbox sync error:', err);
    return res(500, { message: 'Erro sync Dropbox', error: err.message });
  }
}

// Get temporary download/preview link for a Dropbox file
async function dropboxGetLink(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });
  const dropboxPath = data.dropboxPath;
  if (!dropboxPath) return res(400, { message: 'dropboxPath obrigatorio.' });

  try {
    const r = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: dbxHeaders(await getDropboxToken()),
      body: JSON.stringify({ path: dropboxPath }),
    });
    const result = await r.json();
    if (result.error) return res(400, { message: 'Erro ao gerar link', error: result.error_summary });
    return res(200, { link: result.link, metadata: result.metadata });
  } catch (err) {
    return res(500, { message: 'Erro ao gerar link Dropbox', error: err.message });
  }
}


// --- Dropbox Browse (list folder contents) ---
async function dropboxBrowse(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });

  const folderPath = query.path || '';

  try {
    const r = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: dbxHeaders(await getDropboxToken()),
      body: JSON.stringify({ path: folderPath, recursive: false, limit: 2000 }),
    });
    const data = await r.json();
    if (data.error) return res(400, { message: 'Erro Dropbox', error: data.error_summary });

    const entries = (data.entries || []).map(e => {
      const isFile = e['.tag'] === 'file';
      const ext = isFile ? (e.name.split('.').pop() || '').toLowerCase() : '';
      let fileType = 'other';
      if (['mp4','mov','avi','mkv','webm'].includes(ext)) fileType = 'video';
      else if (['mp3','wav','ogg','m4a','aac'].includes(ext)) fileType = 'audio';
      else if (ext === 'pdf') fileType = 'pdf';
      else if (['doc','docx','txt','rtf'].includes(ext)) fileType = 'document';
      else if (['ppt','pptx'].includes(ext)) fileType = 'presentation';
      else if (['xls','xlsx','csv'].includes(ext)) fileType = 'spreadsheet';
      else if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) fileType = 'image';
      else if (['zip','rar','7z','tar','gz'].includes(ext)) fileType = 'archive';

      return {
        tag: e['.tag'],
        name: e.name,
        path: e.path_display,
        pathLower: e.path_lower,
        id: e.id,
        ...(isFile ? {
          size: e.size || 0,
          modified: e.server_modified || '',
          fileType,
          ext,
        } : {}),
      };
    });

    // Sort: folders first (alphabetical), then files (alphabetical)
    entries.sort((a, b) => {
      if (a.tag !== b.tag) return a.tag === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return res(200, { path: folderPath, entries });
  } catch (err) {
    console.error('Dropbox browse error:', err);
    return res(500, { message: 'Erro ao navegar Dropbox', error: err.message });
  }
}

// --- Dropbox Download (get temporary link) ---
async function dropboxDownload(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });
  if (!data.path) return res(400, { message: 'path obrigatorio.' });

  try {
    const r = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: dbxHeaders(await getDropboxToken()),
      body: JSON.stringify({ path: data.path }),
    });
    const result = await r.json();
    if (result.error) return res(400, { message: 'Erro Dropbox', error: result.error_summary });

    // Track based on action: 'download' or 'view' (default: view)
    const action = data.action || 'view';
    const fileName = result.metadata?.name || data.path.split('/').pop() || '';
    try {
      if (action === 'download') {
        await ddb.send(new UpdateCommand({
          TableName: T.DOWNLOADS,
          Key: { filePath: data.path },
          UpdateExpression: 'ADD downloads :one SET fileName = :name, lastDownloadAt = :now',
          ExpressionAttributeValues: { ':one': 1, ':name': fileName, ':now': new Date().toISOString() },
        }));
      } else {
        await ddb.send(new UpdateCommand({
          TableName: T.DOWNLOADS,
          Key: { filePath: data.path },
          UpdateExpression: 'ADD #v :one SET fileName = :name, lastViewAt = :now',
          ExpressionAttributeNames: { '#v': 'views' },
          ExpressionAttributeValues: { ':one': 1, ':name': fileName, ':now': new Date().toISOString() },
        }));
      }
    } catch (trackErr) { console.error('Track error:', trackErr.message); }

    return res(200, { url: result.link, name: fileName });
  } catch (err) {
    console.error('Dropbox download error:', err);
    return res(500, { message: 'Erro ao gerar link', error: err.message });
  }
}

// --- Dropbox File Text (extract text from .doc/.docx) ---
async function dropboxFileText(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });
  if (!data.path) return res(400, { message: 'path obrigatorio.' });

  try {
    const token = await getDropboxToken();

    // Step 1: Get temporary link (same approach as dropboxDownload which works)
    const linkResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: dbxHeaders(token),
      body: JSON.stringify({ path: data.path }),
    });
    const linkResult = await linkResp.json();
    if (linkResult.error) return res(400, { message: 'Erro Dropbox', error: linkResult.error_summary });

    // Step 2: Download the file content via the temporary link
    const fileResp = await fetch(linkResult.link);
    if (!fileResp.ok) return res(400, { message: 'Erro ao baixar conteudo do arquivo' });

    const buffer = await fileResp.arrayBuffer();
    const ext = (data.path.split('.').pop() || '').toLowerCase();
    let text = '';

    if (ext === 'docx') {
      try {
        const zip = await JSZip.loadAsync(buffer);
        let docXml = null;
        const possiblePaths = ['word/document.xml', 'word/document2.xml', 'content.xml'];
        for (const p of possiblePaths) {
          const file = zip.file(p);
          if (file) { docXml = await file.async('text'); break; }
        }
        if (!docXml) {
          const wordFiles = Object.keys(zip.files).filter(f => f.startsWith('word/') && f.endsWith('.xml'));
          if (wordFiles.length > 0) {
            docXml = await zip.file(wordFiles[0])?.async('text');
          }
        }
        if (docXml) {
          const wtMatches = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
          if (wtMatches && wtMatches.length > 0) {
            text = wtMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').replace(/\s+/g, ' ').trim();
          } else {
            text = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
      } catch (zipErr) {
        console.error('JSZip error:', zipErr.message);
      }
    } else if (ext === 'txt') {
      text = new TextDecoder().decode(buffer);
    } else if (ext === 'doc') {
      const bytes = new Uint8Array(buffer);
      const chars = [];
      let seq = '';
      for (let i = 0; i < bytes.length && chars.length < 5000; i++) {
        if (bytes[i] >= 32 && bytes[i] <= 126) {
          seq += String.fromCharCode(bytes[i]);
        } else {
          if (seq.length > 3) chars.push(seq);
          seq = '';
        }
      }
      if (seq.length > 3) chars.push(seq);
      text = chars.join(' ').replace(/\s+/g, ' ').trim();
    }

    if (text.length > 3000) text = text.substring(0, 3000);

    // Use Bedrock AI to summarize the text into a brief description
    let summary = '';
    if (text.length > 30) {
      // Check if we already have a cached summary for this folder
      const folderPath = data.path.substring(0, data.path.lastIndexOf('/'));
      const cacheKey = '__FOLDER_SUMMARIES__';
      let cached = null;
      try {
        const cacheData = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: cacheKey } }));
        cached = cacheData.Item?.summaries?.[folderPath];
      } catch { /* ignore */ }

      if (cached && !data.regenerate) {
        summary = cached;
      } else {
        try {
          const summaryPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Voce e um assistente que cria resumos breves de materiais para igrejas. Responda APENAS com o resumo, sem prefixos como "Resumo:" ou "Esta mensagem...". Escreva em portugues do Brasil, em 2-3 frases curtas e objetivas que descrevam o conteudo principal da mensagem.<|eot_id|><|start_header_id|>user<|end_header_id|>
Resuma a mensagem abaixo em 2-3 frases curtas para ajudar alguem a entender do que se trata esta mensagem:

${text.substring(0, 2000)}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;
          const cmd = new InvokeModelCommand({
            modelId: 'us.meta.llama3-1-8b-instruct-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({ prompt: summaryPrompt, max_gen_len: 200, temperature: 0.2 }),
          });
          const aiResp = await bedrock.send(cmd);
          const aiResult = JSON.parse(new TextDecoder().decode(aiResp.body));
          summary = (aiResult.generation || '').trim();

          // Cache the summary
          if (summary) {
            try {
              const cacheData = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: cacheKey } }));
              const summaries = (cacheData.Item?.summaries) || {};
              summaries[folderPath] = summary;
              await ddb.send(new PutCommand({ TableName: T.VIDEO_TAGS, Item: { videoId: cacheKey, summaries, updatedAt: new Date().toISOString() } }));
            } catch { /* ignore cache write error */ }
          }
        } catch (aiErr) {
          console.error('Bedrock summary error:', aiErr.message);
          summary = text.substring(0, 300) + (text.length > 300 ? '...' : '');
        }
      }
    }

    return res(200, { path: data.path, text: summary || text.substring(0, 300), ext, textLength: text.length });
  } catch (err) {
    console.error('Dropbox file-text error:', err);
    return res(500, { message: 'Erro ao ler arquivo', error: err.message });
  }
}


// =============================================================================
// YOUTUBE
// =============================================================================
const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN || '';
const YT_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || '';
const YT_UPLOADS_PLAYLIST = YT_CHANNEL_ID ? 'UU' + YT_CHANNEL_ID.substring(2) : '';

async function ytGetAccessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${YT_CLIENT_ID}&client_secret=${YT_CLIENT_SECRET}&refresh_token=${YT_REFRESH_TOKEN}&grant_type=refresh_token`,
  });
  const data = await r.json();
  return data.access_token;
}

async function youtubeListVideos(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!YT_REFRESH_TOKEN) return res(500, { message: 'YouTube nao configurado.' });

  try {
    const token = await ytGetAccessToken();
    const pageToken = query.pageToken || '';
    const maxResults = Math.min(parseInt(query.limit) || 20, 50);

    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status,contentDetails&playlistId=${YT_UPLOADS_PLAYLIST}&maxResults=${maxResults}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await r.json();
    if (data.error) return res(400, { message: 'Erro YouTube', error: data.error.message });

    const videos = (data.items || []).map(item => {
      const s = item.snippet;
      const st = item.status || {};
      return {
        id: s.resourceId?.videoId || item.id,
        title: s.title,
        description: s.description || '',
        thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.standard?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
        publishedAt: s.publishedAt,
        privacy: st.privacyStatus || 'unknown',
        channelTitle: s.channelTitle,
      };
    }).filter(v => v.title !== 'Deleted video' && v.title !== 'Private video');

    return res(200, {
      videos,
      totalResults: data.pageInfo?.totalResults || 0,
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
    });
  } catch (err) {
    console.error('YouTube list error:', err);
    return res(500, { message: 'Erro YouTube', error: err.message });
  }
}

async function youtubeSearch(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!YT_REFRESH_TOKEN) return res(500, { message: 'YouTube nao configurado.' });
  if (!query.q) return res(400, { message: 'Parametro q obrigatorio.' });

  try {
    const token = await ytGetAccessToken();
    const q = encodeURIComponent(query.q);
    const maxResults = Math.min(parseInt(query.limit) || 20, 50);
    const pageToken = query.pageToken || '';

    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YT_CHANNEL_ID}&q=${q}&type=video&maxResults=${maxResults}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await r.json();
    if (data.error) return res(400, { message: 'Erro YouTube', error: data.error.message });

    const videos = (data.items || []).map(item => {
      const s = item.snippet;
      return {
        id: item.id?.videoId || item.id,
        title: s.title,
        description: s.description || '',
        thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.standard?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
        publishedAt: s.publishedAt,
        privacy: 'unknown',
        channelTitle: s.channelTitle,
      };
    });

    return res(200, {
      videos,
      totalResults: data.pageInfo?.totalResults || 0,
      nextPageToken: data.nextPageToken || null,
    });
  } catch (err) {
    console.error('YouTube search error:', err);
    return res(500, { message: 'Erro YouTube', error: err.message });
  }
}


// =============================================================================
// COMMENTS
// =============================================================================
async function commentsList(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!query.videoId) return res(400, { message: 'videoId obrigatorio.' });

  const data = await ddb.send(new ScanCommand({
    TableName: T.COMMENTS,
    FilterExpression: 'videoId = :v',
    ExpressionAttributeValues: { ':v': query.videoId },
  }));
  const items = (data.Items || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return res(200, items);
}

async function commentsCreate(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!data.videoId || !data.text) return res(400, { message: 'videoId e text obrigatorios.' });

  const comment = {
    id: uuid(),
    videoId: data.videoId,
    videoTitle: data.videoTitle || '',
    userId: user.id,
    userName: user.name,
    userPhoto: '',
    text: data.text.trim(),
    createdAt: new Date().toISOString(),
  };

  // Get user photo
  try {
    const userData = await ddb.send(new GetCommand({ TableName: T.USERS, Key: { id: user.id } }));
    if (userData.Item?.photoUrl) comment.userPhoto = userData.Item.photoUrl;
  } catch {}

  await ddb.send(new PutCommand({ TableName: T.COMMENTS, Item: comment }));

  // Notify all admins via internal message
  try {
    const usersData = await ddb.send(new ScanCommand({
      TableName: T.USERS,
      FilterExpression: '#r = :admin',
      ExpressionAttributeNames: { '#r': 'role' },
      ExpressionAttributeValues: { ':admin': 'admin' },
    }));
    const admins = usersData.Items || [];
    for (const admin of admins) {
      await ddb.send(new PutCommand({
        TableName: T.MESSAGES,
        Item: {
          id: uuid(),
          fromUserId: user.id,
          fromName: user.name,
          toUserId: admin.id,
          subject: `Novo comentario em: ${data.videoTitle || data.videoId}`,
          body: `${user.name} comentou:\n\n"${data.text.trim()}"`,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      }));
    }
  } catch (e) {
    console.error('Error notifying admins:', e.message);
  }

  return res(201, comment);
}


// =============================================================================
// YOUTUBE SMART SEARCH
// =============================================================================

// Synonym dictionary (Portuguese)
const SYNONYMS = {
  'adolescente': ['jovem', 'juventude', 'teen', 'adolescentes', 'jovens', 'adolescencia'],
  'jovem': ['adolescente', 'juventude', 'teen', 'jovens', 'adolescentes'],
  'crianca': ['infantil', 'kids', 'criancas', 'ministerio infantil', 'children'],
  'infantil': ['crianca', 'kids', 'criancas', 'children'],
  'lider': ['lideranca', 'lideres', 'leadership', 'gestor', 'gestao'],
  'lideranca': ['lider', 'lideres', 'leadership', 'gestao', 'gestor'],
  'pastor': ['pastoral', 'pastores', 'ministerio pastoral'],
  'casais': ['casal', 'matrimonio', 'casamento', 'conjugal'],
  'mulher': ['mulheres', 'feminino', 'feminina'],
  'homem': ['homens', 'masculino'],
  'pregacao': ['mensagem', 'sermao', 'pregacoes', 'mensagens', 'sermoes', 'culto'],
  'mensagem': ['pregacao', 'sermao', 'pregacoes', 'mensagens', 'sermoes'],
  'louvor': ['worship', 'adoracao', 'musica', 'musical'],
  'worship': ['louvor', 'adoracao', 'musica'],
  'celula': ['pequeno grupo', 'celulas', 'pequenos grupos', 'grupo pequeno'],
  'pequeno grupo': ['celula', 'celulas', 'pequenos grupos'],
  'discipulado': ['discipulo', 'discipulos', 'formacao', 'capacitacao'],
  'capacitacao': ['treinamento', 'formacao', 'curso', 'discipulado'],
  'treinamento': ['capacitacao', 'formacao', 'curso', 'treinar'],
  'mentoria': ['mentor', 'mentorias', 'coaching', 'acompanhamento'],
  'webinar': ['webinars', 'live', 'ao vivo', 'online'],
  'conferencia': ['congresso', 'evento', 'conference', 'encontro'],
  'evento': ['conferencia', 'congresso', 'encontro', 'retiro'],
  'retiro': ['retiros', 'acampamento', 'evento'],
  'missao': ['missoes', 'missionario', 'evangelismo', 'missional'],
  'evangelismo': ['evangelizar', 'missao', 'missoes', 'alcance'],
  'oracao': ['orar', 'intercessao', 'oracoes', 'jejum'],
  'biblia': ['biblico', 'biblica', 'escritura', 'estudo biblico', 'palavra'],
  'estudo': ['estudo biblico', 'estudos', 'aprendizado', 'ensino'],
  'familia': ['familiar', 'familias', 'lar', 'casa'],
  'igreja': ['igrejas', 'congregacao', 'comunidade', 'ministerio'],
  'ministerio': ['ministerios', 'servico', 'ministerial'],
  'plantacao': ['plantar', 'plantacao de igreja', 'church planting'],
  'proposito': ['propositos', '5 propositos', 'purpose'],
  'gestao': ['administracao', 'gerenciamento', 'organizacao', 'lideranca'],
  'financeiro': ['financas', 'dinheiro', 'oferta', 'dizimo', 'mordomia'],
  'saude': ['emocional', 'mental', 'burnout', 'cansaco', 'esgotamento'],
  'conflito': ['conflitos', 'crise', 'problema', 'dificuldade', 'desafio'],
  'crescimento': ['crescer', 'multiplicacao', 'expansao', 'desenvolvimento'],
  'voluntario': ['voluntarios', 'servir', 'servo', 'servico'],
  'comunicacao': ['comunicar', 'redes sociais', 'marketing', 'midia'],
  'domingo': ['culto', 'celebracao', 'programacao', 'liturgia'],
};

function normalize(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Gera variantes plural/singular de uma palavra em português
function getStemVariants(word) {
  const variants = new Set([word]);
  // Plural → singular
  if (word.endsWith('oes')) variants.add(word.slice(0, -3) + 'ao'); // mensagoes→mensagao (não comum mas seguro)
  if (word.endsWith('aes')) variants.add(word.slice(0, -3) + 'ao');
  if (word.endsWith('ais')) variants.add(word.slice(0, -2) + 'l'); // ministeriais→ministerial
  if (word.endsWith('eis')) variants.add(word.slice(0, -2) + 'l'); // possiveis→possivel
  if (word.endsWith('is') && !word.endsWith('ais') && !word.endsWith('eis')) variants.add(word.slice(0, -2) + 'l'); // jovens→jovel (edge case ok)
  if (word.endsWith('ns')) variants.add(word.slice(0, -2) + 'm'); // jovens→jovem, mensagens→mensagem
  if (word.endsWith('es') && !word.endsWith('oes') && !word.endsWith('aes')) variants.add(word.slice(0, -2)); // lideres→lider
  if (word.endsWith('s') && !word.endsWith('ns') && !word.endsWith('es')) variants.add(word.slice(0, -1)); // campanhas→campanha
  // Singular → plural
  if (word.endsWith('ao')) { variants.add(word.slice(0, -2) + 'oes'); variants.add(word.slice(0, -2) + 'aes'); } // mensagao→mensagoes
  if (word.endsWith('l')) variants.add(word.slice(0, -1) + 'is'); // ministerial→ministeriais
  if (word.endsWith('m')) variants.add(word.slice(0, -1) + 'ns'); // mensagem→mensagens, jovem→jovens
  if (word.endsWith('r') || word.endsWith('z')) variants.add(word + 'es'); // lider→lideres
  if (!word.endsWith('s') && !word.endsWith('l') && !word.endsWith('m') && !word.endsWith('r') && !word.endsWith('z')) variants.add(word + 's'); // campanha→campanhas
  return [...variants];
}

function extractKeywords(query) {
  const stopwords = new Set(['de','do','da','dos','das','em','no','na','nos','nas','um','uma','uns','umas',
    'o','a','os','as','e','ou','que','para','por','com','como','eu','me','meu','minha',
    'preciso','quero','gostaria','ajuda','sobre','ter','ser','estar','fazer','pode','tem',
    'muito','mais','menos','bem','bom','boa','qual','quais','onde','quando','porque']);
  const words = normalize(query).split(' ').filter(w => w.length > 2 && !stopwords.has(w));
  
  // Expand with plural/singular variants + synonyms
  const expanded = new Set(words);
  for (const word of words) {
    // Add plural/singular variants
    getStemVariants(word).forEach(v => expanded.add(v));
    // Add synonyms
    const syns = SYNONYMS[word];
    if (syns) syns.forEach(s => expanded.add(normalize(s)));
    // Also check if word is part of a synonym value
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (vals.some(v => normalize(v) === word)) {
        expanded.add(normalize(key));
        vals.forEach(v => expanded.add(normalize(v)));
      }
    }
    // Check stem variants against synonyms too
    for (const variant of getStemVariants(word)) {
      const varSyns = SYNONYMS[variant];
      if (varSyns) varSyns.forEach(s => expanded.add(normalize(s)));
    }
  }
  return [...expanded];
}

function scoreVideo(video, keywords) {
  const title = normalize(video.title);
  const desc = normalize(video.description || '');
  let score = 0;

  for (const kw of keywords) {
    // Exact match in title (highest weight)
    if (title.includes(kw)) score += 10;
    // Exact match in description
    if (desc.includes(kw)) score += 3;
    // Partial match in title (fuzzy)
    const titleWords = title.split(' ');
    for (const tw of titleWords) {
      if (tw.length > 3 && kw.length > 3) {
        if (tw.startsWith(kw.substring(0, 4)) || kw.startsWith(tw.substring(0, 4))) score += 2;
      }
    }
  }
  return score;
}

async function youtubeSmartSearch(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!YT_REFRESH_TOKEN) return res(500, { message: 'YouTube nao configurado.' });
  if (!query.q) return res(400, { message: 'Parametro q obrigatorio.' });

  try {
    const keywords = extractKeywords(query.q);
    if (keywords.length === 0) return res(200, { videos: [], totalResults: 0, query: query.q, keywords: [] });

    const token = await ytGetAccessToken();

    // Fetch multiple pages of videos to search through
    let allVideos = [];
    let pageToken = '';
    const maxPages = 3; // ~150 videos to search through

    for (let i = 0; i < maxPages; i++) {
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${YT_UPLOADS_PLAYLIST}&maxResults=50`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await r.json();
      if (data.error) break;

      const videos = (data.items || []).map(item => {
        const s = item.snippet;
        const st = item.status || {};
        return {
          id: s.resourceId?.videoId || item.id,
          title: s.title,
          description: s.description || '',
          thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.standard?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
          publishedAt: s.publishedAt,
          privacy: st.privacyStatus || 'unknown',
          channelTitle: s.channelTitle,
        };
      }).filter(v => v.title !== 'Deleted video' && v.title !== 'Private video');

      allVideos = allVideos.concat(videos);
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    // Score and rank
    const scored = allVideos.map(v => ({ ...v, score: scoreVideo(v, keywords) }))
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return res(200, {
      videos: scored,
      totalResults: scored.length,
      query: query.q,
      keywords,
    });
  } catch (err) {
    console.error('Smart search error:', err);
    return res(500, { message: 'Erro na busca', error: err.message });
  }
}


// --- Dropbox Smart Search (recursive with synonyms + fuzzy) ---
async function dropboxSmartSearch(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!DROPBOX_REFRESH_TOKEN) return res(500, { message: 'Dropbox nao configurado.' });
  if (!query.q) return res(400, { message: 'Parametro q obrigatorio.' });

  try {
    const keywords = extractKeywords(query.q);
    if (keywords.length === 0) return res(200, { entries: [], totalResults: 0, query: query.q, keywords: [] });

    const token = await getDropboxToken();

    // List all files recursively with pagination
    let allFiles = [];
    let allFolders = [];
    let hasMore = true;
    let cursor = null;
    const maxPages = 2;
    let pages = 0;

    while (hasMore && pages < maxPages) {
      const url = cursor
        ? 'https://api.dropboxapi.com/2/files/list_folder/continue'
        : 'https://api.dropboxapi.com/2/files/list_folder';
      const payload = cursor
        ? { cursor }
        : { path: '', recursive: true, limit: 2000 };
      const r = await fetch(url, {
        method: 'POST',
        headers: dbxHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.error) break;

      const files = (data.entries || []).filter(e => e['.tag'] === 'file');
      const folders = (data.entries || []).filter(e => e['.tag'] === 'folder');
      allFiles = allFiles.concat(files);
      allFolders = allFolders.concat(folders);
      hasMore = data.has_more;
      cursor = data.cursor;
      pages++;
    }

    // Score each file
    const scored = allFiles.map(file => {
      const name = normalize(file.name);
      const path = normalize(file.path_display || '');
      let score = 0;

      for (const kw of keywords) {
        if (name.includes(kw)) score += 10;
        if (path.includes(kw)) score += 3;
        // Fuzzy: partial match (starts with or contains substring of 3+ chars)
        const nameWords = name.split(/[\s\-_.]+/);
        for (const nw of nameWords) {
          if (nw.length > 2 && kw.length > 2) {
            if (nw.startsWith(kw.substring(0, Math.min(kw.length, 4)))) score += 4;
            else if (kw.startsWith(nw.substring(0, Math.min(nw.length, 4)))) score += 3;
            else if (nw.includes(kw) || kw.includes(nw)) score += 2;
          }
        }
      }
      return { file, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

    // Score folders too
    const scoredFolders = allFolders.map(folder => {
      const name = normalize(folder.name);
      const path = normalize(folder.path_display || '');
      let score = 0;
      for (const kw of keywords) {
        if (name.includes(kw)) score += 12;
        if (path.includes(kw)) score += 3;
        const nameWords = name.split(/[\s\-_.]+/);
        for (const nw of nameWords) {
          if (nw.length > 2 && kw.length > 2) {
            if (nw.startsWith(kw.substring(0, Math.min(kw.length, 4)))) score += 5;
            else if (kw.startsWith(nw.substring(0, Math.min(nw.length, 4)))) score += 4;
            else if (nw.includes(kw) || kw.includes(nw)) score += 3;
          }
        }
      }
      return { folder, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

    // Format results
    const entries = scored.map(s => {
      const f = s.file;
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      let fileType = 'other';
      if (['mp4','mov','avi','mkv','webm'].includes(ext)) fileType = 'video';
      else if (['mp3','wav','ogg','m4a','aac'].includes(ext)) fileType = 'audio';
      else if (ext === 'pdf') fileType = 'pdf';
      else if (['doc','docx','txt','rtf'].includes(ext)) fileType = 'document';
      else if (['ppt','pptx'].includes(ext)) fileType = 'presentation';
      else if (['xls','xlsx','csv'].includes(ext)) fileType = 'spreadsheet';
      else if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) fileType = 'image';
      else if (['zip','rar','7z','tar','gz'].includes(ext)) fileType = 'archive';

      const rel = f.path_display.substring(1);
      const parts = rel.split('/');
      const folder = parts.length > 1 ? parts.slice(0, -1).join(' / ') : '';

      return {
        tag: 'file',
        name: f.name,
        path: f.path_display,
        pathLower: f.path_lower,
        id: f.id,
        size: f.size || 0,
        modified: f.server_modified || '',
        fileType,
        ext,
        folder,
        score: s.score,
      };
    });

    return res(200, { entries, totalResults: entries.length, query: query.q, keywords,
      folders: scoredFolders.map(s => ({
        tag: 'folder',
        name: s.folder.name,
        path: s.folder.path_display,
        pathLower: s.folder.path_lower,
        id: s.folder.id,
        score: s.score,
      }))
    });
  } catch (err) {
    console.error('Dropbox smart search error:', err);
    return res(500, { message: 'Erro na busca', error: err.message });
  }
}


// =============================================================================
// VIDEO TAGS
// =============================================================================
async function videoTagsGet(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!query.videoId) return res(400, { message: 'videoId obrigatorio.' });
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: query.videoId } }));
  return res(200, data.Item || { videoId: query.videoId, tags: [] });
}

async function videoTagsSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem gerenciar tags.' });
  if (!data.videoId) return res(400, { message: 'videoId obrigatorio.' });
  const tags = (data.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);
  const item = { videoId: data.videoId, tags, updatedAt: new Date().toISOString(), updatedBy: user.id };
  await ddb.send(new PutCommand({ TableName: T.VIDEO_TAGS, Item: item }));
  return res(200, item);
}

async function videoTagsAll(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.VIDEO_TAGS }));
  const items = data.Items || [];
  // Build a map of videoId -> tags and a set of all unique tags
  const tagMap = {};
  const allTags = new Set();
  for (const item of items) {
    tagMap[item.videoId] = item.tags || [];
    (item.tags || []).forEach(t => allTags.add(t));
  }
  return res(200, { tagMap, allTags: [...allTags].sort() });
}

// =============================================================================
// VIDEO CATEGORIES (catalog rows — admin-managed)
// =============================================================================
// Uses a single item in VIDEO_TAGS table with videoId = '__CATALOG_CATEGORIES__'
// Structure: { videoId: '__CATALOG_CATEGORIES__', assignments: { videoId: [cat1, cat2, ...] } }

const CATALOG_CATEGORIES_KEY = '__CATALOG_CATEGORIES__';

async function videoCategoriesGetAll(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: CATALOG_CATEGORIES_KEY } }));
  const assignments = (data.Item && data.Item.assignments) || {};
  return res(200, { assignments });
}

async function videoCategoriesSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem gerenciar categorias do catalogo.' });
  if (!data.videoId || !data.categories) return res(400, { message: 'videoId e categories obrigatorios.' });
  const videoId = data.videoId;
  const categories = Array.isArray(data.categories) ? data.categories : [];

  // Get current assignments
  const current = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: CATALOG_CATEGORIES_KEY } }));
  const assignments = (current.Item && current.Item.assignments) || {};

  if (categories.length === 0) {
    delete assignments[videoId];
  } else {
    assignments[videoId] = categories;
  }

  await ddb.send(new PutCommand({
    TableName: T.VIDEO_TAGS,
    Item: { videoId: CATALOG_CATEGORIES_KEY, assignments, updatedAt: new Date().toISOString(), updatedBy: user.id }
  }));

  return res(200, { videoId, categories, assignments });
}

// =============================================================================
// FOLDER VIDEOS (admin links YouTube videos to material folders)
// =============================================================================
// Uses VIDEO_TAGS table with videoId = '__FOLDER_VIDEOS__'
// Structure: { videoId: '__FOLDER_VIDEOS__', folders: { "/path/to/folder": [{ id, title, thumbnail }] } }

const FOLDER_VIDEOS_KEY = '__FOLDER_VIDEOS__';

async function folderVideosGet(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const folderPath = query.folder || '';
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_VIDEOS_KEY } }));
  const folders = (data.Item && data.Item.folders) || {};
  if (folderPath) {
    return res(200, { folder: folderPath, videos: folders[folderPath] || [] });
  }
  return res(200, { folders });
}

async function folderVideosSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem vincular videos a pastas.' });
  if (!data.folder) return res(400, { message: 'folder obrigatorio.' });
  const folder = data.folder;
  const videos = Array.isArray(data.videos) ? data.videos : [];

  // Get current
  const current = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_VIDEOS_KEY } }));
  const folders = (current.Item && current.Item.folders) || {};

  if (videos.length === 0) {
    delete folders[folder];
  } else {
    folders[folder] = videos;
  }

  await ddb.send(new PutCommand({
    TableName: T.VIDEO_TAGS,
    Item: { videoId: FOLDER_VIDEOS_KEY, folders, updatedAt: new Date().toISOString(), updatedBy: user.id }
  }));

  return res(200, { folder, videos });
}

// =============================================================================
// FOLDER THUMBNAILS (admin custom thumbs for material folders)
// =============================================================================
const FOLDER_THUMBNAILS_KEY = '__FOLDER_THUMBNAILS__';

async function folderThumbnailsGet(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const thumbnails = {};

  // Paginated scan for FTHUMB# items
  let lastKey = undefined;
  do {
    const params = {
      TableName: T.VIDEO_TAGS,
      FilterExpression: 'begins_with(videoId, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'FTHUMB#' },
      ProjectionExpression: 'videoId, thumbnailUrl',
      ExclusiveStartKey: lastKey,
    };
    const data = await ddb.send(new ScanCommand(params));
    for (const item of (data.Items || [])) {
      const folderPath = item.videoId.replace('FTHUMB#', '');
      if (item.thumbnailUrl) thumbnails[folderPath] = item.thumbnailUrl;
    }
    lastKey = data.LastEvaluatedKey;
  } while (lastKey);

  // Also check legacy single-item format
  const legacy = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_THUMBNAILS_KEY } }));
  if (legacy.Item && legacy.Item.thumbnails) {
    for (const [k, v] of Object.entries(legacy.Item.thumbnails)) {
      if (!thumbnails[k] && v) thumbnails[k] = v;
    }
  }
  return res(200, { thumbnails });
}

async function folderThumbnailSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem alterar thumbnails de pastas.' });
  if (!data.folder) return res(400, { message: 'folder obrigatorio.' });

  const key = `FTHUMB#${data.folder}`;
  if (data.thumbnailUrl) {
    await ddb.send(new PutCommand({
      TableName: T.VIDEO_TAGS,
      Item: { videoId: key, thumbnailUrl: data.thumbnailUrl, updatedAt: new Date().toISOString(), updatedBy: user.id }
    }));
  } else {
    await ddb.send(new DeleteCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: key } }));
  }

  return res(200, { folder: data.folder, thumbnailUrl: data.thumbnailUrl || null });
}

// =============================================================================
// FOLDER TAGS (admin tags for material folders - improves search)
// =============================================================================
const FOLDER_TAGS_KEY = '__FOLDER_TAGS__';

async function folderTagsGet(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_TAGS_KEY } }));
  const tagMap = (data.Item && data.Item.tagMap) || {};
  if (query.folder) {
    return res(200, { folder: query.folder, tags: tagMap[query.folder] || [] });
  }
  return res(200, { tagMap });
}

async function folderTagsSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem gerenciar tags de pastas.' });
  if (!data.folder) return res(400, { message: 'folder obrigatorio.' });
  const tags = (data.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);
  const description = data.description || '';

  const current = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_TAGS_KEY } }));
  const tagMap = (current.Item && current.Item.tagMap) || {};
  const descMap = (current.Item && current.Item.descMap) || {};

  if (tags.length === 0) {
    delete tagMap[data.folder];
  } else {
    tagMap[data.folder] = tags;
  }

  if (description) {
    descMap[data.folder] = description;
  } else {
    delete descMap[data.folder];
  }

  await ddb.send(new PutCommand({
    TableName: T.VIDEO_TAGS,
    Item: { videoId: FOLDER_TAGS_KEY, tagMap, descMap, updatedAt: new Date().toISOString(), updatedBy: user.id }
  }));

  return res(200, { folder: data.folder, tags, description });
}

async function folderTagsAll(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  // Read from legacy main item
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_TAGS, Key: { videoId: FOLDER_TAGS_KEY } }));
  const tagMap = (data.Item && data.Item.tagMap) || {};
  const descMap = (data.Item && data.Item.descMap) || {};

  // Paginated scan for individual FTAG# items
  let lastKey = undefined;
  do {
    const params = {
      TableName: T.VIDEO_TAGS,
      FilterExpression: 'begins_with(videoId, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'FTAG#' },
      ProjectionExpression: 'videoId, tags, description',
      ExclusiveStartKey: lastKey,
    };
    const scan = await ddb.send(new ScanCommand(params));
    for (const item of (scan.Items || [])) {
      const folderPath = item.videoId.replace('FTAG#', '');
      if (!tagMap[folderPath] || tagMap[folderPath].length === 0) {
        tagMap[folderPath] = item.tags || [];
      }
      if (item.description && !descMap[folderPath]) descMap[folderPath] = item.description;
    }
    lastKey = scan.LastEvaluatedKey;
  } while (lastKey);

  const allTags = new Set();
  Object.values(tagMap).forEach(tags => (tags || []).forEach(t => allTags.add(t)));
  return res(200, { tagMap, descMap, allTags: [...allTags].sort() });
}

// Generate tags for all folders automatically — saves each as individual FTAG# item
async function folderTagsGenerate(user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas admin.' });

  try {
    const token = await getDropboxToken();
    let allFolders = [];
    let hasMore = true;
    let cursor = null;
    while (hasMore) {
      const url = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';
      const payload = cursor ? { cursor } : { path: '', recursive: true, limit: 2000 };
      const r = await fetch(url, { method: 'POST', headers: dbxHeaders(token), body: JSON.stringify(payload) });
      const data = await r.json();
      if (data.error) break;
      allFolders = allFolders.concat((data.entries || []).filter(e => e['.tag'] === 'folder'));
      hasMore = data.has_more;
      cursor = data.cursor;
    }

    const tagRules = [
      { keywords: ['mensagem', 'mensagens', 'pregacao', 'sermao'], tags: ['mensagem', 'pregação'] },
      { keywords: ['louvor', 'worship', 'musica', 'adoracao'], tags: ['louvor', 'worship'] },
      { keywords: ['lideranca', 'lider', 'lideres', 'gestao'], tags: ['liderança', 'gestão'] },
      { keywords: ['crianca', 'criancas', 'kids', 'infantil'], tags: ['crianças', 'infantil'] },
      { keywords: ['jovem', 'jovens', 'juventude', 'adolescente', 'teen'], tags: ['jovens'] },
      { keywords: ['mulher', 'mulheres', 'feminino'], tags: ['mulheres'] },
      { keywords: ['homem', 'homens', 'masculino'], tags: ['homens'] },
      { keywords: ['casais', 'casal', 'casamento', 'matrimonio'], tags: ['casais'] },
      { keywords: ['celula', 'celulas', 'pequeno grupo', 'pequenos grupos'], tags: ['células', 'pequenos grupos'] },
      { keywords: ['financ', 'dinheiro', 'oferta', 'dizimo', 'mordomia'], tags: ['finanças'] },
      { keywords: ['missao', 'missoes', 'evangelismo'], tags: ['missões'] },
      { keywords: ['oracao', 'intercessao', 'jejum'], tags: ['oração'] },
      { keywords: ['discipulado', 'discipulo', 'formacao', 'capacitacao'], tags: ['discipulado'] },
      { keywords: ['familia', 'familiar'], tags: ['família'] },
      { keywords: ['retiro', 'retiros', 'acampamento'], tags: ['retiro'] },
      { keywords: ['evento', 'eventos', 'conferencia', 'congresso'], tags: ['eventos'] },
      { keywords: ['webinar', 'webinars', 'live'], tags: ['webinar'] },
      { keywords: ['mentoria', 'mentorias', 'mentor'], tags: ['mentoria'] },
      { keywords: ['voluntario', 'voluntarios', 'servir'], tags: ['voluntariado'] },
      { keywords: ['comunicacao', 'midia', 'marketing'], tags: ['comunicação'] },
      { keywords: ['saude', 'emocional', 'burnout', 'mental'], tags: ['saúde emocional'] },
      { keywords: ['proposito', 'propositos'], tags: ['propósitos'] },
      { keywords: ['eleve', 'inspire leaders', 'leaders', 'treinamento'], tags: ['treinamento'] },
      { keywords: ['serie'], tags: ['série'] },
      { keywords: ['campanha', 'campanhas'], tags: ['campanha'] },
      { keywords: ['domingo', 'culto', 'celebracao'], tags: ['culto'] },
    ];

    // Check which folders already have tags (FTAG# items)
    const existingScan = await ddb.send(new ScanCommand({
      TableName: T.VIDEO_TAGS,
      FilterExpression: 'begins_with(videoId, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'FTAG#' },
      ProjectionExpression: 'videoId'
    }));
    const existingPaths = new Set((existingScan.Items || []).map(i => i.videoId.replace('FTAG#', '')));

    let generated = 0;
    // Save in batches of 25 (DynamoDB BatchWrite limit)
    let batch = [];
    for (const folder of allFolders) {
      const folderPath = folder.path_display;
      if (existingPaths.has(folderPath)) continue;

      const name = normalize(folder.name);
      const pathNorm = normalize(folder.path_display);
      const tags = new Set();

      for (const rule of tagRules) {
        if (rule.keywords.some(kw => name.includes(kw) || pathNorm.includes(kw))) {
          rule.tags.forEach(t => tags.add(t));
        }
      }

      if (tags.size > 0) {
        batch.push({ PutRequest: { Item: { videoId: `FTAG#${folderPath}`, tags: [...tags], updatedAt: new Date().toISOString() } } });
        generated++;

        if (batch.length >= 25) {
          await ddb.send(new BatchWriteCommand({ RequestItems: { [T.VIDEO_TAGS]: batch } }));
          batch = [];
        }
      }
    }
    // Write remaining
    if (batch.length > 0) {
      await ddb.send(new BatchWriteCommand({ RequestItems: { [T.VIDEO_TAGS]: batch } }));
    }

    return res(200, { message: `Tags geradas para ${generated} pastas de ${allFolders.length} total.`, generated, totalFolders: allFolders.length });
  } catch (err) {
    console.error('Generate tags error:', err);
    return res(500, { message: 'Erro ao gerar tags: ' + err.message });
  }
}

// ---- Custom Video Thumbnails ----
async function videoThumbnailSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem alterar thumbnails.' });
  if (!data.videoId || !data.thumbnailUrl) return res(400, { message: 'videoId e thumbnailUrl obrigatorios.' });
  // Save custom thumbnail in the VideoTags table (adds/updates customThumbnail field)
  await ddb.send(new UpdateCommand({
    TableName: T.VIDEO_TAGS,
    Key: { videoId: data.videoId },
    UpdateExpression: 'SET customThumbnail = :url, thumbnailUpdatedAt = :ts, thumbnailUpdatedBy = :by',
    ExpressionAttributeValues: { ':url': data.thumbnailUrl, ':ts': new Date().toISOString(), ':by': user.id },
  }));
  return res(200, { ok: true, videoId: data.videoId, customThumbnail: data.thumbnailUrl });
}

async function videoThumbnailDelete(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem alterar thumbnails.' });
  if (!data.videoId) return res(400, { message: 'videoId obrigatorio.' });
  await ddb.send(new UpdateCommand({
    TableName: T.VIDEO_TAGS,
    Key: { videoId: data.videoId },
    UpdateExpression: 'REMOVE customThumbnail, thumbnailUpdatedAt, thumbnailUpdatedBy',
  }));
  return res(200, { ok: true, videoId: data.videoId });
}

async function videoThumbnailsAll(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.VIDEO_TAGS, FilterExpression: 'attribute_exists(customThumbnail)' }));
  const map = {};
  for (const item of (data.Items || [])) {
    if (item.customThumbnail) map[item.videoId] = item.customThumbnail;
  }
  return res(200, { thumbnails: map });
}


// =============================================================================
// VIDEO RECOMMENDATIONS
// =============================================================================
async function videoRecsGet(query, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!query.videoId) return res(400, { message: 'videoId obrigatorio.' });
  const data = await ddb.send(new GetCommand({ TableName: T.VIDEO_RECS, Key: { videoId: query.videoId } }));
  return res(200, data.Item || { videoId: query.videoId, items: [] });
}

async function videoRecsSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem gerenciar indicacoes.' });
  if (!data.videoId) return res(400, { message: 'videoId obrigatorio.' });

  // Get existing or create new
  const existing = await ddb.send(new GetCommand({ TableName: T.VIDEO_RECS, Key: { videoId: data.videoId } }));
  const current = existing.Item || { videoId: data.videoId, items: [] };

  // Add new item
  const newItem = {
    id: uuid(),
    type: data.type || 'external', // 'external', 'video', 'material'
    title: data.title || '',
    description: data.description || '',
    url: data.url || '',
    imageUrl: data.imageUrl || '',
    videoId: data.linkedVideoId || '',
    materialPath: data.materialPath || '',
    createdAt: new Date().toISOString(),
  };

  current.items = [...(current.items || []), newItem];
  current.updatedAt = new Date().toISOString();
  current.updatedBy = user.id;

  await ddb.send(new PutCommand({ TableName: T.VIDEO_RECS, Item: current }));
  return res(201, newItem);
}

async function videoRecsDeleteItem(videoId, query, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores.' });
  const itemId = query.itemId;
  if (!itemId) return res(400, { message: 'itemId obrigatorio.' });

  const existing = await ddb.send(new GetCommand({ TableName: T.VIDEO_RECS, Key: { videoId } }));
  if (!existing.Item) return res(404, { message: 'Nao encontrado.' });

  existing.Item.items = (existing.Item.items || []).filter(i => i.id !== itemId);
  await ddb.send(new PutCommand({ TableName: T.VIDEO_RECS, Item: existing.Item }));
  return res(200, { ok: true });
}


// --- Dropbox Track Download (manual tracking) ---
async function dropboxTrackDownload(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!data.path) return res(400, { message: 'path obrigatorio.' });
  const fileName = data.fileName || data.path.split('/').pop() || '';
  await ddb.send(new UpdateCommand({
    TableName: T.DOWNLOADS,
    Key: { filePath: data.path },
    UpdateExpression: 'SET downloads = if_not_exists(downloads, :zero) + :one, fileName = :name, lastDownloadAt = :now',
    ExpressionAttributeValues: { ':zero': 0, ':one': 1, ':name': fileName, ':now': new Date().toISOString() },
  }));
  return res(200, { ok: true });
}

// --- Dropbox Top Downloads ---
async function dropboxTopDownloads(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new ScanCommand({ TableName: T.DOWNLOADS }));

  // Aggregate downloads by parent folder
  const folderDownloads = {};
  for (const item of (data.Items || [])) {
    const parts = (item.filePath || '').split('/');
    if (parts.length < 2) continue;
    const folderPath = parts.slice(0, -1).join('/');
    const folderName = parts[parts.length - 2] || folderPath;
    if (!folderDownloads[folderPath]) {
      folderDownloads[folderPath] = { folderPath, folderName, downloads: 0 };
    }
    folderDownloads[folderPath].downloads += (item.downloads || 0);
  }

  const items = Object.values(folderDownloads)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 10)
    .map((item, i) => ({
      rank: i + 1,
      folderPath: item.folderPath,
      folderName: item.folderName,
      downloads: item.downloads,
    }));

  return res(200, items);
}


// --- Trail Approve (admin only) ---
async function trailApprove(trailId, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem aprovar trilhas.' });
  await ddb.send(new UpdateCommand({
    TableName: T.TRAILS, Key: { id: trailId },
    UpdateExpression: 'SET #s = :s, approvedAt = :now, approvedBy = :by',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': 'approved', ':now': new Date().toISOString(), ':by': user.id },
  }));
  return res(200, { ok: true });
}


// =============================================================================
// BANNER / ANNOUNCEMENTS
// =============================================================================
async function bannerGet(user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  const data = await ddb.send(new GetCommand({ TableName: T.CONTENT, Key: { id: '__BANNER__' } }));
  const banner = data.Item;
  if (!banner || !banner.active) return res(200, { active: false });
  // Check expiration
  if (banner.expiresAt && new Date(banner.expiresAt) < new Date()) return res(200, { active: false });
  return res(200, { active: true, message: banner.message || '', type: banner.bannerType || 'info', createdAt: banner.createdAt });
}

async function bannerSave(data, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores.' });
  const item = {
    id: '__BANNER__',
    active: !!data.active,
    message: data.message || '',
    bannerType: data.type || 'info',
    expiresAt: data.expiresAt || null,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  };
  await ddb.send(new PutCommand({ TableName: T.CONTENT, Item: item }));
  return res(200, { ok: true });
}


// =============================================================================
// ADMIN ANALYTICS
// =============================================================================
async function adminAnalytics(user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores.' });

  try {
    // Fetch all data in parallel
    const [usersData, trailsData, progressData, contentData, downloadsData, churchesData] = await Promise.all([
      ddb.send(new ScanCommand({ TableName: T.USERS })),
      ddb.send(new ScanCommand({ TableName: T.TRAILS })),
      ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS })),
      ddb.send(new ScanCommand({ TableName: T.CONTENT })),
      ddb.send(new ScanCommand({ TableName: T.DOWNLOADS })),
      ddb.send(new ScanCommand({ TableName: T.CHURCHES })),
    ]);

    const users = usersData.Items || [];
    const trails = trailsData.Items || [];
    const progress = progressData.Items || [];
    const content = contentData.Items || [];
    const downloads = downloadsData.Items || [];
    const churches = churchesData.Items || [];

    // --- Users ---
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const blockedUsers = users.filter(u => u.status === 'blocked').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const pastors = users.filter(u => u.role === 'pastor_presidente').length;
    const leaders = users.filter(u => u.role === 'lider').length;

    // --- Users by church ---
    const usersByChurch = {};
    users.forEach(u => {
      const cId = u.churchId || 'sem-igreja';
      if (!usersByChurch[cId]) usersByChurch[cId] = { count: 0, churchName: '' };
      usersByChurch[cId].count++;
    });
    churches.forEach(c => {
      if (usersByChurch[c.id]) usersByChurch[c.id].churchName = c.name;
    });
    const churchRanking = Object.entries(usersByChurch)
      .map(([id, data]) => ({ churchId: id, churchName: data.churchName || 'Sem igreja', users: data.count }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    // --- Top content by views ---
    const topContent = content
      .filter(c => c.id !== '__BANNER__' && c.views > 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(c => ({ title: c.title, views: c.views || 0, type: c.type }));

    // --- Top downloads ---
    const topDownloads = downloads
      .filter(d => (d.downloads || 0) > 0)
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 10)
      .map((d, i) => ({ rank: i + 1, fileName: d.fileName || d.filePath, downloads: d.downloads || 0, views: d.views || 0 }));

    const topViewed = downloads
      .filter(d => (d.views || 0) > 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map((d, i) => ({ rank: i + 1, fileName: d.fileName || d.filePath, views: d.views || 0, downloads: d.downloads || 0 }));

    // --- Trails ---
    const totalTrails = trails.length;
    const approvedTrails = trails.filter(t => !t.status || t.status === 'approved').length;
    const pendingTrails = trails.filter(t => t.status === 'pending').length;

    // Trail progress stats
    const totalEnrollments = progress.length;
    const completedEnrollments = progress.filter(p => p.completedAt).length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Most popular trails (by enrollments)
    const trailEnrollments = {};
    progress.forEach(p => {
      const tId = p.trailId;
      if (!trailEnrollments[tId]) trailEnrollments[tId] = { enrolled: 0, completed: 0 };
      trailEnrollments[tId].enrolled++;
      if (p.completedAt) trailEnrollments[tId].completed++;
    });
    const popularTrails = Object.entries(trailEnrollments)
      .map(([trailId, data]) => {
        const trail = trails.find(t => t.id === trailId);
        return { trailId, title: trail?.title || 'Trilha removida', enrolled: data.enrolled, completed: data.completed };
      })
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 10);

    // --- Top users by points ---
    const topUsers = users
      .filter(u => (u.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map((u, i) => ({ rank: i + 1, name: u.name, points: u.points || 0, role: u.role, churchId: u.churchId }));

    return res(200, {
      users: { total: totalUsers, active: activeUsers, blocked: blockedUsers, admins, pastors, leaders },
      churchRanking,
      topContent,
      topDownloads,
      topViewed,
      trails: { total: totalTrails, approved: approvedTrails, pending: pendingTrails, enrollments: totalEnrollments, completed: completedEnrollments, completionRate },
      popularTrails,
      topUsers,
      totalChurches: churches.length,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res(500, { message: 'Erro ao gerar analytics', error: err.message });
  }
}


// =============================================================================
// ADMIN REPORTS
// =============================================================================
async function adminReports(query, user) {
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores.' });
  const report = query.report;

  const [usersData, downloadsData, progressData, trailsData, churchesData] = await Promise.all([
    ddb.send(new ScanCommand({ TableName: T.USERS })),
    ddb.send(new ScanCommand({ TableName: T.DOWNLOADS })),
    ddb.send(new ScanCommand({ TableName: T.TRAIL_PROGRESS })),
    ddb.send(new ScanCommand({ TableName: T.TRAILS })),
    ddb.send(new ScanCommand({ TableName: T.CHURCHES })),
  ]);
  const users = usersData.Items || [];
  const downloads = downloadsData.Items || [];
  const progress = progressData.Items || [];
  const trails = trailsData.Items || [];
  const churches = churchesData.Items || [];

  const churchMap = {};
  churches.forEach(c => { churchMap[c.id] = c.name; });

  if (report === 'active-users') {
    const sorted = users.filter(u => (u.points || 0) > 0).sort((a, b) => (b.points || 0) - (a.points || 0));
    return res(200, { title: 'Usuários mais ativos', data: sorted.map((u, i) => ({ rank: i+1, nome: u.name, email: u.email, pontos: u.points || 0, papel: u.role, igreja: churchMap[u.churchId] || '' })) });
  }

  if (report === 'inactive-users') {
    const inactive = users.filter(u => !u.points || u.points === 0);
    return res(200, { title: 'Usuários que não estão acessando', data: inactive.map(u => ({ nome: u.name, email: u.email, papel: u.role, igreja: churchMap[u.churchId] || '', status: u.status })) });
  }

  if (report === 'top-downloaders') {
    // Count downloads per user (we don't track per-user yet, so use points as proxy)
    const sorted = users.filter(u => (u.points || 0) > 0).sort((a, b) => (b.points || 0) - (a.points || 0));
    return res(200, { title: 'Quem mais baixou materiais', data: sorted.slice(0, 30).map((u, i) => ({ rank: i+1, nome: u.name, email: u.email, igreja: churchMap[u.churchId] || '', pontos: u.points || 0 })) });
  }

  if (report === 'top-materials') {
    const sorted = downloads.filter(d => (d.downloads || 0) > 0).sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    return res(200, { title: 'Materiais mais baixados', data: sorted.slice(0, 30).map((d, i) => {
      const parts = (d.filePath || '').split('/');
      const folder = parts.length > 2 ? parts.slice(1, -1).join(' / ') : '';
      return { rank: i+1, arquivo: d.fileName || '', pasta: folder, downloads: d.downloads || 0, visualizacoes: d.views || 0 };
    }) });
  }

  if (report === 'top-trainings') {
    const trailEnroll = {};
    progress.forEach(p => {
      if (!trailEnroll[p.trailId]) trailEnroll[p.trailId] = { enrolled: 0, completed: 0 };
      trailEnroll[p.trailId].enrolled++;
      if (p.completedAt) trailEnroll[p.trailId].completed++;
    });
    const sorted = Object.entries(trailEnroll).map(([id, data]) => {
      const trail = trails.find(t => t.id === id);
      return { trilha: trail?.title || 'Removida', inscritos: data.enrolled, concluidos: data.completed, taxa: data.enrolled > 0 ? Math.round((data.completed / data.enrolled) * 100) + '%' : '0%' };
    }).sort((a, b) => b.inscritos - a.inscritos);
    return res(200, { title: 'Treinamentos mais assistidos', data: sorted.slice(0, 30) });
  }

  if (report === 'churches-downloads') {
    // Aggregate downloads by church (using user churchId from downloads - we need to approximate)
    const churchDownloads = {};
    churches.forEach(c => { churchDownloads[c.id] = { name: c.name, downloads: 0 }; });
    // Since we don't track which user downloaded, use user count * avg as proxy
    // For now, show churches with most users as most active
    users.forEach(u => {
      if (u.churchId && churchDownloads[u.churchId]) {
        churchDownloads[u.churchId].downloads += (u.points || 0);
      }
    });
    const sorted = Object.values(churchDownloads).filter(c => c.downloads > 0).sort((a, b) => b.downloads - a.downloads);
    return res(200, { title: 'Igrejas que mais baixam materiais', data: sorted.map((c, i) => ({ rank: i+1, igreja: c.name, engajamento: c.downloads })) });
  }

  if (report === 'categories-downloads') {
    const catCount = {};
    downloads.filter(d => (d.downloads || 0) > 0).forEach(d => {
      const parts = (d.filePath || '').split('/');
      const cat = parts[1] || 'Outros';
      if (!catCount[cat]) catCount[cat] = 0;
      catCount[cat] += (d.downloads || 0);
    });
    const sorted = Object.entries(catCount).map(([cat, count]) => ({ categoria: cat, downloads: count })).sort((a, b) => b.downloads - a.downloads);
    return res(200, { title: 'Categorias de materiais mais baixados', data: sorted });
  }

  return res(400, { message: 'Relatório não encontrado. Use: active-users, inactive-users, top-downloaders, top-materials, top-trainings, churches-downloads, categories-downloads' });
}


// =============================================================================
// AI ASSISTANT (Amazon Bedrock) - Search-first approach
// =============================================================================

async function assistantChat(data, user) {
  if (!user) return res(401, { message: 'Nao autenticado' });
  if (!data.message) return res(400, { message: 'message obrigatoria.' });

  try {
    const userMessage = data.message.trim();
    
    // 1. First, search for relevant content using our smart search logic
    const searchKeywords = extractKeywords(userMessage);
    
    // If too few keywords, ask for more context
    if (searchKeywords.length === 0 || userMessage.length < 10) {
      return res(200, { reply: 'Pode me dar mais detalhes sobre o que voce esta procurando? Por exemplo, qual tema, publico-alvo ou tipo de conteudo voce precisa?' });
    }

    // 2. Search videos
    const token = await ytGetAccessToken();
    let allVideos = [];
    let pageToken = '';
    for (let i = 0; i < 10; i++) {
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YT_UPLOADS_PLAYLIST}&maxResults=50`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const ytRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const ytData = await ytRes.json();
      if (ytData.error) break;
      const items = (ytData.items || []).filter(i => i.snippet.title !== 'Deleted video' && i.snippet.title !== 'Private video');
      allVideos = allVideos.concat(items);
      pageToken = ytData.nextPageToken;
      if (!pageToken) break;
    }

    // Score videos by relevance
    const scoredVideos = allVideos.map(v => {
      const title = normalize(v.snippet.title);
      const desc = normalize(v.snippet.description || '');
      let score = 0;
      for (const kw of searchKeywords) {
        if (title.includes(kw)) score += 10;
        if (desc.includes(kw)) score += 3;
        const titleWords = title.split(/[\s\-|,]+/);
        for (const tw of titleWords) {
          if (tw.length > 3 && kw.length > 3 && (tw.startsWith(kw.substring(0, 4)) || kw.startsWith(tw.substring(0, 4)))) score += 2;
        }
      }
      return { ...v, score };
    }).filter(v => v.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);

    // 3. Search materials
    let scoredMaterials = [];
    try {
      const dbxToken = await getDropboxToken();
      let allFiles = [];
      let hasMore = true;
      let cursor = null;
      let pages = 0;
      while (hasMore && pages < 2) {
        const url = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';
        const payload = cursor ? { cursor } : { path: '', recursive: true, limit: 2000 };
        const r = await fetch(url, { method: 'POST', headers: dbxHeaders(dbxToken), body: JSON.stringify(payload) });
        const d = await r.json();
        if (d.error) break;
        allFiles = allFiles.concat((d.entries || []).filter(e => e['.tag'] === 'file'));
        hasMore = d.has_more;
        cursor = d.cursor;
        pages++;
      }
      scoredMaterials = allFiles.map(f => {
        const name = normalize(f.name);
        const path = normalize(f.path_display || '');
        let score = 0;
        for (const kw of searchKeywords) {
          if (name.includes(kw)) score += 10;
          if (path.includes(kw)) score += 3;
          const nameWords = name.split(/[\s\-_.]+/);
          for (const nw of nameWords) {
            if (nw.length > 3 && kw.length > 3 && (nw.startsWith(kw.substring(0, 4)) || kw.startsWith(nw.substring(0, 4)))) score += 2;
          }
        }
        return { ...f, score };
      }).filter(f => f.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
    } catch {}

    // 4. Search tags
    let tagMatches = [];
    try {
      const tagsData = await ddb.send(new ScanCommand({ TableName: T.VIDEO_TAGS }));
      const allTags = tagsData.Items || [];
      for (const item of allTags) {
        const tags = item.tags || [];
        for (const kw of searchKeywords) {
          if (tags.some(t => t.includes(kw) || kw.includes(t))) {
            const video = allVideos.find(v => (v.snippet.resourceId?.videoId || '') === item.videoId);
            if (video && !scoredVideos.find(sv => (sv.snippet.resourceId?.videoId || '') === item.videoId)) {
              tagMatches.push(video);
            }
            break;
          }
        }
      }
    } catch {}

    // 5. Build context for AI with ONLY relevant results
    const videoContext = [...scoredVideos, ...tagMatches.slice(0, 3)].map(v => {
      const id = v.snippet.resourceId?.videoId || '';
      const title = v.snippet.title;
      const desc = (v.snippet.description || '').substring(0, 150);
      return `- [[video:${id}]]${title} | ${desc}`;
    }).join('\n');

    const materialContext = scoredMaterials.map(f => {
      const parts = f.path_display.split('/');
      const folder = parts.slice(1, -1).join(' > ');
      return `- [[material:${f.path_lower}]]${f.name} (${folder})`;
    }).join('\n');

    // 6. If no results found
    if (scoredVideos.length === 0 && scoredMaterials.length === 0 && tagMatches.length === 0) {
      return res(200, { reply: 'Nao encontrei conteudos sobre esse tema na plataforma no momento. Pode tentar com outras palavras-chave ou me dizer mais sobre o que precisa?' });
    }

    // 7. Call Bedrock with focused context
    const systemPrompt = `Voce e o assistente da Plataforma Rede Inspire. Sua funcao e recomendar conteudos da plataforma.

REGRAS:
- Recomende APENAS os conteudos listados abaixo. Nao invente nada.
- Mantenha o formato [[video:ID]]Titulo e [[material:path]]Nome exatamente como esta.
- Seja breve e objetivo. Maximo 5 recomendacoes.
- Se o usuario for vago, peca mais detalhes.
- Responda em portugues brasileiro.

CONTEUDOS ENCONTRADOS PARA A PERGUNTA "${userMessage}":

Videos relevantes:
${videoContext || 'Nenhum video encontrado.'}

Materiais relevantes:
${materialContext || 'Nenhum material encontrado.'}

Responda recomendando os mais relevantes da lista acima para o que o usuario pediu. Use o formato [[video:ID]]Titulo ou [[material:path]]Nome para que fiquem clicaveis.`;

    const history = data.history || [];
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|>`;
    for (const msg of history.slice(-4)) {
      prompt += `<|start_header_id|>${msg.role}<|end_header_id|>\n${msg.content}<|eot_id|>`;
    }
    prompt += `<|start_header_id|>user<|end_header_id|>\n${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`;

    const command = new InvokeModelCommand({
      modelId: 'us.meta.llama3-1-8b-instruct-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ prompt, max_gen_len: 800, temperature: 0.1 }),
    });

    const response = await bedrock.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const reply = result.generation || 'Desculpe, nao consegui processar sua pergunta.';

    return res(200, { reply: reply.trim() });
  } catch (err) {
    console.error('Assistant error:', err);
    return res(500, { message: 'Erro no assistente', error: err.message });
  }
}
