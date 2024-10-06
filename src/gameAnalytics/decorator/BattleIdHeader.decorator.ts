import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { APIError } from "../../common/controller/APIError";
import { APIErrorReason } from "../../common/controller/APIErrorReason";

/**
 * Extract the `battle-id` field from the request header.
 *
 * Notice that it will throw `APIError REQUIRED` if no _Battle-Id_ header can be found
 */
export const BattleIdHeader = createParamDecorator((data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const battleId = request.headers['battle-id'] as string;

    if(!battleId)
        throw new APIError({
            reason: APIErrorReason.REQUIRED, 
            field: 'Battle-Id', 
            value: battleId, 
            message: 'The "Battle-Id" header is required'
        });

    return battleId;
});