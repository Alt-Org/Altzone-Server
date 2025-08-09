import { IsInt, IsOptional } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('BuyStallSlot')
export class BuyStallSlotDto {
  @IsInt()
  @IsOptional()
  amount: number = 1;
}
