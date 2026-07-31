import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Profile } from '../../../../profile/profile.schema';
import { Environment } from '../../../../common/enum/environment.enum';

export default class ProfileBuilder implements IDataBuilder<Profile> {
  private readonly base: Profile = {
    _id: undefined,
    username: 'defaultUser',
    password: 'defaultPassword',
    isSystemAdmin: false,
    isGuest: false,
    securityQuestion: undefined,
    securityAnswer: undefined,
    failedRecoveryAttempts: 0,
    recoveryLockedUntil: null,
    tokenVersion: 0,
    environment: Environment.TEACHING_DEMO,
    expiresAt: undefined,
  };

  build(): Profile {
    return { ...this.base };
  }

  set_id(_id: string) {
    this.base._id = _id;
    return this;
  }

  setUsername(username: string) {
    this.base.username = username;
    return this;
  }

  setPassword(password: string) {
    this.base.password = password;
    return this;
  }

  setIsGuest(isGuest: boolean) {
    this.base.isGuest = isGuest;
    return this;
  }

  setSecurityQuestion(securityQuestion: string) {
    this.base.securityQuestion = securityQuestion;
    return this;
  }

  setSecurityAnswer(securityAnswer: string) {
    this.base.securityAnswer = securityAnswer;
    return this;
  }

  setFailedRecoveryAttempts(failedRecoveryAttempts: number) {
    this.base.failedRecoveryAttempts = failedRecoveryAttempts;
    return this;
  }

  setRecoveryLockedUntil(recoveryLockedUntil: Date) {
    this.base.recoveryLockedUntil = recoveryLockedUntil;
    return this;
  }

  setTokenVersion(tokenVersion: number) {
    this.base.tokenVersion = tokenVersion;
    return this;
  }

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
