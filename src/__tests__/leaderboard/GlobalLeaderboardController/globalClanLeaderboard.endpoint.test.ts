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

describe('GET /leaderboards/clans/global', () => {
  let app: INestApplication;
  const getGlobalClanLeaderboard = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: envVars.JWT_SECRET })],
      controllers: [GlobalLeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: { getGlobalClanLeaderboard },
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

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    getGlobalClanLeaderboard.mockResolvedValue({
      entries: [
        {
          rank: 3,
          wins: 7,
          clanId: '665af23e5e9820013aa99991',
          name: 'ranked-clan',
          logo: null,
        },
      ],
      ownRank: null,
      itemCount: 5,
    });
  });

  it('returns the documented envelope to an anonymous request', async () => {
    const response = await request(app.getHttpServer())
      .get('/leaderboards/clans/global?page=2&limit=2')
      .expect(200);

    expect(response.body).toEqual({
      data: {
        leaderboard: {
          entries: [
            {
              rank: 3,
              wins: 7,
              clanId: '665af23e5e9820013aa99991',
              name: 'ranked-clan',
              logo: null,
            },
          ],
          ownRank: null,
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
    expect(getGlobalClanLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 2, skip: 2 },
      undefined,
    );
  });

  it('returns an empty successful page with population metadata', async () => {
    getGlobalClanLeaderboard.mockResolvedValueOnce({
      entries: [],
      ownRank: 4,
      itemCount: 5,
    });

    const response = await request(app.getHttpServer())
      .get('/leaderboards/clans/global?page=99')
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

  it('rejects invalid pagination instead of clamping it', async () => {
    const response = await request(app.getHttpServer())
      .get('/leaderboards/clans/global?limit=51')
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'limit', reason: 'MORE_THAN_MAX' }),
      ]),
    );
    expect(getGlobalClanLeaderboard).not.toHaveBeenCalled();
  });

  it('rejects a supplied invalid token', async () => {
    await request(app.getHttpServer())
      .get('/leaderboards/clans/global')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(getGlobalClanLeaderboard).not.toHaveBeenCalled();
  });
});
