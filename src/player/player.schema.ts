import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ClassName} from "../util/dictionary";
import {Clan} from "../clan/clan.schema";

export type PlayerDocument = HydratedDocument<Player>;

@Schema()
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
