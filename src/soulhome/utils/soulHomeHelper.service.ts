import { InjectModel } from "@nestjs/mongoose";
import { SoulHome } from "../soulhome.schema";
import { Model } from "mongoose";
import { Player } from "../../player/player.schema";
import BasicService from "../../common/service/basicService/BasicService";
import { PlayerDto } from "../../player/dto/player.dto";
import ServiceError, { isServiceError } from "../../common/service/basicService/ServiceError";
import { SoulHomeDto } from "../dto/soulhome.dto";
import { Injectable } from "@nestjs/common";

/**
 * Class holds helper methods, that can be used in th SoulHome module
 */
@Injectable()
export default class SoulHomeHelperService {
    constructor(
        @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
        @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    ) {
        this.soulHomeService = new BasicService(model);
        this.playerService = new BasicService(playerModel);
    }
    private readonly soulHomeService: BasicService;
    private readonly playerService: BasicService; 

    /**
     * Finds a SoulHome to which specified Player has access to, 
     * that is the SoulHome of the Clan of which Player is a member.
     *
     * @param player_id The mongo _id of the Player
     *
     * @returns Found _SoulHome_ or array of ServiceErrors in case it was not found or any other error(s) occurred
     */
    public async getPlayerSoulHome(player_id: string){
        const playerResp = await this.playerService.readOneById<PlayerDto>(player_id);

        if(isServiceError(playerResp))
            return playerResp as ServiceError[];
 
        const player = playerResp as PlayerDto;

        return this.soulHomeService.readOne<SoulHomeDto>({filter: {clan_id: player.clan_id}});
    }
}