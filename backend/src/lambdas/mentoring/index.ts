import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MentoringService } from '../../services/mentoring.service';

const svc = new MentoringService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const userRole = event.requestContext.authorizer?.role || 'membro';
    const pathParts = event.path.split('/').filter(Boolean);

    // GET /mentoring/webinars
    if (method === 'GET' && pathParts.includes('webinars')) {
      const webinars = await svc.getUpcomingWebinars();
      return { statusCode: 200, headers, body: JSON.stringify({ webinars }) };
    }

    // POST /mentoring/webinars — create (pastor/admin only)
    if (method === 'POST' && pathParts.includes('webinars') && !pathParts.includes('enroll')) {
      if (userRole !== 'pastor_presidente') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores podem criar webinars' }) };
      }
      const body = JSON.parse(event.body || '{}');
      const webinar = await svc.createWebinar(body, userId);
      return { statusCode: 201, headers, body: JSON.stringify(webinar) };
    }

    // POST /mentoring/webinars/:id/enroll — enroll in webinar
    if (method === 'POST' && pathParts.includes('enroll')) {
      const webinarId = pathParts[pathParts.indexOf('webinars') + 1];
      await svc.enrollWebinar(webinarId, userId);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Inscrito com sucesso' }) };
    }

    // DELETE /mentoring/webinars/:id — delete (pastor/admin only)
    if (method === 'DELETE' && pathParts.includes('webinars')) {
      if (userRole !== 'pastor_presidente') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores podem excluir webinars' }) };
      }
      const webinarId = pathParts[pathParts.indexOf('webinars') + 1];
      await svc.deleteWebinar(webinarId);
      return { statusCode: 204, headers, body: '' };
    }

    // GET /mentoring/sessions
    if (method === 'GET' && pathParts.includes('sessions')) {
      const sessions = await svc.getAllMentoringSessions();
      return { statusCode: 200, headers, body: JSON.stringify({ sessions }) };
    }

    // POST /mentoring/sessions — create mentoring (pastor or leader)
    if (method === 'POST' && pathParts.includes('sessions') && !pathParts.includes('register') && !pathParts.includes('complete')) {
      if (userRole !== 'pastor_presidente' && userRole !== 'lider') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Apenas pastores e líderes podem criar mentorias' }) };
      }
      const body = JSON.parse(event.body || '{}');
      const session = await svc.createMentoringSession(body, userId);
      return { statusCode: 201, headers, body: JSON.stringify(session) };
    }

    // DELETE /mentoring/sessions/:id
    if (method === 'DELETE' && pathParts.includes('sessions')) {
      const sessionId = pathParts[pathParts.indexOf('sessions') + 1];
      await svc.deleteMentoringSession(sessionId, userId);
      return { statusCode: 204, headers, body: '' };
    }

    // POST /mentoring/register
    if (method === 'POST' && pathParts.includes('register')) {
      const { sessionId } = JSON.parse(event.body || '{}');
      await svc.registerParticipation(userId, sessionId);
      return { statusCode: 201, headers, body: JSON.stringify({ message: 'Participação registrada' }) };
    }

    // POST /mentoring/complete
    if (method === 'POST' && pathParts.includes('complete')) {
      const { sessionId } = JSON.parse(event.body || '{}');
      await svc.completeSession(sessionId, userId);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Sessão concluída' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Rota não encontrada' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
