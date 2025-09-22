import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ObjectId } from 'mongodb';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { BoxReference } from '../enum/BoxReference.enum';

export type BoxDocument = HydratedDocument<Box>;

/**
 * The box collection contain metadata, which can be used to determine the resources corresponding to different testing sessions
 */
@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
export class Box {
  /**
   * Group admin password, which is also used as an identifier of whom box it is. not hashed
   */
  @Prop({ type: String, required: true, unique: true })
  adminPassword: string;

  /**
   * Group admin profile _id
   */
  @Prop({ type: ObjectId, required: true })
  adminProfile_id: ObjectId;

  /**
   * Group admin player _id
   */
  @Prop({ type: ObjectId, required: true })
  adminPlayer_id: ObjectId;

  @ExtractField()
  _id: ObjectId;
}

export const BoxSchema = SchemaFactory.createForClass(Box);
BoxSchema.set('collection', ModelName.BOX);
BoxSchema.virtual(BoxReference.ADMIN_PROFILE, {
  ref: ModelName.PROFILE,
  localField: 'adminProfile_id',
  foreignField: '_id',
  justOne: true,
});
BoxSchema.virtual(BoxReference.ADMIN_PLAYER, {
  ref: ModelName.PLAYER,
  localField: 'adminPlayer_id',
  foreignField: '_id',
  justOne: true,
});
BoxSchema.virtual(BoxReference.GROUP_ADMIN, {
  ref: ModelName.GROUP_ADMIN,
  localField: 'adminPassword',
  foreignField: 'password',
  justOne: true,
});

export const publicReferences = Object.values(BoxReference);
