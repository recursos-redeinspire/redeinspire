import { DynamoDB } from 'aws-sdk';
import { ChurchMetrics, LeaderReport, LeaderRanking, TimelineEvent, ReportFilterDTO } from '../types';

const ddb = new DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'Users';
const INTERACTIONS_TABLE = process.env.INTERACTIONS_TABLE || 'Interactions';
const PROGRESS_TABLE = process.env.TRAIL_PROGRESS_TABLE || 'TrailProgress';

export class DashboardService {
  async getChurchMetrics(churchId: string): Promise<ChurchMetrics> {
    const usersResult = await ddb.query({
      TableName: USERS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `CHURCH#${churchId}` },
    }).promise();
    const users = usersResult.Items || [];
    const activeUsers = users.filter((u: any) => u.status === 'active');

    return {
      totalLeaders: users.length,
      activeLeaders: activeUsers.length,
      totalContentAccessed: 0,
      trailsInProgress: 0,
      trailsCompleted: 0,
      topContent: [],
      recentAccesses: activeUsers.slice(0, 10).map((u: any) => ({
        userId: u.PK.replace('USER#', ''),
        name: u.name,
        lastAccessAt: u.lastAccessAt || u.createdAt,
      })),
    };
  }

  async getLeaderReport(churchId: string, leaderId: string): Promise<LeaderReport> {
    const userResult = await ddb.get({
      TableName: USERS_TABLE,
      Key: { PK: `USER#${leaderId}`, SK: 'PROFILE' },
    }).promise();
    const user = userResult.Item as any;

    const progressResult = await ddb.query({
      TableName: PROGRESS_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `USER#${leaderId}` },
    }).promise();

    return {
      leader: user,
      completedResources: [],
      inProgressResources: [],
      recentDownloads: [],
      trailProgress: (progressResult.Items || []) as any[],
      lastAccessAt: user?.lastAccessAt || '',
    };
  }

  async getLeaderRanking(churchId: string): Promise<LeaderRanking[]> {
    const usersResult = await ddb.query({
      TableName: USERS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `CHURCH#${churchId}` },
    }).promise();

    return ((usersResult.Items || []) as any[])
      .map((u, i) => ({
        leader: u,
        engagementScore: Math.random() * 100, // placeholder
        rank: i + 1,
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  async getChurchTimeline(churchId: string): Promise<TimelineEvent[]> {
    return [
      { eventId: '1', type: 'adesao', title: 'Adesão à Rede Inspire', description: 'Igreja filiada à rede', date: '2024-01-15' },
      { eventId: '2', type: 'mentoria', title: 'Primeira mentoria concluída', description: 'Mentoria de liderança', date: '2024-03-20' },
    ];
  }

  async exportReport(churchId: string, format: 'excel' | 'pdf', filters?: ReportFilterDTO): Promise<string> {
    // In production, generate real file and upload to S3
    return `/api/reports/download/${churchId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  }
}
