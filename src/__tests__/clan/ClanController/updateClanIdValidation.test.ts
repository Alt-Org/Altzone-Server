import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClanController } from '../../../clan/clan.controller';
import { ClanIdGuard } from '../../../common/guard/clanId.guard';
import { ValidateUpdateMongoIdMiddleware } from '../../../common/middleware/validateUpdateMongoId.middleware';
import { HasClanRightsGuard } from '../../../clan/role/decorator/guard/HasClanRights';

@Module({ controllers: [ClanController] })
class UpdateClanTestModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ValidateUpdateMongoIdMiddleware).forRoutes({
      path: 'clan',
      method: RequestMethod.PUT,
    });
  }
}

describe('PUT /clan ID validation', () => {
  const clanIdGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const clanRightsGuard = { canActivate: jest.fn().mockReturnValue(true) };
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [UpdateClanTestModule],
    })
      .useMocker(() => ({}))
      .overrideGuard(ClanIdGuard)
      .useValue(clanIdGuard)
      .overrideGuard(HasClanRightsGuard)
      .useValue(clanRightsGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    clanIdGuard.canActivate.mockClear();
    clanRightsGuard.canActivate.mockClear();
  });

  it.each(['12345', 'invalidid'])(
    'returns 400 for malformed ID %s before database-backed guards',
    async (invalidId) => {
      const response = await request(app.getHttpServer())
        .put('/clan')
        .send({ _id: invalidId })
        .expect(400);

      expect(response.body.errors[0]).toMatchObject({
        reason: 'VALIDATION',
        field: '_id',
        value: invalidId,
      });
      expect(JSON.stringify(response.body)).not.toContain('CastError');
      expect(clanIdGuard.canActivate).not.toHaveBeenCalled();
      expect(clanRightsGuard.canActivate).not.toHaveBeenCalled();
    },
  );
});
