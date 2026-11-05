import { NotionService } from './notion.service';

function mockFetchOnce(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('NotionService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('throws when no token is configured', async () => {
    const svc = new NotionService('');
    await expect(svc.testConnection()).rejects.toThrow('NOTION_API_TOKEN não configurado');
  });

  it('validates the connection via /users/me', async () => {
    mockFetchOnce(200, { id: 'bot-1', bot: { workspace_name: 'Rede Inspire' } });
    const svc = new NotionService('secret_token');
    const result = await svc.testConnection();
    expect(result).toEqual({ botId: 'bot-1', workspaceName: 'Rede Inspire' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notion.com/v1/users/me',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('creates a space (page) under an existing parent page', async () => {
    mockFetchOnce(200, { id: 'page-1', url: 'https://notion.so/page-1' });
    const svc = new NotionService('secret_token');
    const space = await svc.createSpace('parent-1', 'Equipe Rede Inspire');
    expect(space).toEqual({ pageId: 'page-1', title: 'Equipe Rede Inspire', url: 'https://notion.so/page-1' });
  });

  it('creates a kanban board with the expected properties', async () => {
    mockFetchOnce(200, { id: 'db-1', url: 'https://notion.so/db-1' });
    const svc = new NotionService('secret_token');
    await svc.createKanbanBoard('parent-1', 'Board da Equipe');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.properties.Status.select.options.map((o: any) => o.name)).toEqual([
      'A Fazer',
      'Em Andamento',
      'Em Revisão',
      'Concluído',
    ]);
  });

  it('maps a Notion page into a card', async () => {
    mockFetchOnce(200, {
      id: 'card-1',
      url: 'https://notion.so/card-1',
      created_time: '2026-01-01T00:00:00.000Z',
      properties: {
        Nome: { title: [{ plain_text: 'Preparar culto' }] },
        Status: { select: { name: 'Em Andamento' } },
        Responsável: { rich_text: [{ plain_text: 'João' }] },
        Prioridade: { select: { name: 'Alta' } },
        Prazo: { date: { start: '2026-02-01' } },
        Tags: { multi_select: [{ name: 'louvor' }] },
      },
    });
    const svc = new NotionService('secret_token');
    const card = await svc.createCard('db-1', { title: 'Preparar culto' });
    expect(card).toEqual({
      cardId: 'card-1',
      title: 'Preparar culto',
      status: 'Em Andamento',
      assignee: 'João',
      priority: 'Alta',
      dueDate: '2026-02-01',
      tags: ['louvor'],
      url: 'https://notion.so/card-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('moves a card by updating its Status property', async () => {
    mockFetchOnce(200, { id: 'card-1', url: 'u', created_time: 't', properties: {} });
    const svc = new NotionService('secret_token');
    await svc.moveCard('card-1', 'Concluído');
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.notion.com/v1/pages/card-1');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ properties: { Status: { select: { name: 'Concluído' } } } });
  });

  it('archives a card instead of deleting it', async () => {
    mockFetchOnce(204, undefined);
    const svc = new NotionService('secret_token');
    await svc.archiveCard('card-1');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ archived: true });
  });

  it('lists only person-type users as team members, following pagination', async () => {
    mockFetchOnce(200, {
      results: [
        { id: 'u1', type: 'person', name: 'Maria', person: { email: 'maria@example.com' } },
        { id: 'bot1', type: 'bot', name: 'Integration Bot' },
      ],
      has_more: true,
      next_cursor: 'cursor-2',
    });
    mockFetchOnce(200, {
      results: [{ id: 'u2', type: 'person', name: 'Pedro', person: { email: 'pedro@example.com' } }],
      has_more: false,
      next_cursor: null,
    });
    const svc = new NotionService('secret_token');
    const members = await svc.listTeamMembers();
    expect(members).toEqual([
      { notionUserId: 'u1', name: 'Maria', email: 'maria@example.com', avatarUrl: undefined },
      { notionUserId: 'u2', name: 'Pedro', email: 'pedro@example.com', avatarUrl: undefined },
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('propagates the Notion API error message on failure', async () => {
    mockFetchOnce(400, { message: 'parent_page_id inválido' });
    const svc = new NotionService('secret_token');
    await expect(svc.createSpace('bad-parent', 'X')).rejects.toThrow('parent_page_id inválido');
  });
});
