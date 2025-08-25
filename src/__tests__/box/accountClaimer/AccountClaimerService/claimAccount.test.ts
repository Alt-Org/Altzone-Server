import ProfileModule from '../../../profile/modules/profile.module';
import PlayerModule from '../../../player/modules/player.module';
import ClanModule from '../../../clan/modules/clan.module';
import BoxModule from '../../modules/box.module';
import ClanBuilder from '../../../clan/data/clan/ClanBuilder';
import BoxBuilder from '../../data/box/BoxBuilder';
import AccountClaimerService from '../../../../box/accountClaimer/accountClaimer.service';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import { Box } from '../../../../box/schemas/box.schema';
import { ObjectId } from 'mongodb';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';

describe('AccountClaimerService.claimAccount() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;
  let service: AccountClaimerService;

  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  let clanBuilder: ClanBuilder;
  const boxModel = BoxModule.getBoxModel();
  let boxBuilder: BoxBuilder;
  let box: Box;
  const boxPassword = 'box-shared-psw';

  beforeEach(async () => {
    service = await BoxModule.getAccountClaimerService();

    clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    boxBuilder = BoxBuilderFactory.getBuilder('Box');

    const clan1ToCreate = clanBuilder.setName('clan1').build();
    const clan1 = await clanModel.create(clan1ToCreate);

    const clan2ToCreate = clanBuilder.setName('clan2').build();
    const clan2 = await clanModel.create(clan2ToCreate);

    const boxToCreate = boxBuilder
      .setTestersSharedPassword(boxPassword)
      .setTestersAmount(10)
      .setCreatedClan_ids([new ObjectId(clan1._id), new ObjectId(clan2._id)])
      .setAdminProfileId(new ObjectId())
      .setAdminPlayerId(new ObjectId())
      .build();
    box = await boxModel.create(boxToCreate);
  });

  it('Should create a profile for tester', async () => {
    const profilesBefore = await profileModel.find();

    await service.claimAccount(boxPassword);

    const profilesAfter = await profileModel.find();

    expect(profilesAfter).toHaveLength(profilesBefore.length + 1);
  });

  it('Should create a player for tester', async () => {
    const playersBefore = await playerModel.find();

    await service.claimAccount(boxPassword);

    const playersAfter = await playerModel.find();

    expect(playersAfter).toHaveLength(playersBefore.length + 1);
  });

  it('Should assign player to one of the box clans', async () => {
    await service.claimAccount(boxPassword);

    const assignedClans = await clanModel.find({ playerCount: 1 });
    const testerPlayer = await playerModel.findOne({
      clan_id: assignedClans[0]._id,
    });

    expect(assignedClans).not.toBeNull();
    expect(assignedClans).toHaveLength(1);
    expect(testerPlayer.clan_id.toString()).toBe(
      assignedClans[0]._id.toString(),
    );
  });

  it('Should increase amount of testers in the box', async () => {
    const boxBefore = await boxModel.findById(box._id);

    await service.claimAccount(boxPassword);

    const boxAfter = await boxModel.findById(box._id);

    expect(boxAfter.testerAccountsClaimed).toBe(
      boxBefore.testerAccountsClaimed + 1,
    );
  });

  it('Should return claimed account information if password is valid', async () => {
    const [account, errors] = await service.claimAccount(boxPassword);

    expect(errors).toBeNull();
    expect(account).not.toBeNull();
    expect(account.accessToken).not.toBeNull();
    expect(account.Clan).not.toBeNull();
  });

  it('Should return ServiceError NOT_ALLOWED if there are no place left in the box', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 10,
    });

    const [account, errors] = await service.claimAccount(boxPassword);

    expect(account).toBeNull();
    expect(errors).toContainSE_NOT_AUTHORIZED();
  });

  it('Should return ServiceError NOT_ALLOWED if testerAccountsClaimed is more than testersAmount', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 15,
    });

    const [account, errors] = await service.claimAccount(boxPassword);

    expect(account).toBeNull();
    expect(errors).toContainSE_NOT_AUTHORIZED();
  });

  it('Should return ServiceError NOT_ALLOWED if the testersAmount is equal to 0', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 0,
      testerAccountsClaimed: 0,
    });

    const [account, errors] = await service.claimAccount(boxPassword);

    expect(account).toBeNull();
    expect(errors).toContainSE_NOT_AUTHORIZED();
  });

  it('Should not return ServiceError NOT_ALLOWED if there are one last place left in the box', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 9,
    });

    const [account, errors] = await service.claimAccount(boxPassword);

    expect(account).not.toBeNull();
    expect(errors).not.toContainSE_NOT_AUTHORIZED();
  });

  it('Should not create profile and player for tester if there are no place left in the box', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 10,
    });

    const profilesBefore = await profileModel.find();
    const playersBefore = await playerModel.find();

    await runClaimAccountAsync(20);

    const profilesAfter = await profileModel.find();
    const playersAfter = await playerModel.find();

    expect(profilesAfter).toHaveLength(profilesBefore.length);
    expect(playersAfter).toHaveLength(playersBefore.length);
  });

  it('Should not increase players amount in any box clan if there are no place left in the box', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 10,
    });

    await runClaimAccountAsync(20);

    const clansAfter = await clanModel.find({
      _id: { $in: box.createdClan_ids },
    });

    const clansWithIncreasedPlayerCount = clansAfter.filter(
      (clan) => clan.playerCount > 0,
    );

    expect(clansWithIncreasedPlayerCount).toHaveLength(0);
  });

  it('Should not increase testerAccountsClaimed in box clan if there are no place left in the box', async () => {
    await boxModel.findByIdAndUpdate(box._id, {
      testersAmount: 10,
      testerAccountsClaimed: 10,
    });

    await runClaimAccountAsync(20);

    const boxAfter = await boxModel.findById(box._id);

    expect(boxAfter.testerAccountsClaimed).toBe(10);
  });

  it('Should return ServiceError REQUIRED if the password is null', async () => {
    const [account, errors] = await service.claimAccount(null);

    expect(account).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if the password is undefined', async () => {
    const [account, errors] = await service.claimAccount(undefined);

    expect(account).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if the password is an empty string', async () => {
    const [account, errors] = await service.claimAccount('');

    expect(account).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError NOT_FOUND if there are no box with provided password is null', async () => {
    const [account, errors] = await service.claimAccount('invalid-password');

    expect(account).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  /**
   * Calls claimAccount() method multiple time asynchronously
   * @param amount
   */
  async function runClaimAccountAsync(amount: number): Promise<void> {
    const calls = Array.from(Array(amount).keys()).map(() =>
      service.claimAccount(boxPassword),
    );

    await Promise.all(calls);
  }
});
