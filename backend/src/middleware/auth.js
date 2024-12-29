const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: '未授权访问' });
    }

    jwt.verify(token, '你的密钥', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: '无效的令牌' });
        }
        req.user = decoded; // 将解码后的用户信息附加到请求对象上
        next();
    });
};

module.exports = authMiddleware;
