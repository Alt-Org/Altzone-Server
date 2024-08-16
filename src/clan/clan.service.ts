import {
    AddBasicService,
    ClearCollectionReferences,
} from "../common/base/decorator/AddBasicService.decorator";
import { IBasicService } from "../common/base/interface/IBasicService";
import { BasicServiceDummyAbstract } from "../common/base/abstract/basicServiceDummy.abstract";
import { CreateClanDto } from "./dto/createClan.dto";
import { UpdateClanDto } from "./dto/updateClan.dto";
import { deleteNotUniqueArrayElements } from "src/common/function/deleteNotUniqueArrayElements";
import { deleteArrayElements } from "src/common/function/deleteArrayElements";
import { addUniqueArrayElements } from "src/common/function/addUniqueArrayElements";
import { PlayerDto } from "src/player/dto/player.dto";
import { StockService } from "../stock/stock.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Clan } from "./clan.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, MongooseError, Types } from "mongoose";
import { ModelName } from "src/common/enum/modelName.enum";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { IHookImplementer } from "../common/interface/IHookImplementer";
import { StockDto } from "../stock/dto/stock.dto";
import { CreateStockDto } from "../stock/dto/createStock.dto";
import { ItemService } from "../item/item.service";
import { CreateItemDto } from "../item/dto/createItem.dto";
import { getDefaultItems } from "./defaultValues/items";
import { CreateSoulHomeDto } from "src/soulhome/dto/createSoulHome.dto";
import { SoulHomeService } from "src/soulhome/soulhome.service";
import { RoomService } from "src/Room/room.service";
import { RoomDocument } from "src/Room/room.schema";
import { RoomDto } from "src/Room/dto/room.dto";
import { CreateRoomDto } from "src/Room/dto/createRoom.dto";
import { updateSoulHomeDto } from "src/soulhome/dto/updateSoulHome.dto";
import { User } from "src/auth/user";
import { ClanDto } from "./dto/clan.dto";
import { IResponseShape } from "../common/interface/IResponseShape";
import getDefaultStock from "./defaultValues/stock";
import {getDefaultRoom, getDefaultSoulHome} from "./defaultValues/soulHome";
import { SoulHomeDto } from "../soulhome/dto/soulhome.dto";


