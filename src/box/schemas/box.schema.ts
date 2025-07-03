import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ObjectId } from 'mongodb';
import { SessionStage } from '../enum/SessionStage.enum';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { BoxReference } from '../enum/BoxReference.enum';
import {
  PredefinedDailyTask,
  PredefinedDailyTaskSchema,
} from '../dailyTask/predefinedDailyTask.schema';

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
   * On which stage the testing session is
   */
  @Prop({
    type: String,
    enum: SessionStage,
    required: true,
    default: SessionStage.PREPARING,
  })
  sessionStage: SessionStage;

  /**
   * Password for testers to claim their accounts in the box. Not hashed.
   * It used as a proof that the claimer is eligible to access the particular box
   */
  @Prop({ type: String, default: null })
  testersSharedPassword: string | null;

  /**
   * When the box should be automatically completely removed, timestamp
   */
  @Prop({ type: Number, required: true })
  boxRemovalTime: number;

  /**
   * When the testing session be automatically reset, timestamp
   */
  @Prop({ type: Number, required: true })
  sessionResetTime: number;

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

  /**
   * All clans that are related to the box
   */
  @Prop({ type: [ObjectId], required: true })
  clan_ids: ObjectId[];

  /**
   * All soul homes' _ids that are related to the box
   */
  @Prop({ type: [ObjectId], required: true })
  soulHome_ids: ObjectId[];

  /**
   * All rooms' _ids that are related to the box
   */
  @Prop({ type: [ObjectId], required: true })
  room_ids: ObjectId[];

  /**
   * All stocks' _ids that are related to the box
   */
  @Prop({ type: [ObjectId], required: true })
  stock_ids: ObjectId[];

  /**
   * Array of unique identifiers, which is used to identify the device sending the request to claim the profile.
   * Each identifier is unique within the box
   */
  @Prop({ type: [String], required: true, default: [] })
  accountClaimersIds: string[];

  /**
   * array of predefined by the group admin tasks
   */
  @Prop({ type: [PredefinedDailyTaskSchema], required: true, default: [] })
  dailyTasks: PredefinedDailyTask[];

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

BoxSchema.virtual(BoxReference.CLANS, {
  ref: ModelName.CLAN,
  localField: 'clan_ids',
  foreignField: '_id',
});
BoxSchema.virtual(BoxReference.SOUL_HOMES, {
  ref: ModelName.SOULHOME,
  localField: 'soulHome_ids',
  foreignField: '_id',
});
BoxSchema.virtual(BoxReference.ROOMS, {
  ref: ModelName.ROOM,
  localField: 'room_ids',
  foreignField: '_id',
});
BoxSchema.virtual(BoxReference.STOCKS, {
  ref: ModelName.STOCK,
  localField: 'stock_ids',
  foreignField: '_id',
});

BoxSchema.virtual(BoxReference.TESTER_PROFILES, {
  ref: ModelName.PROFILE,
  localField: 'testers.profile_id',
  foreignField: '_id',
});
BoxSchema.virtual(BoxReference.TESTER_PLAYERS, {
  ref: ModelName.PLAYER,
  localField: 'testers.player_id',
  foreignField: '_id',
});

BoxSchema.virtual(BoxReference.DAILY_TASKS, {
  ref: ModelName.DAILY_TASK,
  localField: 'dailyTasks._id',
  foreignField: '_id',
});

export const publicReferences = Object.values(BoxReference);
