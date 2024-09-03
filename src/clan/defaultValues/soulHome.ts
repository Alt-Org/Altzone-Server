import { CreateSoulHomeDto } from "../../soulhome/dto/createSoulHome.dto"

/**
 * Get the default SoulHome object
 * @param clan_id to which the SoulHome belongs to
 * @returns 
 */
export function getDefaultSoulHome(clan_id: string): CreateSoulHomeDto {
    return {
        name: "clan",
        clan_id
    }
}

/**
 * Get the default Room object
 * @param soulHome_id to which the Room belongs to
 * @param player_id to which the Room belongs to
 * @returns 
 */
export function getDefaultRoom(soulHome_id: string, player_id: string){ //: CreateRoomDto {
    // return {
    //     floorType: "placeholder",
    //     wallType: "placeholder",
    //     player_id,
    //     soulHome_id
    // }
}