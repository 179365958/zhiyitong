const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

let sequelize = null;

// 创建 Sequelize 实例的函数
const createSequelize = () => {
    const dbType = process.env.DB_TYPE || 'mysql';
    const dbConfig = config[dbType];
    
    if (!dbConfig) {
        throw new Error(`不支持的数据库类型: ${dbType}`);
    }

    return new Sequelize(dbConfig);
};

// 初始化数据库连接
const initializeDatabase = async () => {
    try {
        if (!sequelize) {
            sequelize = createSequelize();
        }
        await sequelize.authenticate();
        logger.info('数据库连接成功');
    } catch (error) {
        if (error.original?.code === 'ER_BAD_DB_ERROR') {
            logger.info('系统数据库未创建，跳过模型初始化');
            return;
        }
        logger.error('数据库连接失败:', error);
        throw error;
    }
};

// 导出模型
const db = {
    sequelize: null,
    Sequelize,
    SystemConfig: null
};

// 初始化模型
const initializeModels = () => {
    if (!sequelize) return;

    // 导入模型定义
    db.SystemConfig = require('./systemConfig')(sequelize, Sequelize);

    // 设置模型关联
    Object.values(db).forEach(model => {
        if (model && model.associate) {
            model.associate(db);
        }
    });
};

// 初始化
initializeDatabase()
    .then(() => {
        if (sequelize) {
            db.sequelize = sequelize;
            initializeModels();
        }
    })
    .catch(error => {
        logger.error('模型初始化失败:', error);
    });

module.exports = db;
