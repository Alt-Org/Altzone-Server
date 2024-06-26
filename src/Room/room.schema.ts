import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {ExtractField} from "../common/decorator/response/ExtractField";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Room{
    @Prop({ type: String, required: true })
    floorType: String;

    @Prop({ type: String ,required:true})
    wallType: String; 

    @Prop({ type: Boolean, default: false })
    isActive: boolean; 

    @Prop({type: Array<String>,default: []})
    roomItems: string[]; //array of items in the room

    @Prop({ type: String, required: true })
    player_id: string; // owner

    @Prop({ type: String, required: true })
    soulHome_id: string; 
    @ExtractField()
    _id: string;
}
export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.set('collection', ModelName.ROOM);
RoomSchema.virtual(ModelName.PLAYER,{
    ref: ModelName.PLAYER,
    localField : "player_id",
    foreignField :"_id"
})
