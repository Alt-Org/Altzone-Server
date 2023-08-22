import {User} from "../../auth/user";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";
import {SupportedAction} from "../authorization.interceptor";

export type RulesSetter<Ability, Subject, Actor = User> =
    (
        actor: Actor,
        subject: Subject,
        action: SupportedAction,
        subject_id: string | undefined,
        requestHelperService?: RequestHelperService
    ) =>
        Ability;

export type RulesSetterAsync<Ability, Subject, Actor = User> =
    (
        actor: Actor,
        subject: Subject,
        action: SupportedAction,
        subject_id: string | undefined,
        requestHelperService?: RequestHelperService
    ) =>
        Promise<Ability>;