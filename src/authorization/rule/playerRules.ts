import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {PlayerDto} from "../../player/dto/player.dto";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {isClanAdmin} from "../util/isClanAdmin";
import {ModelName} from "../../common/enum/modelName.enum";
import {ClanDto} from "../../clan/dto/clan.dto";
import {isLastClanAdmin} from "../util/isLastClanAdmin";
import {ForbiddenException, NotFoundException} from "@nestjs/common";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const playerRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.create || action === Action.read){
        can(Action.create_request, subject);

        const publicFields = [
            '_id', 'name', 'uniqueIdentifier', 'profile_id', 'clan_id', 
            'Clan', 'CustomCharacter', 'above13', 'parentalAuth', 'gameStatistics',
            'points', 'currentAvatarId', 'battleCharacter_ids'
        ];
        can(Action.read_request, subject);
        can(Action.read_response, subject, publicFields);
        can(Action.read_response, subject, {_id: user.player_id});
    }

    if(action === Action.update){
        can(Action.update_request, subject, {_id: user.player_id});
        cannot(Action.update_request, subject, ['clan_id']);

        const reqPlayer_id = subjectObj?._id;
        const reqClan_id = subjectObj?.clan_id;

        //if add to clan
        if(subjectObj && reqPlayer_id && reqClan_id){
            const clanWhereToAdd = await requestHelperService.getModelInstanceById(ModelName.CLAN, reqClan_id, ClanDto);
            if(!clanWhereToAdd)
                throw new NotFoundException('Clan with that _id not found');

            const playerToAdd = await requestHelperService.getModelInstanceById(ModelName.PLAYER, reqPlayer_id, PlayerDto);
            if(!playerToAdd)
                throw new NotFoundException('Player with that _id not found');

            //if player is in any clan and clan_id does change
            if(playerToAdd.clan_id && playerToAdd.clan_id !== reqClan_id)
                throw new ForbiddenException('Player is already in a clan. Please remove the Player from current clan first');

            const isAdmin = isClanAdmin(clanWhereToAdd, user.player_id);
            if(!isAdmin)
                throw new ForbiddenException('Logged-in user is not clan admin');

            can(Action.update_request, subject, ['clan_id']);
        // if delete from clan
        } else if(subjectObj && reqPlayer_id && reqClan_id === null){
            const playerToDelete = await requestHelperService.getModelInstanceById(ModelName.PLAYER, reqPlayer_id, PlayerDto);
            if(!playerToDelete)
                throw new NotFoundException('Player with that _id not found');

            const clanWhereFromDelete = await requestHelperService.getModelInstanceById(ModelName.CLAN, playerToDelete.clan_id, ClanDto);
            if(!clanWhereFromDelete)
                throw new NotFoundException('Clan with that _id not found');

            const isAdmin = isClanAdmin(clanWhereFromDelete, user.player_id);
            const isLastAdmin = isLastClanAdmin(clanWhereFromDelete, reqPlayer_id);

            //is logged-in user not clan admin
            if(!isAdmin && reqPlayer_id !== user.player_id)
                throw new ForbiddenException('Logged-in user is not clan admin or user is trying to update other user profile');
            //is last clan admin
            if(isLastAdmin)
                throw new ForbiddenException('Player can not be removed from clan because it is the last clan admin. Please add another clan admin first');

            can(Action.update_request, subject, ['clan_id']);
        }
    }

    if(action === Action.delete){
        if(subjectObj._id !== user.player_id)
            throw new ForbiddenException('The logged-in user can not delete other users profiles');

        const playerToDelete = await requestHelperService.getModelInstanceById(ModelName.PLAYER, subjectObj._id, PlayerDto);
        const playerClan = await requestHelperService.getModelInstanceById(ModelName.CLAN, playerToDelete.clan_id, ClanDto);
        const isLastAdmin = isLastClanAdmin(playerClan, subjectObj._id);

        if(isLastAdmin)
            throw new ForbiddenException('Player is the last clan admin. Please add another clan admin or remove the clan first');

        can(Action.delete_request, subject, {_id: user.player_id});
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}