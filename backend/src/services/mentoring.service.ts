import { DynamoDB } from 'aws-sdk';
import { Webinar, MentoringSession } from '../types';
import { v4 as uuid } from 'uuid';

const ddb = new DynamoDB.DocumentClient();
const TABLE = process.env.MENTORING_TABLE || 'Mentoring';

export class MentoringService {
  // ---- Webinars ----
  async getUpcomingWebinars(): Promise<Webinar[]> {
    const now = new Date().toISOString();
    const result = await ddb.scan({ TableName: TABLE }).promise();
    return ((result.Items || []) as any[])
      .filter((i) => i.type === 'webinar' && i.scheduledAt > now)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .map((i) => ({
        webinarId: i.SK.replace('SESSION#', ''),
        title: i.title,
        description: i.description,
        scheduledAt: i.scheduledAt,
        meetingUrl: i.meetingUrl,
        hostName: i.hostName,
        createdBy: i.createdBy || '',
        enrolledUsers: i.enrolledUsers || [],
        enrolledCount: (i.enrolledUsers || []).length,
      }));
  }

  async createWebinar(data: { title: string; description: string; scheduledAt: string; meetingUrl: string; hostName: string }, createdBy: string): Promise<Webinar> {
    const webinarId = uuid();
    const item = {
      PK: 'WEBINARS',
      SK: `SESSION#${webinarId}`,
      type: 'webinar',
      title: data.title,
      description: data.description,
      scheduledAt: data.scheduledAt,
      meetingUrl: data.meetingUrl,
      hostName: data.hostName,
      createdBy,
      enrolledUsers: [],
      createdAt: new Date().toISOString(),
    };
    await ddb.put({ TableName: TABLE, Item: item }).promise();
    return { webinarId, ...data, createdBy, enrolledUsers: [], enrolledCount: 0 };
  }

  async deleteWebinar(webinarId: string): Promise<void> {
    await ddb.delete({ TableName: TABLE, Key: { PK: 'WEBINARS', SK: `SESSION#${webinarId}` } }).promise();
  }

  async enrollWebinar(webinarId: string, userId: string): Promise<void> {
    await ddb.update({
      TableName: TABLE,
      Key: { PK: 'WEBINARS', SK: `SESSION#${webinarId}` },
      UpdateExpression: 'SET enrolledUsers = list_append(if_not_exists(enrolledUsers, :empty), :user)',
      ExpressionAttributeValues: { ':user': [userId], ':empty': [] },
    }).promise();
  }

  // ---- Mentoring Sessions ----
  async getMentoringSessions(userId: string): Promise<MentoringSession[]> {
    const result = await ddb.query({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `USER#${userId}` },
    }).promise();
    return ((result.Items || []) as any[]).map((i) => ({
      sessionId: i.SK.replace('SESSION#', ''),
      title: i.title,
      description: i.description || '',
      mentorName: i.mentorName,
      mentorId: i.mentorId || '',
      pastorName: i.pastorName || '',
      pastorId: i.pastorId || '',
      status: i.status,
      scheduledAt: i.scheduledAt,
      meetingUrl: i.meetingUrl,
      createdBy: i.createdBy || '',
    }));
  }

  async getAllMentoringSessions(): Promise<MentoringSession[]> {
    const result = await ddb.scan({ TableName: TABLE }).promise();
    return ((result.Items || []) as any[])
      .filter((i) => i.type === 'mentoring')
      .map((i) => ({
        sessionId: i.SK.replace('SESSION#', ''),
        title: i.title,
        description: i.description || '',
        mentorName: i.mentorName,
        mentorId: i.mentorId || '',
        pastorName: i.pastorName || '',
        pastorId: i.pastorId || '',
        status: i.status,
        scheduledAt: i.scheduledAt,
        meetingUrl: i.meetingUrl,
        createdBy: i.createdBy || '',
      }));
  }

  async createMentoringSession(data: {
    title: string; description: string; scheduledAt: string; meetingUrl?: string;
    mentorName: string; mentorId: string; pastorName: string; pastorId: string;
  }, createdBy: string): Promise<MentoringSession> {
    const sessionId = uuid();
    const item = {
      PK: `USER#${data.mentorId}`,
      SK: `SESSION#${sessionId}`,
      type: 'mentoring',
      title: data.title,
      description: data.description,
      mentorName: data.mentorName,
      mentorId: data.mentorId,
      pastorName: data.pastorName,
      pastorId: data.pastorId,
      status: 'scheduled',
      scheduledAt: data.scheduledAt,
      meetingUrl: data.meetingUrl || '',
      createdBy,
      createdAt: new Date().toISOString(),
    };
    await ddb.put({ TableName: TABLE, Item: item }).promise();
    // Also create entry for the pastor so they can see it
    if (data.pastorId !== data.mentorId) {
      await ddb.put({
        TableName: TABLE,
        Item: { ...item, PK: `USER#${data.pastorId}` },
      }).promise();
    }
    return {
      sessionId, title: data.title, description: data.description,
      mentorName: data.mentorName, mentorId: data.mentorId,
      pastorName: data.pastorName, pastorId: data.pastorId,
      status: 'scheduled', scheduledAt: data.scheduledAt,
      meetingUrl: data.meetingUrl, createdBy,
    };
  }

  async deleteMentoringSession(sessionId: string, userId: string): Promise<void> {
    await ddb.delete({ TableName: TABLE, Key: { PK: `USER#${userId}`, SK: `SESSION#${sessionId}` } }).promise();
  }

  async registerParticipation(userId: string, sessionId: string): Promise<void> {
    await ddb.put({
      TableName: TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: `SESSION#${sessionId}`,
        status: 'scheduled',
        registeredAt: new Date().toISOString(),
      },
    }).promise();
  }

  async completeSession(sessionId: string, userId: string): Promise<void> {
    await ddb.update({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: `SESSION#${sessionId}` },
      UpdateExpression: 'SET #s = :s, completedAt = :c',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'completed', ':c': new Date().toISOString() },
    }).promise();
  }
}
