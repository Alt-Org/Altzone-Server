import { CreateClanDto } from "./dto/createClan.dto";
import { UpdateClanDto } from "./dto/updateClan.dto";
import { deleteNotUniqueArrayElements } from "../common/function/deleteNotUniqueArrayElements";
import { deleteArrayElements } from "../common/function/deleteArrayElements";
import { PlayerDto } from "../player/dto/player.dto";
import { StockService } from "../stock/stock.service";
import { Injectable } from "@nestjs/common";
import { Clan, publicReferences } from "./clan.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StockDto } from "../stock/dto/stock.dto";
import { SoulHomeService } from "../soulhome/soulhome.service";
import { RoomDto } from "../room/dto/room.dto";
import { ClanDto } from "./dto/clan.dto";
import { SoulHomeDto } from "../soulhome/dto/soulhome.dto";
import BasicService from "../common/service/basicService/BasicService";
import ServiceError, { isServiceError } from "../common/service/basicService/ServiceError";
import { Player } from "../player/player.schema";
import ClanHelperService from "./utils/clanHelper.service";
import { ItemDto } from "../item/dto/item.dto";
import { SEReason } from "../common/service/basicService/SEReason";
import { TIServiceReadManyOptions, TReadByIdOptions } from "../common/service/basicService/IService";
import { ModelName } from "../common/enum/modelName.enum";

@Injectable()
export class ClanService{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        @InjectModel(Player.name) public readonly playerModel: Model<Player>,
        private readonly stockService: StockService,
        private readonly soulhomeService: SoulHomeService,
        private readonly clanHelperService: ClanHelperService
    ) {
        this.basicService = new BasicService(model);
        this.playerService = new BasicService(playerModel);
    }
    public readonly basicService: BasicService;
    public readonly playerService: BasicService;

    /**
     * Crete a new Clan with other default objects.
     *
     * The default objects are required on the game side. 
     * These objects are a Stock with its Items given to each new Clan, as well as a SoulHome with one Room
     * @param clanToCreate 
     * @param player_id the player_id of the Clan creator, and who is also will be the admin of the Clan
     * @returns 
     */
    public async createOne(clanToCreate: CreateClanDto, player_id: string) {
        const clanWithAdmin = {...clanToCreate, admin_ids: [player_id]};
        const clanResp = await this.basicService.createOne<any, ClanDto>(clanWithAdmin);

        if(isServiceError(clanResp))
            return clanResp as ServiceError[];

        const clan = clanResp as ClanDto;

        const playerResp = await this.playerService.updateOneById(player_id, { clan_id: clan._id });
        if(isServiceError(playerResp))
            return playerResp as ServiceError[];

        const stockResp = await this.clanHelperService.createDefaultStock(clan._id);
        if(isServiceError(stockResp))
            return stockResp as ServiceError[];

        const stock = stockResp as { Stock: StockDto, Item: ItemDto[] };

        const soulHomeResp = await this.clanHelperService.createDefaultSoulHome(clan._id, clan.name);
        if(isServiceError(soulHomeResp))
            return soulHomeResp as ServiceError[];

        const soulHome = soulHomeResp as { SoulHome: SoulHomeDto, Item: ItemDto[], Room: RoomDto[] };

        return clan;
    }

    /**
     * Reads a Clan by its _id in DB.
     * 
     * @param _id - The Mongo _id of the Clan to read.
     * @param options - Options for reading the Clan.
     * @returns Clan with the given _id on succeed or an array of ServiceErrors if any occurred.
     */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => publicReferences.includes(ref));

        return this.basicService.readOneById<ClanDto>(_id, optionsToApply);
    }

    /**
     * Reads all Clans based on the provided options.
     * 
     * @param options - Options for reading Clans.
     * @returns An array of Clans if succeeded or an array of ServiceErrors if error occurred.
     */
    async readAll(options?: TIServiceReadManyOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => publicReferences.includes(ref));

        return this.basicService.readMany<ClanDto>(optionsToApply);
    }

    /**
     * Updates the specified Clan data in DB
     *
     * @param clanToUpdate object with fields to be updated 
     * @returns _true_ if update went successfully or array 
     * of ServiceErrors if something went wrong
     */
    public async updateOneById(clanToUpdate: UpdateClanDto) {
        const {_id, admin_idsToDelete, admin_idsToAdd, ...fieldsToUpdate} = clanToUpdate;

        if (!admin_idsToAdd && !admin_idsToDelete)
            return this.basicService.updateOneById(_id, fieldsToUpdate);

        const clanResp = await this.basicService.readOneById<ClanDto>(_id);
        if(isServiceError(clanResp))
            return clanResp as ServiceError[];

        const clan = clanResp as ClanDto;
        let admin_ids: string[] = clan.admin_ids;

        if(admin_idsToDelete)
            admin_ids = deleteArrayElements(admin_ids, admin_idsToDelete);

        if(admin_idsToAdd){
            const idsToAdd = deleteNotUniqueArrayElements(admin_idsToAdd);
            admin_ids = admin_ids ? [...admin_ids, ...idsToAdd] : idsToAdd;
            admin_ids = deleteNotUniqueArrayElements(admin_ids);
        }

        if (admin_ids.length === 0)
            return [new ServiceError({
                message: 'Clan can not be without at least one admin. You are trying to delete all clan admins',
                field: 'admin_ids',
                reason: SEReason.REQUIRED
            })];

        //add only players that are clan members
        const clanToUpdate_id = clan._id.toString();
        const playersInClan: string[] = [];
        const playersNotInClan: string[] = [];
        for (let i = 0; i < admin_ids.length; i++) {
            const player_id = admin_ids[i];
            const playerResp = await this.playerService.readOneById<PlayerDto>(player_id);
            if(isServiceError(playerResp))
                continue;

            const player = playerResp as PlayerDto;

            if (player)
                player.clan_id === clanToUpdate_id ? playersInClan.push(player_id) : playersNotInClan.push(player_id);
        }

        if (playersInClan.length === 0)
            return [new ServiceError({
                message: 'Clan can not be without at least one admin. You are trying to delete all clan admins',
                field: 'admin_ids',
                reason: SEReason.REQUIRED
            })];

        return await this.basicService.updateOneById(_id, {...fieldsToUpdate, admin_ids: playersInClan});
    }

    /**
     * Deletes a Clan by its _id from DB.
     *  
     * Notice that the method will also delete Clan's SoulHome and Stock as well.
     * Also all Players, which were members of the Clan will be excluded.
     *
     * @param _id - The Mongo _id of the Clan to delete.
     * @returns _true_ if Clan was removed successfully, 
     * or a ServiceError array if the Clan was not found or something else went wrong
     */
    async deleteOneById(_id: string) {
        const clanResp = await this.basicService.readOneById<ClanDto>(
            _id, 
            { includeRefs: [ ModelName.SOULHOME, ModelName.STOCK, ModelName.PLAYER ] }
        );
        if(isServiceError(clanResp))
            return clanResp;

        const clan = clanResp as ClanDto;

        if(clan.Player){
            for(let i=0, l=clan.Player.length; i<l; i++){
                const player = clan.Player[i];
                await this.playerService.updateOneById(player._id, { clan_id: null });
            }
        }

        if(clan.Stock)
            await this.stockService.deleteOneById(clan.Stock._id);
        if(clan.SoulHome)
            await this.soulhomeService.deleteOneById(clan.SoulHome._id);

        return this.basicService.deleteOneById(_id);
    }
}