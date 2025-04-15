import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { APIError } from '../controller/APIError';
import { APIErrorReason } from '../controller/APIErrorReason';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from '../../player/schemas/player.schema';
import { Model } from 'mongoose';

/**
 * Determine the clan _id of the logged-in player.
 *
 * Notice that this decorator must be used where paths have authentication and the player expected to be in a clan.
 *
 * It will return APIErrors to the client if:
 * - MISCONFIGURED the path has no authentication
 * - NOT_FOUND the player can not be found
 * - NOT_AUTHORIZED the player is not in any clan
 */
export default function DetermineClanId() {
  return applyDecorators(UseGuards(ClanIdGuard));
}

@Injectable()
export class ClanIdGuard implements CanActivate {
  constructor(@InjectModel(Player.name) public readonly model: Model<Player>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        field: 'user',
        value: user,
        message: 'The ClanIdGuard requires an authenticated user.',
      });
    }

    const player = await this.model.findById(user.player_id);

    if (!player) {
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'Player not found.',
      });
    }

    if (!player.clan_id) {
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'Player is not a member of a clan.',
      });
    }

    user.clan_id = player.clan_id.toString();

    return true;
  }
}
