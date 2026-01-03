const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
};

const getConnection = async () => {
  const dbPool = createPool();
  return await dbPool.getConnection();
};

const query = async (sql, params = []) => {
  const dbPool = createPool();
  try {
    const [results] = await dbPool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const testConnection = async () => {
  try {
    const connection = await getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  query,
  getConnection,
  testConnection,
  pool: () => pool
};
