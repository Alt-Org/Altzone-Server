import { CustomCharacterService } from '../../../../player/customCharacter/customCharacter.service';
import { CharacterId } from '../../../../player/customCharacter/enum/characterId.enum';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ModelName } from '../../../../common/enum/modelName.enum';
import LoggedUser from '../../../test_utils/const/loggedUser';
import { CustomCharacter } from '../../../../player/customCharacter/customCharacter.schema';
import { ObjectId } from 'mongodb';
import CustomCharacterModule from '../../modules/customCharacter.module';
import PlayerBuilderFactory from '../../data/playerBuilderFactory';

describe('CustomCharacterService.readMany() test suite', () => {
  let characterService: CustomCharacterService;
  const characterModel = CustomCharacterModule.getCustomCharacterModel();
  const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');

  const characterId = CharacterId.Prankster_202;
  const player = LoggedUser.getPlayer();

  let character1: CustomCharacter;
  let character2: CustomCharacter;
  let character3: CustomCharacter;

  const allCharactersFilter = { characterId: characterId };

  beforeEach(async () => {
    characterService = await CustomCharacterModule.getCustomCharacterService();

    const player_id = new ObjectId(player._id);
    character1 = characterBuilder
      .setCharacterId(characterId)
      .setSize(10)
      .setPlayerId(player_id)
      .build();
    character2 = characterBuilder
      .setCharacterId(characterId)
      .setSize(20)
      .setPlayerId(player_id)
      .build();
    character3 = characterBuilder
      .setCharacterId(characterId)
      .setSize(30)
      .setPlayerId(player_id)
      .build();

    const createdCharacter1 = await characterModel.create(character1);
    character1._id = createdCharacter1._id;
    const createdCharacter2 = await characterModel.create(character2);
    character2._id = createdCharacter2._id;
    const createdCharacter3 = await characterModel.create(character3);
    character3._id = createdCharacter3._id;
  });

  it('Should return all characters that match the provided filter', async () => {
    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
    });

    const clearedCharacters = clearDBRespDefaultFields(characters);

    expect(errors).toBeNull();
    expect(clearedCharacters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character1 }),
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return all characters in DB if filter is undefined', async () => {
    const [characters, errors] = await characterService.readMany({
      filter: undefined,
    });

    expect(errors).toBeNull();
    expect(characters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character1 }),
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return all characters in DB if filter is empty object', async () => {
    const [characters, errors] = await characterService.readMany({
      filter: {},
    });

    expect(errors).toBeNull();
    expect(characters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character1 }),
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return all characters in DB if options are undefined', async () => {
    const [characters, errors] = await characterService.readMany(undefined);

    expect(errors).toBeNull();
    expect(characters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character1 }),
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return all characters in DB if options are null', async () => {
    const [characters, errors] = await characterService.readMany(null);

    expect(errors).toBeNull();
    expect(characters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character1 }),
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return characters with only specified fields in the options.select', async () => {
    const select = ['characterId'];

    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      select,
    });

    expect(errors).toBeNull();
    characters.forEach((character) => {
      expect(character).toHaveProperty('characterId');
      expect(character.size).toBeUndefined();
      expect(character.attack).toBeUndefined();
    });
  });

  it('Should limit the number of returned characters using options.limit', async () => {
    const limit = 2;

    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      limit,
    });

    expect(errors).toBeNull();
    expect(characters).toHaveLength(2);
  });

  it('Should skip specified number of characters using options.skip', async () => {
    const skip = 1;
    const sort: any = { speed: 1 };

    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      skip,
      sort,
    });

    expect(errors).toBeNull();
    expect(characters).toHaveLength(2);
    expect(characters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...character2 }),
        expect.objectContaining({ ...character3 }),
      ]),
    );
  });

  it('Should return sorted characters using options.sort', async () => {
    const sort: any = { speed: 1 };

    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      sort,
    });

    expect(errors).toBeNull();
    expect(characters.map((characters) => characters.speed)).toEqual([
      character1.speed,
      character2.speed,
      character3.speed,
    ]);
  });

  it('Should return characters with reference objects using options.includeRefs', async () => {
    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      includeRefs: [ModelName.PLAYER],
    });

    expect(errors).toBeNull();
    characters.forEach((character) => {
      const clearedPlayer = clearDBRespDefaultFields(character.Player);
      expect(clearedPlayer).toEqual(
        expect.objectContaining({
          ...player,
          _id: new ObjectId(player._id),
          profile_id: new ObjectId(player.profile_id),
        }),
      );
    });
  });

  it('Should ignore non-existing references from options.includeRefs', async () => {
    const nonExistingRef = 'non-existing-reference' as any;
    const [characters, errors] = await characterService.readMany({
      filter: allCharactersFilter,
      includeRefs: [nonExistingRef],
    });

    expect(errors).toBeNull();
    characters.forEach((character) => {
      expect(character[nonExistingRef]).toBeUndefined();
    });
  });

  it('Should return ServiceError NOT_FOUND if no characters match the filter', async () => {
    const filter = { characterId: 'non-existing-character-id' };

    const [characters, errors] = await characterService.readMany({ filter });

    expect(characters).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
