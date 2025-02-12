const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
// 加载环境变量
dotenv.config();


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_SYS_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  const pool = mysql.createPool(dbConfig);
  
  module.exports = {
    pool,
    dbConfig
  };