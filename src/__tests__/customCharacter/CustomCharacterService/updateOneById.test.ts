import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import {CustomCharacterService} from "../../../customCharacter/customCharacter.service";
import CustomCharacterBuilderFactory from "../data/customCharacterBuilderFactory";
import CustomCharacterModule from "../modules/customCharacter.module";

describe('CustomCharacter.updateOneById() test suite', () => {
    let characterService: CustomCharacterService;
    const characterBuilder = CustomCharacterBuilderFactory.getBuilder('CustomCharacter');
    const characterUpdateBuilder = CustomCharacterBuilderFactory.getBuilder('UpdateCustomCharacterDto');
    const characterModel = CustomCharacterModule.getCustomCharacterModel();
    const existingCharacter = characterBuilder.setPlayerId(new ObjectId(getNonExisting_id())).setSize(10).build();

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();
        const createdCharacter = await characterModel.create(existingCharacter);
        existingCharacter._id = createdCharacter._id;
    });

    it('Should update character in the DB and return true if the input is valid', async () => {
        const updatedSize = existingCharacter.size + 20;
        const updateData = characterUpdateBuilder.setId(existingCharacter._id).setSize(updatedSize).build();

        const [wasUpdated, errors] = await characterService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedCharacter = await characterModel.findById(existingCharacter._id);
        const clearedCharacter = clearDBRespDefaultFields(updatedCharacter);
        expect(clearedCharacter).toEqual({...existingCharacter, size: updatedSize});
    });

    it('Should return ServiceError NOT_FOUND if the character with provided _id does not exist', async () => {
        const updatedSize = existingCharacter.size + 20;
        const updateData = characterUpdateBuilder.setId(getNonExisting_id()).setSize(updatedSize).build();

        const [wasUpdated, errors] = await characterService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return ServiceError NOT_NUMBER if the size field is of wrong type', async () => {
        const invalidSize = 'non-existing-character-id' as any;
        const updateData = characterUpdateBuilder.setId(existingCharacter._id).setSize(invalidSize).build();

        const [wasUpdated, errors] = await characterService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_NUMBER();
    });

    it('Should return REQUIRED if _id is null', async () => {
        const updateData = characterUpdateBuilder.setId(null).build();

        const [wasUpdated, errors] = await characterService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should return REQUIRED if _id is undefined', async () => {
        const updateData = characterUpdateBuilder.setId(undefined).build();

        const [wasUpdated, errors] = await characterService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });
});