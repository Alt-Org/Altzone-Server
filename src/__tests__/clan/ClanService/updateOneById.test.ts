import {ClanService} from "../../../clan/clan.service";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import ClanBuilderFactory from "../data/clanBuilderFactory";
import ClanModule from "../modules/clan.module";
import {Clan} from "../../../clan/clan.schema";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import PlayerModule from "../../player/modules/player.module";

describe('ClanService.updateOneById() test suite', () => {
    let clanService: ClanService;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanUpdateBuilder = ClanBuilderFactory.getBuilder('UpdateClanDto');
    const clanModel = ClanModule.getClanModel();

    const existingClanName = 'clan1';
    let existingClan: Clan;

    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        clanService = await ClanModule.getClanService();

        const clanToCreate = clanBuilder.setName(existingClanName).build();
        const clanResp = await clanModel.create(clanToCreate);
        existingClan = clanResp.toObject();
    });

    it('Should update clan in the DB and return true if the input is valid', async () => {
        const updatedName = 'updatedClan';
        const updateData = clanUpdateBuilder.setId(existingClan._id).setName(updatedName).build();

        const [wasUpdated, errors] = await clanService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.name).toBe(updatedName);
    });

    it('Should return ServiceError NOT_FOUND if the clan with provided _id does not exist', async () => {
        const updatedName = 'updatedClan';
        const updateData = clanUpdateBuilder.setId(getNonExisting_id()).setName(updatedName).build();

        const [wasUpdated, errors] = await clanService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: should throw ServiceError
    it('Should throw error if input is null or undefined', async () => {
        const nullInput = async () => await clanService.updateOneById(null);
        const undefinedInput = async () => await clanService.updateOneById(undefined);

        await expect(nullInput).rejects.toThrow();
        await expect(undefinedInput).rejects.toThrow();
    });


    it('Should add admins to clan if "admin_idsToAdd" is specified', async () => {
        const admin1Create = playerBuilder
            .setName('player1')
            .setUniqueIdentifier('player1')
            .setClanId(existingClan._id)
            .build();
        const admin1Resp = await playerModel.create(admin1Create);
        const admin1 = admin1Resp.toObject();

        const adminsToAdd = [admin1._id.toString()];
        const updateData = clanUpdateBuilder.setId(existingClan._id.toString()).setAdminIdsToAdd(adminsToAdd).build();

        const [wasUpdated, errors] = await clanService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.admin_ids).toEqual(adminsToAdd);
    });

    it('Should ignore duplicates in "admin_idsToAdd" field', async () => {
        const admin1Create = playerBuilder
            .setName('player1')
            .setUniqueIdentifier('player1')
            .setClanId(existingClan._id)
            .build();
        const admin1Resp = await playerModel.create(admin1Create);
        const admin1 = admin1Resp.toObject();

        const adminsToAdd = [admin1._id, admin1._id, admin1._id];
        const updateData = clanUpdateBuilder.setId(existingClan._id).setAdminIdsToAdd(adminsToAdd).build();

        const [wasUpdated, errors] = await clanService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.admin_ids).toEqual([admin1._id]);
    });

    //TODO: strange behavior with _id fields for players and clans, if they are of different types (ObjectID or string)
    it('Should remove admins specified in "admin_idsToDelete" field', async () => {
        const admin1Create = playerBuilder
            .setName('player1')
            .setUniqueIdentifier('player1')
            .setClanId(existingClan._id)
            .build();
        const admin1Resp = await playerModel.create(admin1Create);
        const admin1 = admin1Resp.toObject();

        const admin2Create = playerBuilder
            .setName('player2')
            .setUniqueIdentifier('player2')
            .setClanId(existingClan._id.toString())
            .build();
        const admin2Resp = await playerModel.create(admin2Create);
        const admin2 = admin2Resp.toObject();

        const addedAdmins = clanBuilder
            .setId(existingClan._id)
            .setAdminIds([admin1._id.toString(), admin2._id.toString()])
            .build();
        await clanModel.findByIdAndUpdate(existingClan._id, addedAdmins);

        const adminsToDelete = [admin1._id.toString()];
        const updateData = clanUpdateBuilder.setId(existingClan._id).setAdminIdsToDelete(adminsToDelete).build();

        const [, errors] = await clanService.updateOneById(updateData);

        expect(errors).toBeNull();
        // expect(wasUpdated).toBeTruthy();

        const leftAdmins = [admin2._id.toString()];
        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.admin_ids).toEqual(leftAdmins);
    });

    it('Should not remove admins specified in "admin_idsToDelete" field if after removing no admins will be left and return REQUIRED SError', async () => {
        const admin1Create = playerBuilder
            .setName('player1')
            .setUniqueIdentifier('player1')
            .setClanId(existingClan._id)
            .build();
        const admin1Resp = await playerModel.create(admin1Create);
        const admin1 = admin1Resp.toObject();

        const adminsToAdd = [admin1._id.toString()];
        const addedAdmins = clanBuilder
            .setId(existingClan._id)
            .setAdminIds(adminsToAdd)
            .build();
        await clanModel.findByIdAndUpdate(existingClan._id, addedAdmins);

        const adminsToDelete = adminsToAdd;
        const updateData = clanUpdateBuilder.setId(existingClan._id).setAdminIdsToDelete(adminsToDelete).build();

        const [wasUpdated, errors] = await clanService.updateOneById(updateData);

        expect(wasUpdated).toBeFalsy();
        expect(errors).toContainSE_REQUIRED();

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.admin_ids).toEqual(adminsToAdd);
    });
});