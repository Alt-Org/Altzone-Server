import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { APIError } from "../../../../common/controller/APIError";
import { APIErrorReason } from "../../../../common/controller/APIErrorReason";

/**
 * Custom decorator to extract the steal token from the request.
 * 
 * @param context - The execution context of the request.
 * @returns - The steal token from the request.
 * @throws - If the steal token is not provided.
 */
export const StealToken = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const stealToken = request["steal_token"];

    if (!stealToken) {
      throw new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        field: "steal_token",
        value: stealToken,
        message: "The steal token not provided",
      });
    }

    return stealToken;
  },
);
