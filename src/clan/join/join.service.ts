import { BadRequestException, Body, HttpCode, HttpStatus, Inject, Injectable, NotFoundException, Param, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BasicServiceDummyAbstract } from "../../common/base/abstract/basicServiceDummy.abstract";
import {
    AddBasicService,
    ClearCollectionReferences,
} from "../../common/base/decorator/AddBasicService.decorator";
import { IBasicService } from "../../common/base/interface/IBasicService";
import { IHookImplementer, PostCreateHookFunction, PostHookFunction } from "../../common/interface/IHookImplementer";
import { PlayerService } from "../../player/player.service";
import { Join } from "./join.schema";
import { Model, MongooseError, Types } from "mongoose";
import { ModelName } from "../../common/enum/modelName.enum";
import { RequestHelperService } from "../../requestHelper/requestHelper.service";
import { IgnoreReferencesType } from "../../common/type/ignoreReferences.type";
import { body } from "express-validator";
import { JoinRequestDto } from "./dto/joinRequest.dto";
import { ClanDto } from "../dto/clan.dto";
import { PlayerDto } from "../../player/dto/player.dto";
import { JoinResultDto } from "./dto/joinResult.dto";
import { request } from "https";
import { ok } from "assert";
import { IResponseShape } from "../../common/interface/IResponseShape";
import { _idDto } from "../../common/dto/_id.dto";
import { error } from "console";
import { ClanService } from "../clan.service";
import { RoomService } from "../../room/room.service";
import { CreateRoomDto } from "../../room/dto/createRoom.dto";
import { SoulHome } from "../../soulhome/soulhome.schema";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";
import { IGetAllQuery } from "../../common/interface/IGetAllQuery";
import { User } from "../../auth/user";
import { PlayerCounterFactory } from "../clan.counters";
import ICounter from "src/common/service/counter/ICounter";

@Injectable()
@AddBasicService()
export class JoinService extends BasicServiceDummyAbstract<Join> implements IBasicService<Join>, IHookImplementer {
    public constructor(
        @InjectModel(Join.name) public readonly model: Model<Join>,
        private readonly playerCounterFactory: PlayerCounterFactory,
        private readonly requestHelperService: RequestHelperService,
        private readonly clanService: ClanService,
        private readonly roomService:RoomService
    ) {
        super();
        this.refsInModel = [];
        this.modelName = ModelName.JOIN;

        this.playerCounter = this.playerCounterFactory.create();
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    private readonly playerCounter: ICounter;

    /**
     * Handle the request to join the Clan.
     *
     * In case the Clan is open the Player will be added immediately to the Clan.
     *
     * In case the Clan is closed, a request to join the Clan will be created.
     * @param joinRequest request to join the Clan
     * @returns 
     */
    public async handleJoinRequest(joinRequest: JoinRequestDto) {
        const {player_id, clan_id} = joinRequest;

        const clan = await this.getClan(clan_id);
        if(!clan)
            throw new NotFoundException('Clan with that _id is not found');

        const player = await this.requestHelperService.getModelInstanceByCondition( // get the player Joining
            ModelName.PLAYER,
            { _id: player_id },
            PlayerDto,
            true
        );
        if(!player)
            throw new NotFoundException('Player with that _id is not found');

        // check if clan to join is open
        if (clan.isOpen) { 
            // does the player in some old clan? if so reduce the players in the old clan
            if (player.clan_id) { 
                const pclan = await this.getClan(player.clan_id);
                if (pclan.playerCount <= 1) {
                    this.clanService.deleteOneById(pclan._id);
                } else {
                    await this.playerCounter.decreaseByIdOnOne(player.clan_id);
                }
            }
            await this.joinClan(player_id, clan_id); // join the clan
            const resp = this.configureResponse(joinRequest);//this.createOne(body);
            
            return resp;
        } 

        if(!joinRequest.join_message)
            throw new BadRequestException('The join_message must be specified for the closed clans');

        // if clan closed and join_meaasage provided create a joinrequest in db
        return this.createOne(joinRequest);    
    }

    /**
     * Remove Player from Clan by the specified player_id
     * @param player_id to remove
     */
    public async leaveClan(player_id: string) {
        // get the player leaving
        const player = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.PLAYER,
            { _id: player_id },
            PlayerDto,
            true
        );

        if(!player)
            throw new NotFoundException('Player with that _id not found');

        const clan_id = player.clan_id;
        if (!clan_id) 
            throw new NotFoundException("Player is not joined to any clan");

        const clan = await this.getClan(clan_id);

        if(!clan)
            throw new NotFoundException("Clan with that _id not found");

        //If the last player
        if (clan.playerCount <= 1) {
            this.clanService.deleteOneById(clan._id);
        } else {
            await this.playerCounter.decreaseByIdOnOne(clan_id);  
        }
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: null }); // update clan_id for the requested player;
    }

    /**
     * Removes the specified Player from the Clan
     *
     * @param player_id
     * @param clan_id 
     */
    public async removePlayerFromClan(player_id: string, clan_id: string) {
        // get the player to remove
        const player = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.PLAYER,
            { _id: player_id },
            PlayerDto,
            true
        );

        if(!player)
            throw new NotFoundException('Player with that _id not found');

        const clan = await this.getClan(clan_id);

        if(!clan)
            throw new NotFoundException("Clan with that _id not found");

        //If the last player
        if (clan.playerCount <= 1 ) {
            this.clanService.deleteOneById(clan._id);
        } else {
            this.playerCounter.decreaseByIdOnOne(clan_id);
            //await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: clan_id }, "playerCount", -1) // update clan playercount    
        }
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: null }); // update clan_id for the requested player;
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<JoinResultDto>, oldDoc: Join): Promise<boolean> => {
        if (!input?.accepted){
            return true;
        }
                  
        const player = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.PLAYER,
            { _id: oldDoc.player_id },
            PlayerDto,
            true
        );
        
        if (input.accepted) { // if player was accepted join the clan
            if (player?.clan_id) {
                //await this.playerCounter.increaseByIdOnOne(player.clan_id);
                //await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: player.clan_id }, "playerCount", -1)
            }
            this.joinClan(oldDoc.player_id, oldDoc.clan_id);
        }
        this.deleteOneById(input._id) // delete the join request
        return true;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }

    private async joinClan(player_id: string, clan_id: string) { // func to join a clan
        const soulhome = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.SOULHOME, 
            {clan_id: clan_id},
            SoulHomeDto, true
        );

        if(soulhome){
            const firstRoom: CreateRoomDto = {
                floorType: "placeholder",
                wallType: "placeholder",
                player_id: player_id,
                soulHome_id: soulhome._id
            };
    
            const room = await this.roomService.createOne(firstRoom);
            if (!room || room instanceof MongooseError)
                return;
            let updatedlist = soulhome.rooms;
            updatedlist.push(room.data.Room._id);
            await this.requestHelperService.updateOneById(ModelName.SOULHOME, soulhome._id, {rooms:updatedlist});
        }
             
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: clan_id }); // update clan_id for the requested player;
        await this.playerCounter.increaseByIdOnOne(clan_id);
        //await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: clan_id }, "playerCount", 1); // update clan playercount
    }

    private async getClan(_id: string) {
        return await this.requestHelperService.getModelInstanceByCondition(  // get the Clan to join
            ModelName.CLAN,
            { _id: _id },
            ClanDto,
            true
        );
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
}

