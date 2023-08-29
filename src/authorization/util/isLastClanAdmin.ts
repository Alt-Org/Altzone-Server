import {ClanDto} from "../../clan/dto/clan.dto";

export const isLastClanAdmin = (clan: ClanDto, player_id: string): boolean => {
    if(!clan)
        return false;

    return clan.admin_ids.length === 1 && clan.admin_ids.includes(player_id);
}