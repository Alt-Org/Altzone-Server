import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SessionStage } from '../enum/SessionStage.enum';
import {
  PredefinedDailyTask,
  PredefinedDailyTaskSchema,
} from '../dailyTask/predefinedDailyTask.schema';
import { defaultPredefinedDailyTasks } from '../dailyTask/defaultPredefinedDailyTasks';
import { HydratedDocument, Types } from 'mongoose';
import { ClanToCreate, ClanToCreateSchema } from './ClanToCreate.schema';
import { BoxReference } from '../enum/BoxReference.enum';
import { ModelName } from 'src/common/enum/modelName.enum';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  /**
   * ID of the box the session belongs to
   */
  @Prop({ type: Types.ObjectId, ref: ModelName.BOX, required: true })
  box_id: Types.ObjectId;

  /**
   * Name of the session
   */
  @Prop({ type: String, required: true })
  sessionName: string;

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
   * It is used as proof that the claimer is eligible to access the particular box
   */
  @Prop({ type: String, default: null })
  testersSharedPassword: string | null;

  /**
   * When the box should be automatically completely removed, timestamp
   */
  @Prop({ type: Number, required: true })
  boxRemovalTime: number;

  /**
   * When the testing session will be automatically reset, timestamp
   */
  @Prop({ type: Number, required: true })
  sessionResetTime: number;

  /**
   * Clan data to be created when session goes to testing stage.
   */
  @Prop({ type: [ClanToCreateSchema] })
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
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.virtual(BoxReference.CLANS, {
  ref: ModelName.CLAN,
  localField: 'createdClan_ids',
  foreignField: '_id',
});
SessionSchema.virtual(BoxReference.DAILY_TASKS, {
  ref: ModelName.DAILY_TASK,
  localField: 'dailyTasks._id',
  foreignField: '_id',
});
