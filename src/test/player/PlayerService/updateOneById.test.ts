import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {MongoServerError} from "mongodb";
import {PlayerService} from "../../../player/player.service";
import PlayerBuilderFactory from "../data/playerBuilderFactory";
import {Player} from "../../../player/player.schema";
import PlayerModule from "../modules/player.module";

describe('PlayerService.updateOneById() test suite', () => {
    let playerService: PlayerService;
    const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
    let existingPlayer: Player;

    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        playerService = await PlayerModule.getPlayerService();
        const playerToCreate = playerBuilder.build();
        const playerResp = await playerModel.create(playerToCreate);
        existingPlayer = playerResp.toObject();
    });

    it('Should successfully update an existing player', async () => {
        const updateData = {_id: existingPlayer._id, name: 'newName'};
        const resp = await playerService.updateOneById(updateData);

        expect(resp).toBeTruthy();

        const updatedPlayer = await playerModel.findById(existingPlayer._id);
        expect(updatedPlayer.name).toBe(updateData.name);
    });

    it('Should throw error if the name already exists', async () => {
        const anotherPlayerData = playerBuilder.setName('anotherName').setUniqueIdentifier('anotherName').build();
        await playerModel.create(anotherPlayerData);

        const updateData = {_id: existingPlayer._id, name: 'anotherName'};

        await expect(playerService.updateOneById(updateData)).rejects.toThrow(MongoServerError);
    });

    it('Should not throw error if the player is not found', async () => {
        const nonExistingId = getNonExisting_id();
        const updateData = {_id: nonExistingId, name: 'non-existing'};

        const result = await playerService.updateOneById(updateData);

        expect(result).toBeTruthy();
    });
});