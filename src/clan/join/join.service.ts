import { Body, Injectable, Req } from "@nestjs/common";
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

@Injectable()
@AddBasicService()
export class JoinService extends BasicServiceDummyAbstract<Join> implements IBasicService<Join>, IHookImplementer {
    public constructor(
        @InjectModel(Join.name) public readonly model: Model<Join>,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.CLAN];
        this.modelName = ModelName.JOIN;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public async handleJoinRequest(@Body() body: JoinRequestDto, @Req() request: Request) {
        const player_id = body.player_id;
        const clan_id = body.clan_id;
        if(request["user"].player_id != player_id ) {
            return "you can not change another players clan";
        } 
        const clan = await this.requestHelperService.getModelInstanceByCondition(  // get the Clan to join
            ModelName.CLAN,
            { _id: clan_id },
            ClanDto,
            true
        );
        const player = await this.requestHelperService.getModelInstanceByCondition( // get the player Joining
            ModelName.PLAYER,
            { _id: player_id },
            PlayerDto,
            true
        );
        if(player?.clan_id && player.clan_id == clan_id )   return "You are already in the requested clan";

        if (clan.isOpen) { // check if clan to join is open
            if (player?.clan_id) { // does an old clan id exist? if so reduce the players in the old clan
                await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: player.clan_id }, "playerCount", -1)
            }
            return this.joinClan(player_id, clan_id); // join the clan
        } else if (body?.join_message) { // if not open create a joinrequest in db
            return this.createOne(body);
        } else {
            return "Please include a join_message because you are trying to join an closed clan";
        }
    }
    public async joinClan(player_id: string, clan_id: string) { // func to join a clan
        await this.requestHelperService.updateOneById(ModelName.PLAYER, player_id, { clan_id: clan_id }); // update clan_id for the requested player;
        await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: clan_id }, "playerCount", 1) // update clan playercount
        return "player succesfully joined clan " + clan_id;
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


    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}