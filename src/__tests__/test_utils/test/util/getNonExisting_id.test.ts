import { getNonExisting_id } from '../../util/getNonExisting_id';

describe('getNonExisting_id() test suite', () => {
  it('Should return 000000000000000000000000', () => {
    const result = getNonExisting_id();
    expect(result).toBe('000000000000000000000000');
  });
});
