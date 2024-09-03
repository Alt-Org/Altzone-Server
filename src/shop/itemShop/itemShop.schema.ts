import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from "mongoose";
import { ShopItemDTO } from './dto/shopItem.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ModelName } from '../../common/enum/modelName.enum';

export type ItemShopDocument = HydratedDocument<ItemShop>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }, _id: false })
export class ShopItem {
    @Prop({ type: String, required: false })
    item_id: string;

    @Prop({ type: Boolean, required: false, default: false })
    isInVoting: Boolean;

    @Prop({ type: Boolean, required: false, default: false })
    isSold: Boolean;

    @Prop({ type: String, required: false })
    vote_id: string;
}
const ShopItemSchema = SchemaFactory.createForClass(ShopItem);
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ItemShop {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: [ShopItemSchema], required: false, default: []})
    items: ShopItem[];

    @Prop({ type: Number, required: false, default: new Date().getTime() })
    lastRestock: number;

    @ExtractField()
    _id: string;

}

export const ItemShopSchema = SchemaFactory.createForClass(ItemShop);
ItemShopSchema.set('collection', ModelName.ITEMSHOP);
