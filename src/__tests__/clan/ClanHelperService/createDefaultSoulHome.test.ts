import ClanBuilderFactory from "../data/clanBuilderFactory";
import ClanModule from "../modules/clan.module";
import ClanHelperService from "../../../clan/utils/clanHelper.service";
import ItemModule from "../../clanInventory/modules/item.module";
import {ItemName} from "../../../clanInventory/item/enum/itemName.enum";
import SoulhomeModule from "../../clanInventory/modules/soulhome.module";
import RoomModule from "../../clanInventory/modules/room.module";

describe('ClanHelperService.createDefaultSoulHome() test suite', () => {
    let clanHelperService: ClanHelperService;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const roomModel = RoomModule.getRoomModel();
    const itemModel = ItemModule.getItemModel();

    const existingClan = clanBuilder.build();

    beforeEach(async () => {
        clanHelperService = await ClanModule.getClanHelperService();
        const createdClan = await clanModel.create(existingClan);
        existingClan._id = createdClan._id;
    });

    it('Should create a new SoulHome for a specified clan', async () => {
        await clanHelperService.createDefaultSoulHome(existingClan._id, 'soulhome1');

        const createdSoulHome = await soulHomeModel.findOne({clan_id: existingClan._id});

        expect(createdSoulHome).not.toBeNull();
    });

    it('Should create 30 Rooms for the SoulHome', async () => {
        await clanHelperService.createDefaultSoulHome(existingClan._id, 'soulhome1');

        const createdSoulHome = await soulHomeModel.findOne({clan_id: existingClan._id});
        const createdRooms = await roomModel.find({soulHome_id: createdSoulHome._id});

        expect(createdRooms).not.toBeNull();
        expect(createdRooms.length).toBe(30);
    });

    it('Should add default items to the first SoulHome room', async () => {
        const [result, ] = await clanHelperService.createDefaultSoulHome(existingClan._id, 'soulhome1');

        const {Item} = result;
        const itemsRoom_id = Item[0].room_id;

        const createdItems = await itemModel.find({room_id: itemsRoom_id});

        expect(createdItems).not.toBeNull();
        expect(createdItems).toEqual(expect.arrayContaining([
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.SOFA_RAKKAUS}),
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.ARMCHAIR_RAKKAUS}),
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.FLOORLAMP_RAKKAUS}),
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.DININGTABLE_RAKKAUS}),
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.SOFATABLE_RAKKAUS}),
            expect.objectContaining({room_id: itemsRoom_id, unityKey: ItemName.BED_RAKKAUS})
        ]))
    });
});