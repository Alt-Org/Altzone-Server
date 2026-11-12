import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { User } from '../../../auth/user';
import { CASLAbilityFactory } from '../../../authorization/caslAbility.factory';
import { AuthorizationInterceptor } from '../../../authorization/authorization.interceptor';
import { ClanController } from '../../../clan/clan.controller';
import { ClanService } from '../../../clan/clan.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';

describe('DELETE /clan/:_id endpoint', () => {
  const existingId = '507f1f77bcf86cd799439011';
  const nonExistingId = '000000000000000000000000';
  const deleteOneById = jest.fn(async (_id: string) => {
    if (_id === nonExistingId)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: '_id',
            value: _id,
          }),
        ],
      ];

    return [true, null];
  });
  const createForUser = jest.fn().mockResolvedValue({
    can: jest.fn().mockReturnValue(true),
  });
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ClanController],
      providers: [
        AuthorizationInterceptor,
        {
          provide: CASLAbilityFactory,
          useValue: { createForUser },
        },
        {
          provide: ClanService,
          useValue: { deleteOneById },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    app = module.createNestApplication();
    app.use((req, _res, next) => {
      req.user = new User('profile-id', 'player-id', existingId);
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    deleteOneById.mockClear();
    createForUser.mockClear();
  });

  it.each(['12345', 'invalidid'])(
    'returns 400 for malformed ID %s without calling the service',
    async (invalidId) => {
      const response = await request(app.getHttpServer())
        .delete(`/clan/${invalidId}`)
        .expect(400);

      expect(response.body.errors[0]).toMatchObject({
        reason: 'VALIDATION',
        field: '_id',
        value: invalidId,
      });
      expect(JSON.stringify(response.body)).not.toContain('CastError');
      expect(deleteOneById).not.toHaveBeenCalled();
      expect(createForUser).not.toHaveBeenCalled();
    },
  );

  it('returns 404 for a valid but non-existing clan ID', async () => {
    await request(app.getHttpServer())
      .delete(`/clan/${nonExistingId}`)
      .expect(404);

    expect(deleteOneById).toHaveBeenCalledWith(nonExistingId);
  });

  it('returns 204 when an authorized clan is deleted', async () => {
    await request(app.getHttpServer())
      .delete(`/clan/${existingId}`)
      .expect(204);

    expect(deleteOneById).toHaveBeenCalledWith(existingId);
  });
});
