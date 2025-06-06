import { IsEnum } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Coins } from '../../enum/coins.enum.dto';

@AddType('ClanCoinsDto')
export class ClanCoinsDto {
  /**
   * Amount of coins to buy
   * @example 100
   */
  @IsEnum(Coins)
  amount: Coins;
}
