import oracledb from 'oracledb';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let poolRef = null;

export async function getPool() {
  if (poolRef) return poolRef;

  const walletDir = process.env.ORACLE_WALLET_DIR
    ? path.resolve(process.env.ORACLE_WALLET_DIR)
    : null;

  const poolConfig = walletDir
    ? {
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING,
        walletLocation: walletDir,
        configDir: walletDir,
        poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
        poolMax: Number(process.env.ORACLE_POOL_MAX || 5),
        poolIncrement: Number(process.env.ORACLE_POOL_INC || 1)
      }
    : {
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
        poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
        poolMax: Number(process.env.ORACLE_POOL_MAX || 5),
        poolIncrement: Number(process.env.ORACLE_POOL_INC || 1)
      };

  poolRef = await oracledb.createPool(poolConfig);
  return poolRef;
}

export async function withConnection(run) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    return await run(connection);
  } finally {
    await connection.close();
  }
}

export async function closePool() {
  if (poolRef) {
    await poolRef.close(0);
    poolRef = null;
  }
}


