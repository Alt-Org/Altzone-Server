import {User} from "../../auth/user";
import {PlayerDto} from "../../player/dto/player.dto";
import {ModelName} from "../../common/enum/modelName.enum";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";

/**
 * The function determines the clan_id of the provided user object.
 * @param user
 * @param requestHelperService
 */
export const getClan_id = async (user: User, requestHelperService: RequestHelperService): Promise<string | null> => {
    const player = await requestHelperService.getModelInstanceById(ModelName.PLAYER, user.player_id, PlayerDto);
    return player ? player.clan_id : null;
}