import {
  getCategories,
  listByCategory,
  getContent,
  applyFilters,
  getTrending,
  getNewReleases,
  getTop10,
} from './content.service';
import { CATEGORIES, getAllCategorySlugs, findCategoryBySlug } from '../models/categories';

// Mock DynamoDB Document Client
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: jest.fn(() => ({ send: mockSend })) },
  GetCommand: jest.fn((params) => ({ ...params, _type: 'Get' })),
  QueryCommand: jest.fn((params) => ({ ...params, _type: 'Query' })),
  ScanCommand: jest.fn((params) => ({ ...params, _type: 'Scan' })),
}));

// Set env before import
process.env.CONTENT_TABLE = 'RedeInspire-Content';

const sampleContent = (overrides: Record<string, unknown> = {}) => ({
  contentId: 'c1',
  title: 'Test Content',
  description: 'A test content item',
  categorySlug: 'mensagens',
  type: 'video',
  durationMinutes: 30,
  thumbnailUrl: 'https://example.com/thumb.jpg',
  createdAt: '2024-01-15T10:00:00Z',
  popularity: 50,
  PK: 'CONTENT#c1',
  SK: 'META',
  GSI1PK: 'CATEGORY#mensagens',
  GSI1SK: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('Categories Model', () => {
  it('should have at least 24 categories (including subcategories)', () => {
    const allSlugs = getAllCategorySlugs();
    expect(allSlugs.length).toBeGreaterThanOrEqual(24);
  });

  it('should find top-level category by slug', () => {
    const cat = findCategoryBySlug('mensagens');
    expect(cat).toBeDefined();
    expect(cat!.name).toBe('Mensagens');
  });

  it('should find subcategory by slug', () => {
    const cat = findCategoryBySlug('criancas-baby');
    expect(cat).toBeDefined();
    expect(cat!.name).toBe('Baby');
  });

  it('should return undefined for unknown slug', () => {
    expect(findCategoryBySlug('nonexistent')).toBeUndefined();
  });

  it('should have Crianças with 4 subcategories', () => {
    const cat = findCategoryBySlug('criancas');
    expect(cat).toBeDefined();
    expect(cat!.subcategories).toHaveLength(4);
  });

  it('should have Jovens with 3 subcategories', () => {
    const cat = findCategoryBySlug('jovens');
    expect(cat).toBeDefined();
    expect(cat!.subcategories).toHaveLength(3);
  });
});

describe('ContentService.getCategories', () => {
  it('should return all categories', async () => {
    const categories = await getCategories();
    expect(categories).toEqual(CATEGORIES);
    expect(categories.length).toBeGreaterThanOrEqual(20);
  });
});

describe('ContentService.listByCategory', () => {
  beforeEach(() => mockSend.mockReset());

  it('should return paginated content for valid category', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [sampleContent(), sampleContent({ contentId: 'c2', createdAt: '2024-01-10T10:00:00Z' })],
    });

    const result = await listByCategory('mensagens', { page: 1, pageSize: 10 });
    expect(result.items).toHaveLength(2);
    expect(result.totalCount).toBe(2);
    expect(result.page).toBe(1);
  });

  it('should return empty for unknown category', async () => {
    const result = await listByCategory('nonexistent', { page: 1, pageSize: 10 });
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it('should paginate correctly', async () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      sampleContent({ contentId: `c${i}`, createdAt: `2024-01-${15 - i}T10:00:00Z` })
    );
    mockSend.mockResolvedValueOnce({ Items: items });

    const result = await listByCategory('mensagens', { page: 2, pageSize: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
  });
});

describe('ContentService.getContent', () => {
  beforeEach(() => mockSend.mockReset());

  it('should return content by ID', async () => {
    mockSend.mockResolvedValueOnce({ Item: sampleContent() });

    const content = await getContent('c1');
    expect(content).not.toBeNull();
    expect(content!.contentId).toBe('c1');
    expect(content!.title).toBe('Test Content');
  });

  it('should return null for non-existent content', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    const content = await getContent('nonexistent');
    expect(content).toBeNull();
  });
});

