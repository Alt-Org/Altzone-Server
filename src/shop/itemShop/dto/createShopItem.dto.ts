import { IsBoolean, IsMongoId, IsOptional, IsString } from "class-validator";
import { MongoInvalidArgumentError } from "mongodb";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('CreateShopItemDTO')
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