import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {ClanMetaDto} from "../../metaData/clan/dto/clanMeta.dto";

type Subjects = InferSubjects<typeof ClanMetaDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const metaDataRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.read){
        can(Action.read_request, subject);
        can(Action.read_response, subject);
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}