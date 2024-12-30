const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret_key', // JWT 签名密钥
  expiresIn: process.env.JWT_EXPIRES_IN || '24h', // JWT 过期时间
};