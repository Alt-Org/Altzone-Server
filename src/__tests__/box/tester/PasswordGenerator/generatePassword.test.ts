import { PasswordGenerator } from '../../../../common/function/passwordGenerator';
import BoxModule from '../../modules/box.module';

describe('PasswordGenerator.generatePassword() test suite', () => {
  let passwordGenerator: PasswordGenerator;
  beforeEach(async () => {
    passwordGenerator = await BoxModule.getPasswordGenerator();
  });

  it('Should generate a new password', () => {
    const password = passwordGenerator.generatePassword('fi');
    expect(password).not.toBeNull();
    expect(password).not.toBeUndefined();
    expect(password).not.toBe('');
  });

  it('Should not generate 2 same passwords in a row', () => {
    const password1 = passwordGenerator.generatePassword('fi');
    const password2 = passwordGenerator.generatePassword('fi');

    expect(password1).not.toBe(password2);
  });
});
