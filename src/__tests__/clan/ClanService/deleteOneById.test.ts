import { ClanService } from '../../../clan/clan.service';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import { Clan } from '../../../clan/clan.schema';
import LoggedUser from '../../test_utils/const/loggedUser';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import ClanModule from '../modules/clan.module';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import StockModule from '../../clanInventory/modules/stock.module';
import { Stock } from '../../../clanInventory/stock/stock.schema';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';
import { SoulHome } from '../../../clanInventory/soulhome/soulhome.schema';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('ClanService.deleteOneById() test suite', () => {
  let clanService: ClanService;
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();

  let existingClan_id: string;
  let existingClan: Clan;

  const loggedPlayer = LoggedUser.getPlayer();
  const playerUpdateBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();

  let clanStock: Stock;
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();

  let clanSoulHome: SoulHome;
  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();

    const clanToCreate = clanBuilder.setName('clan1').build();
    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();
    existingClan_id = existingClan._id.toString();

    loggedPlayer.clan_id = existingClan._id;
    const playerUpdate = playerUpdateBuilder
      .setClanId(existingClan._id)
      .build();
    await playerModel.findByIdAndUpdate(loggedPlayer._id, playerUpdate);

    const stock = stockBuilder.setClanId(existingClan_id).build();
    const stockResp = await stockModel.create(stock);
    clanStock = stockResp.toObject();

    const soulHome = soulHomeBuilder.setClanId(existingClan_id).build();
    const soulHomeResp = await soulHomeModel.create(soulHome);
    clanSoulHome = soulHomeResp.toObject();
  });

  it('Should delete the object from DB if the _id is valid and return true', async () => {
    const [wasDeleted, errors] =
      await clanService.deleteOneById(existingClan_id);

    expect(errors).toBeNull();
    expect(wasDeleted).toBeTruthy();

    const deletedClan = await clanModel.findById(existingClan_id);
    expect(deletedClan).toBeNull();
  });

  it('Should delete its Stock and SoulHome from DB', async () => {
    const [ret, error] = await clanService.deleteOneById(existingClan_id);
    expect(error).toBeNull();
    expect(ret).toBe(true);

    const deletedStock = await stockModel.findById(existingClan_id);
    expect(deletedStock).toBeNull();

    const deletedSoulHome = await soulHomeModel.findById(clanSoulHome._id);
    expect(deletedSoulHome).toBeNull();
  });

  it('Should update clan_id to null of all clan members', async () => {
    await clanService.deleteOneById(existingClan_id);

    const exClanMember = await playerModel.findById(loggedPlayer._id);
    expect(exClanMember.clan_id).toBeNull();
  });

  it('Should return ServiceError NOT_FOUND if the object with provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const [wasDeleted, errors] =
      await clanService.deleteOneById(nonExisting_id);

    expect(wasDeleted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if input _id is null or undefined', async () => {
    const nullInput = async () => await clanService.deleteOneById(null);
    const undefinedInput = async () =>
      await clanService.deleteOneById(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
