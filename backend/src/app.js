require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const systemRoutes = require('./routes/system');
const path = require('path');

const app = express();

// 配置 CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// API 路由配置
app.use('/api/system', systemRoutes);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error('应用错误:', err);
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        message: isDevelopment ? err.message : '服务器内部错误',
        stack: isDevelopment ? err.stack : undefined
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`服务器已启动，监听端口 ${PORT}`);
});