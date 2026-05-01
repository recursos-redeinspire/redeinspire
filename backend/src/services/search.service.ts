import { DynamoDB } from 'aws-sdk';
import { Content, SearchResult, SearchFilterDTO } from '../types';

const ddb = new DynamoDB.DocumentClient();
const CONTENT_TABLE = process.env.CONTENT_TABLE || 'Content';

export class SearchService {
  async search(query: string, filters?: SearchFilterDTO): Promise<SearchResult> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: CONTENT_TABLE,
    };
    const result = await ddb.scan(params).promise();
    let items = (result.Items || []) as Content[];

    const q = query.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );

    if (filters?.category) {
      items = items.filter((i) => i.categorySlug === filters.category);
    }
    if (filters?.type) {
      items = items.filter((i) => i.type === filters.type);
    }

    const sortBy = filters?.sortBy || 'relevance';
    if (sortBy === 'date') items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortBy === 'popularity') items.sort((a, b) => b.popularity - a.popularity);

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      items: paged,
      totalCount: items.length,
      suggestions: items.length === 0 ? await this.getSuggestions(query) : [],
      facets: this.buildFacets(items),
    };
  }

  async autocomplete(partialQuery: string): Promise<string[]> {
    if (partialQuery.length < 3) return [];
    const params: DynamoDB.DocumentClient.ScanInput = { TableName: CONTENT_TABLE };
    const result = await ddb.scan(params).promise();
    const items = (result.Items || []) as Content[];
    const q = partialQuery.toLowerCase();
    const titles = items
      .filter((i) => i.title.toLowerCase().includes(q))
      .map((i) => i.title)
      .slice(0, 8);
    return [...new Set(titles)];
  }

  async getSuggestions(query: string): Promise<string[]> {
    return [
      'Mensagens',
      'Pequenos Grupos',
      'Trilhas de Liderança',
      'Campanhas',
      'Jovens',
    ];
  }

  private buildFacets(items: Content[]): Record<string, { value: string; count: number }[]> {
    const catMap: Record<string, number> = {};
    const typeMap: Record<string, number> = {};
    items.forEach((i) => {
      catMap[i.categorySlug] = (catMap[i.categorySlug] || 0) + 1;
      typeMap[i.type] = (typeMap[i.type] || 0) + 1;
    });
    return {
      category: Object.entries(catMap).map(([value, count]) => ({ value, count })),
      type: Object.entries(typeMap).map(([value, count]) => ({ value, count })),
    };
  }
}
