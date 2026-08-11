# AltZone Database Migrations Guide

This directory contains database schema migrations and data transformation utilities for the AltZone backend using [`migrate-mongo`](https://github.com/seppevs/migrate-mongo).

---

## 1. Overview & Workflow

MongoDB is schemaless, but the AltZone backend relies on Mongoose schemas and indexes. As models evolve across feature requests, migration scripts ensure local developer databases, staging, and production environments stay in sync without manual data tweaking.

### Standard Development Workflow

1. **Modify the Mongoose Model/Schema:** Update your backend Mongoose model in `src/` to reflect the new feature requirements.
2. **Generate a Migration File:** Run `npm run migrate:create <brief-description>` to generate a timestamped file in `database/migrations/`.
3. **Write Migration Logic:** Implement the `up` (apply) and `down` (rollback) functions using the native MongoDB driver API.
4. **Apply Changes Locally:** Run `npm run migrate:up` on your local database.
5. **Verify Data:** Inspect your local MongoDB instance to confirm documents and indexes match expectations.
6. **Commit Migration Files:** Commit both the schema updates and the new file in `database/migrations/`.

---

## 2. Environment Setup & Configuration

Migrations rely on environment variables defined in your root `.env` file (`MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_PORT`, `MONGO_DB_NAME`).

Configuration is defined in `migrate-mongo-config.js` at the project root:
- **Migrations Directory:** `database/migrations`
- **Changelog Collection:** `migrations_changelog`
- **Module System:** ES Modules (`esm`)

---

## 3. CLI Commands

| Command | Action |
| :--- | :--- |
| `npm run migrate:create <name>` | Creates a new timestamped migration file in `database/migrations/` |
| `npm run migrate:up` | Executes all pending migrations in chronological order |
| `npm run migrate:down` | Rolls back the last applied migration |
| `npm run migrate:status` | Displays a table showing applied and pending migrations |

---

## 4. Writing a Migration File

Migration files use the ES Module syntax and export two asynchronous functions: `up` and `down`. Both receive the MongoDB `Db` object and `MongoClient`.

### Example Migration

```javascript
/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
export const up = async (db, client) => {
  // 1. Backfill a new required field with default value
  await db.collection('users').updateMany(
    { settings: { $exists: false } },
    { $set: { settings: { notificationsEnabled: true } } }
  );

  // 2. Create an index explicitly (autoIndex is disabled in AppModule)
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
export const down = async (db, client) => {
  // Revert changes made in up()
  await db.collection('users').dropIndex('email_1');
  await db.collection('users').updateMany(
    {},
    { $unset: { settings: "" } }
  );
};