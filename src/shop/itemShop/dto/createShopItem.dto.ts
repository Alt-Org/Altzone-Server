import { IsBoolean, IsMongoId, IsOptional, IsString } from "class-validator";
import { MongoInvalidArgumentError } from "mongodb";

export class CreateShopItemDTO {
    @IsMongoId()
    item_id: string;

    @IsOptional()
    @IsBoolean()
    isInVoting: Boolean;
    
    @IsOptional()
    @IsBoolean()
    isSold: Boolean;

    @IsOptional()
    @IsMongoId()
    vote_id:string;
}