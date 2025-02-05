import {ItemMoverService} from "../../../itemMover/itemMover.service";
import {ItemName} from "../../../clanInventory/item/enum/itemName.enum";
import {QualityLevel} from "../../../clanInventory/item/enum/qualityLevel.enum";
import ItemModule from "../../clanInventory/modules/item.module";
import ClanInventoryBuilderFactory from "../../clanInventory/data/clanInventoryBuilderFactory";
import ItemMoverModule from "../modules/itemMover.module";
import SoulhomeModule from "../../clanInventory/modules/soulhome.module";
import RoomModule from "../../clanInventory/modules/room.module";
import StockModule from "../../clanInventory/modules/stock.module";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {MoveTo} from "../../../clanInventory/item/enum/moveTo.enum";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import LoggedUser from "../../test_utils/const/loggedUser";
import ClanModule from "../../clan/modules/clan.module";
import ClanBuilderFactory from "../../clan/data/clanBuilderFactory";
import PlayerModule from "../../player/modules/player.module";

describe('ItemMoverService.moveItem() test suite', () => {
    let itemMoverService: ItemMoverService;

    const itemModel = ItemModule.getItemModel();
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const item = itemBuilder.setName(ItemName.ARMCHAIR_RAKKAUS).setQualityLevel(QualityLevel.common).build();

    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId(getNonExisting_id()).build();

    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.build();

    const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    const stockModel = StockModule.getStockModel();
    const existingStock = stockBuilder.setClanId(getNonExisting_id()).build();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    const player = LoggedUser.getPlayer();
    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        itemMoverService = await ItemMoverModule.getItemMoverService();

        const createdClan = await clanModel.create(existingClan);
        existingClan._id = createdClan._id;

        await playerModel.findByIdAndUpdate(player._id, { clan_id: existingClan._id });

        existingSoulHome.clan_id = existingClan._id;
        const soulHomeResp = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = soulHomeResp._id;
        existingRoom.soulHome_id = existingSoulHome._id;
        const roomResp = await roomModel.create(existingRoom);
        existingRoom._id = roomResp._id;

        existingStock.clan_id = existingClan._id as any;
        const stockResp = await stockModel.create(existingStock);
        existingStock._id = stockResp._id;

        const dbResp1 = await itemModel.create(item);
        item._id = dbResp1._id;
    });

    it('Should move the item from room to specified stock', async () => {
        await itemModel.findByIdAndUpdate(item._id, { room_id: existingRoom._id });

        await itemMoverService.moveItem(item._id, existingStock._id, MoveTo.STOCK, player._id);

        const itemInDB = await itemModel.findById(item._id);
        const clearedItemInDB = clearDBRespDefaultFields(itemInDB);

        expect(clearedItemInDB).toEqual(expect.objectContaining({...item, stock_id: existingStock._id, room_id: null}));
    });

    //TODO: should return item as an object not array
    it('Should return moved to stock item', async () => {
        await itemModel.findByIdAndUpdate(item._id, { room_id: existingRoom._id });

        const [items, errors] = await itemMoverService.moveItem(item._id, existingStock._id, MoveTo.STOCK, player._id);

        expect(errors).toBeNull();

        const clearedItems = clearDBRespDefaultFields(items);
        expect(clearedItems).toEqual(expect.arrayContaining([
            expect.objectContaining({...item, room_id: existingRoom._id, stock_id: null})
        ]));
    });

    it('Should move the item from stock to specified room', async () => {
        await itemModel.findByIdAndUpdate(item._id, { stock_id: existingStock._id });

        await itemMoverService.moveItem(item._id, existingRoom._id, MoveTo.ROOM, player._id);

        const itemInDB = await itemModel.findById(item._id);
        const clearedItemInDB = clearDBRespDefaultFields(itemInDB);

        expect(clearedItemInDB).toEqual(expect.objectContaining({...item, room_id: existingRoom._id, stock_id: null}));
    });

    //TODO: should return item as an object not array
    it('Should return moved to room item', async () => {
        await itemModel.findByIdAndUpdate(item._id, { stock_id: existingStock._id });

        const [items, errors] = await itemMoverService.moveItem(item._id, existingRoom._id, MoveTo.ROOM, player._id);

        expect(errors).toBeNull();

        const clearedItems = clearDBRespDefaultFields(items);
        expect(clearedItems).toEqual(expect.arrayContaining([
            expect.objectContaining({...item, stock_id: existingStock._id, room_id: null})
        ]));
    });

    it('Should return NOT_FOUND if item is not found', async () => {
        const [items, errors] = await itemMoverService.moveItem(getNonExisting_id(), existingRoom._id, MoveTo.ROOM, player._id);

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: should validate and return NOT_ALLOWED not NOT_FOUND
    it('Should return NOT_FOUND if provided _ids are not mongo _ids', async () => {
        const [items, errors] = await itemMoverService.moveItem('non-mongo-id', existingRoom._id, MoveTo.ROOM, player._id);

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: should validate destinationId param and return NOT_ALLOWED not NOT_FOUND
    it('Should return NOT_ALLOWED if provided destinationId is not mongo _id', async () => {
        const [items, errors] = await itemMoverService.moveItem(item._id, 'not-mongo-id', MoveTo.STOCK, player._id);

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if provided stock _id does not exists', async () => {
        const [items, errors] = await itemMoverService.moveItem(item._id, getNonExisting_id(), MoveTo.STOCK, player._id);

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if provided room _id does not exists', async () => {
        const [items, errors] = await itemMoverService.moveItem(item._id, getNonExisting_id(), MoveTo.ROOM, player._id);

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if provided player _id does not exists', async () => {
        const [items, errors] = await itemMoverService.moveItem(item._id, getNonExisting_id(), MoveTo.ROOM, getNonExisting_id());

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    // TODO: should validate playerId param and return NOT_ALLOWED not NOT_FOUND
    it('Should return NOT_ALLOWED if provided player _id is not mongo _id', async () => {
        const [items, errors] = await itemMoverService.moveItem(item._id, getNonExisting_id(), MoveTo.ROOM, 'non-mongo-id');

        expect(items).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});