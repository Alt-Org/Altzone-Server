import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Types} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {ExtractField} from "../common/decorator/response/ExtractField";

export type ClanDocument = HydratedDocument<Clan>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Clan {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String })
    tag: string;

    @Prop({ type: Number, default: 0 })
    gameCoins: number;

    @Prop({type: Array<Types.ObjectId>, default: []})
    admin_ids: string[];

    @ExtractField()
    _id: string;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);
ClanSchema.set('collection', ModelName.CLAN);
ClanSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: '_id',
    foreignField: 'clan_id'
});
ClanSchema.virtual(ModelName.RAID_ROOM, {
    ref: ModelName.RAID_ROOM,
    localField: '_id',
    foreignField: 'clan_id'
});
ClanSchema.virtual(ModelName.FURNITURE, {
    ref: ModelName.FURNITURE,
    localField: '_id',
    foreignField: 'clan_id'
});