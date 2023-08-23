import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {ClanDto} from "../../clan/dto/clan.dto";
import {UpdateClanDto} from "../../clan/dto/updateClan.dto";
import {ModelName} from "../../common/enum/modelName.enum";
import {MongooseError} from "mongoose";
import {NotFoundException} from "@nestjs/common";
import {getClan_id} from "../util/getClan_id";

type Subjects = InferSubjects<typeof ClanDto | typeof UpdateClanDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const clanRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subject_id, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.create || action === Action.read){
        const clan_id = await getClan_id(user, requestHelperService);
        can(Action.create_request, subject);

        // const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, {_id: clan_id});
    }

    if(action === Action.update || action === Action.delete){
        const clan: ClanDto = await requestHelperService.getModelInstanceById(ModelName.CLAN, subject_id, ClanDto);
        if(clan && !(clan instanceof MongooseError)){
            const isClanAdmin = clan.admin_ids.includes(user.player_id);
            if(isClanAdmin){
                can(Action.update_request, subject);
                can(Action.delete_request, subject);
            }
        } else {
            throw new NotFoundException('The clan with that _id is not found');
        }
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}