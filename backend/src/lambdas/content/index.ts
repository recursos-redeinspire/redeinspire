import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import {
  getCategories,
  listByCategory,
  getContent,
  applyFilters,
  getTrending,
  getNewReleases,
  getTop10,
} from '../../services/content.service';
import { ContentFilterDTO, ErrorResponse } from '../../types';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function success(body: unknown, statusCode = 200): APIGatewayProxyResult {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function errorResponse(err: ErrorResponse): APIGatewayProxyResult {
  return { statusCode: err.statusCode, headers: CORS_HEADERS, body: JSON.stringify(err) };
}

function notFound(message: string): APIGatewayProxyResult {
  return errorResponse({
    statusCode: 404,
    errorCode: 'NOT_FOUND',
    message,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  });
}

function badRequest(message: string): APIGatewayProxyResult {
  return errorResponse({
    statusCode: 400,
    errorCode: 'VALIDATION_ERROR',
    message,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  });
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters } = event;

  try {
    if (httpMethod !== 'GET') {
      return notFound('Rota não encontrada');
    }

    // GET /content/categories
    if (path.endsWith('/categories')) {
      const categories = await getCategories();
      return success(categories);
    }

    // GET /content/trending
    if (path.endsWith('/trending')) {
      const limit = parseInt(queryStringParameters?.limit ?? '20', 10);
      const items = await getTrending(limit);
      return success(items);
    }

    // GET /content/releases
    if (path.endsWith('/releases')) {
      const limit = parseInt(queryStringParameters?.limit ?? '20', 10);
      const items = await getNewReleases(limit);
      return success(items);
    }

    // GET /content/top10
    if (path.endsWith('/top10')) {
      const items = await getTop10();
      return success(items);
    }

    // GET /content/category/:slug
    const categoryMatch = path.match(/\/content\/category\/([^/]+)$/);
    if (categoryMatch) {
      const slug = categoryMatch[1];
      const page = parseInt(queryStringParameters?.page ?? '1', 10);
      const pageSize = parseInt(queryStringParameters?.pageSize ?? '20', 10);

      if (page < 1 || pageSize < 1) {
        return badRequest('page e pageSize devem ser maiores que 0');
      }

      const result = await listByCategory(slug, { page, pageSize });
      return success(result);
    }

    // GET /content/:id (must come after named routes)
    const contentIdMatch = path.match(/\/content\/([^/]+)$/);
    if (contentIdMatch) {
      const contentId = contentIdMatch[1];
      // Skip if it matches a named route
      if (['categories', 'trending', 'releases', 'top10'].includes(contentId)) {
        return notFound('Rota não encontrada');
      }

      const content = await getContent(contentId);
      if (!content) {
        return notFound('Conteúdo não encontrado');
      }
      return success(content);
    }

    // GET /content?filters... (base path with query params)
    if (path.endsWith('/content') || path.endsWith('/content/')) {
      const params = queryStringParameters ?? {};
      const filters: ContentFilterDTO = {
        categorySlug: params.categorySlug,
        type: params.type,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        sortBy: (params.sortBy as ContentFilterDTO['sortBy']) ?? 'relevance',
        page: parseInt(params.page ?? '1', 10),
        pageSize: parseInt(params.pageSize ?? '20', 10),
      };

      if (filters.page < 1 || filters.pageSize < 1) {
        return badRequest('page e pageSize devem ser maiores que 0');
      }

      const result = await applyFilters(filters);
      return success(result);
    }

    return notFound('Rota não encontrada');
  } catch (err: unknown) {
    if ((err as ErrorResponse).errorCode) {
      return errorResponse(err as ErrorResponse);
    }

    console.error('Unhandled error:', err);
    return errorResponse({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    });
  }
};
