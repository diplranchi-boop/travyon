const fs = require("fs");
const path = require("path");
const pool = require("./index");

const migrationsDir = path.resolve(__dirname, "../../migrations/sql");

const ensureSchemaMigrations = async (connection) => {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );
};

const getMigrationFiles = () => {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
};

const getAppliedMigrations = async (connection) => {
  const [rows] = await connection.query(
    "SELECT filename FROM schema_migrations ORDER BY filename"
  );
  return new Set(rows.map((row) => row.filename));
};

const runMigrations = async () => {
  const connection = await pool.getConnection();

  try {
    await ensureSchemaMigrations(connection);

    const files = getMigrationFiles();
    const applied = await getAppliedMigrations(connection);

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, "utf8").trim();

      if (sql.length > 0) {
        await connection.query(sql);
      }

      await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [
        file
      ]);

      console.log(`Applied migration: ${file}`);
    }
  } finally {
    connection.release();
  }
};

const showStatus = async () => {
  const connection = await pool.getConnection();

  try {
    await ensureSchemaMigrations(connection);
    const [rows] = await connection.query(
      "SELECT filename, applied_at FROM schema_migrations ORDER BY filename"
    );

    if (rows.length === 0) {
      console.log("No migrations have been applied yet.");
      return;
    }

    console.log("Applied migrations:");
    rows.forEach((row) => {
      console.log(`- ${row.filename} (${row.applied_at.toISOString()})`);
    });
  } finally {
    connection.release();
  }
};

const main = async () => {
  const mode = process.argv[2];

  if (mode === "status") {
    await showStatus();
    return;
  }

  await runMigrations();
};

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
