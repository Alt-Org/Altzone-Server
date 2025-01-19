import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import RoomModule from "../../modules/room.module";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ModelName} from "../../../../common/enum/modelName.enum";
import {RoomService} from "../../../../clanInventory/room/room.service";
import LoggedUser from "../../../test_utils/const/loggedUser";
import PlayerModule from "../../../player/modules/player.module";
import ClanModule from "../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";

describe('Room.readOneByIdAndPlayerId() test suite', () => {
    let roomService: RoomService;
    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.build();

    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId(getNonExisting_id()).build();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    const existingPlayer = LoggedUser.getPlayer();
    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        const clanResp = await clanModel.create(existingClan);
        existingClan._id = clanResp._id.toString();

        await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: existingClan._id });
        existingPlayer.clan_id = existingClan._id;

        existingSoulHome.clan_id = existingClan._id;
        const createdSoulHome = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = createdSoulHome._id;

        roomService = await RoomModule.getRoomService();
        existingRoom.soulHome_id = existingSoulHome._id.toString();
        const createdRoom = await roomModel.create(existingRoom);
        existingRoom._id = createdRoom._id;
    });

    it('Should find existing room from DB', async () => {
        const [room, errors] = await roomService.readOneByIdAndPlayerId(existingRoom._id, existingPlayer._id);

        const clearedRoom = clearDBRespDefaultFields(room);

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expect.objectContaining(existingRoom));
    });

    it('Should return fields only requested in "select"', async () => {
        const [room, errors] = await roomService.readOneByIdAndPlayerId(
            existingRoom._id, existingPlayer._id, { select: [ '_id', 'cellCount' ], filter: {} }
        );

        const clearedRoom = clearDBRespDefaultFields(room);
        const expected = { _id: existingRoom._id, cellCount: existingRoom.cellCount, isActive: false };

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expected);
    });

    it('Should return NOT_FOUND SError for non-existing room', async () => {
        const [room, errors] = await roomService.readOneByIdAndPlayerId(getNonExisting_id(), existingPlayer._id);

        expect(room).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION SError if provided room _id is not valid', async () => {
        const invalid_id = 'not-valid';

        const [room, errors] = await roomService.readOneByIdAndPlayerId(invalid_id, existingPlayer._id);

        expect(room).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should not throw if provided room _id is null or undefined', async () => {
        const null_idCall = async () => await roomService.readOneByIdAndPlayerId(null, existingPlayer._id);
        const undefined_idCall = async () => await roomService.readOneByIdAndPlayerId(undefined, existingPlayer._id);

        expect(null_idCall).not.toThrow();
        expect(undefined_idCall).not.toThrow();
    });

    it('Should return NOT_FOUND if provided room _id is null or undefined', async () => {
        const [roomNullCall, errorsNullCall] = await roomService.readOneByIdAndPlayerId(null, existingPlayer._id);
        const [roomUndefinedCall, errorsCall] = await roomService.readOneByIdAndPlayerId(undefined, existingPlayer._id);

        expect(roomNullCall).toBeNull();
        expect(errorsNullCall).toContainSE_NOT_FOUND();

        expect(roomUndefinedCall).toBeNull();
        expect(errorsCall).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if player does not exists', async () => {
        const [room, errors] = await roomService.readOneByIdAndPlayerId(existingRoom._id, getNonExisting_id());

        expect(room).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return NOT_FOUND if player does not belong to the Clan where Room is', async () => {
        await playerModel.findByIdAndUpdate(existingPlayer._id, { clan_id: null });

        const [room, errors] = await roomService.readOneByIdAndPlayerId(existingRoom._id, existingPlayer._id);

        expect(room).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should get room\'s collection references if they exists in DB', async () => {
        const [room, errors] = await roomService.readOneByIdAndPlayerId(
            existingRoom._id, existingPlayer._id,
            { includeRefs: [ ModelName.SOULHOME ], filter: {} }
        );

        expect(errors).toBeNull();

        const clearedSoulHome = clearDBRespDefaultFields(room['SoulHome']);
        expect(clearedSoulHome).toMatchObject(existingSoulHome);
    });

    it('Should ignore non-existing schema references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];
        const [room, errors] = await roomService.readOneByIdAndPlayerId(
            existingRoom._id, existingPlayer._id,
            { includeRefs: nonExistingReferences, filter: {} }
        );

        expect(errors).toBeNull();
        expect(room['non-existing']).toBeUndefined();
    });
});