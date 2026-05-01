import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import {
  registerLeader,
  login,
  deactivateLeader,
  getUserProfile,
} from '../../services/auth.service';
import { CreateLeaderDTO, LoginDTO, ErrorResponse } from '../../types';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function success(body: unknown, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function error(err: ErrorResponse): APIGatewayProxyResult {
  return {
    statusCode: err.statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(err),
  };
}

function badRequest(message: string, details?: Record<string, string>): APIGatewayProxyResult {
  return error({
    statusCode: 400,
    errorCode: 'VALIDATION_ERROR',
    message,
    details,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  });
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;

  try {
    // POST /auth/register
    if (httpMethod === 'POST' && path.endsWith('/register')) {
      return await handleRegister(event);
    }

    // POST /auth/login
    if (httpMethod === 'POST' && path.endsWith('/login')) {
      return await handleLogin(event);
    }

    // POST /auth/deactivate
    if (httpMethod === 'POST' && path.endsWith('/deactivate')) {
      return await handleDeactivate(event);
    }

    // GET /auth/profile
    if (httpMethod === 'GET' && path.endsWith('/profile')) {
      return await handleGetProfile(event);
    }

    return error({
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      message: 'Rota não encontrada',
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if ((err as ErrorResponse).errorCode) {
      return error(err as ErrorResponse);
    }

    console.error('Unhandled error:', err);
    return error({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    });
  }
};

async function handleRegister(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return badRequest('Corpo da requisição é obrigatório');
  }

  const data = JSON.parse(event.body) as CreateLeaderDTO & { pastorId?: string };
  const pastorId =
    data.pastorId ??
    event.requestContext.authorizer?.claims?.sub ??
    event.requestContext.authorizer?.principalId;

  if (!pastorId) {
    return badRequest('ID do pastor é obrigatório');
  }

  // Validate required fields
  const validationErrors: Record<string, string> = {};
  if (!data.name) validationErrors.name = 'Nome é obrigatório';
  if (!data.email) validationErrors.email = 'Email é obrigatório';
  if (!data.cpf) validationErrors.cpf = 'CPF é obrigatório';
  if (!data.churchId) validationErrors.churchId = 'ID da igreja é obrigatório';
  if (!data.ministries || data.ministries.length === 0) {
    validationErrors.ministries = 'Pelo menos um ministério é obrigatório';
  }

  if (Object.keys(validationErrors).length > 0) {
    return badRequest('Dados de entrada inválidos', validationErrors);
  }

  const profile = await registerLeader(pastorId, {
    name: data.name,
    email: data.email,
    cpf: data.cpf,
    ministries: data.ministries,
    churchId: data.churchId,
  });

  return success(profile, 201);
}

async function handleLogin(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return badRequest('Corpo da requisição é obrigatório');
  }

  const credentials = JSON.parse(event.body) as LoginDTO;

  if (!credentials.email || !credentials.password) {
    return badRequest('Email e senha são obrigatórios');
  }

  const session = await login(credentials);
  return success(session);
}

async function handleDeactivate(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return badRequest('Corpo da requisição é obrigatório');
  }

  const data = JSON.parse(event.body) as {
    pastorId?: string;
    leaderId: string;
  };
  const pastorId =
    data.pastorId ??
    event.requestContext.authorizer?.claims?.sub ??
    event.requestContext.authorizer?.principalId;

  if (!pastorId) {
    return badRequest('ID do pastor é obrigatório');
  }
  if (!data.leaderId) {
    return badRequest('ID do líder é obrigatório');
  }

  await deactivateLeader(pastorId, data.leaderId);
  return success({ message: 'Líder desativado com sucesso' });
}

async function handleGetProfile(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const userId =
    event.queryStringParameters?.userId ??
    event.requestContext.authorizer?.claims?.sub ??
    event.requestContext.authorizer?.principalId;

  if (!userId) {
    return badRequest('ID do usuário é obrigatório');
  }

  const profile = await getUserProfile(userId);

  if (!profile) {
    return error({
      statusCode: 404,
      errorCode: 'USER_NOT_FOUND',
      message: 'Perfil não encontrado',
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    });
  }

  return success(profile);
}
