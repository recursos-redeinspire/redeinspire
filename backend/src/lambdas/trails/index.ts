import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TrailService } from '../../services/trail.service';

const svc = new TrailService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const pathParts = event.path.split('/').filter(Boolean);

    // GET /trails
    if (method === 'GET' && pathParts.length <= 2) {
      const trails = await svc.getTrails();
      const progress = await svc.getUserProgress(userId);
      return { statusCode: 200, headers, body: JSON.stringify({ trails, progress }) };
    }

    // GET /trails/academy
    if (method === 'GET' && pathParts.includes('academy')) {
      const courses = await svc.getAcademyCourses();
      return { statusCode: 200, headers, body: JSON.stringify({ courses }) };
    }

    // GET /trails/:id
    if (method === 'GET' && pathParts.length === 3) {
      const trail = await svc.getTrailDetail(pathParts[2]);
      return { statusCode: 200, headers, body: JSON.stringify(trail) };
    }

    // POST /trails/:id/start
    if (method === 'POST' && pathParts.includes('start')) {
      const trailId = pathParts[2];
      const progress = await svc.startTrail(userId, trailId);
      return { statusCode: 201, headers, body: JSON.stringify(progress) };
    }

    // POST /trails/:id/complete-module
    if (method === 'POST' && pathParts.includes('complete-module')) {
      const trailId = pathParts[2];
      const { moduleId } = JSON.parse(event.body || '{}');
      const progress = await svc.completeModule(userId, trailId, moduleId);
      return { statusCode: 200, headers, body: JSON.stringify(progress) };
    }

    // GET /trails/:id/certificate
    if (method === 'GET' && pathParts.includes('certificate')) {
      const trailId = pathParts[2];
      const cert = await svc.getCertificate(userId, trailId);
      if (!cert) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Certificado não disponível' }) };
      return { statusCode: 200, headers, body: JSON.stringify(cert) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Rota não encontrada' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
