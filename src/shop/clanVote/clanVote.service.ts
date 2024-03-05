import { InjectModel } from "@nestjs/mongoose";
import { ClanVote } from "./clanVote.schema";
import { Model, MongooseError, Types } from "mongoose";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { ModelName } from "src/common/enum/modelName.enum";
import { AddBasicService, ClearCollectionReferences } from "src/common/base/decorator/AddBasicService.decorator";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import { Body, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { IHookImplementer, PostReadAllHookFunction, PreHookFunction } from "src/common/interface/IHookImplementer";
import { UpdateClanDto } from "src/clan/dto/updateClan.dto";
import { updateClanVoteDto } from "./dto/updateClanVote.dto";

@Injectable()
@AddBasicService()
export class ClanVoteService extends BasicServiceDummyAbstract<ClanVote> implements IBasicService<ClanVote> {
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public constructor(
        @InjectModel(ClanVote.name) public readonly model: Model<ClanVote>,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.ITEM];
        this.modelName = ModelName.CLANVOTE;
    }


   
    public async handleUpdate(@Body() body: updateClanVoteDto) {
        const voteToUpdate = await this.readOneById(body._id);
        if (!voteToUpdate || voteToUpdate instanceof MongooseError)
            throw new NotFoundException('No vote with that _id not found');

        const votedPlayers: string[] = voteToUpdate.data[voteToUpdate.metaData.dataKey].votedPlayers;

        if (votedPlayers.includes(body.player_id))
            throw new ForbiddenException("Player already voted");

        votedPlayers.push(body.player_id);
        body["votedPlayers"] = votedPlayers;
        if(body.vote) {
            body["positiveVotes"] = voteToUpdate.data[voteToUpdate.metaData.dataKey].positiveVotes +1;
        } else {
            body["negativeVotes"] = voteToUpdate.data[voteToUpdate.metaData.dataKey].negativeVotes +1 ;
        }
        return this.updateOneById(body);
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        
    }
}