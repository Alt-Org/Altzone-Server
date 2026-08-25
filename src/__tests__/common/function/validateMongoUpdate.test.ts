import { hasUnsafeMongoUpdateKey } from '../../../common/function/validateMongoUpdate';

describe('validateMongoUpdate', () => {
  it('should allow clean update payloads', () => {
    const validPayload = { $set: { name: 'John', age: 25 } };
    expect(hasUnsafeMongoUpdateKey(validPayload)).toBe(false);
  });

  it('should block __proto__ keys', () => {
    expect(
      hasUnsafeMongoUpdateKey({ $set: { '__proto__.polluted': true } }),
    ).toBe(true);

    const jsonPayload = JSON.parse('{"__proto__": {"polluted": true}}');
    expect(hasUnsafeMongoUpdateKey(jsonPayload)).toBe(true);
  });

  it('should block constructor.prototype keys', () => {
    expect(
      hasUnsafeMongoUpdateKey({
        $set: { 'constructor.prototype.polluted': true },
      }),
    ).toBe(true);
  });

  it('should catch deeply nested unsafe keys', () => {
    const nestedPayload = {
      $set: {
        profile: {
          nested: {
            '__proto__.admin': true,
          },
        },
      },
    };
    expect(hasUnsafeMongoUpdateKey(nestedPayload)).toBe(true);
  });
});
