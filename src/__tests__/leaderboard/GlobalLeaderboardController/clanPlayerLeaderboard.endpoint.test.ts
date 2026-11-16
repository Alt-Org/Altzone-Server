import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthGuard } from '../../../auth/auth.guard';
import { apiValidationExceptionFactory } from '../../../common/exceptionFilter/ValidationExceptionFilter';
import { envVars } from '../../../common/service/envHandler/envVars';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GET /leaderboards/players/clan', () => {
  let app: INestApplication;
  let accessToken: string;
  const playerId = '665af23e5e9820013aa99991';
  const getClanPlayerLeaderboard = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: envVars.JWT_SECRET })],
      controllers: [GlobalLeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: { getClanPlayerLeaderboard },
        },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: apiValidationExceptionFactory,
      }),
    );
    await app.init();
    accessToken = app.get(JwtService).sign({
      profile_id: 'profile-id',
      player_id: playerId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    getClanPlayerLeaderboard.mockResolvedValue({
      entries: [
        {
          rank: 3,
          wins: 7,
          playerId,
          nickname: 'player-one',
          avatar: null,
          clan: {
            clanId: '665af23e5e9820013aa99992',
            name: 'ranked-clan',
            logo: null,
          },
        },
      ],
      ownRank: 3,
      itemCount: 5,
    });
  });

  it('returns the documented envelope to an authenticated clan member', async () => {
    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/clan?page=2&limit=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      data: {
        leaderboard: {
          entries: [
            {
              rank: 3,
              wins: 7,
              playerId,
              nickname: 'player-one',
              avatar: null,
              clan: {
                clanId: '665af23e5e9820013aa99992',
                name: 'ranked-clan',
                logo: null,
              },
            },
          ],
          ownRank: 3,
        },
      },
      metaData: {
        dataKey: 'leaderboard',
        modelName: 'Leaderboard',
        dataType: 'Object',
        dataCount: 1,
      },
      paginationData: {
        currentPage: 2,
        limit: 2,
        offset: 2,
        itemCount: 5,
        pageCount: 3,
      },
    });
    expect(getClanPlayerLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 2, skip: 2 },
      playerId,
    );
  });

  it('returns an empty successful page with own rank and population metadata', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce({
      entries: [],
      ownRank: 4,
      itemCount: 5,
    });

    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/clan?page=99')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data.leaderboard).toEqual({
      entries: [],
      ownRank: 4,
    });
    expect(response.body.paginationData).toEqual({
      currentPage: 99,
      limit: 20,
      offset: 1960,
      itemCount: 5,
      pageCount: 1,
    });
  });

  it('rejects unauthenticated and invalid-token requests', async () => {
    const unauthenticated = await request(app.getHttpServer())
      .get('/leaderboards/players/clan')
      .expect(401);
    expect(unauthenticated.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: 'NOT_AUTHENTICATED' }),
      ]),
    );

    const invalid = await request(app.getHttpServer())
      .get('/leaderboards/players/clan')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(invalid.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: 'AUTHENTICATION_FAILED' }),
      ]),
    );
    expect(getClanPlayerLeaderboard).not.toHaveBeenCalled();
  });

  it('rejects invalid pagination before calling the service', async () => {
    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/clan?limit=51')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'limit', reason: 'MORE_THAN_MAX' }),
      ]),
    );
    expect(getClanPlayerLeaderboard).not.toHaveBeenCalled();
  });

  it('returns the documented not-found response when the player has no clan', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/clan')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      errors: [
        expect.objectContaining({
          statusCode: 404,
          reason: 'NOT_FOUND',
          field: 'clan_id',
        }),
      ],
    });
  });
});
