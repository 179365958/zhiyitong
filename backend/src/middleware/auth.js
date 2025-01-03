// backend/src/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未授权访问' });
    }

    const token = authHeader.split(' ')[1];

    // 使用环境变量中的密钥进行验证
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: '无效的令牌' });
        }
        req.user = decoded; // 将解码后的用户信息附加到请求对象上
        next();
    });
};

module.exports = authMiddleware;