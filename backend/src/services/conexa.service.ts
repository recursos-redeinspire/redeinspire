import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
const CHURCHES_TABLE = process.env.CHURCHES_TABLE || 'Churches';
const USERS_TABLE = process.env.USERS_TABLE || 'Users';

export class ConexaService {
  async handleWebhook(payload: { churchId: string; action: 'block' | 'unblock' }): Promise<void> {
    const newStatus = payload.action === 'block' ? 'blocked' : 'active';

    // Update church status
    await ddb.update({
      TableName: CHURCHES_TABLE,
      Key: { PK: `CHURCH#${payload.churchId}`, SK: 'META' },
      UpdateExpression: 'SET #s = :s, updatedAt = :u',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': newStatus, ':u': new Date().toISOString() },
    }).promise();

    // Propagate to all users of this church
    const usersResult = await ddb.query({
      TableName: USERS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `CHURCH#${payload.churchId}` },
    }).promise();

    const users = usersResult.Items || [];
    for (const user of users) {
      await this.retryWithBackoff(async () => {
        await ddb.update({
          TableName: USERS_TABLE,
          Key: { PK: user.PK as string, SK: 'PROFILE' },
          UpdateExpression: 'SET #s = :s',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':s': newStatus },
        }).promise();
      });
    }
  }

  async syncCadastro(churchId: string, cnpj: string, cpfLider: string): Promise<void> {
    await ddb.update({
      TableName: CHURCHES_TABLE,
      Key: { PK: `CHURCH#${churchId}`, SK: 'META' },
      UpdateExpression: 'SET cnpj = :cnpj, cpfLider = :cpf, syncedAt = :s',
      ExpressionAttributeValues: {
        ':cnpj': cnpj, ':cpf': cpfLider, ':s': new Date().toISOString(),
      },
    }).promise();
  }

  private async retryWithBackoff(fn: () => Promise<void>, maxRetries = 3): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await fn();
        return;
      } catch (err) {
        if (attempt === maxRetries - 1) throw err;
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
}
