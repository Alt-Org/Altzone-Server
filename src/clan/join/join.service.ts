import { Body, HttpCode, HttpStatus, Injectable, NotFoundException, Param, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import {
    AddBasicService,
    ClearCollectionReferences,
} from "src/common/base/decorator/AddBasicService.decorator";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { IHookImplementer, PostCreateHookFunction, PostHookFunction } from "src/common/interface/IHookImplementer";
import { PlayerService } from "src/player/player.service";
import { Join } from "./join.schema";
import { Model, MongooseError, Types } from "mongoose";
import { ModelName } from "src/common/enum/modelName.enum";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { body } from "express-validator";
import { JoinRequestDto } from "./dto/joinRequest.dto";
import { ClanDto } from "../dto/clan.dto";
import { PlayerDto } from "src/player/dto/player.dto";
import { JoinResultDto } from "./dto/joinResult.dto";
import { request } from "https";
import { ok } from "assert";
import { IResponseShape } from "src/common/interface/IResponseShape";
import { _idDto } from "src/common/dto/_id.dto";
import { error } from "console";
import { ClanService } from "../clan.service";
import { RoomService } from "src/Room/room.service";
import { CreateRoomDto } from "src/Room/dto/createRoom.dto";
import { SoulHome } from "src/soulhome/soulhome.schema";
import { SoulHomeDto } from "src/soulhome/dto/soulhome.dto";

@Injectable()
@AddBasicService()
export class JoinService extends BasicServiceDummyAbstract<Join> implements IBasicService<Join>, IHookImplementer {
    public constructor(
        @InjectModel(Join.name) public readonly model: Model<Join>,
        private readonly requestHelperService: RequestHelperService,
        private readonly clanService: ClanService,
        private readonly roomService:RoomService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.CLAN,ModelName.SOULHOME,ModelName.ROOM];
        this.modelName = ModelName.JOIN;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public async handleJoinRequest(@Body() body: JoinRequestDto, @Req() request: Request) {
        const player_id = body.player_id;
        const clan_id = body.clan_id;
        if (request["user"].player_id != player_id) {
            throw new MongooseError("you can not change another players clan");
        }
        const clan = await this.getClan(clan_id);
        const player = await this.requestHelperService.getModelInstanceByCondition( // get the player Joining
            ModelName.PLAYER,
            { _id: player_id },
            PlayerDto,
            true
        );

        if (clan.isOpen) { // check if clan to join is open
            if (player?.clan_id) { // does an old clan id exist? if so reduce the players in the old clan
                const pclan = await this.getClan(player.clan_id);
                if (pclan.playerCount <= 1) {
                    this.clanService.deleteOneById(pclan._id);
                } else {
                    await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: player.clan_id }, "playerCount", -1)
                }
            }
            this.joinClan(player_id, clan_id); // join the clan
            const resp = this.configureResponse(body);//this.createOne(body);
            return resp;
        } else if (body?.join_message) { // if not open create a joinrequest in db
            return this.createOne(body);
        } else {
            throw new NotFoundException("You need to include a join_message since you are trying to join an closed clan");
        }
    }
    
    public async joinClan(player_id: string, clan_id: string) { // func to join a clan
        const soulhome = await this.requestHelperService.getModelInstanceByCondition(ModelName.SOULHOME,{clan_id:clan_id},SoulHomeDto,true)
        const firstRoom: CreateRoomDto = {
            floorType:"placeholder",
            wallType:"placeholder",
            player_id: player_id,
            soulHome_id:soulhome._id
        };
        const room = await this.roomService.createOne(firstRoom);
        if (!room || room instanceof MongooseError)
            return;
        var updatedlist = soulhome.rooms;
        updatedlist.push(room.data.Room._id);
        await this.requestHelperService.updateOneById(ModelName.SOULHOME,soulhome._id,{rooms:updatedlist})
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: clan_id }); // update clan_id for the requested player;
        await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: clan_id }, "playerCount", 1) // update clan playercount
    }
    public async getClan(_id: string) {
        return await this.requestHelperService.getModelInstanceByCondition(  // get the Clan to join
            ModelName.CLAN,
            { _id: _id },
            ClanDto,
            true
        );
    }
    public async leaveClan(@Param() param: _idDto) {
        const player = await this.requestHelperService.getModelInstanceByCondition( // get the player Joining
            ModelName.PLAYER,
            { _id: param._id },
            PlayerDto,
            true
        );
        const clanid = player.clan_id;
        if (!clanid) throw new NotFoundException("Can not find players clan");
        const clan = await this.getClan(clanid);
        if (clan.admin_ids.includes(player._id)) {
            // if is clan admin do something - for future
        }
        if (clan.playerCount <= 1 ) {
            this.clanService.deleteOneById(clan._id);
        } else {
            await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: clanid }, "playerCount", -1) // update clan playercount    
        }
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player._id, { clan_id: null }); // update clan_id for the requested player;

    }
    public updateOnePostHook: PostHookFunction = async (input: Partial<JoinResultDto>, oldDoc: Join): Promise<boolean> => {
        if (!input?.accepted)
            return true;
        
        const player = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.PLAYER,
            { _id: oldDoc.player_id },
            PlayerDto,
            true
        );
        
        if (input.accepted) { // if player was accepted join the clan
            if (player?.clan_id) {
                await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: player.clan_id }, "playerCount", -1)
            }
            this.joinClan(oldDoc.player_id, oldDoc.clan_id);
        }
        this.deleteOneById(input._id) // delete the entry
        return true;
    }
    private configureResponse = (data: any): IResponseShape => {
        const dataKey = this.modelName;
        const dataType = Array.isArray(data) ? 'Array' : 'Object';
        const dataCount = dataType === 'Array' ? data.length : 1;
        return {
            data: {
                [dataKey]: data
            },
            metaData: {
                dataKey: dataKey,
                modelName: this.modelName,
                dataType,
                dataCount
            }
        }
    }
    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}

