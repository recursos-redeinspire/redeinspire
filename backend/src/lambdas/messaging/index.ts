import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MessagingService } from '../../services/messaging.service';

const svc = new MessagingService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const userName = event.requestContext.authorizer?.name || 'Usuário';
    const pathParts = event.path.split('/').filter(Boolean);
    const qs = event.queryStringParameters || {};

    if (method === 'GET' && pathParts.includes('unread-count')) {
      const count = await svc.getUnreadCount(userId);
      return { statusCode: 200, headers, body: JSON.stringify({ count }) };
    }

    if (method === 'GET') {
      const page = parseInt(qs.page || '1');
      const pageSize = parseInt(qs.pageSize || '20');
      const inbox = await svc.getInbox(userId, { page, pageSize });
      return { statusCode: 200, headers, body: JSON.stringify(inbox) };
    }

    if (method === 'POST' && pathParts.includes('read')) {
      const { messageId } = JSON.parse(event.body || '{}');
      await svc.markAsRead(userId, messageId);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Marcada como lida' }) };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const msg = await svc.sendMessage(userId, userName, body);
      return { statusCode: 201, headers, body: JSON.stringify(msg) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
