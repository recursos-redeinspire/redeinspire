import { DynamoDB } from 'aws-sdk';
import { Trail, TrailProgress, Certificate, AcademyCourse } from '../types';
import { v4 as uuid } from 'uuid';

const ddb = new DynamoDB.DocumentClient();
const TRAILS_TABLE = process.env.TRAILS_TABLE || 'Trails';
const PROGRESS_TABLE = process.env.TRAIL_PROGRESS_TABLE || 'TrailProgress';

export class TrailService {
  async getTrails(): Promise<Trail[]> {
    const result = await ddb.scan({ TableName: TRAILS_TABLE }).promise();
    return (result.Items || []) as Trail[];
  }

  async getTrailDetail(trailId: string): Promise<Trail | null> {
    const result = await ddb.get({
      TableName: TRAILS_TABLE,
      Key: { PK: `TRAIL#${trailId}`, SK: 'META' },
    }).promise();
    return (result.Item as Trail) || null;
  }

  async startTrail(userId: string, trailId: string): Promise<TrailProgress> {
    const now = new Date().toISOString();
    const progress: TrailProgress = {
      trailId, userId, completedModules: [], percentComplete: 0, startedAt: now,
    };
    await ddb.put({
      TableName: PROGRESS_TABLE,
      Item: { PK: `USER#${userId}`, SK: `TRAIL#${trailId}`, ...progress },
    }).promise();
    return progress;
  }

  async completeModule(userId: string, trailId: string, moduleId: string): Promise<TrailProgress> {
    const trail = await this.getTrailDetail(trailId);
    const totalModules = trail?.modules?.length || 1;

    const existing = await ddb.get({
      TableName: PROGRESS_TABLE,
      Key: { PK: `USER#${userId}`, SK: `TRAIL#${trailId}` },
    }).promise();

    const progress = (existing.Item || { completedModules: [] }) as any;
    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }
    progress.percentComplete = Math.round((progress.completedModules.length / totalModules) * 100);

    if (progress.percentComplete >= 100) {
      progress.completedAt = new Date().toISOString();
    }

    await ddb.put({
      TableName: PROGRESS_TABLE,
      Item: { PK: `USER#${userId}`, SK: `TRAIL#${trailId}`, ...progress },
    }).promise();

    return progress as TrailProgress;
  }

  async getUserProgress(userId: string): Promise<TrailProgress[]> {
    const result = await ddb.query({
      TableName: PROGRESS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'TRAIL#' },
    }).promise();
    return (result.Items || []) as TrailProgress[];
  }

  async getCertificate(userId: string, trailId: string): Promise<Certificate | null> {
    const progress = await ddb.get({
      TableName: PROGRESS_TABLE,
      Key: { PK: `USER#${userId}`, SK: `TRAIL#${trailId}` },
    }).promise();
    if (!progress.Item || (progress.Item as any).percentComplete < 100) return null;
    return {
      certificateId: uuid(),
      trailId, userId,
      issuedAt: (progress.Item as any).completedAt || new Date().toISOString(),
      downloadUrl: `/api/certificates/${trailId}/${userId}`,
    };
  }

  async getAcademyCourses(): Promise<AcademyCourse[]> {
    const trails = await this.getTrails();
    return trails.map((t) => ({
      courseId: t.trailId, title: t.title, description: t.description,
      durationHours: Math.round(t.totalDurationMinutes / 60), points: t.points, trailId: t.trailId,
    }));
  }

  async assignWelcomeTrail(userId: string): Promise<TrailProgress> {
    return this.startTrail(userId, 'boas-vindas');
  }
}
