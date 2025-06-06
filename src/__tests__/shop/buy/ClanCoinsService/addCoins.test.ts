import ClanCoinsModule from '../../modules/clanCoins.module';
import { ClanCoinsService } from '../../../../shop/buy/clanCoins.service';
import { Coins } from '../../../../shop/enum/coins.enum.dto';
import ClanCoinsBuilderFactory from '../../data/clanCoinsBuilderFactory';
import { ClanCoinsDto } from '../../../../shop/buy/dto/clanCoins.dto';

describe('clanCoinsService.addCoins() test suite', () => {
  let clanCoinsService: ClanCoinsService;
  let clanCoins: ClanCoinsDto;

  const clan_id = '681e534624e7710f1b5ccb80';
  const coins = Coins.FiveHundred;

  beforeEach(async () => {
    clanCoinsService = await ClanCoinsModule.getClainCoinsService();

    const clanCoinsBuilder = ClanCoinsBuilderFactory.getBuilder('ClanCoinsDto');

    clanCoins = clanCoinsBuilder.setAmount(coins).build();
  });

  it('Should return with error if the clan does not exist', async () => {
    const [_, error] = await clanCoinsService.addCoins(
      clan_id,
      clanCoins.amount,
    );

    expect(error).toBeDefined();
    expect(error[0]?.reason).toBe('NOT_FOUND');
    expect(error[0]?.field).toBe('_id');
    expect(error[0]?.value).toBe(clan_id);
  });
});
