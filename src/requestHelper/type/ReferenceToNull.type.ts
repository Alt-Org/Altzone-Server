import { Types } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';

export type ReferenceToNullType = {
  modelName: ModelName;
  filter: { [key: string]: string | Types.ObjectId };
  nullIds: { [key: string]: null };
  isOne?: boolean;
};
