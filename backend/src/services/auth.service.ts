import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDisableUserCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  CreateLeaderDTO,
  LoginDTO,
  AuthSession,
  ErrorResponse,
} from '../types';

const cognitoClient = new CognitoIdentityProviderClient({});
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const USERS_TABLE = process.env.USERS_TABLE!;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

function createErrorResponse(
  statusCode: number,
  errorCode: string,
  message: string,
  details?: Record<string, string>
): ErrorResponse {
  return {
    statusCode,
    errorCode,
    message,
    details,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  };
}

export async function registerLeader(
  pastorId: string,
  leaderData: CreateLeaderDTO
): Promise<UserProfile> {
  // Verify pastor exists and has correct role
  const pastor = await getUserProfile(pastorId);
  if (!pastor || pastor.role !== 'pastor_presidente') {
    throw createErrorResponse(
      403,
      'INSUFFICIENT_PERMISSIONS',
      'Apenas pastores presidentes podem cadastrar líderes'
    );
  }

  const userId = uuidv4();
  const tempPassword = `Temp${uuidv4().slice(0, 8)}!`;

  // Create user in Cognito
  await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: leaderData.email,
      UserAttributes: [
        { Name: 'email', Value: leaderData.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: leaderData.name },
        { Name: 'custom:churchId', Value: leaderData.churchId },
        { Name: 'custom:role', Value: 'lider' },
      ],
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS',
    })
  );

  // Set permanent password
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: leaderData.email,
      Password: tempPassword,
      Permanent: true,
    })
  );

  const profile: UserProfile = {
    userId,
    name: leaderData.name,
    email: leaderData.email,
    role: 'lider',
    churchId: leaderData.churchId,
    ministries: leaderData.ministries,
    status: 'active',
  };

  // Save to DynamoDB
  await ddbClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        GSI1PK: `CHURCH#${leaderData.churchId}`,
        GSI1SK: `USER#${userId}`,
        ...profile,
        cpf: leaderData.cpf,
        cognitoUsername: leaderData.email,
        createdAt: new Date().toISOString(),
        createdBy: pastorId,
        lastAccessAt: new Date().toISOString(),
      },
    })
  );

  return profile;
}

export async function login(credentials: LoginDTO): Promise<AuthSession> {
  try {
    const authResult = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: credentials.email,
          PASSWORD: credentials.password,
        },
      })
    );

    if (!authResult.AuthenticationResult) {
      throw createErrorResponse(
        401,
        'AUTH_FAILED',
        'Credenciais inválidas. Verifique seu email e senha.'
      );
    }

    // Find user profile in DynamoDB by email
    const profile = await findUserByEmail(credentials.email);

    if (!profile) {
      throw createErrorResponse(404, 'USER_NOT_FOUND', 'Perfil não encontrado');
    }

    if (profile.status === 'inactive') {
      throw createErrorResponse(
        403,
        'USER_DISABLED',
        'Sua conta foi desativada. Entre em contato com o administrador.'
      );
    }

    if (profile.status === 'blocked') {
      throw createErrorResponse(
        403,
        'CHURCH_BLOCKED',
        'O acesso da sua igreja foi bloqueado. Entre em contato com o administrador.'
      );
    }

    // Update last access
    await ddbClient.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { PK: `USER#${profile.userId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET lastAccessAt = :now',
        ExpressionAttributeValues: { ':now': new Date().toISOString() },
      })
    );

    return {
      accessToken: authResult.AuthenticationResult.AccessToken!,
      refreshToken: authResult.AuthenticationResult.RefreshToken!,
      userProfile: profile,
    };
  } catch (error: unknown) {
    // Log failed attempt
    console.error('Login attempt failed:', {
      email: credentials.email,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if ((error as ErrorResponse).errorCode) {
      throw error;
    }

    throw createErrorResponse(
      401,
      'AUTH_FAILED',
      'Credenciais inválidas. Verifique seu email e senha.'
    );
  }
}

export async function deactivateLeader(
  pastorId: string,
  leaderId: string
): Promise<void> {
  // Verify pastor has permission
  const pastor = await getUserProfile(pastorId);
  if (!pastor || pastor.role !== 'pastor_presidente') {
    throw createErrorResponse(
      403,
      'INSUFFICIENT_PERMISSIONS',
      'Apenas pastores presidentes podem desativar líderes'
    );
  }

  const leader = await getUserProfile(leaderId);
  if (!leader) {
    throw createErrorResponse(404, 'USER_NOT_FOUND', 'Líder não encontrado');
  }

  // Verify pastor and leader belong to same church
  if (pastor.churchId !== leader.churchId) {
    throw createErrorResponse(
      403,
      'INSUFFICIENT_PERMISSIONS',
      'Você só pode desativar líderes da sua própria igreja'
    );
  }

  // Disable user in Cognito
  await cognitoClient.send(
    new AdminDisableUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: leader.email,
    })
  );

  // Update status in DynamoDB
  await ddbClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { PK: `USER#${leaderId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET #status = :status, deactivatedAt = :now, deactivatedBy = :pastorId',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'inactive',
        ':now': new Date().toISOString(),
        ':pastorId': pastorId,
      },
    })
  );
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
    })
  );

  if (!result.Item) {
    return null;
  }

  return {
    userId: result.Item.userId,
    name: result.Item.name,
    email: result.Item.email,
    role: result.Item.role,
    churchId: result.Item.churchId,
    ministries: result.Item.ministries ?? [],
    status: result.Item.status,
  };
}

async function findUserByEmail(email: string): Promise<UserProfile | null> {
  // In production, add a GSI on email for better performance.
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

  const result = await ddbClient.send(
    new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: 'email = :email AND SK = :sk',
      ExpressionAttributeValues: {
        ':email': email,
        ':sk': 'PROFILE',
      },
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  const item = result.Items[0];
  return {
    userId: item.userId,
    name: item.name,
    email: item.email,
    role: item.role,
    churchId: item.churchId,
    ministries: item.ministries ?? [],
    status: item.status,
  };
}

export async function syncConexaStatus(
  churchId: string,
  status: 'blocked' | 'unblocked'
): Promise<void> {
  const CHURCHES_TABLE = process.env.CHURCHES_TABLE!;

  // Update church status
  const newStatus = status === 'blocked' ? 'blocked' : 'active';
  await ddbClient.send(
    new UpdateCommand({
      TableName: CHURCHES_TABLE,
      Key: { PK: `CHURCH#${churchId}`, SK: 'META' },
      UpdateExpression: 'SET #status = :status, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':now': new Date().toISOString(),
      },
    })
  );

  // Propagate status to all users of this church
  const userStatus = status === 'blocked' ? 'blocked' : 'active';
  const usersResult = await ddbClient.send(
    new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :churchPk',
      ExpressionAttributeValues: {
        ':churchPk': `CHURCH#${churchId}`,
      },
    })
  );

  if (usersResult.Items) {
    const updatePromises = usersResult.Items.map((item) =>
      ddbClient.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET #status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':status': userStatus },
        })
      )
    );
    await Promise.all(updatePromises);
  }
}
