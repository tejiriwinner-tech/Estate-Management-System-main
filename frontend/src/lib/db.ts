import postgres from "postgres";

const defaultUrl =
  "postgresql://postgres.pcckpgzapymifibcdlaf:LincolnEstate@123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

const connectionString = process.env.DATABASE_URL || defaultUrl;

declare global {
  var _sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  global._sql ||
  postgres(connectionString, {
    ssl: "require",
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

global._sql = sql;

export default sql;
