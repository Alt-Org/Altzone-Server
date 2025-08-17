import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';

/**
 * Represents a clan role assignment for a player within a voting context.
 */
@Schema({ _id: false })
export class SetClanRole {
  /**
   * The ID of the player to whom the clan role will be assigned.
   *
   * @example "6630ab1234cd5ef001a1b2c3"
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  player_id: string;

  /**
   * The ID of the role to be assigned to the player.
   *
   * @example "6640bc2345de6fa002b2c3d4"
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  role_id: string;
}

export const SetClanRoleSchema = SchemaFactory.createForClass(SetClanRole);
