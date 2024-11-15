import {PlayerDto} from "../../../player/dto/player.dto";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import PlayerModule from "../../player/modules/player.module";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {MongooseError} from "mongoose";
import {PlayerService} from "../../../player/player.service";

describe('PlayerService.readOneById() test suite', () => {
    let playerService: PlayerService;
    const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
    const playerModel = PlayerModule.getPlayerModel();
    let existingPlayer: PlayerDto;


    beforeEach(async () => {
        playerService = await PlayerModule.getPlayerService();
        const playerToCreate = playerBuilder.build();
        const playerResp = await playerModel.create(playerToCreate);
        existingPlayer = playerResp.toObject();
    });

    it('Should find existing player from DB', async () => {
         const resp = await playerService.readOneById(existingPlayer._id);

        const data = resp['data']['Player'].toObject();

        expect(data).toEqual(expect.objectContaining(existingPlayer));
    });

    it('Should return null for non-existing player', async () => {
        const resp = await playerService.readOneById(getNonExisting_id());

        expect(resp).toBeNull();
    });

    it('Should throw MongooseError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        await expect(playerService.readOneById(invalid_id)).rejects.toThrow(MongooseError);
    });

    it('Should throw MongooseError if non-existing references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];

        await expect(playerService.readOneById(existingPlayer._id, nonExistingReferences)).rejects.toThrow(MongooseError);
    });
});