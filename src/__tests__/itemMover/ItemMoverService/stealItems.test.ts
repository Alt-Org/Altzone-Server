import { ItemMoverService } from '../../../itemMover/itemMover.service';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import { QualityLevel } from '../../../clanInventory/item/enum/qualityLevel.enum';
import ItemModule from '../../clanInventory/modules/item.module';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import ItemMoverModule from '../modules/itemMover.module';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';
import RoomModule from '../../clanInventory/modules/room.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { StealToken } from '../../../clanInventory/item/type/stealToken.type';
import { APIError } from '../../../common/controller/APIError';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';

describe('ItemMoverService.stealItems() test suite', () => {
  let itemMoverService: ItemMoverService;

  const itemModel = ItemModule.getItemModel();
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const item1 = itemBuilder
    .setName(ItemName.ARMCHAIR_RAKKAUS)
    .setQualityLevel(QualityLevel.common)
    .build();
  const item2 = itemBuilder
    .setName(ItemName.CLOSET_RAKKAUS)
    .setQualityLevel(QualityLevel.common)
    .build();
  const allItemsFilter = { qualityLevel: QualityLevel.common };

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const sourceClan = clanBuilder.setName('source-clan').build();
  const destinationClan = clanBuilder.setName('destination-clan').build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const sourceSoulHome = soulHomeBuilder.build();
  const destinationSoulHome = soulHomeBuilder.build();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const sourceRoom = roomBuilder.build();
  const destinationRoom = roomBuilder.build();

  let stealToken: StealToken;

  beforeEach(async () => {
    itemMoverService = await ItemMoverModule.getItemMoverService();

    const destinationClanResp = await clanModel.create(destinationClan);
    destinationClan._id = destinationClanResp._id;
    const sourceClanResp = await clanModel.create(sourceClan);
    sourceClan._id = sourceClanResp._id;

    destinationSoulHome.clan_id = destinationClan._id;
    const destinationSoulHomeResp =
      await soulHomeModel.create(destinationSoulHome);
    destinationSoulHome._id = destinationSoulHomeResp._id;
    destinationRoom.soulHome_id = destinationSoulHome._id;
    const destinationRoomResp = await roomModel.create(destinationRoom);
    destinationRoom._id = destinationRoomResp._id;

    sourceSoulHome.clan_id = sourceClan._id;
    const sourceSoulHomeResp = await soulHomeModel.create(sourceSoulHome);
    sourceSoulHome._id = sourceSoulHomeResp._id.toString();
    sourceRoom.soulHome_id = sourceSoulHome._id;
    const sourceRoomResp = await roomModel.create(sourceRoom);
    sourceRoom._id = sourceRoomResp._id;

    item1.room_id = sourceRoom._id as any;
    item2.room_id = sourceRoom._id as any;
    const item1Resp = await itemModel.create(item1);
    const item2Resp = await itemModel.create(item2);
    item1._id = item1Resp._id;
    item2._id = item2Resp._id;

    stealToken = {
      exp: new Date().getTime() + 60000,
      iat: 1000,
      playerId: getNonExisting_id(),
      soulHomeId: sourceSoulHome._id,
    };
  });

  it('Should move the items to specified room', async () => {
    await itemMoverService.stealItems(
      [item1._id, item2._id],
      stealToken,
      destinationRoom._id,
    );

    const itemsInDB = await itemModel.find(allItemsFilter);
    const clearedItems = clearDBRespDefaultFields(itemsInDB);

    expect(clearedItems).toEqual(
      expect.arrayContaining([
        { ...item1, room_id: destinationRoom._id },
        { ...item2, room_id: destinationRoom._id },
      ]),
    );
  });

  //TODO: should return items with updated room_ids
  it('Should return moved items', async () => {
    const [movedItems, errors] = await itemMoverService.stealItems(
      [item1._id, item2._id],
      stealToken,
      destinationRoom._id,
    );
    const clearedItems = clearDBRespDefaultFields(movedItems);

    expect(errors).toBeNull();
    expect(clearedItems).toEqual(
      expect.arrayContaining([
        { ...item1, room_id: sourceRoom._id },
        { ...item2, room_id: sourceRoom._id },
      ]),
    );
  });

  //TODO: Should throw No movable items found
  it('Should throw NOT_FOUND ServiceError if provided items do not exist', async () => {
    const throwingCall = async () => {
      await itemMoverService.stealItems(
        [getNonExisting_id(), getNonExisting_id()],
        stealToken,
        destinationRoom._id,
      );
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: "Cannot read properties of undefined (reading 'soulHomeId')",
      }),
    );
  });

  it('Should throw NOT_FOUND ServiceError if provided items array is empty', async () => {
    const throwingCall = async () => {
      await itemMoverService.stealItems([], stealToken, destinationRoom._id);
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'No movable items found',
      }),
    );
  });

  it('Should throw NOT_FOUND ServiceError if provided items array is null', async () => {
    const throwingCall = async () => {
      await itemMoverService.stealItems(null, stealToken, destinationRoom._id);
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: "Cannot read properties of null (reading 'map')",
      }),
    );
  });

  it('Should throw NOT_FOUND ServiceError if provided items array is undefined', async () => {
    const throwingCall = async () => {
      await itemMoverService.stealItems(
        undefined,
        stealToken,
        destinationRoom._id,
      );
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: "Cannot read properties of undefined (reading 'map')",
      }),
    );
  });

  //TODO: Should validate the token
  // it('Should throw NOT_FOUND ServiceError if provided steal token is expired', async () => {
  //     const expiredToken = {...stealToken, expiredAt: new Date().getTime()-60000};
  //     const throwingCall = async () => {
  //         await itemMoverService.stealItems([item1._id, item2._id], expiredToken, destinationRoom._id);
  //     }
  //
  //     await expect(throwingCall).rejects.toThrow();
  // });

  it('Should throw NOT_FOUND ServiceError if soulHome in steal token does not exists', async () => {
    const expiredToken = { ...stealToken, soulHomeId: getNonExisting_id() };
    const throwingCall = async () => {
      await itemMoverService.stealItems(
        [item1._id, item2._id],
        expiredToken,
        destinationRoom._id,
      );
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'No movable items found',
      }),
    );
  });

  it('Should throw NOT_FOUND ServiceError if soulHome in steal token is null', async () => {
    const expiredToken = { ...stealToken, soulHomeId: null };
    const throwingCall = async () => {
      await itemMoverService.stealItems(
        [item1._id, item2._id],
        expiredToken,
        destinationRoom._id,
      );
    };

    await expect(throwingCall).rejects.toThrowError(
      new APIError({
        reason: APIErrorReason.NOT_FOUND,
        message: 'No movable items found',
      }),
    );
  });
});
