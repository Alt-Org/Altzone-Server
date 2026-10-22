# AltZone End-to-End (E2E) Testing

**Why this exists:** End-to-End (E2E) tests verify that the entire application stack, so controllers, services, database layers, and background connectors functions correctly from HTTP request down to response. These tests run against an active NestJS server context to prevent breaking API regressions before code reaches production.

E2E tests use [Jest] and [Supertest] to execute HTTP requests against a local test environment.

---

## Quick Start

Before running tests, ensure your local infrastructure dependencies (MongoDB, Redis, Mosquitto) are active via Docker.

```bash
# 1. Start docker
docker compose up -d

# 2. Execute the E2E test suite
npm run test:e2e

# 3. Add a new E2E test file in test/ (e.g., test/profile.e2e-spec.ts)

```

---

## Environment & Dependencies

E2E tests initialize the application using your root `.env` configuration. Ensure the following services are accessible locally:

| Dependency | Purpose | Port |
| --- | --- | --- |
| **MongoDB** | Database storage | `27017` |
| **Redis** | Caching & BullMQ job queues | `6379` |
| **Mosquitto** | MQTT messaging broker | `1883`, `9001` |

Key settings in `test/jest-e2e.json`:

| Setting | Value | Why it matters |
| --- | --- | --- |
| `moduleFileExtensions` | `["js", "json", "ts"]` | Supports TypeScript test resolution |
| `rootDir` | `.` | Context root relative to the test config |
| `testRegex` | `".e2e-spec.ts$"` | Discovers all E2E spec files inside `test/` |
| `transform` | `ts-jest` | Compiles TypeScript tests on the fly |

---

## CLI Reference

| Command | What it does | When to use it |
| --- | --- | --- |
| `npm run test:e2e` | Executes all `.e2e-spec.ts` files with `--runInBand` and `--forceExit` | Before committing or opening a PR |
| `npx jest --config ./test/jest-e2e.json test/app.e2e-spec.ts` | Runs a single spec file | When developing or debugging a specific spec |

> **Tip:** `--runInBand` ensures tests run sequentially in a single process, preventing state pollution across shared database collections. `--forceExit` forces Jest to exit cleanly after background microservices (like MQTT timers) finish execution.

---

## Writing an E2E Test

E2E spec files live in the `test/` folder and end with `.e2e-spec.ts`. Import `AppModule` using relative imports from the root (`../src/app.module`).

Use `test/app.e2e-spec.ts` as your baseline structure.

### Anatomy of an E2E Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Profile API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set global prefix if used in main.ts
    // app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      // Allow background handles time to clear
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });

  it('GET /metadata/game -> should return game metadata', async () => {
    return request(app.getHttpServer())
      .get('/metadata/game')
      .expect(200);
  });
});

```

---

## Common Patterns

### 1. Relative Imports from Root

Always import application modules relative to the `test/` directory using `../src/`:

```typescript
import { AppModule } from '../src/app.module';

```

### 2. Testing Authenticated Endpoints

For endpoints that require authentication tokens, log in during `beforeAll` or inside the test block and pass the authorization header:

```typescript
it('GET /profile/info -> should return user profile', async () => {
  const loginRes = await request(app.getHttpServer())
    .post('/auth/signIn')
    .send({ username: 'testuser', password: 'password123' });

  const token = loginRes.body.accessToken;

  return request(app.getHttpServer())
    .get('/profile/info')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});

```

---

## Safety Checklist

Before committing an E2E test spec, verify:

* [ ] **Tests run sequentially.** Do not remove `--runInBand` from the execution script if tests write to a shared database. This can cause race conditions and other issues.
* [ ] **Teardown is clean.** Verify `afterAll` calls `await app.close()` to prevent orphaned processes or port binding lockups.
* [ ] **Docker services are active.** Confirm MongoDB, Redis, and Mosquitto containers are running prior to executing test suites.
* [ ] **Endpoints match Swagger spec.** Ensure tested routes and HTTP methods align with defined API contracts.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:6379` | Redis server is not running | Start Redis container using `docker compose up -d` |
| `404 Not Found` on valid route | Route missing global prefix or wrong route path | Verify route in Swagger or check `app.setGlobalPrefix()` |
| `TypeError: Right-hand side of 'instanceof' is not callable` | MQTT client reconnecting post-teardown | Ensure `--forceExit` is present in `npm run test:e2e` |
| `Cannot find module '../src/app.module'` | Incorrect relative import path | Use `import { AppModule } from '../src/app.module'` |

---