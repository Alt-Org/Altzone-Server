import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await app.close();
    }
  });

  it('/GET metadata/game', () => {
    return request(app.getHttpServer())
      .get('/metadata/game')
      .expect(200);
  });
});