import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SearchService } from '../../services/search.service';

const searchService = new SearchService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const path = event.path;
    const qs = event.queryStringParameters || {};

    if (path.endsWith('/autocomplete')) {
      const q = qs.q || '';
      const suggestions = await searchService.autocomplete(q);
      return { statusCode: 200, headers, body: JSON.stringify({ suggestions }) };
    }

    const query = qs.q || '';
    const filters = {
      category: qs.category,
      type: qs.type,
      sortBy: (qs.sortBy as any) || 'relevance',
      page: parseInt(qs.page || '1'),
      pageSize: parseInt(qs.pageSize || '20'),
    };
    const result = await searchService.search(query, filters);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
