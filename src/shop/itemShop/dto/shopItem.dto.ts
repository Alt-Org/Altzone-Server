import { Expose } from "class-transformer";
import { IsBoolean, IsMongoId } from "class-validator";
import { ExtractField } from "src/common/decorator/response/ExtractField";

export class ShopItemDTO {

    @Expose()
    item_id: string;

    @Expose()
    isInVoting: Boolean;

    @Expose()
    isSold: Boolean;
    
    @Expose()
    vote_id:string;
}