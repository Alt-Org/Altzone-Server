import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import SoulhomeModule from '../../modules/soulhome.module';
import RoomModule from '../../modules/room.module';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { RoomService } from '../../../../clanInventory/room/room.service';
import LoggedUser from '../../../test_utils/const/loggedUser';
import PlayerModule from '../../../player/modules/player.module';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';

describe('Room.readPlayerClanRooms() test suite', () => {
  let roomService: RoomService;
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom1 = roomBuilder.build();
  const existingRoom2 = roomBuilder.build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder
    .setClanId(getNonExisting_id())
    .build();

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingClan = clanBuilder.build();

  const existingPlayer = LoggedUser.getPlayer();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    const clanResp = await clanModel.create(existingClan);
    existingClan._id = clanResp._id.toString();

    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      clan_id: existingClan._id,
    });
    existingPlayer.clan_id = existingClan._id;

    existingSoulHome.clan_id = existingClan._id;
    const createdSoulHome = await soulHomeModel.create(existingSoulHome);
    existingSoulHome._id = createdSoulHome._id;

    roomService = await RoomModule.getRoomService();
    existingRoom1.soulHome_id = existingSoulHome._id.toString();
    const createdRoom1 = await roomModel.create(existingRoom1);
    existingRoom1._id = createdRoom1._id;
    existingRoom2.soulHome_id = existingSoulHome._id.toString();
    const createdRoom2 = await roomModel.create(existingRoom2);
    existingRoom2._id = createdRoom2._id;
  });

  //TODO: bug, throw error if options with filter are not specified
  it('Should find existing rooms from DB', async () => {
    const [room, errors] = await roomService.readPlayerClanRooms(
      existingPlayer._id,
      { filter: {} },
    );

    const clearedRoom = clearDBRespDefaultFields(room);

    expect(errors).toBeNull();
    expect(clearedRoom).toEqual([existingRoom1, existingRoom2]);
  });

  it('Should return NOT_FOUND if player does not exists', async () => {
    const [room, errors] =
      await roomService.readPlayerClanRooms(getNonExisting_id());

    expect(room).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND if player does not belong to any Clan', async () => {
    await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: null });

    const [room, errors] = await roomService.readPlayerClanRooms(
      existingPlayer._id,
    );

    expect(room).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
