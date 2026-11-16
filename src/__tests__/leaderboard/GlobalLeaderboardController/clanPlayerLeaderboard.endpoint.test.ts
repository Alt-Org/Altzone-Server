import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthGuard } from '../../../auth/auth.guard';
import { apiValidationExceptionFactory } from '../../../common/exceptionFilter/ValidationExceptionFilter';
import { envVars } from '../../../common/service/envHandler/envVars';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GET /leaderboards/clans/:clanId/players', () => {
  let app: INestApplication;
  const clanId = '665af23e5e9820013aa99992';
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
  });

  afterAll(async () => app.close());

  beforeEach(() => {
    getClanPlayerLeaderboard.mockResolvedValue({
      entries: [
        {
          rank: 3,
          wins: 7,
          playerId,
          nickname: 'player-one',
          avatar: null,
          clan: { clanId, name: 'ranked-clan', logo: null },
        },
      ],
      ownRank: null,
      itemCount: 5,
    });
  });

  it('returns the documented envelope without authentication', async () => {
    const response = await request(app.getHttpServer())
      .get(`/leaderboards/clans/${clanId}/players?page=2&limit=2`)
      .expect(200);

    expect(response.body.data.leaderboard).toEqual({
      entries: [
        expect.objectContaining({ rank: 3, playerId, nickname: 'player-one' }),
      ],
      ownRank: null,
    });
    expect(response.body.paginationData).toEqual({
      currentPage: 2,
      limit: 2,
      offset: 2,
      itemCount: 5,
      pageCount: 3,
    });
    expect(getClanPlayerLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 2, skip: 2 },
      clanId,
    );
  });

  it('returns an empty out-of-range page with no own rank', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce({
      entries: [],
      ownRank: null,
      itemCount: 5,
    });

    const response = await request(app.getHttpServer())
      .get(`/leaderboards/clans/${clanId}/players?page=99`)
      .expect(200);

    expect(response.body.data.leaderboard).toEqual({
      entries: [],
      ownRank: null,
    });
  });

  it('rejects invalid clan ids and pagination before calling the service', async () => {
    const invalidClan = await request(app.getHttpServer())
      .get('/leaderboards/clans/not-an-id/players')
      .expect(400);
    expect(invalidClan.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'clanId', reason: 'NOT_ALLOWED' }),
      ]),
    );

    const invalidPage = await request(app.getHttpServer())
      .get(`/leaderboards/clans/${clanId}/players?limit=51`)
      .expect(400);
    expect(invalidPage.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'limit', reason: 'MORE_THAN_MAX' }),
      ]),
    );
    expect(getClanPlayerLeaderboard).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown clan', async () => {
    getClanPlayerLeaderboard.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .get(`/leaderboards/clans/${clanId}/players`)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      errors: [
        expect.objectContaining({
          reason: 'NOT_FOUND',
          field: 'clanId',
          value: clanId,
        }),
      ],
    });
  });
});
