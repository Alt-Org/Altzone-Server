import { ContextType, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';
import { APIRateLimitGuard } from '../../../../../common/throttler/guard/APIRateLimit.guard';

describe('APIRateLimitGuard.shouldSkip() test suite', () => {
  let guard: APIRateLimitGuard;

  const shouldSkip = (context: ExecutionContext) =>
    guard['shouldSkip'](context);

  const createContext = (type: ContextType) =>
    ({ getType: () => type }) as ExecutionContext;

  beforeEach(() => {
    guard = new APIRateLimitGuard(
      { throttlers: [] },
      {} as ThrottlerStorage,
      new Reflector(),
    );
  });

  it('Should not skip http requests', async () => {
    const result = await shouldSkip(createContext('http'));
    expect(result).toBe(false);
  });

  it('Should skip websocket requests', async () => {
    const result = await shouldSkip(createContext('ws'));
    expect(result).toBe(true);
  });
});
