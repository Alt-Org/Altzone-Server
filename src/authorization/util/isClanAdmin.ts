import {ClanDto} from "../../clan/dto/clan.dto";

export const isClanAdmin = (clan?: ClanDto, player_id?: string): boolean => {
    if(!clan || !player_id)
        return false;

    return clan.admin_ids.includes(player_id);
}