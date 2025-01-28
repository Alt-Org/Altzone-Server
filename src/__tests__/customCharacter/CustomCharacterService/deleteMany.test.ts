import {CustomCharacterService} from "../../../customCharacter/customCharacter.service";
import CustomCharacterModule from "../modules/customCharacter.module";
import CustomCharacterBuilderFactory from "../data/customCharacterBuilderFactory";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {CharacterId} from "../../../customCharacter/enum/characterId.enum";
import {ObjectId} from "mongodb";

describe('CustomCharacterService.deleteMany() test suite', () => {
    let characterService: CustomCharacterService;
    const characterModel = CustomCharacterModule.getCustomCharacterModel();
    const customCharacterBuilder = CustomCharacterBuilderFactory.getBuilder('CustomCharacter');

    const characterId = CharacterId.Prankster_202;

    const player_id = new ObjectId(getNonExisting_id());
    const existingCharacter1 = customCharacterBuilder.setPlayerId(player_id).setCharacterId(characterId).build();
    const existingCharacter2 = customCharacterBuilder.setPlayerId(player_id).setCharacterId(characterId).build();

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();

        const createdCharacter1 = await characterModel.create(existingCharacter1);
        existingCharacter1._id = createdCharacter1._id;
        const createdCharacter2 = await characterModel.create(existingCharacter2);
        existingCharacter2._id = createdCharacter2._id;
    });

    it('Should remove all characters from DB that match the condition and return true', async () => {
        const [isRemoved, errors] = await characterService.deleteMany({characterId: characterId});

        const charactersInDB = await characterModel.find({characterId: characterId});

        expect(errors).toBeNull();
        expect(isRemoved).toBeTruthy();
        expect(charactersInDB).toHaveLength(0);
    });

    it('Should not remove any characters from DB if the condition is null and return SE REQUIRED', async () => {
        const [isRemoved, errors] = await characterService.deleteMany(null);

        const charactersInDB = await characterModel.find({characterId: characterId});
        const clearedCharacters = clearDBRespDefaultFields(charactersInDB);

        expect(isRemoved).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(clearedCharacters).toEqual(expect.arrayContaining([
            expect.objectContaining(existingCharacter1),
            expect.objectContaining(existingCharacter2)
        ]));
    });

    it('Should not remove any characters from DB if the condition is undefined and return SE REQUIRED', async () => {
        const [isRemoved, errors] = await characterService.deleteMany(undefined);

        const charactersInDB = await characterModel.find({characterId: characterId});
        const clearedCharacters = clearDBRespDefaultFields(charactersInDB);

        expect(isRemoved).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(clearedCharacters).toEqual(expect.arrayContaining([
            expect.objectContaining(existingCharacter1),
            expect.objectContaining(existingCharacter2)
        ]));
    });

    it('Should not remove any characters from DB if any of characters does not satisfy the condition', async () => {
        await characterService.deleteMany({characterId: CharacterId.Wiseacre_701});

        const charactersInDB = await characterModel.find({characterId: characterId});
        const clearedCharacters = clearDBRespDefaultFields(charactersInDB);

        expect(clearedCharacters).toEqual(expect.arrayContaining([
            expect.objectContaining(existingCharacter1),
            expect.objectContaining(existingCharacter2)
        ]));
    });

    it('Should return SE NOT_FOUND if any of characters does not satisfy the condition', async () => {
        const [isRemovedNull, errorsNull] = await characterService.deleteMany({characterId: CharacterId.Wiseacre_701});

        expect(isRemovedNull).toBeNull();
        expect(errorsNull).toContainSE_NOT_FOUND();
    });

    it('Should remove all characters from DB if the condition is empty object and return true', async () => {
        const [isRemoved, errors] = await characterService.deleteMany({});

        const charactersInDB = await characterModel.find({characterId: characterId});

        expect(errors).toBeNull();
        expect(isRemoved).toBeTruthy();
        expect(charactersInDB).toHaveLength(0);
    });

    it('Should return SE NOT_FOUND if provided characterId is of wrong type', async () => {
        const invalidCharacterId = 'non-existing-enum' as any;

        const [isRemovedNull, errorsNull] = await characterService.deleteMany({characterId: invalidCharacterId});

        expect(isRemovedNull).toBeNull();
        expect(errorsNull).toContainSE_NOT_FOUND();
    });

    it('Should not remove any characters from DB if provided characterId is of wrong type', async () => {
        const invalidCharacterId = 'non-existing-enum' as any;

        await characterService.deleteMany({characterId: invalidCharacterId});

        const charactersInDB = await characterModel.find({characterId: characterId});
        const clearedCharacters = clearDBRespDefaultFields(charactersInDB);

        expect(clearedCharacters).toEqual(expect.arrayContaining([
            expect.objectContaining(existingCharacter1),
            expect.objectContaining(existingCharacter2)
        ]));
    });
});