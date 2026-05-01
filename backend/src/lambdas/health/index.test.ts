import { handler } from './index';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Health Lambda', () => {
  it('should return 200 with healthy status', async () => {
    const event = {} as APIGatewayProxyEvent;
    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('rede-inspire-api');
    expect(body.timestamp).toBeDefined();
  });

  it('should include CORS headers', async () => {
    const event = {} as APIGatewayProxyEvent;
    const result = await handler(event);

    expect(result.headers).toBeDefined();
    expect(result.headers!['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers!['Content-Type']).toBe('application/json');
  });
});
