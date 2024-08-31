import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Clan } from "../../clan/clan.schema";
import { Model, MongooseError } from "mongoose";
import BasicService from "../../common/service/basicService/BasicService";
import { PlayerService } from "../../player/player.service";
import ServiceError, { isServiceError } from "../../common/service/basicService/ServiceError";
import { SEReason } from "../../common/service/basicService/SEReason";
import { PlayerDto } from "../../player/dto/player.dto";
import { ClanDto } from "../../clan/dto/clan.dto";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { SoulHome } from "../../soulhome/soulhome.schema";
import { RoomDto } from "../dto/room.dto";

/**
 * Class containing helper methods used in the module service(s)
 */
@Injectable()
export default class RoomHelperService{
    public constructor(
        @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
        @InjectModel(SoulHome.name) public readonly soulHomeModel: Model<SoulHome>,
        private readonly playerService: PlayerService
    ){
        this.clanBasicService = new BasicService(clanModel);
        this.soulHomeBasicService = new BasicService(soulHomeModel);
    }

    private readonly clanBasicService: BasicService;
    private readonly soulHomeBasicService: BasicService;

    /**
     * Get the SoulHome of the Clan to which Player belongs to
     *
     * @param player_id Mongo _id of the Player
     * @returns _SoulHome_ object if the Player belongs to Clan or 
     * array with _ServiceError_ with reason NOT_FOUND if the Player can not be found,
     * the Player does not belong to any Clan or if this Clan does not have any SoulHome
     */
    async getPlayerSoulHome(player_id: string){
        const playerResp = await this.playerService.readOneById(player_id);
        if(!playerResp || playerResp instanceof MongooseError || !playerResp.data?.Player)
            return [new ServiceError({
                reason: SEReason.NOT_FOUND, 
                field: 'player_id', 
                value: player_id, 
                message: 'Could not find any Player with this _id'
            })];
        
        const {clan_id} = playerResp.data.Player as unknown as PlayerDto;
        if(!clan_id)
            return [new ServiceError({
                reason: SEReason.NOT_FOUND, 
                field: 'clan_id', 
                value: clan_id, 
                message: 'The Player is not in any Clan'
            })];

        const clanResp = await this.clanBasicService.readOneById<ClanDto>(clan_id, {includeRefs: [ModelName.SOULHOME]});
        if(isServiceError(clanResp))
            return [new ServiceError({
                reason: SEReason.NOT_FOUND, 
                field: 'clan_id', 
                value: clan_id, 
                message: 'Could not find any Clan with this _id'
            })];
        
        const clan = clanResp as unknown as ClanDto;
        const clanSoulHome = clan.SoulHome as unknown as SoulHomeDto[];

        if(!clanSoulHome || clanSoulHome.length === 0)
            return [new ServiceError({
                reason: SEReason.NOT_FOUND,
                field: 'soulHome_id',
                value: undefined,
                message: 'Could not find SoulHome of the Clan'
            })];

        return clanSoulHome[0];
    }


    /**
     * Get array of Room objects of the Clan to which Player belongs to
     *
     * @param player_id Mongo _id of the Player
     * @returns _Rooms array_ object if the Player belongs to Clan or 
     * array with _ServiceError_ with reason NOT_FOUND if the Player can not be found,
     * the Player does not belong to any Clan or if this Clan does not have any SoulHome
     */
    async getPlayerRooms(player_id: string): Promise<RoomDto[] | ServiceError[]>{
        const soulHomeResp = await this.getPlayerSoulHome(player_id);

        if(isServiceError(soulHomeResp))
            return soulHomeResp as ServiceError[];

        const soulHome = soulHomeResp as unknown as SoulHomeDto;

        const soulHomeWithRoomsResp = await this.soulHomeBasicService.readOneById(soulHome._id, {includeRefs: [ModelName.ROOM]});

        if(isServiceError(soulHomeWithRoomsResp))
            return soulHomeWithRoomsResp;

        const soulHomeWithRooms = soulHomeWithRoomsResp as unknown as SoulHomeDto;

        return soulHomeWithRooms.Room ?? [];
    }
}