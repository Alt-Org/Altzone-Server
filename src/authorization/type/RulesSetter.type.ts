import {User} from "../../auth/user";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";

export type RulesSetter<Ability, Subject, Actor = User> =
    (
        actor: Actor,
        subject: Subject,
        requestHelperService?: RequestHelperService
    ) =>
        Ability;

export type RulesSetterAsync<Ability, Subject, Actor = User> =
    (
        actor: Actor,
        subject: Subject,
        requestHelperService?: RequestHelperService
    ) =>
        Promise<Ability>;