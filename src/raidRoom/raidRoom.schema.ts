import {Player} from "../player/player.schema";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Clan} from "../clan/clan.schema";

export type RaidRoomDocument = HydratedDocument<RaidRoom>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class RaidRoom {
    @Prop({ type: Number, required: true })
    type: number;

    @Prop({ type: Number, required: true })
    rowCount: number;

    @Prop({ type: Number, required: true })
    colCount: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.PLAYER })
    player_id: Player;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
    clan_id: Clan;
}

export const RaidRoomSchema = SchemaFactory.createForClass(RaidRoom);
RaidRoomSchema.set('collection', ModelName.RAID_ROOM);
RaidRoomSchema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});
RaidRoomSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});