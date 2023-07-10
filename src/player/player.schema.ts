import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Clan} from "../clan/clan.schema";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacter} from "../customCharacter/customCharacter.schema";
import {RaidRoom} from "../raidRoom/raidRoom.schema";

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Player {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number, required: true })
    backpackCapacity: number;

    @Prop({ type: String, required: true, unique: true })
    uniqueIdentifier: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
    clan_id: Clan;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CUSTOM_CHARACTER })
    currentCustomCharacter_id: CustomCharacter;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.RAID_ROOM })
    raidRoom_id: RaidRoom;
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
PlayerSchema.virtual(ModelName.RAID_ROOM, {
    ref: ModelName.RAID_ROOM,
    localField: '_id',
    foreignField: 'player_id',
    justOne: true
});