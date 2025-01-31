import {CustomCharacterService} from "../../../../player/customCharacter/customCharacter.service";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ObjectId} from "mongodb";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import CustomCharacterModule from "../../modules/customCharacter.module";
import PlayerBuilderFactory from "../../data/playerBuilderFactory";


describe('CustomCharacterService.updateOneByCondition() test suite', () => {
    let characterService: CustomCharacterService;

    const characterModel = CustomCharacterModule.getCustomCharacterModel();
    const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');

    const filter = { size: 10 };
    const player_id = new ObjectId(getNonExisting_id());
    const existingCharacter = characterBuilder.setSize(10).setPlayerId(player_id).build();

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();

        const createdCharacter = await characterModel.create(existingCharacter);
        existingCharacter._id = createdCharacter._id;
    });

    it('Should update the character that matches the provided filter and return true', async () => {
        const newSize = 30;
        const updateData = { size: newSize };

        const [wasUpdated, errors] = await characterService.updateOneByCondition(updateData, { filter });

        expect(errors).toBeNull();
        expect(wasUpdated).toBe(true);

        const updatedCharacter = await characterModel.findById(existingCharacter._id);
        const clearedCharacter = clearDBRespDefaultFields(updatedCharacter);
        expect(clearedCharacter).toEqual({...existingCharacter, size: newSize });
    });

    it('Should return ServiceError NOT_FOUND if no characters match the provided filter', async () => {
        const filter = { size: 100 };
        const updateData = { size: 30 };

        const [wasUpdated, errors] = await characterService.updateOneByCondition(updateData, { filter });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return SE NOT_NUMBER if provided size is of wrong type', async () => {
        const filter = { size: 'not-number' };
        const updateData = { size: 30 };

        const [foundCharacter, errors] = await characterService.updateOneByCondition(updateData, { filter });

        expect(foundCharacter).toBeNull();
        expect(errors).toContainSE_NOT_NUMBER();
    });

    it('Should return SE REQUIRED if provided update objects is null', async () => {
        const [foundCharacter, errors] = await characterService.updateOneByCondition(null, {filter});

        expect(foundCharacter).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should return SE REQUIRED if provided update objects is undefined', async () => {
        const [foundCharacter, errors] = await characterService.updateOneByCondition(undefined, { filter });

        expect(foundCharacter).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });
});