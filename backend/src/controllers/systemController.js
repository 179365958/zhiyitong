const { SystemConfig } = require('../models');
const { sequelize } = require('../utils/database');
const logger = require('../utils/logger');

// 检查系统是否已初始化
exports.checkSystemInit = async (req, res) => {
    try {
        // 1. 检查系统数据库是否存在
        const [results] = await sequelize.query(
            'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
            {
                replacements: ['zyt_sys'],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!results) {
            return res.json({
                initialized: false,
                step: 'database',
                message: '系统数据库未创建'
            });
        }

        // 2. 检查必要的表是否存在
        const tables = ['sys_config', 'sys_user', 'sys_role', 'sys_permission'];
        for (const table of tables) {
            const [tableExists] = await sequelize.query(
                'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
                {
                    replacements: ['zyt_sys', table],
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!tableExists) {
                return res.json({
                    initialized: false,
                    step: 'tables',
                    message: '系统表未完全创建'
                });
            }
        }

        // 3. 检查是否存在管理员账户
        const [adminExists] = await sequelize.query(
            'SELECT COUNT(*) as count FROM zyt_sys.sys_user WHERE is_admin = 1',
            {
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!adminExists || adminExists.count === 0) {
            return res.json({
                initialized: false,
                step: 'admin',
                message: '管理员账户未创建'
            });
        }

        // 系统已完全初始化
        return res.json({
            initialized: true,
            message: '系统已初始化'
        });

    } catch (error) {
        logger.error('检查系统初始化状态失败:', error);
        return res.status(200).json({
            initialized: false,
            step: 'error',
            message: '检查系统状态失败: ' + (error.message || '未知错误')
        });
    }
};

// 初始化系统
exports.initializeSystem = async (req, res) => {
    const { 
        dbConfig,    // 数据库配置
        adminUser    // 管理员账户信息
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // 1. 创建系统数据库
        await sequelize.query('CREATE DATABASE IF NOT EXISTS zyt_sys');

        // 2. 创建系统表
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS zyt_sys.sys_config (
                id INT PRIMARY KEY AUTO_INCREMENT,
                config_key VARCHAR(50) NOT NULL UNIQUE,
                config_value TEXT,
                description VARCHAR(200),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `, { transaction });

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS zyt_sys.sys_user (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                real_name VARCHAR(50),
                email VARCHAR(100),
                phone VARCHAR(20),
                is_admin TINYINT(1) NOT NULL DEFAULT 0,
                status TINYINT NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `, { transaction });

        // 3. 创建管理员账户
        const { username, password, realName, email } = adminUser;
        await sequelize.query(`
            INSERT INTO zyt_sys.sys_user (username, password, real_name, email, is_admin)
            VALUES (?, ?, ?, ?, 1)
        `, {
            replacements: [username, password, realName, email],
            transaction
        });

        // 4. 保存系统配置
        await sequelize.query(`
            INSERT INTO zyt_sys.sys_config (config_key, config_value, description)
            VALUES ('system_initialized', 'true', '系统是否已初始化'),
                   ('init_time', NOW(), '系统初始化时间')
        `, { transaction });

        await transaction.commit();

        return res.json({
            success: true,
            message: '系统初始化成功'
        });

    } catch (error) {
        await transaction.rollback();
        logger.error('系统初始化失败:', error);
        return res.status(500).json({
            success: false,
            message: '系统初始化失败',
            error: error.message
        });
    }
};
