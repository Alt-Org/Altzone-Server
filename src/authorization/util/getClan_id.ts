import {User} from "../../auth/user";
import {PlayerDto} from "../../player/dto/player.dto";
import {ModelName} from "../../common/enum/modelName.enum";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";

/**
 * The function determines the clan_id of the provided user object.
 * If provided user object does not have clan_id it will make a request to DB.
 * The function can be useful if the provided JWT was provided without clan_id.
 * @param user
 * @param requestHelperService
 */
export const getClan_id = async (user: User, requestHelperService: RequestHelperService): Promise<string | null> => {
    let userClan_id = user.clan_id;
    if(userClan_id)
        return userClan_id;

    const player: PlayerDto = await requestHelperService.getModelInstanceById(ModelName.PLAYER, user.player_id, PlayerDto);
    if(player)
        return player._id;

    return null;
}