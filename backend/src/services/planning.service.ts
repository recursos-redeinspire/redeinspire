import { DynamoDB } from 'aws-sdk';
import { Plan } from '../types';
import { v4 as uuid } from 'uuid';

const ddb = new DynamoDB.DocumentClient();
const TABLE = process.env.PLANS_TABLE || 'Plans';

export class PlanningService {
  async createPlan(userId: string, type: 'sunday' | 'annual' | 'ministry', title: string, data: Record<string, unknown>): Promise<Plan> {
    const now = new Date().toISOString();
    const planId = uuid();
    const plan: Plan = { planId, userId, type, title, data, createdAt: now, updatedAt: now };
    await ddb.put({
      TableName: TABLE,
      Item: { PK: `USER#${userId}`, SK: `PLAN#${planId}`, ...plan },
    }).promise();
    return plan;
  }

  async getPlan(userId: string, planId: string): Promise<Plan | null> {
    const result = await ddb.get({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: `PLAN#${planId}` },
    }).promise();
    return (result.Item as Plan) || null;
  }

  async updatePlan(userId: string, planId: string, updates: Partial<Plan>): Promise<Plan | null> {
    const existing = await this.getPlan(userId, planId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await ddb.put({
      TableName: TABLE,
      Item: { PK: `USER#${userId}`, SK: `PLAN#${planId}`, ...updated },
    }).promise();
    return updated;
  }

  async getUserPlans(userId: string): Promise<Plan[]> {
    const result = await ddb.query({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'PLAN#' },
    }).promise();
    return (result.Items || []) as Plan[];
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    await ddb.delete({
      TableName: TABLE,
      Key: { PK: `USER#${userId}`, SK: `PLAN#${planId}` },
    }).promise();
  }
}
