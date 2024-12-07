require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const systemRoutes = require('./routes/system');
const path = require('path');

// 记录服务器启动时间
global.serverStartTime = new Date();

const app = express();

// 配置 CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// 解析 JSON 请求体
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API 路由配置
app.use('/api/system', systemRoutes);

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error('应用错误:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : '服务器内部错误'
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`服务器已启动，监听端口 ${PORT}`);
    logger.info(`环境: ${process.env.NODE_ENV}`);
    logger.info(`数据库类型: ${process.env.DB_TYPE}`);
});