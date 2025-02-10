// backend/src/middleware/auth.js
//require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未授权访问' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: '无效的令牌' });
        }
        req.user = decoded;

        // 检查用户是否有创建凭证的权限
        if (!req.user.roles.includes('admin') && !req.user.roles.includes('accountant')) {
            return res.status(403).json({ message: '没有足够的权限' });
        }

        next();
    });
};

module.exports = authMiddleware;