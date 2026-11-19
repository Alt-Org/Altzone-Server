import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { PackageRaceStatus } from './enum/packageRaceStatus.enum';

@Schema({ _id: false })
export class PackageRaceTeamResult {
  @Prop({ type: ObjectId, required: true })
  team_id: ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  memberCount: number;

  @Prop({ type: Number, required: true, min: 0 })
  targetPoints: number;

  @Prop({ type: Number, required: true, min: 0 })
  taskPoints: number;

  @Prop({ type: Number, required: true, min: 0 })
  battlePoints: number;
}

export const PackageRaceTeamResultSchema = SchemaFactory.createForClass(
  PackageRaceTeamResult,
);

/**
 * The package race of a box session (Embedded into the box document).
 */
@Schema({ _id: false })
export class PackageRace {
  @Prop({
    type: String,
    enum: PackageRaceStatus,
    required: true,
    default: PackageRaceStatus.ACTIVE,
  })
  status: PackageRaceStatus;

  /**
   * When the race was started
   */
  @Prop({ type: Date, required: true })
  startedAt: Date;

  /**
   * When the race is scheduled to end
   */
  @Prop({ type: Date, required: true })
  endsAt: Date;

  /**
   * When the race was actually ended, null while the race is active
   */
  @Prop({ type: Date, default: null })
  endedAt?: Date | null;

  /**
   * Team standings frozen at the moment the race was ended, empty while the race is active
   */
  @Prop({ type: [PackageRaceTeamResultSchema], default: [] })
  teams?: PackageRaceTeamResult[];
}

export const PackageRaceSchema = SchemaFactory.createForClass(PackageRace);
