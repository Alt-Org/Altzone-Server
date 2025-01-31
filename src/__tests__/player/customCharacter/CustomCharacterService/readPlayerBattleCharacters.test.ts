import {CustomCharacterService} from "../../../../player/customCharacter/customCharacter.service";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {CustomCharacter} from "../../../../player/customCharacter/customCharacter.schema";
import CustomCharacterModule from "../../modules/customCharacter.module";
import PlayerBuilderFactory from "../../data/playerBuilderFactory";
import PlayerModule from "../../modules/player.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('CustomCharacterService.readPlayerBattleCharacters() test suite', () => {
    let characterService: CustomCharacterService;
    const characterModel = CustomCharacterModule.getCustomCharacterModel();
    const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');

    const playerModel = PlayerModule.getPlayerModel();
    const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    const playerUpdateBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
    const player1 = playerBuilder.setName('player1').setUniqueIdentifier('player1').build();
    const player2 = playerBuilder.setName('player2').setUniqueIdentifier('player2').build();

    let player1Character1: CustomCharacter;
    let player1Character2: CustomCharacter;
    let player1Character3: CustomCharacter;

    let player2Character: CustomCharacter;

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();

        const createdPlayer1 = await playerModel.create(player1);
        player1._id = createdPlayer1._id;
        player1Character1 = characterBuilder.setSize(10).setPlayerId(player1._id).build();
        player1Character2 = characterBuilder.setSize(20).setPlayerId(player1._id).build();
        player1Character3 = characterBuilder.setSize(30).setPlayerId(player1._id).build();
        const createdCharacter1 = await characterModel.create(player1Character1);
        player1Character1._id = createdCharacter1._id;
        const createdCharacter2 = await characterModel.create(player1Character2);
        player1Character2._id = createdCharacter2._id;
        const createdCharacter3 = await characterModel.create(player1Character3);
        player1Character3._id = createdCharacter3._id;
        const player1Characters = playerUpdateBuilder.setBattleCharacterIds([
            createdCharacter1._id,
            createdCharacter2._id,
            createdCharacter3._id
        ]).build();
        await playerModel.findByIdAndUpdate(player1._id, player1Characters);

        const createdPlayer2 = await playerModel.create(player2);
        player2._id = createdPlayer2._id;
        player2Character = characterBuilder.setSize(50).setPlayerId(player2._id).build();
        const createdCharacter4 = await characterModel.create(player2Character);
        player2Character._id = createdCharacter4._id;
        const player2Characters = playerUpdateBuilder.setBattleCharacterIds([
            createdCharacter4._id
        ]).build();
        await playerModel.findByIdAndUpdate(player2._id, player2Characters);
    });

    it('Should return all player battle characters', async () => {
        const [characters, errors] = await characterService.readPlayerBattleCharacters(player1._id);

        const clearedCharacters = clearDBRespDefaultFields(characters);

        expect(errors).toBeNull();
        expect(clearedCharacters).toHaveLength(3);
        expect(clearedCharacters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ...player1Character1 }),
                expect.objectContaining({ ...player1Character2 }),
                expect.objectContaining({ ...player1Character3 }),
            ])
        );
    });

    it('Should ignore characters that does not belong to the player', async () => {
        const otherPlayerCharacter = player2Character._id;
        const updateData = playerUpdateBuilder.setBattleCharacterIds([
            player1Character1._id,
            otherPlayerCharacter
        ]).build();
        await playerModel.findByIdAndUpdate(player1._id, updateData);

        const [characters, errors] = await characterService.readPlayerBattleCharacters(player1._id);
        const clearedCharacters = clearDBRespDefaultFields(characters);

        expect(errors).toBeNull();
        expect(clearedCharacters).toHaveLength(1);
        expect(clearedCharacters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ...player1Character1 })
            ])
        );
    });

    it('Should ignore characters that does not exists', async () => {
        const nonExistingCharacter = getNonExisting_id();
        const updateData = playerUpdateBuilder.setBattleCharacterIds([
            player1Character1._id,
            nonExistingCharacter
        ]).build();
        await playerModel.findByIdAndUpdate(player1._id, updateData);

        const [characters, errors] = await characterService.readPlayerBattleCharacters(player1._id);
        const clearedCharacters = clearDBRespDefaultFields(characters);

        expect(errors).toBeNull();
        expect(clearedCharacters).toHaveLength(1);
        expect(clearedCharacters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ...player1Character1 })
            ])
        );
    });

    it('Should return ServiceError NOT_FOUND if player does not have any battle characters', async () => {
        const updateData = playerUpdateBuilder.setBattleCharacterIds([]).build();
        await playerModel.findByIdAndUpdate(player1._id, updateData);

        const [characters, errors] = await characterService.readPlayerBattleCharacters(player1._id);

        expect(characters).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return ServiceError NOT_FOUND if no characters are found', async () => {
        const updateData = playerUpdateBuilder.setBattleCharacterIds([
            getNonExisting_id(),
            getNonExisting_id()
        ]).build();
        await playerModel.findByIdAndUpdate(player1._id, updateData);

        const [characters, errors] = await characterService.readPlayerBattleCharacters(player1._id);

        expect(characters).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return ServiceError REQUIRED if player _id is null', async () => {
        const [characters, errors] = await characterService.readPlayerBattleCharacters(null);

        expect(characters).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should return ServiceError REQUIRED if player _id is undefined', async () => {
        const [characters, errors] = await characterService.readPlayerBattleCharacters(undefined);

        expect(characters).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });
});