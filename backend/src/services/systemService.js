const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const hashPassword = require('../utils/hashPassword'); // Assuming hashPassword is defined in this file

const sequelize = new Sequelize(process.env.DB_SYS_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    port: process.env.DB_PORT,
});

// 测试数据库连接
const testDatabaseConnection = async (dbConfig) => {
    try {
        const sequelizeTest = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            dialect: 'mysql',
        });
        await sequelizeTest.authenticate();
        return { success: true, message: '数据库连接成功' };
    } catch (error) {
        logger.error('数据库连接失败:', error);
        return { success: false, message: '数据库连接失败: ' + error.message };
    }
};

// 执行 SQL 命令
const executeSqlCommands = async (sqlCommands) => {
    try {
        await sequelize.query(sqlCommands);
        logger.info('SQL 命令执行成功');
    } catch (error) {
        logger.error('执行 SQL 命令失败:', error);
        throw new Error('执行 SQL 命令失败: ' + error.message);
    }
};

// 检查系统初始化状态
const checkInitialized = async () => {
    try {
        const [results] = await sequelize.query(
            'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', { replacements: ['zyt_sys'] }
        );
        return results && results.length > 0;
    } catch (error) {
        logger.error('检查系统初始化状态失败:', error);
        return false;
    }
};

// 检查并创建数据库
const checkAndCreateDatabase = async () => {
    const sequelizeTemp = new Sequelize(process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_TYPE,
        port: process.env.DB_PORT,
    });

    const [results] = await sequelizeTemp.query(
        'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', { replacements: ['zyt_sys'] }
    );

    if (results.length === 0) {
        // 数据库不存在，创建数据库
        await sequelizeTemp.query(
            'CREATE DATABASE zyt_sys DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci'
        );
        logger.info('数据库 zyt_sys 创建成功');
    } else {
        logger.info('数据库 zyt_sys 已存在');
    }
};

// 连接到数据库之前检查并创建数据库
const initializeDatabaseConnection = async () => {
    await checkAndCreateDatabase(); // 检查并创建数据库
    // 重新初始化 Sequelize 连接
    sequelize = new Sequelize(process.env.DB_SYS_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_TYPE,
        port: process.env.DB_PORT,
    });
};

// 执行 SQL 初始化
const executeSqlInitialization = async () => {
    // 1. 执行 SQL 脚本以创建数据库和表
    const sqlFilePath = path.join(__dirname, '../../sql/01_create_system_db.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    await checkAndCreateDatabase();
    await executeSqlCommands(sqlCommands);

    // 2. 检查 sys_user 表是否存在
    const [results] = await sequelize.query(
        'SHOW TABLES LIKE "sys_user"'
    );

    if (results.length === 0) {
        throw new Error('用户表 sys_user 不存在，无法插入管理员信息');
    }
};

// 写入管理员信息
const writeAdminInfo = async (adminUser) => {
    // 3. 插入管理员信息
    const hashedPassword = await hashPassword(adminUser.password);
    await sequelize.query(
        `INSERT INTO sys_user (username, password, real_name, created_at, created_by) VALUES 
        (:username, :password, :real_name, NOW(), 1)`,
        { 
            replacements: {
                username: adminUser.username,
                password: hashedPassword,
                real_name: adminUser.realName || '系统管理员'
            }
        }
    );
};

// 初始化系统
const initializeSystem = async (dbConfig, adminUser) => {
    await initializeDatabaseConnection(); // 连接到数据库之前检查并创建数据库
    await executeSqlInitialization();
    await writeAdminInfo(adminUser);
    return { success: true, message: '系统初始化成功' };
};

module.exports = { testDatabaseConnection, executeSqlCommands, initializeSystem, checkInitialized };
