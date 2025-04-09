import { ClanBasicRight } from './enum/clanBasicRight.enum';
import { ClanRoleType } from './enum/clanRoleType.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

/**
 * Defines clan role structure
 */
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ClanRole {
  /**
   * Unique for clan name of the role
   */
  @Prop({ type: String, required: true })
  name: string;

  /**
   * Type of the role
   */
  @Prop({ type: String, enum: ClanRoleType, required: true })
  claRoleType: ClanRoleType;

  /**
   * Object with basic rights that the role has
   */
  @Prop({ type: Object, required: true })
  rights: Partial<Record<ClanBasicRight, true>>;

  _id: ObjectId;
}

export const ClanRoleSchema = SchemaFactory.createForClass(ClanRole);
