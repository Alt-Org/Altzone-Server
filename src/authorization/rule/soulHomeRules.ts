import { InferSubjects, MongoAbility } from '@casl/ability';
import { AllowedAction } from '../caslAbility.factory';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability';
import { Action } from '../enum/action.enum';
import { RulesSetterAsync } from '../type/RulesSetter.type';
import { getClan_id } from '../util/getClan_id';
import { NotFoundException } from '@nestjs/common';
import { ModelName } from '../../common/enum/modelName.enum';
import { ClanDto } from '../../clan/dto/clan.dto';
import { MongooseError } from 'mongoose';

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const soulHomeRules: RulesSetterAsync<Ability, Subjects> = async (
  user,
  subject: any,
  action,
  subjectObj: any,
  requestHelperService,
) => {
  const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

  if (action === Action.read) {
    can(Action.read_request, subject);
    can(Action.read_response, subject);
  }

  if (
    action === Action.update ||
    action === Action.delete ||
    action === Action.create
  ) {
    const clan_id = await getClan_id(user, requestHelperService);
    const clan = await requestHelperService.getModelInstanceById(
      ModelName.CLAN,
      clan_id,
      ClanDto,
    );
    if (!clan || clan instanceof MongooseError)
      throw new NotFoundException(
        'The clan with that _id is not found. Can not check is the logged-in user clan admin',
      );
    const isClanAdmin = clan.admin_ids.includes(user.player_id);
    if (!isClanAdmin) throw new NotFoundException('you are not an admin');
    can(Action.create_request, subject);
    can(Action.update_request, subject);
    can(Action.delete_request, subject);
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
};
