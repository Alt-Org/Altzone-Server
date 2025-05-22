import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { ClanCoinsDto } from '../../../../shop/buy/dto/clanCoins.dto';
import { Coins } from '../../../../shop/enum/coins.enum.dto';

export default class ClanCoinsDtoBuilder
  implements IDataBuilder<ClanCoinsDto>
{
  private readonly base: ClanCoinsDto = {
    amount: Coins.OneHundred
  };

  build(): ClanCoinsDto {
    return { ...this.base };
  }

  setAmount(amount: Coins) {
    this.base.amount = amount;
    return this;
  } 
}
