import MatcherReturner from '../../../jest_util/MatcherReturner';

describe('MatcherReturner class test suite', () => {
  /**
   * @type {MatcherReturner}
   */
  let matcherReturner;

  beforeEach(() => {
    matcherReturner = new MatcherReturner();
  });

  describe('passTrue()', () => {
    it('Should return valid jest matcher object with pass set to true', () => {
      const message = 'Some message';

      const resp = matcherReturner.passTrue(message);

      expect(resp.pass).toBeTruthy();
      expect(typeof resp.message === 'function').toBeTruthy();
      expect(resp.message().includes(message)).toBeTruthy();
    });
  });

  describe('passFalse()', () => {
    it('Should return valid jest matcher object with pass set to false', () => {
      const message = 'Some message';

      const resp = matcherReturner.passFalse(message);

      expect(resp.pass).toBeFalsy();
      expect(typeof resp.message === 'function').toBeTruthy();
      expect(resp.message().includes(message)).toBeTruthy();
    });
  });
});