@Injectable()
@AddBasicService()
export class ClanService extends BasicServiceDummyAbstract<Clan> implements IBasicService<Clan> {
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly stockService: StockService,
        private readonly itemService: ItemService,
        private readonly soulhomeService: SoulHomeService,
        private readonly roomService: RoomService,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.STOCK, ModelName.SOULHOME];
        this.modelName = ModelName.CLAN;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    /**
     * @deprecated use the handleDefaultCreate() method instead
     * @param body 
     * @param user 
     * @returns 
     */
    public async handleCreate(body: CreateClanDto, user: User) {
        const creatorPlayer_id = user.player_id;
        body['admin_ids'] = [creatorPlayer_id];
        const clanResp = await this.createOne(body);

        if (!clanResp || clanResp instanceof MongooseError)
            return clanResp;

        await this.requestHelperService.updateOneById(ModelName.PLAYER, creatorPlayer_id, { clan_id: clanResp.data[clanResp.metaData.dataKey]._id });

        return clanResp;
    }

    /**
     * Crete a new Clan with other default objects.
     *
     * The default objects are required on the game side. 
     * These objects are a Stock with its Items given to each new Clan, as well as a SoulHome with one Room
     * @param clanToCreate 
     * @param player_id the player_id of the Clan creator, and who is also will be the admin of the Clan
     * @returns 
     */
    public async handleDefaultCreate(clanToCreate: CreateClanDto, player_id: string) {
        let dataToReturn: IResponseShape = {
            data: {},
            metaData: {
                dataKey: ModelName.CLAN,
                modelName: ModelName.CLAN,
                dataType: 'Object',
                dataCount: 1
            }
        };
        clanToCreate['admin_ids'] = [player_id];

        const clanResp: any = await this.createOne(clanToCreate);

        if (!clanResp || clanResp instanceof MongooseError || !clanResp.data || !clanResp.data.Clan)
            return dataToReturn;

        const createdClan = clanResp.data.Clan as ClanDto;
        dataToReturn.data[ModelName.CLAN] = createdClan;

        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: createdClan._id });

        //Create clan's stock
        const clanStock = getDefaultStock(createdClan._id.toString());
        const stockResp = await this.stockService.createOne(clanStock);
        if (!stockResp || stockResp instanceof MongooseError || !stockResp.data || !stockResp.data.Stock)
            return dataToReturn;

        const createdStock = stockResp.data.Stock as unknown as StockDto;
        dataToReturn.data[ModelName.STOCK] = createdStock;

        //Add default items to clan's stock
        const items: CreateItemDto[] = getDefaultItems(createdStock._id.toString());
        const itemResp = await this.itemService.createMany(items);

        //Create clan's SoulHome
        const clanSoulHome = getDefaultSoulHome(createdClan._id.toString());
        const soulHomeResp = await this.soulhomeService.createOne(clanSoulHome);
        if (!soulHomeResp || soulHomeResp instanceof MongooseError || !soulHomeResp.data || !soulHomeResp.data.SoulHome)
            return dataToReturn;

        const createdSoulHome = soulHomeResp.data.SoulHome as unknown as SoulHomeDto;
        dataToReturn.data[ModelName.SOULHOME] = createdSoulHome;

        const firstRoom = getDefaultRoom(createdSoulHome._id.toString(), player_id);
        const roomResp = await this.roomService.createOne(firstRoom);
        if (!roomResp || roomResp instanceof MongooseError || !roomResp.data || !roomResp.data.Room)
            return dataToReturn;

        const createdRoom = roomResp.data.Room as unknown as RoomDto;

        const addRoom = [createdRoom._id];
        const soulHomeUpdate: updateSoulHomeDto = {
            _id: createdSoulHome._id, type: undefined,
            addedRooms: addRoom, removedRooms: undefined
        };
        await this.soulhomeService.handleUpdate(soulHomeUpdate);
        
        return dataToReturn;
    }

    /**
     * Update the specified Clan data
     * @param clanToUpdate object with fields to be updated 
     * @returns 
     */
    public async handleUpdate(clanToUpdate: UpdateClanDto) {
        if (!clanToUpdate.admin_idsToAdd && !clanToUpdate.admin_idsToDelete)
            return this.updateOneById(clanToUpdate);

        const clanResp = await this.readOneById(clanToUpdate._id);
        if (!clanResp || clanResp instanceof MongooseError || !clanResp.data || !clanResp.data.Clan)
            throw new NotFoundException('Clan with that _id not found');

        const clan = clanResp.data.Clan as ClanDto;
        let admin_ids: string[] = clan.admin_ids;

        if(clanToUpdate.admin_idsToDelete)
            admin_ids = deleteArrayElements(admin_ids, clanToUpdate.admin_idsToDelete);

        if(clanToUpdate.admin_idsToAdd)
            admin_ids = admin_ids ? 
                [...admin_ids, ...deleteNotUniqueArrayElements(clanToUpdate.admin_idsToAdd)] : 
                deleteNotUniqueArrayElements(clanToUpdate.admin_idsToAdd);
        
        if (admin_ids.length === 0)
            throw new BadRequestException('Clan can not be without at least one admin. You are trying to delete all clan admins');

        //add only players that are clan members
        const clanToUpdate_id = clan._id;
        const playersInClan: string[] = [];
        const playersNotInClan: string[] = [];
        for (let i = 0; i < admin_ids.length; i++) {
            const player_id = admin_ids[i];
            const player = await this.requestHelperService.getModelInstanceById(ModelName.PLAYER, player_id, PlayerDto);
            if (player)
                player.clan_id === clanToUpdate_id ? playersInClan.push(player_id) : playersNotInClan.push(player_id);
        }
        
        clanToUpdate['admin_idsToDelete'] = undefined;
        clanToUpdate['admin_idsToAdd'] = undefined;
        clanToUpdate['admin_ids'] = playersInClan;
        return await this.updateOneById(clanToUpdate);
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            { modelName: ModelName.PLAYER, filter: searchFilter, nullIds }
        ], ignoreReferences);

        await this.stockService.deleteByCondition(searchFilter);
        await this.soulhomeService.deleteByCondition(searchFilter);
    }
}