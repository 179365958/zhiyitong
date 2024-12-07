const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

// 创建 Sequelize 实例
const createSequelize = () => {
    const dbType = process.env.DB_TYPE || 'mysql';
    const dbConfig = config[dbType];
    
    if (!dbConfig) {
        throw new Error(`不支持的数据库类型: ${dbType}`);
    }

    return new Sequelize({
        ...dbConfig,
        // 不指定数据库，这样可以在数据库不存在时也能连接
        database: undefined
    });
};

// 创建 Sequelize 实例
const sequelize = createSequelize();

// 初始化数据库连接
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('数据库连接成功');

        // 检查系统数据库是否存在
        const [results] = await sequelize.query(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
            {
                replacements: ['zyt_sys']
            }
        );

        if (results.length === 0) {
            logger.info('系统数据库不存在，跳过模型初始化');
            return;
        }

        // 如果数据库存在，切换到系统数据库
        await sequelize.query('USE zyt_sys');
        
        // 初始化模型
        await initializeModels();
    } catch (error) {
        logger.error('数据库连接失败:', error);
    }
};

// 导出模型
const db = {
    sequelize,
    Sequelize,
    SystemConfig: null
};

// 初始化模型
const initializeModels = async () => {
    // 导入模型定义
    db.SystemConfig = require('./systemConfig')(sequelize, Sequelize);
    
    // 同步所有模型
    await sequelize.sync();
    logger.info('模型初始化成功');
};

// 初始化
initializeDatabase().catch(error => {
    logger.error('模型初始化失败:', error);
});

module.exports = db;
