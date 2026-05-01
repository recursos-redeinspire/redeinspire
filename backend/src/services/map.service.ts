import { DynamoDB } from 'aws-sdk';
import { ChurchPin, ChurchDetail, ChurchRanking } from '../types';

const ddb = new DynamoDB.DocumentClient();
const TABLE = process.env.CHURCHES_TABLE || 'Churches';

export class MapService {
  async getChurches(): Promise<ChurchPin[]> {
    const result = await ddb.scan({ TableName: TABLE }).promise();
    return ((result.Items || []) as any[])
      .filter((i) => i.status === 'active')
      .map((i) => ({
        churchId: i.PK.replace('CHURCH#', ''),
        name: i.name,
        city: i.city,
        state: i.state,
        latitude: i.latitude,
        longitude: i.longitude,
      }));
  }

  async getChurchDetail(churchId: string): Promise<ChurchDetail | null> {
    const result = await ddb.get({
      TableName: TABLE,
      Key: { PK: `CHURCH#${churchId}`, SK: 'META' },
    }).promise();
    if (!result.Item) return null;
    const i = result.Item as any;
    return {
      churchId, name: i.name, city: i.city, state: i.state,
      pastorName: i.pastorName || '', cnpj: i.cnpj, memberCount: i.memberCount || 0,
    };
  }

  async getTopChurchesByEngagement(month: string, limit: number = 10): Promise<ChurchRanking[]> {
    const churches = await this.getChurches();
    return churches
      .map((c, i) => ({ church: c, engagementScore: Math.random() * 100, rank: i + 1 }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }
}
