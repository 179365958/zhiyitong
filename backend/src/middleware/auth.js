// 引入 dotenv 以读取环境变量
require('dotenv').config();
const jwt = require('jsonwebtoken');

// 中间件函数
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: '未授权访问' });
    }

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