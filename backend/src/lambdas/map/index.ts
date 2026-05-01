import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MapService } from '../../services/map.service';

const svc = new MapService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const pathParts = event.path.split('/').filter(Boolean);
    const qs = event.queryStringParameters || {};

    if (method === 'GET' && pathParts.includes('top')) {
      const month = qs.month || new Date().toISOString().slice(0, 7);
      const limit = parseInt(qs.limit || '10');
      const ranking = await svc.getTopChurchesByEngagement(month, limit);
      return { statusCode: 200, headers, body: JSON.stringify({ ranking }) };
    }

    if (method === 'GET' && pathParts.length >= 3) {
      const churchId = pathParts[2];
      const detail = await svc.getChurchDetail(churchId);
      if (!detail) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Igreja não encontrada' }) };
      return { statusCode: 200, headers, body: JSON.stringify(detail) };
    }

    const churches = await svc.getChurches();
    return { statusCode: 200, headers, body: JSON.stringify({ churches }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
