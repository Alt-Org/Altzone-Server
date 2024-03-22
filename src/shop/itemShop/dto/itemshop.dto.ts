import { Expose, Type } from "class-transformer";
import { ExtractField } from "src/common/decorator/response/ExtractField";
import { ShopItemDTO } from "./shopItem.dto";

export class ItemShopDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    name: string;

    @Expose()
    items: ShopItemDTO[]

    @Expose()
    lastRestock:number;


}