import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { APIError } from "../../../common/controller/APIError";
import { APIErrorReason } from "../../../common/controller/APIErrorReason";

export const StealToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
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
