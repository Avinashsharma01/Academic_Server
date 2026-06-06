import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
  host: process.env.POSTGRES_HOST || process.env.PGHOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 5432),
  user: process.env.POSTGRES_USER || process.env.PGUSER || "postgres",
  password: String(process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || "root"),
  database: process.env.POSTGRES_DB || process.env.PGDATABASE || "postgres",
  ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

export default pool;