import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PlanningService } from '../../services/planning.service';

const svc = new PlanningService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const pathParts = event.path.split('/').filter(Boolean);

    if (method === 'GET' && pathParts.length <= 2) {
      const plans = await svc.getUserPlans(userId);
      return { statusCode: 200, headers, body: JSON.stringify({ plans }) };
    }

    if (method === 'GET' && pathParts.length >= 3) {
      const planId = pathParts[2];
      const plan = await svc.getPlan(userId, planId);
      if (!plan) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Plano não encontrado' }) };
      return { statusCode: 200, headers, body: JSON.stringify(plan) };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const plan = await svc.createPlan(userId, body.type, body.title, body.data || {});
      return { statusCode: 201, headers, body: JSON.stringify(plan) };
    }

    if (method === 'PUT' && pathParts.length >= 3) {
      const planId = pathParts[2];
      const body = JSON.parse(event.body || '{}');
      const plan = await svc.updatePlan(userId, planId, body);
      if (!plan) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Plano não encontrado' }) };
      return { statusCode: 200, headers, body: JSON.stringify(plan) };
    }

    if (method === 'DELETE' && pathParts.length >= 3) {
      const planId = pathParts[2];
      await svc.deletePlan(userId, planId);
      return { statusCode: 204, headers, body: '' };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
