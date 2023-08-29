import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {PlayerDto} from "../../player/dto/player.dto";
import {UpdatePlayerDto} from "../../player/dto/updatePlayer.dto";
import {RulesSetterAsync} from "../type/rulesSetter.type";
import {isClanAdmin} from "../util/isClanAdmin";
import {ModelName} from "../../common/enum/modelName.enum";
import {ClanDto} from "../../clan/dto/clan.dto";
import {isLastClanAdmin} from "../util/isLastClanAdmin";

type Subjects = InferSubjects<typeof PlayerDto | typeof UpdatePlayerDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const playerRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.create || action === Action.read || action === Action.delete){
        can(Action.create_request, subject);

        const publicFields = ['_id', 'name', 'uniqueIdentifier', 'profile_id'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, publicFields);
        can(Action.read_response, subject, {_id: user.player_id});

        can(Action.delete_request, subject, {_id: user.player_id});
    }

    if(action === Action.update){
        can(Action.update_request, subject, {_id: user.player_id});
        cannot(Action.update_request, subject, ['clan_id']);

        const reqPlayer_id = subjectObj._id;
        const reqClan_id = subjectObj.clan_id;

        //if add to clan
        if(subjectObj && reqPlayer_id && reqClan_id){
            const clanWhereToAdd = await requestHelperService.getModelInstanceById(ModelName.CLAN, reqClan_id, ClanDto);
            //if clan exists
            if(clanWhereToAdd){
                const playerToAdd = await requestHelperService.getModelInstanceById(ModelName.PLAYER, reqPlayer_id, PlayerDto);
                //if player is not in any clan or clan_id does not change
                if(playerToAdd && (playerToAdd.clan_id === null || playerToAdd.clan_id === reqClan_id)){
                    const isAdmin = isClanAdmin(clanWhereToAdd, user.player_id);
                    if(isAdmin)
                        can(Action.update_request, subject, ['clan_id']);
                }
            }
        // if delete from clan
        } else if(subjectObj && reqPlayer_id && reqClan_id === null){
            const playerToDelete = await requestHelperService.getModelInstanceById(ModelName.PLAYER, reqPlayer_id, PlayerDto);
            if(playerToDelete){
                const clanWhereFromDelete = await requestHelperService.getModelInstanceById(ModelName.CLAN, playerToDelete.clan_id, ClanDto);
                if(clanWhereFromDelete){
                    const isAdmin = isClanAdmin(clanWhereFromDelete, user.player_id);
                    const isLastAdmin = isLastClanAdmin(clanWhereFromDelete, reqPlayer_id);
                    //is logged-in user clan admin or own profile and that user not last clan admin
                    if ((isAdmin || reqPlayer_id === user.player_id) && !isLastAdmin)
                        can(Action.update_request, subject, ['clan_id']);
                }
            }
        }
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}