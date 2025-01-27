import {CustomCharacterService} from "../../../customCharacter/customCharacter.service";
import CustomCharacterModule from "../modules/customCharacter.module";
import CustomCharacterBuilderFactory from "../data/customCharacterBuilderFactory";
import LoggedUser from "../../test_utils/const/loggedUser";
import {clearDBRespDefaultFields} from "../../test_utils/util/removeDBDefaultFields";
import {CharacterId} from "../../../customCharacter/enum/characterId.enum";
import {CharacterBaseStats} from "../../../customCharacter/const/CharacterBaseStats";
import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";

describe('CustomCharacterService.createOne() test suite', () => {
    let characterService: CustomCharacterService;
    const characterModel = CustomCharacterModule.getCustomCharacterModule();
    const createCustomCharacterBuilder = CustomCharacterBuilderFactory.getBuilder('CreateCustomCharacterDto');

    const player = LoggedUser.getPlayer();

    beforeEach(async () => {
        characterService = await CustomCharacterModule.getCustomCharacterService();
    });

    it('Should create a custom character in DB if the input is valid', async () => {
        const characterId = CharacterId.Prankster_202;
        const characterToCreate = createCustomCharacterBuilder.setCharacterId(characterId).build();

        await characterService.createOne(characterToCreate, player._id);

        const createdCharacter = await characterModel.find({player_id: player._id});
        const clearedCharacter = clearDBRespDefaultFields(createdCharacter);

        const expectedSpecs = CharacterBaseStats[characterId];

        expect(clearedCharacter).toHaveLength(1);
        expect(clearedCharacter[0]).toEqual({
            ...characterToCreate, ...expectedSpecs,
            player_id: new ObjectId(player._id), _id: expect.any(ObjectId)
        });
    });

    it('Should return created custom character if the input is valid', async () => {
        const characterId = CharacterId.Prankster_202;
        const characterToCreate = createCustomCharacterBuilder.setCharacterId(characterId).build();

        const [createdCharacter, errors] = await characterService.createOne(characterToCreate, player._id);

        const expectedSpecs = CharacterBaseStats[characterId];

        expect(errors).toBeNull();
        expect(createdCharacter).toEqual(expect.objectContaining({
            ...characterToCreate, ...expectedSpecs,
            player_id: new ObjectId(player._id), _id: expect.any(ObjectId)
        }));
    });

    it('Should return WRONG_ENUM if the level value is not a number', async () => {
        const invalid_level = 'not-a-number' as any;
        const characterToCreate = createCustomCharacterBuilder.setLevel(invalid_level).build();

        const [createdCharacter, errors] = await characterService.createOne(characterToCreate, player._id);

        expect(createdCharacter).toBeNull();
        expect(errors).toContainSE_NOT_NUMBER();
    });

    it('Should not create a custom character if the characterId is not in enum list', async () => {
        const characterId = 'non-enum-value' as any;
        const characterToCreate = createCustomCharacterBuilder.setCharacterId(characterId).build();

        await characterService.createOne(characterToCreate, player._id);

        const createdCharacter = await characterModel.find({player_id: player._id});

        expect(createdCharacter).toHaveLength(0);
    });

    it('Should not create a custom character if the player with provided _id does not exist', async () => {
        const nonExistingPlayer = getNonExisting_id();
        const characterToCreate = createCustomCharacterBuilder.build();

        await characterService.createOne(characterToCreate, nonExistingPlayer);

        const createdCharacter = await characterModel.find({player_id: nonExistingPlayer});

        expect(createdCharacter).toHaveLength(0);
    });

    it('Should return NOT_FOUND if the player with provided _id does not exist', async () => {
        const nonExistingPlayer = getNonExisting_id();
        const characterToCreate = createCustomCharacterBuilder.build();

        const [createdCharacter, errors] = await characterService.createOne(characterToCreate, nonExistingPlayer);

        expect(createdCharacter).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return SE REQUIRED if the input is null or undefined', async () => {
        const [createdCharacterUndef, errorsUndef] = await characterService.createOne(undefined, player._id);
        const [createdCharacterNull, errorsNull] = await characterService.createOne(null, player._id);

        expect(createdCharacterUndef).toBeNull();
        expect(errorsUndef).toContainSE_REQUIRED();

        expect(createdCharacterNull).toBeNull();
        expect(errorsNull).toContainSE_REQUIRED();
    });
});