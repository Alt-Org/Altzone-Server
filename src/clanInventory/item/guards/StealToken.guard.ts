import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AuthService } from "../../../auth/auth.service";
import { APIError } from "../../../common/controller/APIError";
import { APIErrorReason } from "../../../common/controller/APIErrorReason";

@Injectable()
export class StealTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  /**
   * Verifies that the request has a valid steal token attached.
   * 
   * @param context - The execution context of the request.
   * @returns - A promise that resolves to a boolean indicating whether the request is authorized.
   * @throws - If the steal_token is missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const stealToken = request.query.steal_token ?? request.body.steal_token;

    if (!stealToken) {
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: "steal_token is not provided",
        field: "steal_token",
        value: stealToken
      });
    }

    const decoded = await this.authService.verifyToken(stealToken);
    request.steal_token = decoded; // Attach the decoded token to the request object
    return true;
  }
}
