import {Player} from "../player/player.schema";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";

export type ClanDocument = HydratedDocument<Clan>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Clan {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String })
    tag: string;

    @Prop({ type: Number, default: 0 })
    gameCoins: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.PLAYER })
    player_id: Player;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);
ClanSchema.set('collection', ModelName.CLAN);
ClanSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: '_id',
    foreignField: 'clan_id',
});