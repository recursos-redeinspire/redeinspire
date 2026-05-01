import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  PolicyDocument,
  Statement,
} from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

// Role-based access control mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  pastor_presidente: [
    'auth/*',
    'content/*',
    'search/*',
    'trails/*',
    'mentoring/*',
    'dashboard/*',
    'messages/*',
    'map/*',
    'planning/*',
    'podcast/*',
    'reports/*',
  ],
  lider: [
    'auth/profile',
    'content/*',
    'search/*',
    'trails/*',
    'mentoring/*',
    'messages/inbox',
    'map/*',
    'planning/*',
    'podcast/*',
  ],
  membro: [
    'auth/profile',
    'content/*',
    'search/*',
    'map/*',
  ],
};

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    // Validate token by calling Cognito GetUser
    const userResponse = await cognitoClient.send(
      new GetUserCommand({ AccessToken: token })
    );

    const attributes = userResponse.UserAttributes ?? [];
    const role =
      attributes.find((a) => a.Name === 'custom:role')?.Value ?? 'membro';
    const churchId =
      attributes.find((a) => a.Name === 'custom:churchId')?.Value ?? '';
    const userId =
      attributes.find((a) => a.Name === 'sub')?.Value ?? '';
    const email =
      attributes.find((a) => a.Name === 'email')?.Value ?? '';
    const userStatus =
      attributes.find((a) => a.Name === 'custom:status')?.Value ?? 'active';

    // Block access for disabled/blocked users
    if (userStatus === 'inactive' || userStatus === 'blocked') {
      return generatePolicy(userId, 'Deny', event.methodArn, {
        role,
        churchId,
        email,
        status: userStatus,
      });
    }

    const allowedResources = buildAllowedResources(role, event.methodArn);

    return generatePolicyWithResources(userId, allowedResources, {
      role,
      churchId,
      email,
      status: userStatus,
    });
  } catch (err) {
    console.error('Authorization failed:', err);
    throw new Error('Unauthorized');
  }
};

function buildAllowedResources(role: string, methodArn: string): string[] {
  const permissions = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.membro;
  const arnParts = methodArn.split(':');
  const apiGatewayArnPart = arnParts[5].split('/');
  const region = arnParts[3];
  const accountId = arnParts[4];
  const apiId = apiGatewayArnPart[0];
  const stage = apiGatewayArnPart[1];

  return permissions.map((perm) => {
    return `arn:aws:execute-api:${region}:${accountId}:${apiId}/${stage}/*/${perm}`;
  });
}

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: Record<string, string>
): APIGatewayAuthorizerResult {
  const statement: Statement = {
    Action: 'execute-api:Invoke',
    Effect: effect,
    Resource: resource,
  };

  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: [statement],
  };

  return {
    principalId,
    policyDocument,
    context,
  };
}

function generatePolicyWithResources(
  principalId: string,
  resources: string[],
  context: Record<string, string>
): APIGatewayAuthorizerResult {
  const statements: Statement[] = resources.map((resource) => ({
    Action: 'execute-api:Invoke',
    Effect: 'Allow' as const,
    Resource: resource,
  }));

  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: statements,
  };

  return {
    principalId,
    policyDocument,
    context,
  };
}
