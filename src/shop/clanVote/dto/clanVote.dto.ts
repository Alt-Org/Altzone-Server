import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../../common/decorator/response/ExtractField";

@AddType('ClanVoteDto')
export class ClanVoteDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    clan_id: string;

    @Expose()
    itemToBuy_id: string;

    @Expose()
    positiveVotes: number;

    @Expose()
    negativeVotes: number;

    @Expose()
    votedPlayers: string[];

    @Expose()
    startingTime: number;

    @Expose()
    votingTime: number;

    @Expose()
    shop_id:string;

}