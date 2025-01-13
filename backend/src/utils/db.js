const { pool } = require('../config/database');

exports.getConnection = async (database) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`USE \`${database}\``); // 使用反引号包裹数据库名称
    return connection;
  } catch (error) {
    connection.release();
    throw error;
  }
};