describe('ContentService.applyFilters', () => {
  beforeEach(() => mockSend.mockReset());

  it('should filter by type', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        sampleContent({ type: 'video' }),
        sampleContent({ contentId: 'c2', type: 'audio' }),
      ],
    });

    const result = await applyFilters({
      type: 'video',
      sortBy: 'relevance',
      page: 1,
      pageSize: 20,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe('video');
  });

  it('should sort by popularity', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        sampleContent({ contentId: 'c1', popularity: 10 }),
        sampleContent({ contentId: 'c2', popularity: 90 }),
        sampleContent({ contentId: 'c3', popularity: 50 }),
      ],
    });

    const result = await applyFilters({
      sortBy: 'popularity',
      page: 1,
      pageSize: 20,
    });
    expect(result.items[0].popularity).toBe(90);
    expect(result.items[1].popularity).toBe(50);
    expect(result.items[2].popularity).toBe(10);
  });

  it('should sort by date', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        sampleContent({ contentId: 'c1', createdAt: '2024-01-01T00:00:00Z' }),
        sampleContent({ contentId: 'c2', createdAt: '2024-03-01T00:00:00Z' }),
        sampleContent({ contentId: 'c3', createdAt: '2024-02-01T00:00:00Z' }),
      ],
    });

    const result = await applyFilters({
      sortBy: 'date',
      page: 1,
      pageSize: 20,
    });
    expect(result.items[0].createdAt).toBe('2024-03-01T00:00:00Z');
    expect(result.items[2].createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('should use GSI1 query when categorySlug is provided', async () => {
    mockSend.mockResolvedValueOnce({ Items: [sampleContent()] });

    await applyFilters({
      categorySlug: 'mensagens',
      sortBy: 'relevance',
      page: 1,
      pageSize: 20,
    });

    // Verify QueryCommand was used (not ScanCommand)
    const call = mockSend.mock.calls[0][0];
    expect(call._type).toBe('Query');
    expect(call.IndexName).toBe('GSI1');
  });
});

describe('ContentService.getTrending', () => {
  beforeEach(() => mockSend.mockReset());

  it('should return items sorted by popularity descending', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        sampleContent({ contentId: 'c1', popularity: 10 }),
        sampleContent({ contentId: 'c2', popularity: 100 }),
        sampleContent({ contentId: 'c3', popularity: 50 }),
      ],
    });

    const items = await getTrending(3);
    expect(items[0].popularity).toBe(100);
    expect(items[1].popularity).toBe(50);
    expect(items[2].popularity).toBe(10);
  });

  it('should respect limit', async () => {
    mockSend.mockResolvedValueOnce({
      Items: Array.from({ length: 10 }, (_, i) =>
        sampleContent({ contentId: `c${i}`, popularity: i * 10 })
      ),
    });

    const items = await getTrending(3);
    expect(items).toHaveLength(3);
  });
});

describe('ContentService.getNewReleases', () => {
  beforeEach(() => mockSend.mockReset());

  it('should return items sorted by date descending', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        sampleContent({ contentId: 'c1', createdAt: '2024-01-01T00:00:00Z' }),
        sampleContent({ contentId: 'c2', createdAt: '2024-03-01T00:00:00Z' }),
      ],
    });

    const items = await getNewReleases(10);
    expect(items[0].createdAt).toBe('2024-03-01T00:00:00Z');
  });
});

describe('ContentService.getTop10', () => {
  beforeEach(() => mockSend.mockReset());

  it('should return at most 10 items', async () => {
    mockSend.mockResolvedValueOnce({
      Items: Array.from({ length: 15 }, (_, i) =>
        sampleContent({ contentId: `c${i}`, popularity: i })
      ),
    });

    const items = await getTop10();
    expect(items.length).toBeLessThanOrEqual(10);
  });
});
