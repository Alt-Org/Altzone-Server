import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/rulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { ModelName } from "src/common/enum/modelName.enum";
import {getClan_id} from "../util/getClan_id";
import {StockDto} from "../../stock/dto/stock.dto";
import {UpdateStockDto} from "../../stock/dto/updateStock.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const stockRules: RulesSetterAsync<Ability, Subjects> = async (user, subject, action, subjectObj, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === StockDto){
        const clan_id = await getClan_id(user, requestHelperService);
        can(Action.create_request, subject, {clan_id: clan_id});

        //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, {clan_id: clan_id});
    }

    if(subject === UpdateStockDto){
        const clan_id = await getClan_id(user, requestHelperService);
        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, clan_id, ClanDto);
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