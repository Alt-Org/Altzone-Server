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
        this.refsInModel = [ModelName.PLAYER, ModelName.STOCK];
        this.modelName = ModelName.CLAN;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public async handleCreate(body: CreateClanDto, user: User) {
        const creatorPlayer_id = user.player_id;
        body['admin_ids'] = [creatorPlayer_id];
        const clanResp = await this.createOne(body);

        if (!clanResp || clanResp instanceof MongooseError)
            return clanResp;

        await this.requestHelperService.updateOneById(ModelName.PLAYER, creatorPlayer_id, { clan_id: clanResp.data[clanResp.metaData.dataKey]._id });

        return clanResp;
    }

    public async handleDefaultCreate(body: CreateClanDto, request: Request) {
        const creatorPlayer_id = request['user'].player_id;
        body['admin_ids'] = [creatorPlayer_id];
        const clanResp: any = await this.createOne(body);

        if (!clanResp || clanResp instanceof MongooseError)
            return clanResp;

        await this.requestHelperService.updateOneById(ModelName.PLAYER, creatorPlayer_id, { clan_id: clanResp.data[clanResp.metaData.dataKey]._id });

        //Create clan's stock
        const clanStock: CreateStockDto = {
            type: 1,
            rowCount: 5,
            columnCount: 5,
            clan_id: clanResp.data.Clan._id
        }
        const stockResp = await this.stockService.createOne(clanStock);
        if (!stockResp || stockResp instanceof MongooseError)
            return clanResp;

        clanResp.data.Clan.Stock = stockResp.data.Stock;

        //Create clan's stock
        const clanSoulhome: CreateSoulHomeDto = {
            type: "clan",
            clan_id: clanResp.data.Clan._id
        };
        const soulHomeResp = await this.soulhomeService.createOne(clanSoulhome);
        if (!soulHomeResp || soulHomeResp instanceof MongooseError)
            return clanResp;
        const firstRoom: CreateRoomDto = {
            floorType:"placeholder",
            wallType:"placeholder",
            player_id: creatorPlayer_id,
            soulHome_id:soulHomeResp.data.SoulHome._id
        };
        const roomResp = await this.roomService.createOne(firstRoom);
        if (!roomResp || roomResp instanceof MongooseError)
            return clanResp;
        const addRoom = [roomResp.data.Room._id];
        const soulHomeUpdate = {
            _id: soulHomeResp.data.SoulHome._id,
            type:"clan",
            addedRooms: addRoom,
            removedRooms:undefined
        };
        await this.soulhomeService.handleUpdate(soulHomeUpdate);
        
        //Add default items to clan's stock
        const items: CreateItemDto[] = getDefaultItems(stockResp.data.Stock._id,roomResp.data.Room._id);
        await this.itemService.createMany(items);
        return clanResp;
    }

    public async handleUpdate(body: UpdateClanDto) {
        if (!body.admin_idsToAdd && !body.admin_idsToDelete)
            return this.updateOneById(body);

        const clanToUpdate = await this.readOneById(body._id);
        if (!clanToUpdate || clanToUpdate instanceof MongooseError)
            throw new NotFoundException('Clan with that _id not found');

        if (body.admin_idsToDelete)
            clanToUpdate.data[clanToUpdate.metaData.dataKey].admin_ids = deleteArrayElements(clanToUpdate.data[clanToUpdate.metaData.dataKey].admin_ids, body.admin_idsToDelete);

        body.admin_idsToAdd = deleteNotUniqueArrayElements(body.admin_idsToAdd);
        //add only players that are clan members
        const clanToUpdate_id = clanToUpdate.data[clanToUpdate.metaData.dataKey]._id.toString();
        const playersInClan: string[] = [];
        const playersNotInClan: string[] = [];
        for (let i = 0; i < body.admin_idsToAdd.length; i++) {
            const player_id = body.admin_idsToAdd[i];
            const player = await this.requestHelperService.getModelInstanceById(ModelName.PLAYER, player_id, PlayerDto);
            if (player)
                player.clan_id === clanToUpdate_id ? playersInClan.push(player_id) : playersNotInClan.push(player_id);
        }

        const newAdmin_ids = addUniqueArrayElements(clanToUpdate.data[clanToUpdate.metaData.dataKey].admin_ids, playersInClan);

        if (newAdmin_ids.length === 0)
            throw new BadRequestException('Clan can not be without at least one admin. You are trying to delete all clan admins');
        body['admin_ids'] = newAdmin_ids;
        const updateResp = await this.updateOneById(body);

        if (playersNotInClan.length !== 0)
            throw new BadRequestException(
                `Players with the _ids: [${playersNotInClan.toString()}] ` +
                `can not be added to clan admins because they are not the clan members. ` +
                `All other players are successfully added to clan admins and another clan data are updated as well`
            );

        return updateResp;
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            { modelName: ModelName.PLAYER, filter: searchFilter, nullIds }
        ], ignoreReferences);

        await this.stockService.deleteByCondition(searchFilter);
    }
}