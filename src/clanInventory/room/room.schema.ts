import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ModelName } from '../../common/enum/modelName.enum';
import { RoomStatus } from './enum/roomStatus.enum';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Room {
  @Prop({ type: Number, required: true })
  roomPosition: number;

  @Prop({ type: String, required: true })
  roomColour: string;

  @Prop({ type: String, required: true })
  wallpaper: string;

  @Prop({ type: String, required: true })
  floor: string;

  @Prop({ type: Date })
  deactivationTime: Date;

  @Prop({ type: String, required: true })
  roomStatus: RoomStatus;

  @Prop({ type: String, required: true })
  soulHome_id: string;

  @ExtractField()
  _id: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.set('collection', ModelName.ROOM);
RoomSchema.virtual(ModelName.SOULHOME, {
  ref: ModelName.SOULHOME,
  localField: 'soulHome_id',
  foreignField: '_id',
  justOne: true,
});
RoomSchema.virtual(ModelName.ITEM, {
  ref: ModelName.ITEM,
  localField: '_id',
  foreignField: 'room_id',
});

export const publicReferences = [ModelName.SOULHOME, ModelName.ITEM];
