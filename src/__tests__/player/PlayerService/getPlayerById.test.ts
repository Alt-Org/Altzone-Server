import {PlayerDto} from "../../../player/dto/player.dto";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import PlayerModule from "../../player/modules/player.module";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {PlayerService} from "../../../player/player.service";
import {Clan} from "../../../clan/clan.schema";
import ClanBuilderFactory from "../../clan/data/clanBuilderFactory";
import ClanModule from "../../clan/modules/clan.module";
import {ModelName} from "../../../common/enum/modelName.enum";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";

describe('PlayerService.getPlayerById() test suite', () => {
    let playerService: PlayerService;
    const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
    const updatePlayerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
    const playerModel = PlayerModule.getPlayerModel();
    let existingPlayer: PlayerDto;

    const clanBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
    const clanModel = ClanModule.getClanModel();
    let existingClan: Clan;

    beforeEach(async () => {
        playerService = await PlayerModule.getPlayerService();
        const playerToCreate = playerBuilder.build();
        const playerResp = await playerModel.create(playerToCreate);
        existingPlayer = playerResp.toObject();

        const clanToCreate = clanBuilder.build();

        const clanResp = await clanModel.create(clanToCreate);
        existingClan = clanResp.toObject();

        const playerUpdate = updatePlayerBuilder.setClanId(existingClan._id).build();
        await playerModel.updateOne({_id: existingPlayer._id}, playerUpdate);
        existingPlayer.clan_id = existingClan._id;
    });

    it('Should find existing player from DB', async () => {
        const [player, errors] = await playerService.getPlayerById(existingPlayer._id);

        expect(errors).toBeNull();
        expect(player).toEqual(expect.objectContaining(existingPlayer));
    });

    it('Should return NOT_FOUND ServiceError for non-existing player', async () => {
        const [player, errors] = await playerService.getPlayerById(getNonExisting_id());

        expect(player).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION ServiceError if _id is not valid', async () => {
        const invalid_id = 'not-valid';
        const [player, errors] = await playerService.getPlayerById(invalid_id);

        expect(player).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should return only specified in select option fields', async () => {
        const [player, errors] = await playerService.getPlayerById(existingPlayer._id, {select: ['_id', 'name']});

        const selectedFields = {_id: existingPlayer._id, name: existingPlayer.name};
        const clearedResp = clearDBRespDefaultFields(player);

        expect(errors).toBeNull();
        expect(clearedResp).toEqual(selectedFields);
    });

    it('Should include get player\'s clan if requested', async () => {
        const [player, errors] = await playerService.getPlayerById(existingPlayer._id, {includeRefs: [ModelName.CLAN]});

        expect(errors).toBeNull();
        expect(player.Clan).toEqual(expect.objectContaining(existingClan));
    });

    it('Should ignore non-existing references requested', async () => {
        const nonExistingRef = 'Non-existingRef' as ModelName;
        const [player, errors] = await playerService.getPlayerById(existingPlayer._id, {includeRefs: [nonExistingRef]});

        expect(errors).toBeNull();
        expect(player[nonExistingRef]).toBeUndefined();
    });
});