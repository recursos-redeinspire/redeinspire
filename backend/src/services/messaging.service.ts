import { DynamoDB } from 'aws-sdk';
import { Message, CreateMessageDTO, PaginationDTO, PaginatedResult } from '../types';
import { v4 as uuid } from 'uuid';

const ddb = new DynamoDB.DocumentClient();
const TABLE = process.env.MESSAGES_TABLE || 'Messages';

export class MessagingService {
  async sendMessage(fromUserId: string, fromName: string, dto: CreateMessageDTO): Promise<Message> {
    const now = new Date().toISOString();
    const messageId = uuid();
    const message: Message = {
      messageId, fromUserId, fromName,
      toUserId: dto.toUserId, subject: dto.subject, body: dto.body,
      isRead: false, createdAt: now,
    };
    await ddb.put({
      TableName: TABLE,
      Item: {
        PK: `INBOX#${dto.toUserId}`,
        SK: `MSG#${now}#${messageId}`,
        GSI1PK: `SENT#${fromUserId}`,
        ...message,
      },
    }).promise();
    return message;
  }

  async getInbox(userId: string, pagination: PaginationDTO): Promise<PaginatedResult<Message>> {
    const result = await ddb.query({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `INBOX#${userId}` },
      ScanIndexForward: false,
    }).promise();
    const items = (result.Items || []) as Message[];
    const start = (pagination.page - 1) * pagination.pageSize;
    const paged = items.slice(start, start + pagination.pageSize);
    return {
      items: paged, totalCount: items.length,
      page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(items.length / pagination.pageSize),
    };
  }

  async markAsRead(userId: string, messageId: string): Promise<void> {
    const result = await ddb.query({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk',
      FilterExpression: 'messageId = :mid',
      ExpressionAttributeValues: { ':pk': `INBOX#${userId}`, ':mid': messageId },
    }).promise();
    if (result.Items && result.Items.length > 0) {
      const item = result.Items[0];
      await ddb.update({
        TableName: TABLE,
        Key: { PK: item.PK as string, SK: item.SK as string },
        UpdateExpression: 'SET isRead = :r',
        ExpressionAttributeValues: { ':r': true },
      }).promise();
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await ddb.query({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk',
      FilterExpression: 'isRead = :r',
      ExpressionAttributeValues: { ':pk': `INBOX#${userId}`, ':r': false },
    }).promise();
    return result.Count || 0;
  }
}
