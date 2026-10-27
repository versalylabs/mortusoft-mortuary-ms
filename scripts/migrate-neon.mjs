import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required. Add the Neon pooled connection string to .env.local.");

const pool = new Pool({ connectionString, max: 1 });
const migrationDir = join(process.cwd(), "neon", "migrations");

try {
  await pool.query("CREATE SCHEMA IF NOT EXISTS mortusoft_migrations");
  await pool.query(`CREATE TABLE IF NOT EXISTS mortusoft_migrations.applied (
    name text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const names = (await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const contents = await readFile(join(migrationDir, name), "utf8");
    const checksum = createHash("sha256").update(contents).digest("hex");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const previous = await client.query(
        "SELECT checksum FROM mortusoft_migrations.applied WHERE name = $1 FOR UPDATE",
        [name],
      );
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`Applied migration ${name} has changed. Create a new migration instead.`);
        await client.query("COMMIT");
        console.log(`Already applied: ${name}`);
        continue;
      }

      await client.query(contents);
      await client.query(
        "INSERT INTO mortusoft_migrations.applied (name, checksum) VALUES ($1, $2)",
        [name, checksum],
      );
      await client.query("COMMIT");
      console.log(`Applied: ${name}`);
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
