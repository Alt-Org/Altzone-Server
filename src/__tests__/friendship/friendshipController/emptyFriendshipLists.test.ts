import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { FriendshipController } from '../../../friendship/friendship.controller';
import { FriendshipService } from '../../../friendship/friendship.service';
import FriendshipNotifier from '../../../friendship/friendship.notifier';

describe('Friendship empty list endpoints', () => {
  let app: INestApplication;

  const getPlayerFriendlist = jest.fn(async () => [[], null]);
  const getFriendRequests = jest.fn(async () => [[], null]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [FriendshipController],
      providers: [
        {
          provide: FriendshipService,
          useValue: { getPlayerFriendlist, getFriendRequests },
        },
        {
          provide: FriendshipNotifier,
          useValue: {},
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.use((req, _res, next) => {
      req.user = { profile_id: 'profile-1', player_id: 'player-1' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    getPlayerFriendlist.mockClear();
    getFriendRequests.mockClear();
  });

  it('returns 200 and an empty friend list when the player has no friends', async () => {
    const response = await request(app.getHttpServer())
      .get('/friendship')
      .expect(200);

    expect(response.body.data.Friendship).toEqual([]);
    expect(response.body.metaData).toMatchObject({
      dataKey: 'Friendship',
      modelName: 'Friendship',
      dataType: 'Array',
      dataCount: 0,
    });
    expect(getPlayerFriendlist).toHaveBeenCalledWith('player-1');
  });

  it('returns 200 and an empty request list when the player has no friend requests', async () => {
    const response = await request(app.getHttpServer())
      .get('/friendship/requests')
      .expect(200);

    expect(response.body.data.Friendship).toEqual([]);
    expect(response.body.metaData).toMatchObject({
      dataKey: 'Friendship',
      modelName: 'Friendship',
      dataType: 'Array',
      dataCount: 0,
    });
    expect(getFriendRequests).toHaveBeenCalledWith('player-1');
  });
});
