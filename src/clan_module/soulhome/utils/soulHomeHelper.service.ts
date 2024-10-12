import { InjectModel } from "@nestjs/mongoose";
import { SoulHome } from "../soulhome.schema";
import { Model } from "mongoose";
import { SoulHomeDto } from "../dto/soulhome.dto";
import { Injectable } from "@nestjs/common";
import BasicService from "../../../common/service/basicService/BasicService";
import ServiceError from "../../../common/service/basicService/ServiceError";
import { PlayerDto } from "../../../player/dto/player.dto";
import { Player } from "../../../player/player.schema";

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
    public async getPlayerSoulHome(player_id: string): Promise<[SoulHomeDto | null, ServiceError[] | null]>{
        const [player, errors] = await this.playerService.readOneById<PlayerDto>(player_id);

        if(errors || !player)
            return [null, errors];

        return this.soulHomeService.readOne<SoulHomeDto>({filter: {clan_id: player.clan_id}});
    }
}