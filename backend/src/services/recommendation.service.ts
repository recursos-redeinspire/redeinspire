import { DynamoDB } from 'aws-sdk';
import { Content } from '../types';

const ddb = new DynamoDB.DocumentClient();
const CONTENT_TABLE = process.env.CONTENT_TABLE || 'Content';
const INTERACTIONS_TABLE = process.env.INTERACTIONS_TABLE || 'Interactions';

export class RecommendationService {
  async getRecommendations(userId: string, limit: number = 10): Promise<Content[]> {
    // Fallback: return popular content (Personalize integration would go here)
    const result = await ddb.scan({ TableName: CONTENT_TABLE }).promise();
    const items = (result.Items || []) as Content[];
    items.sort((a, b) => b.popularity - a.popularity);
    return items.slice(0, limit);
  }

  async recordInteraction(userId: string, contentId: string, eventType: 'view' | 'complete' | 'download'): Promise<void> {
    const now = new Date().toISOString();
    await ddb.put({
      TableName: INTERACTIONS_TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: `INT#${now}`,
        contentId,
        eventType,
        timestamp: now,
      },
    }).promise();
  }

  async refreshRecommendations(userId: string): Promise<void> {
    // In production, this would trigger a Personalize campaign refresh
  }
}
