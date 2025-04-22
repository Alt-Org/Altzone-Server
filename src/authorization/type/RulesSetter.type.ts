import { User } from '../../auth/user';
import { RequestHelperService } from '../../requestHelper/requestHelper.service';
import { SupportedAction } from '../authorization.interceptor';
import { AllowedSubject } from '../caslAbility.factory';
import { Connection } from 'mongoose';

export type RulesSetter<Ability, Subject, Actor = User> = (
  actor: Actor,
  subject: Subject,
  action: SupportedAction,
  subjectObj: AllowedSubject | undefined,
  requestHelperService?: RequestHelperService,
  connection?: Connection,
) => Ability;

export type RulesSetterAsync<Ability, Subject, Actor = User> = (
  actor: Actor,
  subject: Subject,
  action: SupportedAction,
  subjectObj: AllowedSubject | undefined,
  requestHelperService?: RequestHelperService,
  connection?: Connection,
) => Promise<Ability>;
