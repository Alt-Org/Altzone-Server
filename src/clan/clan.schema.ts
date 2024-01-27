import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
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

    @Prop({type: Array<string>, default: []})
    admin_ids: string[];

    @Prop({ type: Number, default: 1, min: 0 })
    playerCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    itemCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    raidRoomCount: number;
    @Prop({type: Boolean, default: true})
    isOpen: Boolean;


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
ClanSchema.virtual(ModelName.ITEM, {
    ref: ModelName.ITEM,
    localField: '_id',
    foreignField: 'clan_id'
});