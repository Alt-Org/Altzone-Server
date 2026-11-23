import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { CASLAbilityFactory } from '../../../authorization/caslAbility.factory';
import { PlayerService } from '../../../player/player.service';
import ProfileController from '../../../profile/profile.controller';
import { ProfileService } from '../../../profile/profile.service';
import { RequestHelperService } from '../../../requestHelper/requestHelper.service';

describe('POST /profile/guest', () => {
  let app: INestApplication;

  const profileService = {
    createGuestAccount: jest.fn().mockResolvedValue([
      { username: 'Guest-22e0d8d1', password: 'password' },
      null,
    ]),
  };
  const authService = {
    signIn: jest.fn().mockResolvedValue([
      {
        _id: '6b03ef177cf3c26e88fb2eca',
        username: 'Guest-22e0d8d1',
        isGuest: true,
        Player: { _id: '6b03ef177cf3c26e88fb2ecc' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      null,
    ]),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: PlayerService, useValue: {} },
        { provide: AuthService, useValue: authService },
        { provide: CASLAbilityFactory, useValue: {} },
        { provide: RequestHelperService, useValue: {} },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns the same Profile response envelope as sign-in', async () => {
    const response = await request(app.getHttpServer())
      .post('/profile/guest')
      .expect(201);

    expect(Array.isArray(response.body)).toBe(false);
    expect(response.body.data.Profile).toMatchObject({
      username: 'Guest-22e0d8d1',
      isGuest: true,
      Player: expect.any(Object),
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(response.body.metaData).toMatchObject({
      dataKey: 'Profile',
      modelName: 'Profile',
      dataType: 'Object',
    });
  });
});
