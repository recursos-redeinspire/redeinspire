import { DynamoDB } from 'aws-sdk';
import { PodcastEpisode, PaginationDTO, PaginatedResult } from '../types';

const ddb = new DynamoDB.DocumentClient();
const CONTENT_TABLE = process.env.CONTENT_TABLE || 'Content';
const PROGRESS_TABLE = process.env.PODCAST_PROGRESS_TABLE || 'PodcastProgress';

export class PodcastService {
  async getEpisodes(pagination: PaginationDTO): Promise<PaginatedResult<PodcastEpisode>> {
    const result = await ddb.scan({
      TableName: CONTENT_TABLE,
      FilterExpression: '#t = :t',
      ExpressionAttributeNames: { '#t': 'type' },
      ExpressionAttributeValues: { ':t': 'audio' },
    }).promise();
    const items = ((result.Items || []) as any[]).map((i) => ({
      episodeId: i.contentId || i.PK?.replace('CONTENT#', ''),
      title: i.title,
      description: i.description,
      durationSeconds: (i.durationMinutes || 0) * 60,
      audioUrl: i.mediaUrl || '',
      publishedAt: i.createdAt,
    }));
    items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const start = (pagination.page - 1) * pagination.pageSize;
    const paged = items.slice(start, start + pagination.pageSize);
    return {
      items: paged, totalCount: items.length,
      page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(items.length / pagination.pageSize),
    };
  }

  async getEpisode(episodeId: string): Promise<PodcastEpisode | null> {
    const result = await ddb.get({
      TableName: CONTENT_TABLE,
      Key: { PK: `CONTENT#${episodeId}`, SK: 'META' },
    }).promise();
    if (!result.Item) return null;
    const i = result.Item as any;
    return {
      episodeId, title: i.title, description: i.description,
      durationSeconds: (i.durationMinutes || 0) * 60,
      audioUrl: i.mediaUrl || '', publishedAt: i.createdAt,
    };
  }

  async getPlaybackProgress(userId: string, episodeId: string): Promise<number> {
    const result = await ddb.get({
      TableName: PROGRESS_TABLE,
      Key: { PK: `USER#${userId}`, SK: `EPISODE#${episodeId}` },
    }).promise();
    return (result.Item as any)?.positionSeconds || 0;
  }

  async savePlaybackProgress(userId: string, episodeId: string, positionSeconds: number): Promise<void> {
    await ddb.put({
      TableName: PROGRESS_TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: `EPISODE#${episodeId}`,
        positionSeconds,
        updatedAt: new Date().toISOString(),
      },
    }).promise();
  }
}
