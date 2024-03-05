import { Expose } from "class-transformer";
import { ExtractField } from "src/common/decorator/response/ExtractField";

export class ItemShopDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    item_id:string;

    @Expose()
    isInVoting:Boolean

    @Expose()
    isSold:Boolean; 
    
    @Expose()
    stocked:Number;
    

}