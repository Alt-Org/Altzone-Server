import { RequestLoggerService } from './RequestLogger.service';

export function WsLog() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      interface HasLoggerService {
        requestLoggerService: RequestLoggerService;
      }
      const logger: RequestLoggerService = (this as HasLoggerService)
        .requestLoggerService;
      const [message, client] = args;
      const start = Date.now();

      const logWs = async (responseTime: number, error?: any) => {
        await logger?.log?.({
          type: 'ws',
          method: propertyKey,
          client: client?.user?.playerId,
          data: message,
          responseTime,
          ...(error ? { error } : {}),
        });
      };

      try {
        const result = await original.apply(this, args);
        const responseTime = Date.now() - start;
        await logWs(responseTime);
        return result;
      } catch (error) {
        const responseTime = Date.now() - start;
        await logWs(responseTime, error);
        throw error;
      }
    };
  };
}
