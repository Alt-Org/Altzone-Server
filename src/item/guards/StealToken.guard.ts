import {
	BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { APIError } from "../../common/controller/APIError";
import { APIErrorReason } from "../../common/controller/APIErrorReason";

@Injectable()
export class StealTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const stealToken = request.headers["steal_token"];

    if (!stealToken) {
      throw new BadRequestException({
        statusCode: 400,
        errors: [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            message: "Missing header steal_token",
          }),
        ],
      });
    }

    const decoded = await this.authService.verifyToken(stealToken);
    request.steal_token = decoded; // Attach the decoded token to the request object
    return true;
  }
}
