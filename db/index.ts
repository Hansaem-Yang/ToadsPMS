import 'dotenv/config';
import sql, { config as SqlConfig, ConnectionPool } from 'mssql';

let pool: ConnectionPool | null = null;

const config: SqlConfig = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  server: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME!,
  options: {
    encrypt: false,             // 로컬 테스트용
    trustServerCertificate: true,
  },
};

export async function getSql() {
  return sql;
}

export async function getPool(): Promise<ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}

export async function query<T = any>(queryString: string, params?: { name: string, value: any }[]) {
  const pool = await getPool();
  const request = pool.request();

  // 파라미터 바인딩
  params?.forEach(p => request.input(p.name, p.value));

  const result = await request.query<T>(queryString);
  return result.recordset;
}

export async function execute<T = any>(queryString: string, params?: { name: string, value: any }[]) {
  const pool = await getPool();
  const request = pool.request();

  // 파라미터 바인딩
  params?.forEach(p => request.input(p.name, p.value));

  const result = await request.query<T>(queryString);
  return result.rowsAffected[0];
}