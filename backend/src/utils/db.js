const { pool } = require('../config/database');

exports.getConnection = async (database) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`USE ${database}`);
    return connection;
  } catch (error) {
    connection.release(); // 移除 await 关键字
    throw error;
  }
};