import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import { isString } from "lodash";

export class CreateClanVoteDto {

    @IsMongoId()
    clan_id:string;
    
   // @IsMongoId()
    @IsString()
    itemToBuy_id:string;

    @IsNumber()
    @IsOptional()
    startingTime:number;

    @IsNumber()
    votingTime:number;

    @IsMongoId()
    shop_id:string;

}