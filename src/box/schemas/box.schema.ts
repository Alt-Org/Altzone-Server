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
import { ClanToCreate, ClanToCreateSchema } from './clanToCreate.schema';

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
   * Clan data to be created when session goes to testing stage.
   */
  @Prop({ type: [ClanToCreateSchema] })
  clansToCreate: ClanToCreate[];

  /**
   * IDs of created clans when session goes to testing stage.
   */
  @Prop({ type: [ObjectId] })
  createdClan_ids: ObjectId[];

  /**
   * Amount of testers accounts required for the testing session.
   * It defines when the API will no longer allow to claim accounts for the testing session.
   */
  @Prop({ type: Number, default: 0 })
  testersAmount: number;

  /**
   * Amount of tester accounts claimed
   */
  @Prop({ type: Number, default: 0 })
  testerAccountsClaimed: number;

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
  localField: 'createdClan_ids',
  foreignField: '_id',
});
BoxSchema.virtual(BoxReference.DAILY_TASKS, {
  ref: ModelName.DAILY_TASK,
  localField: 'dailyTasks._id',
  foreignField: '_id',
});

export const publicReferences = Object.values(BoxReference);
