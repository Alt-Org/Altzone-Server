import { ObjectId } from 'mongodb';
import { CustomCharacterService } from '../../../../player/customCharacter/customCharacter.service';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ModelName } from '../../../../common/enum/modelName.enum';
import LoggedUser from '../../../test_utils/const/loggedUser';
import CustomCharacterModule from '../../modules/customCharacter.module';
import PlayerBuilderFactory from '../../data/playerBuilderFactory';

describe('CustomCharacterService.readOne() test suite', () => {
  let characterService: CustomCharacterService;

  const characterModel = CustomCharacterModule.getCustomCharacterModel();
  const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');

  const characterSize = 10;
  const filter = { size: characterSize };
  const player_id = new ObjectId(getNonExisting_id());
  const existingCharacter = characterBuilder
    .setSize(characterSize)
    .setPlayerId(player_id)
    .build();

  beforeEach(async () => {
    characterService = await CustomCharacterModule.getCustomCharacterService();
    const dbResp = await characterModel.create(existingCharacter);
    existingCharacter._id = dbResp._id;
  });

  it('Should find and return a character based on the provided filter', async () => {
    const [foundCharacter, errors] = await characterService.readOne({ filter });

    expect(errors).toBeNull();
    expect(foundCharacter).toEqual(
      expect.objectContaining({ ...existingCharacter }),
    );
  });

  it('Should return SE NOT_FOUND if no characters matches the provided filter', async () => {
    const filter = { size: 20 };

    const [foundCharacter, errors] = await characterService.readOne({ filter });

    expect(foundCharacter).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return SE NOT_NUMBER if provided size is of wrong type', async () => {
    const filter = { size: 'not-number' };

    const [foundCharacter, errors] = await characterService.readOne({ filter });

    expect(foundCharacter).toBeNull();
    expect(errors).toContainSE_NOT_NUMBER();
  });

  it('Should return only specified fields in options.select array', async () => {
    const expected = { size: 10, _id: existingCharacter._id };

    const [foundCharacter, errors] = await characterService.readOne({
      filter,
      select: ['size', '_id'],
    });
    const clearedCharacter = clearDBRespDefaultFields(foundCharacter);

    expect(errors).toBeNull();
    expect(clearedCharacter).toEqual(expected);
  });

  it('Should return character with reference objects specified in options.includeRefs array', async () => {
    const player = LoggedUser.getPlayer();
    await characterModel.findByIdAndUpdate(existingCharacter._id, {
      player_id: player._id,
    });

    const [foundCharacter, errors] = await characterService.readOne({
      filter,
      includeRefs: [ModelName.PLAYER],
    });
    const clearedCharacter = clearDBRespDefaultFields(foundCharacter);

    expect(errors).toBeNull();
    expect(clearedCharacter.Player).toEqual(
      expect.objectContaining({
        ...player,
        _id: new ObjectId(player._id),
        profile_id: new ObjectId(player.profile_id),
      }),
    );
  });

  it('Should return SE REQUIRED if provided param is null', async () => {
    const [foundCharacter, errors] = await characterService.readOne(null);

    expect(foundCharacter).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return SE REQUIRED if provided param is undefined', async () => {
    const [foundCharacter, errors] = await characterService.readOne(undefined);

    expect(foundCharacter).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
