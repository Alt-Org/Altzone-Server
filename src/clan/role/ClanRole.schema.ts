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
  clanRoleType: ClanRoleType;

  /**
   * Object with basic rights that the role has
   */
  @Prop({
    type: Map,
    of: Boolean,
    required: true,
    validate: {
      validator: (map: Map<ClanBasicRight, true>) => areRightsValid(map),
      message:
        'Rights object must have a key which is a value of ClanBasicRight enum and the value is true',
    },
  })
  rights: Partial<Record<ClanBasicRight, true>>;

  _id: ObjectId;
}

export const ClanRoleSchema = SchemaFactory.createForClass(ClanRole);

function areRightsValid(map: Map<ClanBasicRight, true>): boolean {
  const allowedKeys = new Set(Object.values(ClanBasicRight));

  for (const [key, value] of map.entries()) {
    if (!allowedKeys.has(key)) return false;

    if (value !== true) return false;
  }

  return true;
}
