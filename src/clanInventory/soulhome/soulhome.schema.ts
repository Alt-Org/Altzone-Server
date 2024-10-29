import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ModelName } from '../../common/enum/modelName.enum';

export type SoulhomeDocument = HydratedDocument<SoulHome>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class SoulHome{
    @Prop({ type: String, required: true})
    name: string;
    
    @Prop({ type: String, required: true, unique: true })
    clan_id: string;

    @ExtractField()
    _id: string;
}
export const SoulhomeSchema = SchemaFactory.createForClass(SoulHome);
SoulhomeSchema.set('collection', ModelName.SOULHOME);
SoulhomeSchema.virtual(ModelName.CLAN,{
    ref: ModelName.CLAN,
    localField : "clan_id",
    foreignField :"_id",
    justOne: true
});
SoulhomeSchema.virtual(ModelName.ROOM, {
    ref: ModelName.ROOM,
    localField : "_id",
    foreignField :"soulHome_id"
});

export const publicReferences = [ModelName.CLAN, ModelName.ROOM];