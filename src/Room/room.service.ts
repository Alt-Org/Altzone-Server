import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, MongooseError } from "mongoose";
import { Room } from "./room.schema";
import { ModelName } from "../common/enum/modelName.enum";
import { UpdateRoomDto } from "./dto/updateRoom.dto";
import BasicService from "../common/service/basicService/BasicService";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { RoomDto } from "./dto/room.dto";
import { TIServiceReadManyOptions, TReadByIdOptions } from "../common/service/basicService/IService";
import ServiceError, { isServiceError } from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { PlayerService } from "../player/player.service";
import { PlayerDto } from "../player/dto/player.dto";
import { Clan } from "../clan/clan.schema";
import { ClanDto } from "../clan/dto/clan.dto";
import { SoulHomeDto } from "../soulhome/dto/soulhome.dto";

@Injectable()
export class RoomService {
    public constructor(
        @InjectModel(Room.name) public readonly model: Model<Room>,
        @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
        private readonly playerService: PlayerService
    ){
        this.refsInModel = [ModelName.ITEM, ModelName.SOULHOME];
        this.basicService = new BasicService(model);
        this.clanBasicService = new BasicService(clanModel);
    }

    public readonly refsInModel: ModelName[];
    private readonly basicService: BasicService;
    private readonly clanBasicService: BasicService;

    /**
     * Creates a new Room in DB.
     * 
     * @param room - The Room data to create.
     * @returns  created Room or an array of service errors if any occurred.
    */
    async createOne(room: CreateRoomDto) {
        return this.basicService.createOne<CreateRoomDto, RoomDto>(room);
    }

    /**
     * Reads a Room by its _id in DB.
     * 
     * @param _id - The Mongo _id of the Room to read.
     * @param options - Options for reading the Room.
     * @returns Room with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));

        return this.basicService.readOneById<RoomDto>(_id, optionsToApply);
    }

    /**
     * Reads all Rooms of the Clan's SoulHome the Player belongs to.
     * 
     * @param player_id - Mongo _id of the Player.
     * @param options - Options for reading Rooms.
     * @returns An array of Rooms if succeeded or an array of ServiceErrors if error occurred.
    */
    async readPlayerClanRooms(player_id: string, options?: TIServiceReadManyOptions) {
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

        const soulHome_id = clanSoulHome[0]._id;

        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));

        optionsToApply.filter = {...optionsToApply.filter, soulHome_id};

        return this.basicService.readMany<RoomDto>(optionsToApply);
    }

    /**
     * Updates a Room by its _id in DB. The _id field is read-only and must be found from the parameter
     * 
     * @param room - The data needs to be updated for the Room.
     * @returns _true_ if Room was updated successfully, _false_ if nothing was updated for the Room, 
     * or a ServiceError array if Room was not found or something else went wrong.
    */
    async updateOneById(room: UpdateRoomDto) {
        const {_id, ...fieldsToUpdate} = room;
        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
     * Deletes a Room by its _id from DB.
     * 
     * @param _id - The Mongo _id of the Room to delete.
     * @returns _true_ if Room was removed successfully, or a ServiceError array if the Room was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        return this.basicService.deleteOneById(_id);
    }
}
