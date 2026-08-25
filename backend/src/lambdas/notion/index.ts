import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NotionService } from '../../services/notion.service';

const svc = new NotionService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const MANAGE_ROLES = ['pastor_presidente', 'lider'];

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userRole = event.requestContext.authorizer?.role || 'membro';
    const pathParts = event.path.split('/').filter(Boolean); // ['notion', ...]

    const canManage = MANAGE_ROLES.includes(userRole);

    // GET /notion/status — valida o token/conexão com o Notion
    if (method === 'GET' && pathParts.includes('status')) {
      const status = await svc.testConnection();
      return { statusCode: 200, headers, body: JSON.stringify(status) };
    }

    // POST /notion/spaces — cria uma página dentro de um workspace já existente
    if (method === 'POST' && pathParts.includes('spaces')) {
      if (!canManage) {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores e líderes podem criar espaços' }) };
      }
      const { parentPageId, title } = JSON.parse(event.body || '{}');
      if (!parentPageId || !title) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'parentPageId e title são obrigatórios' }) };
      }
      const space = await svc.createSpace(parentPageId, title);
      return { statusCode: 201, headers, body: JSON.stringify(space) };
    }

    // POST /notion/boards — cria um database Kanban
    if (method === 'POST' && pathParts.includes('boards') && pathParts.indexOf('boards') === pathParts.length - 1) {
      if (!canManage) {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores e líderes podem criar boards' }) };
      }
      const { parentPageId, title } = JSON.parse(event.body || '{}');
      if (!parentPageId || !title) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'parentPageId e title são obrigatórios' }) };
      }
      const board = await svc.createKanbanBoard(parentPageId, title);
      return { statusCode: 201, headers, body: JSON.stringify(board) };
    }

    // GET /notion/boards/{databaseId}/cards — lista os cards do board
    if (method === 'GET' && pathParts.includes('boards') && pathParts.includes('cards')) {
      const databaseId = pathParts[pathParts.indexOf('boards') + 1];
      const cards = await svc.listBoardCards(databaseId);
      return { statusCode: 200, headers, body: JSON.stringify({ cards }) };
    }

    // POST /notion/boards/{databaseId}/cards — cria um card no board
    if (method === 'POST' && pathParts.includes('boards') && pathParts.includes('cards')) {
      const databaseId = pathParts[pathParts.indexOf('boards') + 1];
      const body = JSON.parse(event.body || '{}');
      if (!body.title) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'title é obrigatório' }) };
      }
      const card = await svc.createCard(databaseId, body);
      return { statusCode: 201, headers, body: JSON.stringify(card) };
    }

    // POST /notion/cards/{pageId}/move — move o card entre colunas do Kanban
    if (method === 'POST' && pathParts.includes('cards') && pathParts.includes('move')) {
      const pageId = pathParts[pathParts.indexOf('cards') + 1];
      const { status } = JSON.parse(event.body || '{}');
      if (!status) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'status é obrigatório' }) };
      }
      const card = await svc.moveCard(pageId, status);
      return { statusCode: 200, headers, body: JSON.stringify(card) };
    }

    // PATCH /notion/cards/{pageId} — atualiza dados do card
    if (method === 'PATCH' && pathParts.includes('cards')) {
      const pageId = pathParts[pathParts.indexOf('cards') + 1];
      const body = JSON.parse(event.body || '{}');
      const card = await svc.updateCard(pageId, body);
      return { statusCode: 200, headers, body: JSON.stringify(card) };
    }

    // DELETE /notion/cards/{pageId} — arquiva o card (Notion não suporta exclusão real via API)
    if (method === 'DELETE' && pathParts.includes('cards')) {
      if (!canManage) {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores e líderes podem excluir cards' }) };
      }
      const pageId = pathParts[pathParts.indexOf('cards') + 1];
      await svc.archiveCard(pageId);
      return { statusCode: 204, headers, body: '' };
    }

    // GET /notion/team — lista os membros do workspace conectado
    if (method === 'GET' && pathParts.includes('team')) {
      const members = await svc.listTeamMembers();
      return { statusCode: 200, headers, body: JSON.stringify({ members }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Rota não encontrada' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
