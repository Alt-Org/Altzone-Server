import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { UpdateClanDto } from "../../clan/dto/updateClan.dto";
import { ModelName } from "src/common/enum/modelName.enum";

type Subjects = InferSubjects<typeof ClanDto | typeof UpdateClanDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const clanRules: RulesSetterAsync<Ability, Subjects> = async (user, subject, requestHelperService) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === ClanDto){
        can(Action.create_request, subject);

        //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, {_id: user.clan_id});
    }

    if(subject === UpdateClanDto){
        const clan: ClanDto = await requestHelperService.getModelInstanceById(ModelName.CLAN, user.clan_id, ClanDto);
        const isClanAdmin = clan.admin_ids.includes(user.player_id);
        if(isClanAdmin){
            can(Action.update_request, subject);
            can(Action.delete_request, subject);
        }
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}