import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { SessionStage } from '../enum/SessionStage.enum';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { BoxReference } from '../enum/BoxReference.enum';
import { ClanToCreate } from './ClanToCreate.v2.schema';
import {
  PredefinedDailyTask,
  PredefinedDailyTaskSchema,
} from '../dailyTask/predefinedDailyTask.schema';
import { defaultPredefinedDailyTasks } from '../dailyTask/defaultPredefinedDailyTasks';

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
   * Name of the box
   *
   * @example "Class 7A"
   */
  @Prop({
    type: String,
    required: true,
  })
  name: string;

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
  @Prop({
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      now.setMonth(now.getMonth() + 6);
      return now;
    },
  })
  boxRemovalTime: Date;

  /**
   * Group teacher profile _id
   */
  @Prop({ type: Types.ObjectId, required: true })
  teacherProfile_id: Types.ObjectId;

  /**
   * Clan data to be created when session goes to testing stage.
   */
  @Prop({ type: [ClanToCreate] })
  clansToCreate: ClanToCreate[];

  /**
   * IDs of created clans when session goes to testing stage.
   */
  @Prop({ type: [Types.ObjectId] })
  createdClan_ids: Types.ObjectId[];

  /**
   * Amount of testers accounts required for the testing session.
   * It defines when the API will no longer allow to claim accounts for the testing session.
   */
  @Prop({ type: Number, default: 20 })
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
  @Prop({
    type: [PredefinedDailyTaskSchema],
    required: true,
    default: defaultPredefinedDailyTasks,
  })
  dailyTasks: PredefinedDailyTask[];

  @ExtractField()
  _id: Types.ObjectId;
}

export const BoxSchema = SchemaFactory.createForClass(Box);
// BoxSchema.set('collection', ModelName.BOX);
BoxSchema.set('collection', 'v2Box');
BoxSchema.virtual(BoxReference.TEACHER_PROFILE, {
  ref: ModelName.TEACHER_PROFILE,
  localField: 'teacherProfile_id',
  foreignField: '_id',
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
