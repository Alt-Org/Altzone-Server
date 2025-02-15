import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";
import {BoxService} from "../../../box/box.service";
import BoxBuilderFactory from "../data/boxBuilderFactory";
import BoxModule from "../modules/box.module";
import ProfileModule from "../../profile/modules/profile.module";
import PlayerModule from "../../player/modules/player.module";
import ClanModule from "../../clan/modules/clan.module";
import SoulhomeModule from "../../clanInventory/modules/soulhome.module";
import RoomModule from "../../clanInventory/modules/room.module";
import StockModule from "../../clanInventory/modules/stock.module";
import ChatModule from "../../chat/modules/chat.module";
import {envVars} from "../../../common/service/envHandler/envVars";
import {Environment} from "../../../common/service/envHandler/enum/environment.enum";
import ClanBuilderFactory from "../../clan/data/clanBuilderFactory";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import {getRoomDefaultItems, getStockDefaultItems} from "../../../clan/utils/defaultValues/items";
import ItemModule from "../../clanInventory/modules/item.module";
import LoggedUser from "../../test_utils/const/loggedUser";

describe('BoxService.initializeBox() test suite', () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;

    let boxService: BoxService;

    const boxAdmin = 'box-admin';
    const adminName = 'box-admin';
    const createBoxBuilder = BoxBuilderFactory.getBuilder('CreateBoxDto');
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    const boxToCreate = createBoxBuilder.setAdminPassword(boxAdmin).setPlayerName(adminName).build();
    const boxModel = BoxModule.getBoxModel();

    const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
    const existingAdmin = adminBuilder.setPassword(boxAdmin).build();
    const adminModel = BoxModule.getGroupAdminModel();

    const profileModel = ProfileModule.getProfileModel();
    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const roomModel = RoomModule.getRoomModel();
    const stockModel = StockModule.getStockModel();
    const itemModel = ItemModule.getItemModel();

    const chatModel = ChatModule.getChatModel();

    beforeEach(async () => {
        boxService = await BoxModule.getBoxService();

        const adminResp = await adminModel.create(existingAdmin);
        existingAdmin._id = adminResp._id;
    });

    it('Should create box in DB if input is valid', async () => {
        await boxService.initializeBox(boxToCreate);

        const dbResp = await boxModel.find({ adminPassword: boxAdmin });
        const boxInDB = dbResp[0]?.toObject();

        const clearedResp = clearDBRespDefaultFields(boxInDB);

        expect(dbResp).toHaveLength(1);
        expect(clearedResp.adminPassword).toBe(boxAdmin);
    });

    it('Should return created box data, if input is valid', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        expect(errors).toBeNull();
        expect(result.adminPassword).toBe(boxAdmin);
    });

    it('Should create 2 clans with auto generated names, if input is without clan names', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const expectedClanName1 = `${boxToCreate.playerName} clan 1`;
        const expectedClanName2 = `${boxToCreate.playerName} clan 2`;

        const clansInDB = await clanModel.find({ _id: { $in: result.clan_ids } }).select(['name']);
        const clearedClans = clearDBRespDefaultFields(clansInDB);

        expect(clansInDB).toHaveLength(2);
        expect(clearedClans).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: expectedClanName1, _id: expect.any(ObjectId) }),
            expect.objectContaining({ name: expectedClanName2, _id: expect.any(ObjectId) })
        ]));
    });

    it('Should create 2 clans with provided names', async () => {
        const clan1Name = 'box-clan-1';
        const clan2Name = 'box-clan-2';
        const [result, errors] = await boxService.initializeBox({...boxToCreate, clanNames: [clan1Name, clan2Name]});

        const clansInDB = await clanModel.find({ _id: { $in: result.clan_ids } }).select(['name']);
        const clearedClans = clearDBRespDefaultFields(clansInDB);

        expect(clansInDB).toHaveLength(2);
        expect(clearedClans).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: clan1Name, _id: expect.any(ObjectId) }),
            expect.objectContaining({ name: clan2Name, _id: expect.any(ObjectId) })
        ]));
    });

    it('Should create soul home for each clan', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const soulHomesInDB = await soulHomeModel.find({ clan_id: { $in: result.clan_ids } });

        expect(soulHomesInDB).toHaveLength(2);
    });

    it('Should create 30 rooms for each soul home', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const soulHome1Rooms = await roomModel.find({ soulHome_id: { $in: result.soulHome_ids[0] } });
        const soulHome2Rooms = await roomModel.find({ soulHome_id: { $in: result.soulHome_ids[1] } });

        expect(soulHome1Rooms).toHaveLength(30);
        expect(soulHome2Rooms).toHaveLength(30);
    });

    it('Should create default items for each soul home', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const defaultItemsCount = getRoomDefaultItems('').length;

        const soulHome1Items = await itemModel.find({ room_id: { $in: result.room_ids[0] } });
        const soulHome2Items = await itemModel.find({ room_id: { $in: result.room_ids[1] } });

        expect(soulHome1Items).toHaveLength(defaultItemsCount);
        expect(soulHome2Items).toHaveLength(defaultItemsCount);
    });

    it('Should create stock for each clan', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const stocksInDB = await stockModel.find({ clan_id: { $in: result.clan_ids } });

        expect(stocksInDB).toHaveLength(2);
    });

    it('Should create default items for each stock', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const defaultItemsCount = getStockDefaultItems('').length;

        const soulHome1Items = await itemModel.find({ stock_id: { $in: result.stock_ids[0] } });
        const soulHome2Items = await itemModel.find({ stock_id: { $in: result.stock_ids[1] } });

        expect(soulHome1Items).toHaveLength(defaultItemsCount);
        expect(soulHome2Items).toHaveLength(defaultItemsCount);
    });

    it('Should create a chat', async () => {
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        const chatInDB = await chatModel.findById(result.chat_id);

        expect(chatInDB).not.toBeNull();
    });

    it('Should not save any box in DB, if the provided input is null', async () => {
        await boxService.initializeBox(null);

        const dbResp = await boxModel.findOne({ adminPassword: undefined });
        expect(dbResp).toBeNull();

        const dataLeft = await isBoxDataLeft();
        expect(dataLeft).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED, if the provided input is null', async () => {
        const [result, errors] = await boxService.initializeBox(null);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should not save any box in DB, if the provided input is undefined', async () => {
        await boxService.initializeBox(undefined);

        const dbResp = await boxModel.findOne({ adminPassword: undefined });
        expect(dbResp).toBeNull();

        const dataLeft = await isBoxDataLeft();
        expect(dataLeft).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED, if the provided input is undefined', async () => {
        const [result, errors] = await boxService.initializeBox(undefined);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should return ServiceError with reason NOT_FOUND, if the provided adminPassword does not exists', async () => {
        const [result, errors] = await boxService.initializeBox({...boxToCreate, adminPassword: 'non-existent'});

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not save any box data, if the provided adminPassword does not exists', async () => {
        await boxService.initializeBox({...boxToCreate, adminPassword: 'non-existent'});

        const dataLeft = await isBoxDataLeft();
        expect(dataLeft).toBeNull();
    });

    it('Should return ServiceError with reason NOT_UNIQUE, if box with provided adminPassword already registered', async () => {
        const existingBox = boxBuilder
            .setAdminPassword(boxToCreate.adminPassword).setAdminProfileId(new ObjectId()).setAdminPlayerId(new ObjectId())
            .setClanIds([]).setSoulHomeIds([]).setRoomIds([]).setStockIds([])
            .setChatId(new ObjectId())
            .build();
        await boxModel.create(existingBox);
        const [result, errors] = await boxService.initializeBox(boxToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_UNIQUE();
        expect(errors[0].field).toEqual('adminPassword');
        expect(errors[0].value).toEqual(boxToCreate.adminPassword);
    });

    it('Should not save any box data, if box with provided adminPassword already registered', async () => {
        const existingBox = boxBuilder
            .setAdminPassword(boxToCreate.adminPassword).setAdminProfileId(new ObjectId()).setAdminPlayerId(new ObjectId())
            .setClanIds([]).setSoulHomeIds([]).setRoomIds([]).setStockIds([])
            .setChatId(new ObjectId())
            .build();
        await boxModel.create(existingBox);
        await boxService.initializeBox(boxToCreate);

        const dataLeft = await isBoxDataLeft();
        const {Box, ...otherData} = dataLeft;
        expect(otherData).toEqual({});
        expect(Box).toHaveLength(1);
        expect(Box[0].adminPassword).toBe(existingBox.adminPassword);
    });

    it('Should return ServiceError with reason NOT_UNIQUE, if one of clan names already registered', async () => {
        const existingClanName = 'box-clan';
        const existingClan = clanBuilder.setName(existingClanName).build();
        await clanModel.create(existingClan);

        const [result, errors] = await boxService.initializeBox({...boxToCreate, clanNames: [existingClanName, 'non-existent-clan']});

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_UNIQUE();
        expect(errors[0].field).toEqual('clanNames');
        expect(errors[0].value).toEqual(existingClanName);
    });

    it('Should not save any box data, if one of clan names already registered', async () => {
        const existingClanName = 'box-clan';
        const existingClan = clanBuilder.setName(existingClanName).build();
        await clanModel.create(existingClan);

        await boxService.initializeBox({...boxToCreate, clanNames: [existingClanName, 'non-existent-clan']});

        const dataLeft = await isBoxDataLeft();
        const {Clan, ...otherData} = dataLeft;
        expect(otherData).toEqual({});
        expect(Clan).toHaveLength(1);
        expect(Clan[0].name).toBe(existingClan.name);
    });

    it('Should return two ServiceError with reason NOT_UNIQUE, if both of clan names already registered', async () => {
        const existingClanName1 = 'box-clan-1';
        const existingClan1 = clanBuilder.setName(existingClanName1).build();
        const existingClanName2 = 'box-clan-2';
        const existingClan2 = clanBuilder.setName(existingClanName2).build();
        await clanModel.create(existingClan1);
        await clanModel.create(existingClan2);

        const [result, errors] = await boxService.initializeBox({...boxToCreate, clanNames: [existingClanName1, existingClanName2]});

        expect(result).toBeNull();
        expect(errors).toHaveLength(2);
        expect(errors[0]).toBeSE_NOT_UNIQUE();
        expect(errors[0].field).toEqual('clanNames');
        expect(errors[0].value).toEqual(existingClanName1);

        expect(errors[1]).toBeSE_NOT_UNIQUE();
        expect(errors[1].field).toEqual('clanNames');
        expect(errors[1].value).toEqual(existingClanName2);
    });

    it('Should not save any box data, if both of clan names already registered', async () => {
        const existingClanName1 = 'box-clan-1';
        const existingClan1 = clanBuilder.setName(existingClanName1).build();
        const existingClanName2 = 'box-clan-2';
        const existingClan2 = clanBuilder.setName(existingClanName2).build();
        await clanModel.create(existingClan1);
        await clanModel.create(existingClan2);

        await boxService.initializeBox({...boxToCreate, clanNames: [existingClanName1, existingClanName2]});

        const dataLeft = await isBoxDataLeft();
        const {Clan, ...otherData} = dataLeft;
        expect(otherData).toEqual({});
        expect(Clan).toHaveLength(2);
    });

    it('Should return ServiceError with reason NOT_UNIQUE, if player with provided name is already registered', async () => {
        const existingPlayer = playerBuilder.setName(boxToCreate.playerName).build();
        await playerModel.create(existingPlayer);

        const [result, errors] = await boxService.initializeBox(boxToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_UNIQUE();
        expect(errors[0].field).toEqual('playerName');
        expect(errors[0].value).toEqual(boxToCreate.playerName);
    });

    it('Should not save any box data, if player with provided name is already registered', async () => {
        const existingPlayer = playerBuilder.setName(boxToCreate.playerName).build();
        await playerModel.create(existingPlayer);

        await boxService.initializeBox(boxToCreate);

        const dataLeft = await isBoxDataLeft();
        const {Player, ...otherData} = dataLeft;
        expect(otherData).toEqual({});
        expect(Player).toHaveLength(1);
        expect(Player[0].name).toBe(existingPlayer.name);
    });


    /**
     * Checks whenever any box related data exists in DB.
     *
     * @returns a record with all references found
     */
    async function isBoxDataLeft(): Promise<Record<string, any[]> | null> {
        const leftData: Record<string, any> = {};

        const boxesInDB = await boxModel.find();
        if(boxesInDB.length !== 0)
            leftData['Box'] = boxesInDB;

        const clansInDB = await clanModel.find();
        if(clansInDB.length !== 0)
            leftData['Clan'] = clansInDB;

        const soulHomesInDB = await soulHomeModel.find();
        if(soulHomesInDB.length !== 0)
            leftData['Soul Home'] = soulHomesInDB;

        const roomsInDB = await roomModel.find();
        if(roomsInDB.length !== 0)
            leftData['Room'] = roomsInDB;

        const stocksInDB = await stockModel.find();
        if(stocksInDB.length !== 0)
            leftData['Stock'] = stocksInDB;

        const itemsInDB = await itemModel.find();
        if(itemsInDB.length !== 0)
            leftData['Item'] = itemsInDB;

        const playersInDB = await playerModel.find({ name: { $ne: LoggedUser.getPlayer().name } });
        if(playersInDB.length !== 0)
            leftData['Player'] = playersInDB;

        const profilesInDB = await profileModel.find({ username: { $ne: LoggedUser.getProfile().username } });
        if(profilesInDB.length !== 0)
            leftData['Profile'] = profilesInDB;

        const chatsInDB = await chatModel.find();
        if(chatsInDB.length !== 0)
            leftData['Chat'] = chatsInDB;

        return Object.keys(leftData).length !== 0 ? leftData : null;
    }
});