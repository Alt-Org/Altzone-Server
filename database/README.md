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

| Variable | Purpose |
|---|---|
| `MONGO_USERNAME` | Database user |
| `MONGO_PASSWORD` | Database password |
| `MONGO_HOST` | Host address |
| `MONGO_PORT` | Port (usually `27017`) |
| `MONGO_DB_NAME` | Target database name |

The tool is configured in `migrate-mongo-config.js` at project root. Key settings you should know:

| Setting | Value | Why it matters |
|---|---|---|
| `migrationsDir` | `database/migrations` | Where your scripts live. |
| `changelogCollectionName` | `migrations_changelog` | Tracks applied migrations in MongoDB itself. |
| `moduleSystem` | `esm` | All migration files must use the `export` syntax. |

---

## CLI Reference

| Command | What it does | When to use it |
|---|---|---|
| `npm run migrate:create <name>` | Creates a timestamped `.js` file in `database/migrations/` | Every time you alter a model that affects existing data |
| `npm run migrate:up` | Runs all pending migrations in chronological order | After pulling new code, or after writing a new migration locally |
| `npm run migrate:down` | Reverts **only the last applied** migration | When your last migration broke something locally |
| `npm run migrate:status` | Shows which migrations are applied vs. pending | Before pushing code, confirm your local DB is in sync |

> **Tip:** Always run `migrate:status` before switching branches. If a branch has migrations you haven't run, your local schema will be out of sync and tests will likely fail in all kinds of confusing ways.

---

## Writing a Migration

A migration file is just a plain ES module exporting `up` and `down`. Both receive the native MongoDB `Db` instance and `MongoClient`.

Use the template at `database/migrations/migration-template.js` as your starting point.

### Anatomy of a Migration

```javascript
/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
export const up = async (db, client) => {
  // Apply your changes here: data backfills, index creation, collection renames, etc.
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
export const down = async (db, client) => {
  // Reverse everything in `up`. This must leave the DB in its pre-migration state.
};
```

### Common Patterns

#### 1. Backfilling a New Required Field
If you add a required field to a Mongoose schema, existing documents will fail validation unless they have a value themselves.

```javascript
export const up = async (db) => {
  await db.collection('players').updateMany(
    { rank: { $exists: false } },
    { $set: { rank: 'rookie' } }
  );
};

export const down = async (db) => {
  await db.collection('players').updateMany(
    {},
    { $unset: { rank: '' } }
  );
};
```

---

**2. Creating an Index (When Needed)**

If `autoIndex` is enabled in `AppModule`, Mongoose will create indexes defined in your schema automatically on startup. You generally **do not** need to create them in migrations unless:

- You're creating an index that isn't defined in the Mongoose schema (e.g., a compound index for a specific query pattern).
- You're working on a collection that doesn't have a Mongoose model.
- You need fine-grained control over index options (e.g., partial filters, collation).

```javascript
export const up = async (db) => {
  await db.collection('matches').createIndex(
    { playerId: 1, createdAt: -1 },
    { name: 'matches_playerId_createdAt' }
  );
};

export const down = async (db) => {
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
export const up = async (db) => {
  await db.collection('users').updateMany({}, { $set: { legacy: false } });
  await db.collection('users').createIndex({ legacy: 1 });
};

export const down = async (db) => {
  await db.collection('users').dropIndex('legacy_1');   // Undo step 2 first
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

| Symptom | Likely Cause | Fix |
|---|---|---|
| `migrate:up` says "no migrations to run" | Already applied, or file not in `database/migrations/` | Check `migrate:status` |
| `migrate:down` fails with "index not found" | Index was dropped manually or name mismatch | Check `db.collection.getIndexes()` in MongoDB |
| Tests fail after pulling `main` | Missing migrations on your branch | Run `migrate:up`, check `migrate:status` |
| `down` leaves orphaned data | Forgot to unset a field or drop a collection | Fix the `down` function, test locally, commit only then |

---