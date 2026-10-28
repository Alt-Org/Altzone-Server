import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class APIRateLimitGuard extends ThrottlerGuard {
  /**
   * Skips non REST API traffic e.g. WebSockets.
   * @param context - The execution context of the request.
   * @returns - A promise that resolves to a boolean indicating whether to skip rate limiting or not.
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    return context.getType() !== 'http';
  }

  /**
   * Resolves the key that requests are tracked by in priority order :
   * authenticated player_id -> body username -> client ip.
   *
   * Note: relies on the auth guard being registered as APP_GUARD before this guard
   * so that `req.user` is already set for authenticated requests.
   * @param req - The request data (body, headers).
   * @returns - A promise that resolves to a string (the tracking key).
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const playerId = req.user?.player_id;
    if (playerId) {
      return `player_id:${playerId}`;
    }

    const username = req.body?.username;
    if (typeof username === 'string' && username) {
      return `username:${username}`;
    }

    return `ip:${req.ip}`;
  }
}
