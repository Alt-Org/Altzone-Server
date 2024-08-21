import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {ExtractField} from "../common/decorator/response/ExtractField";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Room {
    @Prop({ type: String, required: true })
    floorType: string;

    @Prop({ type: String ,required:true})
    wallType: string; 

    @Prop({ type: Boolean, default: false })
    isActive: boolean; 

    @Prop({ type: Number })
    deactivationTime: number;

    @Prop({ type: Number, required: true })
    cellCount: number;

    @Prop({ type: Boolean, default: false })
    hasLift: boolean;

    @Prop({ type: String, required: true })
    soulHome_id: string; 

    @ExtractField()
    _id: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.set('collection', ModelName.ROOM);
RoomSchema.virtual(ModelName.SOULHOME, {
    ref: ModelName.SOULHOME,
    localField : "soulHome_id",
    foreignField :"_id",
    justOne: true
});
RoomSchema.virtual(ModelName.ITEM, {
    ref: ModelName.ITEM,
    localField : "_id",
    foreignField :"room_id"
});
