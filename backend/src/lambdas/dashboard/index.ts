import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DashboardService } from '../../services/dashboard.service';

const svc = new DashboardService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const churchId = event.requestContext.authorizer?.churchId || '';
    const pathParts = event.path.split('/').filter(Boolean);
    const qs = event.queryStringParameters || {};

    if (method === 'GET' && pathParts.includes('metrics')) {
      const metrics = await svc.getChurchMetrics(churchId);
      return { statusCode: 200, headers, body: JSON.stringify(metrics) };
    }

    if (method === 'GET' && pathParts.includes('ranking')) {
      const ranking = await svc.getLeaderRanking(churchId);
      return { statusCode: 200, headers, body: JSON.stringify({ ranking }) };
    }

    if (method === 'GET' && pathParts.includes('timeline')) {
      const timeline = await svc.getChurchTimeline(churchId);
      return { statusCode: 200, headers, body: JSON.stringify({ timeline }) };
    }

    if (method === 'GET' && pathParts.includes('leader') && pathParts.length >= 4) {
      const leaderId = pathParts[3];
      const report = await svc.getLeaderReport(churchId, leaderId);
      return { statusCode: 200, headers, body: JSON.stringify(report) };
    }

    if (method === 'GET' && pathParts.includes('export')) {
      const format = (qs.format as 'excel' | 'pdf') || 'excel';
      const url = await svc.exportReport(churchId, format);
      return { statusCode: 200, headers, body: JSON.stringify({ downloadUrl: url }) };
    }

    // Default: return metrics
    const metrics = await svc.getChurchMetrics(churchId);
    return { statusCode: 200, headers, body: JSON.stringify(metrics) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
