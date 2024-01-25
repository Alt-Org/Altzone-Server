import { AllowedAction } from "../caslAbility.factory";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType } from "@casl/ability";
import { Action } from "../enum/action.enum";
import { InferSubjects, MongoAbility } from "@casl/ability/dist/types";
import { RulesSetterAsync } from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { UpdateClanDto } from "../../clan/dto/updateClan.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PlayerDto } from "../../player/dto/player.dto";
import { isClanAdmin } from "../util/isClanAdmin";
import { JoinResultDto } from "src/clan/join/dto/joinResult.dto";
import { JoinRequestDto } from "src/clan/join/dto/joinRequest.dto";
import { getClan_id } from "../util/getClan_id";
import { MongooseError } from "mongoose";
import { JoinDto } from "src/clan/join/dto/join.dto";


type Subjects = InferSubjects<typeof JoinDto | typeof JoinResultDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const joinRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);
    if (action == Action.create) 
        can(Action.create_request, subject);
    
    if (action === Action.read || action === Action.update) {
        const clan_id = await getClan_id(user, requestHelperService);
        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, clan_id, ClanDto);

        if (!clan || clan instanceof MongooseError)
            throw new NotFoundException('The clan with that _id is not found. Can not check is the logged-in user clan admin');

        const isClanAdmin = clan.admin_ids.includes(user.player_id);
        if (!isClanAdmin)
            throw new NotFoundException('you are not an admin');

        can(Action.update_request, subject);
        can(Action.read_request, subject, { clan_id: clan_id });
        can(Action.read_response, subject, { clan_id: clan_id });

    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}

