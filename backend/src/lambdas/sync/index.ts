import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConexaService } from '../../services/conexa.service';

const svc = new ConexaService();
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  return true;
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  return true;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { churchId, cnpj, cpfLider } = body;

    if (!churchId) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'churchId é obrigatório' }) };
    }

    if (cnpj && !validateCNPJ(cnpj)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'CNPJ inválido' }) };
    }

    if (cpfLider && !validateCPF(cpfLider)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'CPF inválido' }) };
    }

    await svc.syncCadastro(churchId, cnpj || '', cpfLider || '');
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Sincronização concluída' }) };
  } catch (err: any) {
    console.error('Sync error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
