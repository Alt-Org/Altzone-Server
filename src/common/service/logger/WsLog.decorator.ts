import { RequestLoggerService } from './RequestLogger.service';

/**
 * Decorator for logging WebSocket handler method calls.
 *
 * This decorator wraps the target method and logs its execution details,
 * including method name, client information, input data, response time,
 * and any errors that occur during execution. It expects the decorated
 * class to have a `requestLoggerService` property implementing
 * `RequestLoggerService`.
 */
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
        await logger?.log({
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
