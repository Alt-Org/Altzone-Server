import { AllowedAction } from "../caslAbility.factory";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType } from "@casl/ability";
import { Action } from "../enum/action.enum";
import { InferSubjects, MongoAbility } from "@casl/ability/dist/types";
import { RulesSetterAsync } from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { JoinResultDto } from "src/clan/join/dto/joinResult.dto";
import { getClan_id } from "../util/getClan_id";
import { JoinDto } from "src/clan/join/dto/join.dto";
import { isClanAdmin } from "../util/isClanAdmin";
import { RemovePlayerDTO } from "src/clan/join/dto/removePlayer.dto";
import AddType, { isType } from "src/common/base/decorator/AddType.decorator";
import { PlayerLeaveClanDto } from "../../clan/join/dto/playerLeave.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const joinRules: RulesSetterAsync<Ability, Subjects> = async (user, subject, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);
    if (action == Action.create){
        //Player can leave a Clan with no restrictions
        if(subject === PlayerLeaveClanDto)
            can(Action.create_request, subject);
        else
            //Player can make clan joining requests only by himself
            can(Action.create_request, subject, {player_id: user.player_id});
    }

    //If someone is making request to remove a player from the clan
    if(action === Action.create && isType(subject, 'RemovePlayerDTO')){
        const clan_id = await getClan_id(user, requestHelperService);
        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, clan_id, ClanDto);
        const isAdmin = isClanAdmin(clan, user.player_id);

        if(isAdmin){
            can(Action.create_request, subject);
        }
    }
    
    if (action === Action.read || action === Action.update || action === Action.delete) {
        const clan_id = await getClan_id(user, requestHelperService);
        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, clan_id, ClanDto);

        const isAdmin =  isClanAdmin(clan, user.player_id);
        if (isAdmin){
            can(Action.update_request, subject);
            can(Action.read_request, subject, { clan_id: clan_id });
            can(Action.read_response, subject, { clan_id: clan_id });
            can(Action.delete_request, subject);
        }  
    }
    

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}

