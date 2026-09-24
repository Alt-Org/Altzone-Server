import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  WsExceptionFilter,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class GlobalWsExceptionFilter implements WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('ERROR:', exception);
    const client = host.switchToWs().getClient();
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception instanceof BadRequestException
          ? exception.getResponse()
          : 'Internal server error';

    client.send?.(JSON.stringify({ event: 'error', data: error }));
  }
}
