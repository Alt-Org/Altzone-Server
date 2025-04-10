import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RequestHelperService } from '../../requestHelper/requestHelper.service';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { ModelName } from '../../common/enum/modelName.enum';
import { PlayerDto } from '../../player/dto/player.dto';

@Injectable()
export class ClanIdGuard implements CanActivate {
  constructor(private readonly requestHelperService: RequestHelperService) {}

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

    const player = await this.requestHelperService.getModelInstanceById(
      ModelName.PLAYER,
      user.player_id,
      PlayerDto,
    );

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

    user.clan_id = player.clan_id;

    return true;
  }
}
