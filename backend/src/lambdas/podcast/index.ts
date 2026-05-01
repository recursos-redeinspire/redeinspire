import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PodcastService } from '../../services/podcast.service';

const svc = new PodcastService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const pathParts = event.path.split('/').filter(Boolean);
    const qs = event.queryStringParameters || {};

    if (method === 'GET' && pathParts.includes('progress')) {
      const episodeId = pathParts[2];
      const position = await svc.getPlaybackProgress(userId, episodeId);
      return { statusCode: 200, headers, body: JSON.stringify({ positionSeconds: position }) };
    }

    if (method === 'GET' && pathParts.length >= 3) {
      const episodeId = pathParts[2];
      const episode = await svc.getEpisode(episodeId);
      if (!episode) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Episódio não encontrado' }) };
      return { statusCode: 200, headers, body: JSON.stringify(episode) };
    }

    if (method === 'GET') {
      const page = parseInt(qs.page || '1');
      const pageSize = parseInt(qs.pageSize || '20');
      const result = await svc.getEpisodes({ page, pageSize });
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (method === 'POST' && pathParts.includes('progress')) {
      const body = JSON.parse(event.body || '{}');
      await svc.savePlaybackProgress(userId, body.episodeId, body.positionSeconds);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Progresso salvo' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido' }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
