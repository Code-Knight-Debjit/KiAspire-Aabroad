require("dotenv").config();

// Single config, driven entirely by env vars — dev and production both just
// set DATABASE_URL differently. No separate "environments" block, since this
// app only ever runs as one process against one database at a time.
//
// SSL is always on: the hosting Postgres rejects plaintext connections with
// "SSL/TLS required". rejectUnauthorized is off because the server presents a
// self-signed cert, and there is no CA bundle to validate it against.
module.exports = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};
