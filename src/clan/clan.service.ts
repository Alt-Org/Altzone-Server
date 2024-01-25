import { BadRequestException, Body, Injectable, NotFoundException, Req } from "@nestjs/common";
import { Model, MongooseError, Types } from "mongoose";
import { Clan } from "./clan.schema";
import { InjectModel } from "@nestjs/mongoose";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { IgnoreReferencesType } from "../common/type/ignoreReferences.type";
import { ModelName } from "../common/enum/modelName.enum";
import { RaidRoomService } from "../raidRoom/raidRoom.service";
import { FurnitureService } from "../furniture/furniture.service";
import {
    AddBasicService,
    ClearCollectionReferences,
} from "../common/base/decorator/AddBasicService.decorator";
import { IBasicService } from "../common/base/interface/IBasicService";
import { BasicServiceDummyAbstract } from "../common/base/abstract/basicServiceDummy.abstract";
import { CreateClanDto } from "./dto/createClan.dto";
import { IHookImplementer, PostCreateHookFunction, PostHookFunction } from "src/common/interface/IHookImplementer";
import { UpdateClanDto } from "./dto/updateClan.dto";
import { deleteNotUniqueArrayElements } from "src/common/function/deleteNotUniqueArrayElements";
import { deleteArrayElements } from "src/common/function/deleteArrayElements";
import { addUniqueArrayElements } from "src/common/function/addUniqueArrayElements";
import { PlayerDto } from "src/player/dto/player.dto";

@Injectable()
@AddBasicService()
export class ClanService extends BasicServiceDummyAbstract<Clan> implements IBasicService<Clan> {
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly raidRoomService: RaidRoomService,
        private readonly furnitureService: FurnitureService,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.RAID_ROOM, ModelName.FURNITURE];
        this.modelName = ModelName.CLAN;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public async handleCreate(@Body() body: CreateClanDto, @Req() request: Request) {
        const creatorPlayer_id = request['user'].player_id;
        body['admin_ids'] = [creatorPlayer_id];
        const clanResp = await this.createOne(body);
        if (clanResp && !(clanResp instanceof MongooseError))
            await this.requestHelperService.updateOneById(ModelName.PLAYER, creatorPlayer_id, { clan_id: clanResp.data[clanResp.metaData.dataKey]._id });
        return clanResp;
    }

    public async handleUpdate(@Body() body: UpdateClanDto) {
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

        await this.raidRoomService.deleteByCondition(searchFilter);
        await this.furnitureService.deleteByCondition(searchFilter);
    }
}