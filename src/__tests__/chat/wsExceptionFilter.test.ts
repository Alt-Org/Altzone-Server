import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GlobalWsExceptionFilter } from '../../chat/decorator/wsExceptionFilter.decorator';

describe('GlobalWsExceptionFilter', () => {
  const client = { send: jest.fn() };
  const host = {
    switchToWs: () => ({ getClient: () => client }),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the validation response for a bad WebSocket message', () => {
    const validationError = {
      statusCode: 400,
      error: 'Bad Request',
      errors: [{ field: 'emotion', message: 'emotion must be an enum value' }],
    };

    new GlobalWsExceptionFilter().catch(
      new BadRequestException(validationError),
      host,
    );

    expect(client.send).toHaveBeenCalledWith(
      JSON.stringify({ event: 'error', data: validationError }),
    );
  });

  it('preserves explicit WebSocket errors', () => {
    new GlobalWsExceptionFilter().catch(new WsException('Invalid event'), host);

    expect(client.send).toHaveBeenCalledWith(
      JSON.stringify({ event: 'error', data: 'Invalid event' }),
    );
  });
});
