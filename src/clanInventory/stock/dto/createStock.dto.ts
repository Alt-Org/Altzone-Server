import { IsInt, IsMongoId } from 'class-validator';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('CreateStockDto')
export class CreateStockDto {
  @IsInt()
  cellCount: number;

  @IsClanExists()
  @IsMongoId()
  clan_id: string;
}
