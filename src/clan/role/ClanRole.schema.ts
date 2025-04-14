import { ClanBasicRight } from './enum/clanBasicRight.enum';
import { ClanRoleType } from './enum/clanRoleType.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { areRoleRightsValid } from './decorator/validation/validators';

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
  clanRoleType: ClanRoleType;

  /**
   * Object with basic rights that the role has
   */
  @Prop({
    type: Object,
    required: true,
    validate: {
      validator: (field: Record<string, true>) => areRoleRightsValid(field),
      message:
        'Rights object must have a key which is a value of ClanBasicRight enum and the value is true',
    },
  })
  rights: Partial<Record<ClanBasicRight, true>>;

  _id: ObjectId | string;
}

export const ClanRoleSchema = SchemaFactory.createForClass(ClanRole);
