import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { APIErrorReason } from "../../common/controller/APIErrorReason";
import { APIError } from "../../common/controller/APIError";

/**
 * Extracts the `secret` field from the request header.
 *
 * Notice that it will throw `APIError REQUIRED` if no _Secret_ header can be found
 */
export const SecretHeader = createParamDecorator((data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['secret'] as string;

    if(!secret)
        throw new APIError({reason: APIErrorReason.REQUIRED, message: 'The "Secret" header is required'})

    return secret;
});