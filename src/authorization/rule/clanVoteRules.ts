import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { ClanVoteDto } from "src/shop/clanVote/dto/clanVote.dto";
import { UpdateClanVoteDto } from "src/shop/clanVote/dto/updateClanVote.dto";
import { AllowedAction } from "../caslAbility.factory";
import { Action } from "../enum/action.enum";
import { RulesSetterAsync } from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { UpdateClanDto } from "../../clan/dto/updateClan.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { getClan_id } from "../util/getClan_id";
import { MongooseError } from "mongoose";
import { JoinDto } from "src/clan/join/dto/join.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const clanVoteRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);
    const clan_id = await getClan_id(user, requestHelperService);
    const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, clan_id, ClanDto);
    if (!clan || clan instanceof MongooseError)
        throw new NotFoundException('The clan with that _id is not found. User is not in a clan');
    can(Action.create_request, subject);
    can(Action.read_request, subject,);
    can(Action.read_response, subject,);
    if (Action.update == action) {
        const vote = await requestHelperService.getModelInstanceById(ModelName.CLANVOTE, subjectObj._id, ClanVoteDto)
        if (!vote || vote instanceof MongooseError)
            throw new NotFoundException('The vote with that _id is not found. User is not in the clan that this vote belongs to');

        if (vote.clan_id === clan_id)
            can(Action.update_request, subject);
    }



    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}

