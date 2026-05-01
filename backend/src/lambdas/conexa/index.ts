import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConexaService } from '../../services/conexa.service';

const svc = new ConexaService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const pathParts = event.path.split('/').filter(Boolean);
    const body = JSON.parse(event.body || '{}');

    if (pathParts.includes('webhook')) {
      await svc.handleWebhook({ churchId: body.churchId, action: body.action });
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Webhook processado' }) };
    }

    if (pathParts.includes('sync')) {
      await svc.syncCadastro(body.churchId, body.cnpj, body.cpfLider);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Cadastro sincronizado' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Rota não encontrada' }) };
  } catch (err: any) {
    console.error('Conexa integration error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Erro na integração' }) };
  }
};
