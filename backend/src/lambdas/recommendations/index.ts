import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RecommendationService } from '../../services/recommendation.service';

const svc = new RecommendationService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';

    if (method === 'GET') {
      const limit = parseInt(event.queryStringParameters?.limit || '10');
      const items = await svc.getRecommendations(userId, limit);
      return { statusCode: 200, headers, body: JSON.stringify({ items }) };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      await svc.recordInteraction(userId, body.contentId, body.eventType);
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Interação registrada' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
