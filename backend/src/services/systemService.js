const mysql = require('mysql2/promise');
const config = require('../config/database');

// 检查系统初始化状态
exports.checkSystemInit = async () => {
    try {
        // 检查数据库连接
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        // 检查数据库是否存在
        const [rows] = await connection.query(`SHOW DATABASES LIKE '${config.database}'`);
        const dbExists = rows.length > 0;

        await connection.end();

        return {
            success: true,
            initialized: dbExists,
            message: dbExists ? '系统已初始化' : '系统未初始化'
        };
    } catch (error) {
        return {
            success: false,
            initialized: false,
            message: '数据库连接失败：' + error.message
        };
    }
};

// 验证数据库配置
exports.validateDbConfig = async (dbConfig) => {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.end();
        return {
            success: true,
            message: '数据库配置有效'
        };
    } catch (error) {
        return {
            success: false,
            message: '数据库配置无效：' + error.message
        };
    }
};

// 初始化系统
exports.initializeSystem = async () => {
    try {
        // 创建数据库连接
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        // 创建数据库
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
        await connection.query(`USE ${config.database}`);

        // 创建必要的表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.end();

        return {
            success: true,
            message: '系统初始化成功'
        };
    } catch (error) {
        return {
            success: false,
            message: '系统初始化失败：' + error.message
        };
    }
};

// 获取系统状态
exports.getSystemStatus = async () => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [dbSize] = await connection.query(`
            SELECT table_schema AS 'database',
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
            FROM information_schema.tables
            WHERE table_schema = ?
            GROUP BY table_schema
        `, [config.database]);

        await connection.end();

        return {
            success: true,
            status: {
                database: config.database,
                size: dbSize[0]?.size_mb || 0,
                uptime: process.uptime()
            }
        };
    } catch (error) {
        return {
            success: false,
            message: '获取系统状态失败：' + error.message
        };
    }
};

// 获取企业账套列表
exports.getCompanies = async () => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [companies] = await connection.query('SELECT * FROM companies');
        await connection.end();

        return {
            success: true,
            data: companies
        };
    } catch (error) {
        return {
            success: false,
            message: '获取企业账套列表失败：' + error.message
        };
    }
};

// 用户登录
exports.login = async (username, password) => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        await connection.end();

        if (users.length === 0) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        const user = users[0];
        // 这里应该添加密码验证逻辑
        if (password !== user.password) { // 注意：实际应用中应该使用加密后的密码比较
            return {
                success: false,
                message: '密码错误'
            };
        }

        return {
            success: true,
            data: {
                id: user.id,
                username: user.username
            }
        };
    } catch (error) {
        return {
            success: false,
            message: '登录失败：' + error.message
        };
    }
};