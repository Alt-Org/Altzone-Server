import {ClanService} from "../../../clan/clan.service";
import LoggedUser from "../../test_utils/const/loggedUser";
import ClanBuilderFactory from "../data/clanBuilderFactory";
import ClanModule from "../modules/clan.module";
import {ModelName} from "../../../common/enum/modelName.enum";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import PlayerModule from "../../player/modules/player.module";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import {ObjectId} from "mongodb";

describe('ClanService.readAll() test suite', () => {
    let clanService: ClanService;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();

    const loggedPlayer = LoggedUser.getPlayer();
    const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
    const playerModel = PlayerModule.getPlayerModel();

    const clanWithPlayer = clanBuilder
        .setName('clan1')
        .setAdminIds([loggedPlayer._id])
        .setPlayerCount(1)
        .build();
    const clan2 = clanBuilder.setName('clan2').build();
    const clan3 = clanBuilder.setName('clan3').build();

    const allClansFilter = { name: { $regex: 'clan' } };

    beforeEach(async () => {
        clanService = await ClanModule.getClanService();

        const clan1Resp = (await clanModel.create(clanWithPlayer)).toObject();
        await clanModel.create(clan2);
        await clanModel.create(clan3);

        const playerUpdate = playerBuilder.setClanId(clan1Resp._id).build();
        await playerModel.findByIdAndUpdate(loggedPlayer._id, playerUpdate);
        loggedPlayer.clan_id = clan1Resp._id;
    });

    it('Should return all clans that match the provided filter', async () => {
        const [clans, errors] = await clanService.readAll({ filter: allClansFilter });

        expect(errors).toBeNull();
        expect(clans).toHaveLength(3);
        expect(clans).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: clanWithPlayer.name }),
                expect.objectContaining({ name: clan2.name }),
                expect.objectContaining({ name: clan3.name }),
            ])
        );
    });

    it('Should return clans with only specified fields using options.select', async () => {
        const select = ['_id', 'name'];

        const [clans, errors] = await clanService.readAll({ filter: allClansFilter, select });

        const clearedClans = clearDBRespDefaultFields(clans);

        expect(errors).toBeNull();
        expect(clearedClans).toEqual([
            { _id: expect.any(ObjectId), name: clanWithPlayer.name },
            { _id: expect.any(ObjectId), name: clan2.name },
            { _id: expect.any(ObjectId), name: clan3.name }
        ]);
    });

    it('Should limit the number of returned objects using options.limit', async () => {
        const limit = 2;

        const [clans, errors] = await clanService.readAll({ filter: allClansFilter, limit });

        expect(errors).toBeNull();
        expect(clans).toHaveLength(2);
    });

    it('Should skip specified number of objects using options.skip', async () => {
        const skip = 1;

        const [clans, errors] = await clanService.readAll({ filter: allClansFilter, skip });

        expect(errors).toBeNull();
        expect(clans).toHaveLength(2);
        expect(clans).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: clan2.name }),
                expect.objectContaining({ name: clan3.name }),
            ])
        );
    });

    it('Should return sorted objects using options.sort', async () => {
        const sort: { ['name']: 1 } = { name: 1 };

        const [clans, errors] = await clanService.readAll({ filter: allClansFilter, sort });

        expect(errors).toBeNull();
        expect(clans.map(clan => clan.name)).toEqual([clanWithPlayer.name, clan2.name, clan3.name]);
    });

    it('Should return objects with reference objects using options.includeRefs', async () => {
        const [clans, errors] = await clanService.readAll({ filter: allClansFilter, includeRefs: [ModelName.PLAYER] });

        expect(errors).toBeNull();

        clans.forEach(clan => {
            if(clan.name === clanWithPlayer.name) {
                const refPlayer = (clan.Player[0] as any).toObject();
                const clearedPlayer = clearDBRespDefaultFields(refPlayer);
                expect(clearedPlayer).toMatchObject(clearedPlayer);
            } else {
                expect(clan).toHaveProperty('Player');
                expect(clan.Player).toEqual([]);
            }
        });
    });

    it('Should return filtered, selected, sorted, limited, and skipped objects with reference objects when all options are used', async () => {
        const select = ['name'];
        const limit = 2;
        const skip = 1;
        const sort: { ['name']: -1 } = { name: -1 };

        const [clans, errors] = await clanService.readAll({
            filter: allClansFilter,
            select,
            limit,
            skip,
            sort,
            includeRefs: [ModelName.PLAYER],
        });

        expect(errors).toBeNull();
        expect(clans).toHaveLength(2);
        expect(clans[0].name).toBe(clan2.name);
        expect(clans[1].name).toBe(clanWithPlayer.name);
        clans.forEach(clan => {
            if(clan.name === clanWithPlayer.name) {
                const refPlayer = (clan.Player[0] as any).toObject();
                const clearedPlayer = clearDBRespDefaultFields(refPlayer);
                expect(clearedPlayer).toMatchObject(clearedPlayer);
            } else {
                expect(clan).toHaveProperty('Player');
                expect(clan.Player).toEqual([]);
            }
        });
    });

    it('Should return ServiceError NOT_FOUND if no objects match the filter', async () => {
        const filter = { name: 'non-existing-clan' };

        const [clans, errors] = await clanService.readAll({ filter });

        expect(clans).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});