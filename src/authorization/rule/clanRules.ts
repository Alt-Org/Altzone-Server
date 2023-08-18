import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetter} from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { UpdateClanDto } from "../../clan/dto/updateClan.dto";

type Subjects = InferSubjects<typeof ClanDto | typeof UpdateClanDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const clanRules: RulesSetter<Ability, Subjects> = (user, subject) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === ClanDto){
        can(Action.create_request, subject);

        //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, {_id: user.clan_id});

        can(Action.delete_request, subject, {_id: user.clan_id});
    }

    if(subject === UpdateClanDto){
        can(Action.update_request, subject, {_id: user.clan_id});
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}