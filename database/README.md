# AltZone Database Migrations

**Why this exists:** MongoDB doesn't enforce schemas, but our backend does (via Mongoose). When a model changes, existing documents in local, staging, and production need to stay compatible. Migrations are the automated, reversible way to do that, no manual `mongosh` tweaking required.

[`migrate-mongo`](https://github.com/seppevs/migrate-mongo) is used to track which scripts have run and in what order.

---

## Quick Start

If you just changed a Mongoose model and need to migrate data:

```bash
# 1. Generate a new migration file
npm run migrate:create add-player-rank-field

# 2. Open the generated file in database/migrations/ and write your up/down logic

# 3. Run it against your local database
npm run migrate:up

# 4. Verify the result in MongoDB Compass or mongosh
```

---

## Environment & Config

Migrations read your root `.env` for connection details:

| Variable         | Purpose                |
| ---------------- | ---------------------- |
| `MONGO_USERNAME` | Database user          |
| `MONGO_PASSWORD` | Database password      |
| `MONGO_HOST`     | Host address           |
| `MONGO_PORT`     | Port (usually `27017`) |
| `MONGO_DB_NAME`  | Target database name   |

The tool is configured in `migrate-mongo-config.js` at project root. Key settings you should know:

| Setting                   | Value                  | Why it matters                                                     |
| ------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `migrationsDir`           | `database/migrations`  | Where your scripts live.                                           |
| `changelogCollectionName` | `migrations_changelog` | Tracks applied migrations in MongoDB itself.                       |
| `moduleSystem`            | `commonjs`             | Migration files use `module.exports.up` and `module.exports.down`. |

---

## CLI Reference

| Command                         | What it does                                               | When to use it                                                   |
| ------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `npm run migrate:create <name>` | Creates a timestamped `.js` file in `database/migrations/` | Every time you alter a model that affects existing data          |
| `npm run migrate:up`            | Runs all pending migrations in chronological order         | After pulling new code, or after writing a new migration locally |
| `npm run migrate:down`          | Reverts **only the last applied** migration                | When your last migration broke something locally                 |
| `npm run migrate:status`        | Shows which migrations are applied vs. pending             | Before pushing code, confirm your local DB is in sync            |

> **Tip:** Always run `migrate:status` before switching branches. If a branch has migrations you haven't run, your local schema will be out of sync and tests will likely fail in all kinds of confusing ways.

---

## Writing a Migration

A migration file is a CommonJS module exporting `up` and `down`. Both receive the native MongoDB `Db` instance and `MongoClient`.

Use the template at `database/migrations/migration-template.js` as your starting point.

### Anatomy of a Migration

```javascript
/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.up = async (db, client) => {
  // Apply your changes here: data backfills, index creation, collection renames, etc.
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.down = async (db, client) => {
  // Reverse everything in `up`. This must leave the DB in its pre-migration state.
};
```

### Common Patterns

#### 1. Backfilling a New Required Field

If you add a required field to a Mongoose schema, existing documents will fail validation unless they have a value themselves.

```javascript
module.exports.up = async (db) => {
  await db
    .collection('players')
    .updateMany({ rank: { $exists: false } }, { $set: { rank: 'rookie' } });
};

module.exports.down = async (db) => {
  await db.collection('players').updateMany({}, { $unset: { rank: '' } });
};
```

---

**2. Creating an Index (When Needed)**

If `autoIndex` is enabled, Mongoose can create indexes defined in the schema on startup. Create an index in a migration when it is required for correctness or must exist before the new application version starts. A unique index used as an idempotency guarantee belongs in a migration even when the same index is also declared in the Mongoose schema.

Other reasons to manage an index in a migration include:

- You're creating an index that isn't defined in the Mongoose schema (e.g., a compound index for a specific query pattern).
- You're working on a collection that doesn't have a Mongoose model.
- You need fine-grained control over index options (e.g., partial filters, collation).

```javascript
module.exports.up = async (db) => {
  await db
    .collection('matches')
    .createIndex(
      { playerId: 1, createdAt: -1 },
      { name: 'matches_playerId_createdAt' },
    );
};

module.exports.down = async (db) => {
  await db.collection('matches').dropIndex('matches_playerId_createdAt');
};
```

> **You should still name your indexes explicitly** if you create them manually. It makes `dropIndex` in `down` unambiguous.

---

- [ ] **Indexes are explicitly named** when created manually. This prevents `dropIndex` from breaking if MongoDB's auto-naming convention changes.

---

#### 3. Multi-Step Migrations

If a migration does several things, `down` must undo them in **reverse order**:

```javascript
module.exports.up = async (db) => {
  await db.collection('users').updateMany({}, { $set: { legacy: false } });
  await db.collection('users').createIndex({ legacy: 1 });
};

module.exports.down = async (db) => {
  await db.collection('users').dropIndex('legacy_1'); // Undo step 2 first
  await db.collection('users').updateMany({}, { $unset: { legacy: '' } }); // Then step 1
};
```

---

## Safety Checklist

Before committing a migration, verify:

- [ ] **`down` actually works.** Run `migrate:up`, then `migrate:down`, then `migrate:up` again. If the second `up` fails, your `down` is incomplete.
- [ ] **Indexes are explicitly named.** This prevents `dropIndex` from breaking if MongoDB's auto-naming convention changes.
- [ ] **Destructive operations are gated.** Use `updateMany` with filters rather than blindly overwriting documents if/when needed.
- [ ] **The migration is idempotent.** Running `up` twice should not error or corrupt data (e.g., use `$set` instead of `$inc` for defaults).

---

## Troubleshooting

| Symptom                                          | Likely Cause                                                              | Fix                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| `migrate:up` says "no migrations to run"         | Already applied, or file not in `database/migrations/`                    | Check `migrate:status`                                   |
| `migrate:down` fails with "index not found"      | Index was dropped manually or name mismatch                               | Check `db.collection.getIndexes()` in MongoDB            |
| Tests fail after pulling `main`                  | Missing migrations on your branch                                         | Run `migrate:up`, check `migrate:status`                 |
| `down` leaves orphaned data                      | Forgot to unset a field or drop a collection                              | Fix the `down` function, test locally, commit only then  |
| `Cannot find module 'dotenv'` in a copied config | The config is under `/tmp`, outside `/app/node_modules` module resolution | Add `--env NODE_PATH=/app/node_modules` to `docker exec` |

---

## Running a Migration in an Existing API Container

Use this procedure when the deployed API image does not contain
`migrate-mongo-config.js` or `database/migrations`. It does not rebuild the
image or create/remove containers. It copies one migration into a temporary
directory in an existing API container and runs the repository's
`migrate-mongo` installation.

### Important deployment rules

- Run a migration once per MongoDB database, not once per API instance.
- Check which database the selected container uses before running anything.
- Do not run the same migration concurrently from multiple containers.
- `migrations_changelog` in MongoDB is the authoritative execution history.
- A separate teacher database has a separate changelog and migration state.
- If dev, main, and prod API instances share one database, run the migration
  from only one of those containers.
- Copy only the intended migration when historic changes were applied manually
  and the changelog may not contain the older repository migrations.

The container's `/tmp` files survive an ordinary container restart but disappear
when the container is removed or replaced. The database changes and changelog
do not depend on those temporary files.

### Server-side file layout

Keep the configuration and with the following the repository layout:

```text
api/
├── migrate-mongo-config.js
└── database/
    └── migrations/
        └── <timestamp>-<description>.js
```

Run the following commands from that `api` directory. Set the actual API
container name and intended migration filename first:

```bash
CONTAINER_NAME=your-api-container
MIGRATION_FILE=20261111120000-create-player-leaderboard-win-indexes.js
```

The container name can be found with `docker ps --format '{{.Names}}'`. The
variables remain available in the current shell session only.

### 1. Verify the migration runner and environment

```bash
docker exec "$CONTAINER_NAME" \
  /app/node_modules/.bin/migrate-mongo --version
```

Verify that the required variables exist without printing their values:

```bash
docker exec "$CONTAINER_NAME" node -e '
const required = [
  "MONGO_USERNAME",
  "MONGO_PASSWORD",
  "MONGO_HOST",
  "MONGO_PORT",
  "MONGO_DB_NAME"
];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}
console.log("MongoDB environment variables are available");
'
```

Confirm separately with the deployment owner that `MONGO_DB_NAME` belongs to
the intended database. Do not print credentials into shell history or logs.

### 2. Prepare a temporary directory in the container

```bash
docker exec "$CONTAINER_NAME" \
  mkdir -p /tmp/altzone-migrate/database/migrations
```

### 3. Copy the config and one migration

```bash
docker cp \
  ./migrate-mongo-config.js \
  "${CONTAINER_NAME}:/tmp/altzone-migrate/migrate-mongo-config.js"
```

```bash
docker cp \
  "./database/migrations/$MIGRATION_FILE" \
  "${CONTAINER_NAME}:/tmp/altzone-migrate/database/migrations/"
```

Verify the copied files:

```bash
docker exec "$CONTAINER_NAME" \
  find /tmp/altzone-migrate -maxdepth 3 -type f
```

Check the migration syntax with the container's Node.js:

```bash
docker exec "$CONTAINER_NAME" \
  node --check \
  "/tmp/altzone-migrate/database/migrations/$MIGRATION_FILE"
```

### 4. Check status before applying

The copied config is outside `/app`, so set `NODE_PATH` to allow its
`require('dotenv')` call to find the dependency installed in
`/app/node_modules`:

```bash
docker exec \
  --env NODE_PATH=/app/node_modules \
  --workdir /tmp/altzone-migrate \
  "$CONTAINER_NAME" \
  /app/node_modules/.bin/migrate-mongo status \
  --file /tmp/altzone-migrate/migrate-mongo-config.js \
  --migrations-dir /tmp/altzone-migrate/database/migrations
```

The intended migration should be `PENDING`. Stop if unexpected migrations are
listed or the database connection fails.

### 5. Apply the migration

```bash
docker exec \
  --env NODE_PATH=/app/node_modules \
  --workdir /tmp/altzone-migrate \
  "$CONTAINER_NAME" \
  /app/node_modules/.bin/migrate-mongo up \
  --file /tmp/altzone-migrate/migrate-mongo-config.js \
  --migrations-dir /tmp/altzone-migrate/database/migrations
```

A successful run prints `MIGRATED UP: <migration filename>`.

### 6. Verify after applying

Run the status command from step 4 again. The migration must now be `APPLIED`.
Also verify the affected fields, collection, or indexes using the acceptance
checks documented in the migration's pull request.

The copied `/tmp/altzone-migrate` directory can be left in place for auditing.
Do not run `down` merely to test access on a shared database. A rollback must be
an explicit deployment decision because it changes database state and may
remove correctness constraints such as unique indexes.
