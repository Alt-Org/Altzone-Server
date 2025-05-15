import ClanBuilderFactory from '../../../../__tests__/clan/data/clanBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import ClanCoinsModule from '../../modules/clanCoins.module';
import { ClanCoinsService } from '../../../../shop/buy/clanCoins.service';
import { Coins } from '../../../../shop/enum/coins.enum.dto';
import ClanCoinsBuilderFactory from '../../data/clanCoinsBuilderFactory';
import { ClanCoinsDto } from '../../../../shop/buy/dto/clanCoins.dto';

describe('clanCoinsService.addCoins() test suite', () => {

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

    let clanCoinsService: ClanCoinsService;
    let clanCoins: ClanCoinsDto;
    
    const clan_id = '681e534624e7710f1b5ccb80';
    const coins = Coins.FifeHundred;

  beforeEach(async () => {
    clanCoinsService = await ClanCoinsModule.getClainCoinsService();

    const clanCoinsBuilder = ClanCoinsBuilderFactory.getBuilder('ClanCoinsDto'); 
    
    clanCoins = clanCoinsBuilder
        .setId(clan_id)
        .setAmount(coins)
        .build();
  });

  it('Should add the amount to the Clans gameCoins if input is valid', async () => {
    
    const clan = clanBuilder
        .setName('clan1')
        .setId(clan_id)
        .build();

    await clanModel.create(clan);

    await clanCoinsService.addCoins(clanCoins);

    const dbResp = await clanModel.find({ _id: clan_id });
    expect(dbResp[0].gameCoins).toBe(coins);
  });

  it('Should return with error if the clan does not exist', async () => {
    
    const [_, error] = await clanCoinsService.addCoins(clanCoins);

    expect(error).toBeDefined();
    expect(error[0]?.reason).toBe('NOT_FOUND');
    expect(error[0]?.field).toBe('_id');
    expect(error[0]?.value).toBe(clan_id);
  });
});
