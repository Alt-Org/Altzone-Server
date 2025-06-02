import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';

export class SetClanRole {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  player_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  role_id: string;
}
