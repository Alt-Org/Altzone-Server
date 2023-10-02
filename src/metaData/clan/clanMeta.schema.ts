import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Types} from "mongoose";
import {ModelName} from "../../common/enum/modelName.enum";

export type ClanMetaDocument = HydratedDocument<ClanMeta>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }, _id: false })
export class ClanMeta {
    @Prop({ type: String })
    _id: string;

    @Prop({ type: Number, default: 0, min: 0 })
    playerCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    furnitureCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    raidRoomCount: number;
}

export const ClanMetaSchema = SchemaFactory.createForClass(ClanMeta);
ClanMetaSchema.set('collection', ModelName.CLAN_META);