const winston = require('winston');
const path = require('path');
require('dotenv').config();

// 确保日志目录存在
const fs = require('fs');
const logDir = path.join(__dirname, '../../', process.env.LOG_PATH || 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 日志格式
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// 创建日志记录器
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // 错误日志写入文件
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        // 所有日志写入文件
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        })
    ]
});

// 在开发环境下，同时输出到控制台
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;
