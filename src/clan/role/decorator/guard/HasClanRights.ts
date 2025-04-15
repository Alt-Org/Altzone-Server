import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from '../../../../player/schemas/player.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { APIError } from '../../../../common/controller/APIError';
import { APIErrorReason } from '../../../../common/controller/APIErrorReason';
import { Clan } from '../../../clan.schema';
import { ClanBasicRight } from '../../enum/clanBasicRight.enum';
import { Reflector } from '@nestjs/core';

const CLAN_RIGHTS_METADATA = Symbol('CLAN_RIGHTS_METADATA');
function setClanRights(rightsToHave: ClanBasicRight[]) {
  return SetMetadata(CLAN_RIGHTS_METADATA, rightsToHave);
}

/**
 * Determines whenever a logged-in player has all the clan basic rights required
 * @param rightsToHave all clan basic rights player must have
 *
 * @returns decorator to be used
 */
export default function HasClanRights(rightsToHave: ClanBasicRight[]) {
  return applyDecorators(
    setClanRights(rightsToHave),
    UseGuards(HasClanRightsGuard),
  );
}

@Injectable()
export class HasClanRightsGuard implements CanActivate {
  constructor(
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Determines whenever a logged-in user has all the clan rights required.
   * Notice that it uses reflection under the hood from which it gets what rights are required.
   *
   * @param context context where the method is called
   *
   * @returns true if player has all the required rights in the clan
   * @throws APIError if:
   * - MISCONFIGURED `Request` does not have user
   * - NOT_FOUND player or clan can not be found (based on the `Request` `user` object)
   * - NOT_AUTHORIZED player is not in any clan or does not have all the required rights
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        field: 'user',
        value: user,
        message: 'The HasClanRightsGuard guard requires an authenticated user',
      });
    }

    const player = await this.playerModel.findById(user.player_id);

    if (!player)
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        field: 'player_id',
        value: user.player_id,
        message: 'Logged-in player does not exists',
      });

    if (!player.clan_id)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        field: 'clan_id',
        value: player.clan_id,
        message: 'Logged-in player is not a member of any clan',
      });

    if (!player.clanRole_id)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        field: 'clanRole_id',
        value: player.clanRole_id,
        message: 'Logged-in player does not have any role',
      });

    const clan = await this.clanModel.findById(player.clan_id);
    if (!clan)
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        field: 'clan_id',
        value: player.clan_id.toString(),
        message:
          'Clan with _id, where logged-in player is a member does not exists',
      });

    const playerRole = clan.roles.find(
      (role) => role._id.toString() === player.clanRole_id.toString(),
    );
    if (!playerRole)
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        field: 'clanRole_id',
        value: player.clanRole_id.toString(),
        message: 'Role of logged-in player does not exists',
      });

    if (!playerRole.rights) playerRole.rights = {};

    const rightsToHave = this.reflector.get<ClanBasicRight[]>(
      CLAN_RIGHTS_METADATA,
      context.getHandler(),
    );

    const errors: APIError[] = [];
    for (const rightToHave of rightsToHave) {
      if (!playerRole.rights[rightToHave]) {
        errors.push(
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            field: 'rights',
            value: rightToHave,
            message: 'Logged-in player role does not have all required rights',
          }),
        );
      }
    }

    if (errors.length > 0) throw errors;

    return true;
  }
}
