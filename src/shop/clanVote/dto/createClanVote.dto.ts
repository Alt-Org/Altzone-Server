import { IsMongoId, IsNumber, IsString } from "class-validator";
import { isString } from "lodash";

export class CreateClanVoteDto {

    @IsMongoId()
    clan_id:string;
    
   // @IsMongoId()
    @IsString()
    itemToBuy_id:string;

    @IsNumber()
    startingTime:number;

    @IsNumber()
    votingTime:number;


}