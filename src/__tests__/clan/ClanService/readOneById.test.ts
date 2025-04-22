import { ClanService } from '../../../clan/clan.service';
import LoggedUser from '../../test_utils/const/loggedUser';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';
import { Clan } from '../../../clan/clan.schema';
import { ModelName } from '../../../common/enum/modelName.enum';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import PlayerModule from '../../player/modules/player.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';

describe('ClanService.readOneById() test suite', () => {
  let clanService: ClanService;
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();

  const existingClanName = 'clan1';
  let existingClan: Clan;

  const loggedPlayer = LoggedUser.getPlayer();
  const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();

    const clanToCreate = clanBuilder
      .setName(existingClanName)
      .setAdminIds([loggedPlayer._id])
      .setPlayerCount(1)
      .build();
    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();

    const playerUpdate = playerBuilder.setClanId(existingClan._id).build();
    await playerModel.findByIdAndUpdate(loggedPlayer._id, playerUpdate);
    loggedPlayer.clan_id = existingClan._id;
  });

  it('Should find existing clan from DB', async () => {
    const [clan, errors] = await clanService.readOneById(existingClan._id);

    expect(errors).toBeNull();
    expect(clan).toEqual(expect.objectContaining(existingClan));
  });

  it('Should return only requested in "select" fields', async () => {
    const [clan, errors] = await clanService.readOneById(existingClan._id, {
      select: ['_id', 'name'],
    });

    const clearedClan = clearDBRespDefaultFields(clan);
    const expected = { _id: existingClan._id, name: existingClan.name };

    expect(errors).toBeNull();
    expect(clearedClan).toEqual(expected);
  });

  it('Should return NOT_FOUND SError for non-existing clan', async () => {
    const [clan, errors] = await clanService.readOneById(getNonExisting_id());

    expect(clan).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return VALIDATION SError if provided _id is not valid', async () => {
    const invalid_id = 'not-valid';

    const [clan, errors] = await clanService.readOneById(invalid_id);

    expect(clan).toBeNull();
    expect(errors).toContainSE_VALIDATION();
  });

  it('Should get clan collection references if they exists in DB', async () => {
    const [clan, errors] = await clanService.readOneById(existingClan._id, {
      includeRefs: [ModelName.PLAYER],
    });

    expect(errors).toBeNull();

    const refPlayer = (clan.Player[0] as any).toObject();
    const clearedPlayer = clearDBRespDefaultFields(refPlayer);
    expect(clearedPlayer).toMatchObject(clearedPlayer);
  });

  it('Should ignore non-existing schema references requested', async () => {
    const nonExistingReferences: any = ['non-existing'];
    const [clan, errors] = await clanService.readOneById(existingClan._id, {
      includeRefs: nonExistingReferences,
    });

    expect(errors).toBeNull();
    expect(clan['non-existing']).toBeUndefined();
  });
});
