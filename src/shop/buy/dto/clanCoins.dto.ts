import { IsEnum } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Coins } from '../../../shop/enum/coins.enum.dto';

@AddType('ClanCoinsDto')
export class ClanCoinsDto {
  @IsEnum(Coins)
  amount: Coins;
}
