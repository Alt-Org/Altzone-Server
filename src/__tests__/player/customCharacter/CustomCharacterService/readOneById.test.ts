import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ModelName} from "../../../../common/enum/modelName.enum";
import {CustomCharacterService} from "../../../../player/customCharacter/customCharacter.service";
import {CustomCharacter} from "../../../../player/customCharacter/customCharacter.schema";
import LoggedUser from "../../../test_utils/const/loggedUser";
import PlayerBuilderFactory from "../../data/playerBuilderFactory";
import CustomCharacterModule from "../../modules/customCharacter.module";

describe('CustomCharacter.readOneById() test suite', () => {
    let characterService: CustomCharacterService;
    const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');
    const characterModel = CustomCharacterModule.getCustomCharacterModel();
    let existingCharacter: CustomCharacter;

    const player = LoggedUser.getPlayer();

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();

        const player_id = new ObjectId(player._id);
        existingCharacter = characterBuilder.setPlayerId(player_id).build();

        const createdCharacter = await characterModel.create(existingCharacter);
        existingCharacter._id = createdCharacter._id;
    });

    it('Should find existing character from DB', async () => {
        const [character, errors] = await characterService.readOneById(existingCharacter._id);

        const clearedItem = clearDBRespDefaultFields(character);

        expect(errors).toBeNull();
        expect(clearedItem).toEqual(expect.objectContaining(existingCharacter));
    });

    it('Should return fields only requested in "select"', async () => {
        const [character, errors] = await characterService.readOneById(existingCharacter._id, { select: [ '_id', 'characterId' ] });

        const clearedRoom = clearDBRespDefaultFields(character);
        const expected = { _id: existingCharacter._id, characterId: existingCharacter.characterId };

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expected);
    });

    it('Should return NOT_FOUND SError for non-existing character', async () => {
        const [character, errors] = await characterService.readOneById(getNonExisting_id());

        expect(character).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION SError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        const [character, errors] = await characterService.readOneById(invalid_id);

        expect(character).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should return REQUIRED if provided _id is null', async () => {
        const [character, errors] = await characterService.readOneById(null);

        expect(character).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should return REQUIRED if provided _id is undefined', async () => {
        const [character, errors] = await characterService.readOneById(undefined);

        expect(character).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should get character\'s collection references if they exists in DB', async () => {
        const [character, errors] = await characterService.readOneById(
            existingCharacter._id,
            { includeRefs: [ ModelName.PLAYER ] }
        );

        expect(errors).toBeNull();

        const clearedPlayer = clearDBRespDefaultFields(character['Player']);
        expect(clearedPlayer).toEqual(expect.objectContaining({...player, _id: new ObjectId(player._id), profile_id: new ObjectId(player.profile_id) }));
    });

    it('Should ignore non-existing schema references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];
        const [item, errors] = await characterService.readOneById(existingCharacter._id, { includeRefs: nonExistingReferences });

        expect(errors).toBeNull();
        expect(item['non-existing']).toBeUndefined();
    });
});