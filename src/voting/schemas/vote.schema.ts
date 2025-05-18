import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { Choice } from '../type/choice.type';

@Schema()
export class Vote {
  /**
   * The ID of the player who submitted this vote
   *
   * @example "6630aa9994cd5ef001a1b1c2"
   */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  player_id: string;

  /**
   * The choice the player made in the vote (e.g., APPROVE or REJECT)
   *
   * @example "accept"
   */
  @Prop({
    type: String,
    required: true,
  })
  choice: Choice;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
