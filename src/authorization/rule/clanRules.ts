import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {ClanDto} from "../../clan/dto/clan.dto";
import {ModelName} from "../../common/enum/modelName.enum";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {PlayerDto} from "../../player/dto/player.dto";
import {isClanAdmin} from "../util/isClanAdmin";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const clanRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    // if(action === Action.read){
    //     //const clan_id = await getClan_id(user, requestHelperService);
    //     //const publicFields = ['_id', 'name', 'uniqueIdentifier'];

    //     can(Action.read_request, subject);
    //     can(Action.read_response, subject);
    // }

    if(action === Action.create){
        const playerToMakeClanAdmin = await requestHelperService.getModelInstanceById(ModelName.PLAYER, user.player_id, PlayerDto);

        if(!playerToMakeClanAdmin)
            throw new NotFoundException('Could not recognize logged-in user');

        if(playerToMakeClanAdmin.clan_id)
            throw new ForbiddenException('The logged-in user is already in another Clan');

        can(Action.create_request, subject);
    }

    if(action === Action.update || action === Action.delete){
        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, subjectObj._id, ClanDto);
        if(!clan)
            throw new NotFoundException('The clan with that _id is not found');

        const isAdmin = isClanAdmin(clan, user.player_id);
        if(!isAdmin)
            throw new NotFoundException('The logged-in user is not clan admin');

        can(Action.update_request, subject);
        can(Action.delete_request, subject);
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}