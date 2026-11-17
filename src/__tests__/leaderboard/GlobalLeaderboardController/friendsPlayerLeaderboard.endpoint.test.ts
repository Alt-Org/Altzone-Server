import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthGuard } from '../../../auth/auth.guard';
import { TokenName } from '../../../auth/enum/tokenName.enum';
import { apiValidationExceptionFactory } from '../../../common/exceptionFilter/ValidationExceptionFilter';
import { envVars } from '../../../common/service/envHandler/envVars';
import { GlobalLeaderboardController } from '../../../leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';

describe('GET /leaderboards/players/friends', () => {
  let app: INestApplication;
  let accessToken: string;
  const getFriendsPlayerLeaderboard = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: envVars.JWT_SECRET })],
      controllers: [GlobalLeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: { getFriendsPlayerLeaderboard },
        },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();

    accessToken = module.get(JwtService).sign({
      type: 'access',
      profile_id: 'profile-id',
      player_id: 'player-id',
    });
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
    getFriendsPlayerLeaderboard.mockReset();
    getFriendsPlayerLeaderboard.mockResolvedValue({
      entries: [],
      ownRank: 1,
      itemCount: 1,
    });
  });

  it('accepts the website access-token cookie and returns the documented envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/friends?page=2&limit=2')
      .set('Cookie', `${TokenName.ACCESS_TOKEN}=${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      data: { leaderboard: { entries: [], ownRank: 1 } },
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
        itemCount: 1,
        pageCount: 1,
      },
    });
    expect(getFriendsPlayerLeaderboard).toHaveBeenCalledWith(
      { filter: {}, sort: {}, limit: 2, skip: 2 },
      'player-id',
    );
  });

  it('accepts a bearer access token', async () => {
    await request(app.getHttpServer())
      .get('/leaderboards/players/friends')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/leaderboards/players/friends')
      .expect(401);

    expect(getFriendsPlayerLeaderboard).not.toHaveBeenCalled();
  });

  it('rejects invalid pagination before calling the service', async () => {
    await request(app.getHttpServer())
      .get('/leaderboards/players/friends?limit=51')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    expect(getFriendsPlayerLeaderboard).not.toHaveBeenCalled();
  });
});
