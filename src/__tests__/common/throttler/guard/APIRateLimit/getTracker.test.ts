import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ObjectId } from 'mongodb';
import { APIRateLimitGuard } from '../../../../../common/throttler/guard/APIRateLimit.guard';

describe('APIRateLimitGuard.getTracker() test suite', () => {
  let guard: APIRateLimitGuard;

  const getTracker = (req: Record<string, any>) => guard['getTracker'](req);

  const playerId = new ObjectId().toString();
  const username = 'username123';
  const ip = '127.0.0.1';
  const tKey_playerId = `player_id:${playerId}`;
  const tKey_username = `username:${username}`;
  const tKey_ip = `ip:${ip}`;

  beforeEach(() => {
    guard = new APIRateLimitGuard(
      { throttlers: [] },
      {} as ThrottlerStorage,
      new Reflector(),
    );
  });

  it('Should return player_id tracker if user is authenticated', async () => {
    const req = {
      user: { player_id: playerId },
      body: { username: username },
      ip: ip,
    };

    const result = await getTracker(req);

    expect(result).toBe(tKey_playerId);
  });

  it('Should return username tracker if user is not authenticated and body has username', async () => {
    const req = { body: { username: username }, ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_username);
  });

  it('Should return username tracker if user has no player_id', async () => {
    const req = { user: {}, body: { username: username }, ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_username);
  });

  it('Should return ip tracker if user is not authenticated and body has no username', async () => {
    const req = { body: {}, ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_ip);
  });

  it('Should return ip tracker if request has no body', async () => {
    const req = { ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_ip);
  });

  it('Should return ip tracker if username is an empty string', async () => {
    const req = { body: { username: '' }, ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_ip);
  });

  it('Should return ip tracker if username is not a string', async () => {
    const req = { body: { username: { $ne: null } }, ip: ip };

    const result = await getTracker(req);

    expect(result).toBe(tKey_ip);
  });
});
