import { AllowedAction } from '../caslAbility.factory';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Action } from '../enum/action.enum';
import { RulesSetterAsync } from '../type/RulesSetter.type';
import { NotFoundException } from '@nestjs/common';
import { ModelName } from '../../common/enum/modelName.enum';
import { MongooseError } from 'mongoose';
import { RoomDto } from '../../clanInventory/room/dto/room.dto';
import { SoulHomeDto } from '../../clanInventory/soulhome/dto/soulhome.dto';
import { getClan_id } from '../util/getClan_id';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const roomRules: RulesSetterAsync<Ability, Subjects> = async (
  user,
  subject: any,
  action,
  subjectObj: any,
  requestHelperService,
) => {
  const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

  if (action === Action.read || action === Action.create) {
    can(Action.read_request, subject);
    can(Action.read_response, subject);
    can(Action.create_request, subject);
  }

  if (action === Action.update || action === Action.delete) {
    const room = await requestHelperService.getModelInstanceById(
      ModelName.ROOM,
      subjectObj._id,
      RoomDto,
    );
    if (!room || room instanceof MongooseError)
      throw new NotFoundException(
        'Can not check ownership, room with that id not found',
      );

    const soulHome = await requestHelperService.getModelInstanceById(
      ModelName.SOULHOME,
      room.soulHome_id,
      SoulHomeDto,
    );

    const clan_id = await getClan_id(user, requestHelperService);

    if (
      !soulHome ||
      soulHome instanceof MongooseError ||
      !clan_id ||
      soulHome.clan_id !== clan_id
    )
      throw new ServiceError({
        reason: SEReason.NOT_AUTHORIZED,
        message: "Room does not belong to logged-in player's Clan",
      });

    can(Action.update_request, subject);
    can(Action.delete_request, subject);
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
};
