import { Expose } from "class-transformer";
import { IsBoolean, IsMongoId } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../../common/decorator/response/ExtractField";

@AddType('ShopItemDTO')
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