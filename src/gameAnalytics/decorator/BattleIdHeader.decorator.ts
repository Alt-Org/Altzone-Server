import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extract the `battle-id` field from the request header.
 */
export const BattleIdHeader = createParamDecorator((data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.headers['battle-id'] as string;
});