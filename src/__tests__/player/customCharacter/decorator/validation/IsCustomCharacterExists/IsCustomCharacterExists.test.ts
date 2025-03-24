import { getNonExisting_id } from '../../../../../test_utils/util/getNonExisting_id';
import { isCustomCharacterExists } from '../../../../../../player/customCharacter/decorator/validation/IsCustomCharacterExists.decorator';
import PlayerBuilderFactory from '../../../../data/playerBuilderFactory';
import CustomCharacterModule from '../../../../modules/customCharacter.module';

describe('@IsCustomCharacterExists() test suite', () => {
  let validator: isCustomCharacterExists;
  const characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');
  const characterModel = CustomCharacterModule.getCustomCharacterModel();
  const existingCharacter = characterBuilder
    .setPlayerId(getNonExisting_id())
    .build();

  beforeEach(async () => {
    validator = await CustomCharacterModule.getIsCustomCharacterExists();

    const characterResp = await characterModel.create(existingCharacter);
    existingCharacter._id = characterResp._id;
  });

  it('Should return true if character does exist', async () => {
    const doesExists = await validator.validate(existingCharacter._id);

    expect(doesExists).toBeTruthy();
  });

  it('Should return false if character does not exist', async () => {
    const doesExists = await validator.validate(getNonExisting_id());

    expect(doesExists).toBeFalsy();
  });
});
