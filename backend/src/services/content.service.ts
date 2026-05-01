import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  Content,
  Category,
  ContentFilterDTO,
  PaginationDTO,
  PaginatedResult,
} from '../types';
import { CATEGORIES, findCategoryBySlug } from '../models/categories';

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CONTENT_TABLE = process.env.CONTENT_TABLE!;

function mapItemToContent(item: Record<string, unknown>): Content {
  return {
    contentId: item.contentId as string,
    title: item.title as string,
    description: item.description as string,
    categorySlug: item.categorySlug as string,
    type: item.type as Content['type'],
    durationMinutes: (item.durationMinutes as number) ?? 0,
    thumbnailUrl: (item.thumbnailUrl as string) ?? '',
    createdAt: item.createdAt as string,
    popularity: (item.popularity as number) ?? 0,
  };
}

/**
 * Returns all categories with descriptions.
 * contentCount is populated dynamically by querying GSI1 for each category.
 */
export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

/**
 * Lists content by category using GSI1 (GSI1PK=CATEGORY#slug, GSI1SK=createdAt).
 * Results are sorted by createdAt descending (newest first).
 */
export async function listByCategory(
  categorySlug: string,
  pagination: PaginationDTO
): Promise<PaginatedResult<Content>> {
  const category = findCategoryBySlug(categorySlug);
  if (!category) {
    return { items: [], totalCount: 0, page: pagination.page, pageSize: pagination.pageSize, totalPages: 0 };
  }

  const { page, pageSize } = pagination;

  const result = await ddbClient.send(
    new QueryCommand({
      TableName: CONTENT_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `CATEGORY#${categorySlug}` },
      ScanIndexForward: false, // newest first
    })
  );

  const allItems = (result.Items ?? []).map(mapItemToContent);
  const totalCount = allItems.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);

  return { items, totalCount, page, pageSize, totalPages };
}

/**
 * Gets a single content item by ID.
 * PK = CONTENT#<contentId>, SK = META
 */
export async function getContent(contentId: string): Promise<Content | null> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: CONTENT_TABLE,
      Key: { PK: `CONTENT#${contentId}`, SK: 'META' },
    })
  );

  if (!result.Item) return null;
  return mapItemToContent(result.Item);
}

/**
 * Applies filters to content listing.
 * Supports filtering by category, type, date range, and sorting by date/popularity/relevance.
 */
export async function applyFilters(
  filters: ContentFilterDTO
): Promise<PaginatedResult<Content>> {
  const { categorySlug, type, dateFrom, dateTo, sortBy, page, pageSize } = filters;

  // If category is specified, query GSI1 for efficiency
  let items: Content[];
  if (categorySlug) {
    const result = await ddbClient.send(
      new QueryCommand({
        TableName: CONTENT_TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: buildCategoryKeyCondition(dateFrom, dateTo),
        ExpressionAttributeValues: buildCategoryExprValues(categorySlug, dateFrom, dateTo),
        ScanIndexForward: false,
      })
    );
    items = (result.Items ?? []).map(mapItemToContent);
  } else {
    // Full scan when no category filter
    const result = await ddbClient.send(
      new ScanCommand({
        TableName: CONTENT_TABLE,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: { ':sk': 'META' },
      })
    );
    items = (result.Items ?? []).map(mapItemToContent);
  }

  // Apply in-memory filters
  if (type) {
    items = items.filter((c) => c.type === type);
  }
  if (dateFrom && !categorySlug) {
    items = items.filter((c) => c.createdAt >= dateFrom);
  }
  if (dateTo && !categorySlug) {
    items = items.filter((c) => c.createdAt <= dateTo);
  }

  // Sort
  switch (sortBy) {
    case 'date':
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'popularity':
      items.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'relevance':
    default:
      // Default: sort by popularity then date
      items.sort((a, b) => b.popularity - a.popularity || b.createdAt.localeCompare(a.createdAt));
      break;
  }

  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, totalCount, page, pageSize, totalPages };
}

function buildCategoryKeyCondition(dateFrom?: string, dateTo?: string): string {
  let expr = 'GSI1PK = :pk';
  if (dateFrom && dateTo) {
    expr += ' AND GSI1SK BETWEEN :from AND :to';
  } else if (dateFrom) {
    expr += ' AND GSI1SK >= :from';
  } else if (dateTo) {
    expr += ' AND GSI1SK <= :to';
  }
  return expr;
}

function buildCategoryExprValues(
  categorySlug: string,
  dateFrom?: string,
  dateTo?: string
): Record<string, string> {
  const values: Record<string, string> = { ':pk': `CATEGORY#${categorySlug}` };
  if (dateFrom) values[':from'] = dateFrom;
  if (dateTo) values[':to'] = dateTo;
  return values;
}

/**
 * Returns trending content sorted by popularity (descending).
 * Uses a scan with sort — in production, consider a GSI on popularity.
 */
export async function getTrending(limit: number): Promise<Content[]> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: CONTENT_TABLE,
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': 'META' },
    })
  );

  const items = (result.Items ?? []).map(mapItemToContent);
  items.sort((a, b) => b.popularity - a.popularity);
  return items.slice(0, limit);
}

/**
 * Returns newest content sorted by createdAt descending.
 */
export async function getNewReleases(limit: number): Promise<Content[]> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: CONTENT_TABLE,
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': 'META' },
    })
  );

  const items = (result.Items ?? []).map(mapItemToContent);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items.slice(0, limit);
}

/**
 * Returns top 10 most popular content.
 */
export async function getTop10(): Promise<Content[]> {
  return getTrending(10);
}
