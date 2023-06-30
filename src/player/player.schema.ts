import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ClassName} from "../util/dictionary";
import {Clan} from "../clan/clan.schema";

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Player {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number, required: true })
    backpackCapacity: number;

    @Prop({ type: String, required: true, unique: true })
    uniqueIdentifier: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClassName.CLAN })
    clan_id: Clan;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.set('collection', ClassName.PLAYER);
PlayerSchema.virtual(ClassName.CLAN, {
    ref: ClassName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});