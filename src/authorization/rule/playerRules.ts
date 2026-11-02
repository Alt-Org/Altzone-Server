import { AllowedAction } from '../caslAbility.factory';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability';
import { Action } from '../enum/action.enum';
import { InferSubjects, MongoAbility } from '@casl/ability/dist/types';
import { PlayerDto } from '../../player/dto/player.dto';
import { RulesSetterAsync } from '../type/RulesSetter.type';
import { ModelName } from '../../common/enum/modelName.enum';
import { ClanDto } from '../../clan/dto/clan.dto';
import { isLastClanAdmin } from '../util/isLastClanAdmin';
import { ForbiddenException } from '@nestjs/common';

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const playerRules: RulesSetterAsync<Ability, Subjects> = async (
  user,
  subject: any,
  action,
  subjectObj: any,
  requestHelperService,
) => {
  const { can, cannot, build } = new AbilityBuilder<Ability>(
    createMongoAbility,
  );

  if (action === Action.create || action === Action.read) {
    can(Action.create_request, subject);

    const publicFields = [
      '_id',
      'name',
      'points',
      'backpackCapacity',
      'uniqueIdentifier',
      'above13',
      'parentalAuth',
      'gameStatistics',
      'battleCharacter_ids',
      'currentAvatarId',
      'profile_id',
      'clan_id',
      'avatar',
      'clanRole_id',
    ];
    can(Action.read_request, subject);
    can(Action.read_response, subject, publicFields);
    can(Action.read_response, subject, { _id: user.player_id });
  }

  if (action === Action.update) {
    can(Action.update_request, subject, { _id: user.player_id });
    cannot(Action.update_request, subject, ['clan_id']);
  }

  if (action === Action.delete) {
    if (subjectObj._id !== user.player_id)
      throw new ForbiddenException(
        'The logged-in user can not delete other users profiles',
      );

    const playerToDelete = await requestHelperService.getModelInstanceById(
      ModelName.PLAYER,
      subjectObj._id,
      PlayerDto,
    );
    const playerClan = await requestHelperService.getModelInstanceById(
      ModelName.CLAN,
      playerToDelete.clan_id,
      ClanDto,
    );
    const isLastAdmin = isLastClanAdmin(playerClan, subjectObj._id);

    if (isLastAdmin)
      throw new ForbiddenException(
        'Player is the last clan admin. Please add another clan admin or remove the clan first',
      );

    can(Action.delete_request, subject, { _id: user.player_id });
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
};
