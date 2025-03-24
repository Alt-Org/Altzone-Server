import {MongooseError} from "mongoose";
import {JoinService} from "../../../../clan/join/join.service";
import ClanBuilderFactory from "../../data/clanBuilderFactory";
import ClanModule from "../../modules/clan.module";
import PlayerModule from "../../../player/modules/player.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";
import {ModelName} from "../../../../common/enum/modelName.enum";
import {ObjectId} from "mongodb";

describe('JoinService.createOne() test suite', () => {
    let joinService: JoinService;
    const joinBuilder = ClanBuilderFactory.getBuilder('Join');
    const joinModel = ClanModule.getJoinModel();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clan = clanBuilder.build();

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const player = playerBuilder.build();

    beforeEach(async () => {
        const playerResp = await  playerModel.create(player);
        player._id = playerResp._id.toString();
        const clanResp = await  clanModel.create(clan);
        clan._id = clanResp._id.toString();

        joinService = await ClanModule.getJoinService();
    });

    it('Should create a clan join request in DB if input is valid', async () => {
        const joinToCreate = joinBuilder.setClanId(clan._id).setPlayerId(player._id).build();

        await joinService.createOne(joinToCreate);

        const dbData = await joinModel.findOne({clan_id: clan._id, player_id: player._id});

        expect(dbData.toObject()).toMatchObject({...joinToCreate, _id: expect.any(ObjectId)});
    });

    it('Should return response in appropriate shape', async () => {
        const joinToCreate = joinBuilder.setClanId(clan._id).setPlayerId(player._id).build();

        const resp = await joinService.createOne(joinToCreate);

        const data = resp['data']['Join'].toObject();

        expect(data).toMatchObject({...joinToCreate, _id: expect.any(ObjectId)});

        expect(resp['metaData']).toEqual({
            dataKey: 'Join',
            modelName: ModelName.JOIN,
            dataType: 'Object',
            dataCount: 1
        });
    });

    it('Should not create clan join request in DB if input is invalid', async () => {
        const invalidJoin = joinBuilder.setClanId(undefined).build();

        try {
            await joinService.createOne(invalidJoin);
        } catch (e) { void e }

        const dbData1 = await joinModel.findOne({clan_id: undefined});

        expect(dbData1).toBeNull();
    });

    it('Should throw validation error if input is not valid', async () => {
        const invalidJoin = joinBuilder.setClanId(undefined).build();

        await expect(joinService.createOne(invalidJoin)).rejects.toThrow(MongooseError);
    });
});