import { AllowedAction } from '../caslAbility.factory';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability';
import { Action } from '../enum/action.enum';
import { InferSubjects, MongoAbility } from '@casl/ability/dist/types';
import { RulesSetterAsync } from '../type/RulesSetter.type';
import { ModelName } from '../../common/enum/modelName.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { BoxDto } from '../../box/dto/box.dto';

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const boxRules: RulesSetterAsync<Ability, Subjects> = async (
  user,
  subject: any,
  action,
  subjectObj: any,
  requestHelperService,
) => {
  const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

  if (action === Action.read) {
    const box = await requestHelperService.getModelInstanceById(
      ModelName.BOX,
      subjectObj._id,
      BoxDto,
    );
    if (!box || box instanceof MongooseError)
      throw new NotFoundException(
        'Can not check ownership, box with that id not found',
      );

    if (box.adminProfile_id !== user.profile_id)
      throw new ForbiddenException(
        'Box does not belong to the logged-in Admin',
      );

    can(Action.read_request, subject);
    can(Action.read_response, subject);
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
};
