import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class APIRateLimitGuard extends ThrottlerGuard {
  /**
   * Resolves the key that requests are tracked by in priority order:
   * authenticated player_id -> body username -> client ip.
   *
   * Relies on the auth guard being registered as APP_GUARD before this guard,
   * so that `req.user` is already set for authenticated requests.
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
