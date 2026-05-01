// =============================================================================
// Rede Inspire — Single Lambda Backend (all routes)
// =============================================================================
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const s3 = new S3Client({ region: 'us-east-1' });
const UPLOAD_BUCKET = 'rede-inspire-uploads-danilo';

const JWT_SECRET = process.env.JWT_SECRET || 'rede-inspire-secret-2026';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

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
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, churchId: user.churchId, ministries: user.ministries, birthDate: user.birthDate || '' }, JWT_SECRET, { expiresIn: '7d' });
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
  const command = new PutObjectCommand({ Bucket: UPLOAD_BUCKET, Key: key, ContentType: data.contentType });
  const url = await getSignedUrl(s3, command, { expiresIn: 600 });
  const publicUrl = `https://${UPLOAD_BUCKET}.s3.amazonaws.com/${key}`;
  return res(200, { uploadUrl: url, fileUrl: publicUrl, key });
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
  if (!user || !isAdmin(user)) return res(403, { message: 'Apenas administradores podem criar trilhas.' });
  if (!data.title) return res(400, { message: 'Título é obrigatório.' });
  const modules = (data.modules || []).map((m, i) => ({
    moduleId: m.moduleId || uuid(),
    title: m.title,
    order: m.order ?? (i + 1),
    durationMinutes: m.durationMinutes || 0,
    contentId: m.contentId || null,
  }));
  const totalDurationMinutes = modules.reduce((s, m) => s + (m.durationMinutes || 0), 0);
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