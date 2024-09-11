import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Clan} from "../clan/clan.schema";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacter} from "../customCharacter/customCharacter.schema";
import {Profile} from "../profile/profile.schema";
import {ExtractField} from "../common/decorator/response/ExtractField";

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Player {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number, required: true })
    backpackCapacity: number;

    @Prop({ type: String, required: true, unique: true })
    uniqueIdentifier: string;

    @Prop({ type: Boolean, default: null })
    above13: boolean;

    @ExtractField()
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.PROFILE })
    profile_id: Profile;

    @ExtractField()
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
    clan_id: Clan;

    @ExtractField()
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CUSTOM_CHARACTER })
    currentCustomCharacter_id: CustomCharacter;

    @ExtractField()
    _id: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.set('collection', ModelName.PLAYER);
PlayerSchema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});
PlayerSchema.virtual(ModelName.CUSTOM_CHARACTER, {
    ref: ModelName.CUSTOM_CHARACTER,
    localField: '_id',
    foreignField: 'player_id'
});
PlayerSchema.virtual(ModelName.ROOM,{
    ref: ModelName.ROOM,
    localField:'_id',
    foreignField:'player_id'
})