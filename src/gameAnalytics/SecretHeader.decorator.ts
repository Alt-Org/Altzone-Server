import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Get the `Secret` field from the request header.
 */
export const SecretHeader = createParamDecorator((data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['secret'] as string;

    return secret;
});