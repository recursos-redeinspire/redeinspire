import {
  NotionSpace,
  NotionBoard,
  NotionCard,
  NotionTeamMember,
  CreateNotionCardDTO,
  UpdateNotionCardDTO,
} from '../types';

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const STATUS_OPTIONS = ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'];
const PRIORITY_OPTIONS = ['Baixa', 'Média', 'Alta', 'Urgente'];

// Nomes das propriedades do database Kanban criado por este serviço.
const PROP_TITLE = 'Nome';
const PROP_STATUS = 'Status';
const PROP_ASSIGNEE = 'Responsável';
const PROP_PRIORITY = 'Prioridade';
const PROP_DUE_DATE = 'Prazo';
const PROP_TAGS = 'Tags';

interface NotionErrorBody {
  message?: string;
  code?: string;
}

/**
 * Cliente para a API pública do Notion (https://api.notion.com/v1).
 *
 * Limitação da API do Notion: não existe endpoint para criar ou gerenciar
 * workspaces, nem para convidar/remover membros de um workspace — ambos são
 * operações exclusivas da UI do Notion. `createSpace` cria uma página
 * (container de conteúdo) dentro de um workspace já existente e conectado à
 * integração, e `listTeamMembers` apenas lista os usuários que já fazem
 * parte desse workspace.
 */
export class NotionService {
  private readonly token: string;

  constructor(token: string = process.env.NOTION_API_TOKEN || '') {
    this.token = token;
  }

  private async request<T = any>(path: string, method: string, body?: unknown): Promise<T> {
    if (!this.token) {
      throw new Error('NOTION_API_TOKEN não configurado');
    }

    const response = await fetch(`${NOTION_API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as NotionErrorBody;
      throw new Error(errorBody.message || `Notion API retornou ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  /** Valida o token verificando o bot associado à integração. */
  async testConnection(): Promise<{ botId: string; workspaceName: string | null }> {
    const me = await this.request<any>('/users/me', 'GET');
    return {
      botId: me.id,
      workspaceName: me.bot?.workspace_name ?? null,
    };
  }

  /**
   * Cria uma página dentro de um workspace/página pai já existente.
   * Não cria um workspace novo — o Notion não expõe essa operação via API.
   */
  async createSpace(parentPageId: string, title: string): Promise<NotionSpace> {
    const page = await this.request<any>('/pages', 'POST', {
      parent: { page_id: parentPageId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
    });
    return { pageId: page.id, title, url: page.url };
  }

  /** Cria um database Kanban (colunas de status) dentro de uma página pai. */
  async createKanbanBoard(parentPageId: string, title: string): Promise<NotionBoard> {
    const database = await this.request<any>('/databases', 'POST', {
      parent: { page_id: parentPageId },
      title: [{ type: 'text', text: { content: title } }],
      properties: {
        [PROP_TITLE]: { title: {} },
        [PROP_STATUS]: {
          select: { options: STATUS_OPTIONS.map((name) => ({ name })) },
        },
        [PROP_ASSIGNEE]: { rich_text: {} },
        [PROP_PRIORITY]: {
          select: { options: PRIORITY_OPTIONS.map((name) => ({ name })) },
        },
        [PROP_DUE_DATE]: { date: {} },
        [PROP_TAGS]: { multi_select: {} },
      },
    });
    return { databaseId: database.id, title, url: database.url };
  }

  async listBoardCards(databaseId: string): Promise<NotionCard[]> {
    const result = await this.request<any>(`/databases/${databaseId}/query`, 'POST', {
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });
    return (result.results || []).map(mapPageToCard);
  }

  async createCard(databaseId: string, data: CreateNotionCardDTO): Promise<NotionCard> {
    const page = await this.request<any>('/pages', 'POST', {
      parent: { database_id: databaseId },
      properties: buildCardProperties(data),
    });
    return mapPageToCard(page);
  }

  async updateCard(pageId: string, data: UpdateNotionCardDTO): Promise<NotionCard> {
    const page = await this.request<any>(`/pages/${pageId}`, 'PATCH', {
      properties: buildCardProperties(data),
    });
    return mapPageToCard(page);
  }

  /** Move o card entre colunas do Kanban (atalho para atualizar o Status). */
  async moveCard(pageId: string, status: string): Promise<NotionCard> {
    return this.updateCard(pageId, { status });
  }

  /** O Notion não permite excluir páginas via API — apenas arquivar. */
  async archiveCard(pageId: string): Promise<void> {
    await this.request(`/pages/${pageId}`, 'PATCH', { archived: true });
  }

  /**
   * Lista os usuários que já fazem parte do workspace conectado à
   * integração. O Notion não expõe uma API para convidar, remover ou
   * alterar permissões de membros — isso é feito manualmente na UI.
   */
  async listTeamMembers(): Promise<NotionTeamMember[]> {
    const members: NotionTeamMember[] = [];
    let cursor: string | undefined;

    do {
      const query = cursor ? `?start_cursor=${cursor}` : '';
      const result = await this.request<any>(`/users${query}`, 'GET');
      for (const user of result.results || []) {
        if (user.type === 'person') {
          members.push({
            notionUserId: user.id,
            name: user.name || 'Sem nome',
            email: user.person?.email,
            avatarUrl: user.avatar_url || undefined,
          });
        }
      }
      cursor = result.has_more ? result.next_cursor : undefined;
    } while (cursor);

    return members;
  }
}

function buildCardProperties(data: CreateNotionCardDTO | UpdateNotionCardDTO): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  if (data.title !== undefined) {
    properties[PROP_TITLE] = { title: [{ text: { content: data.title } }] };
  }
  if (data.status !== undefined) {
    properties[PROP_STATUS] = { select: { name: data.status } };
  }
  if (data.assignee !== undefined) {
    properties[PROP_ASSIGNEE] = { rich_text: [{ text: { content: data.assignee } }] };
  }
  if (data.priority !== undefined) {
    properties[PROP_PRIORITY] = { select: { name: data.priority } };
  }
  if (data.dueDate !== undefined) {
    properties[PROP_DUE_DATE] = { date: { start: data.dueDate } };
  }
  if (data.tags !== undefined) {
    properties[PROP_TAGS] = { multi_select: data.tags.map((name) => ({ name })) };
  }

  return properties;
}

function mapPageToCard(page: any): NotionCard {
  const props = page.properties || {};
  return {
    cardId: page.id,
    title: props[PROP_TITLE]?.title?.[0]?.plain_text || '',
    status: props[PROP_STATUS]?.select?.name || '',
    assignee: props[PROP_ASSIGNEE]?.rich_text?.[0]?.plain_text || '',
    priority: props[PROP_PRIORITY]?.select?.name || '',
    dueDate: props[PROP_DUE_DATE]?.date?.start || null,
    tags: (props[PROP_TAGS]?.multi_select || []).map((t: any) => t.name),
    url: page.url,
    createdAt: page.created_time,
  };
}
