import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import { ExtractField } from "src/common/decorator/response/ExtractField";

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

}