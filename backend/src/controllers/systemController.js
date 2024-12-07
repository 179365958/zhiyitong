const systemService = require('../services/systemService');
const logger = require('../utils/logger');

// 检查系统是否已初始化
exports.checkSystemInit = async (req, res) => {
    try {
        const result = await systemService.checkInitialized();
        return res.json(result);
    } catch (error) {
        logger.error('检查系统初始化状态失败:', error);
        return res.status(500).json({
            success: false,
            message: '检查系统状态失败: ' + error.message
        });
    }
};

// 验证数据库配置
exports.validateDbConfig = async (req, res) => {
    try {
        const result = await systemService.testDatabaseConnection(req.body);
        return res.json(result);
    } catch (error) {
        logger.error('验证数据库配置失败:', error);
        return res.status(500).json({
            success: false,
            message: '验证数据库配置失败: ' + error.message
        });
    }
};

// 初始化系统
exports.initializeSystem = async (req, res) => {
    try {
        const { dbConfig, adminUser } = req.body;
        const result = await systemService.initializeSystem(dbConfig, adminUser);
        return res.json(result);
    } catch (error) {
        logger.error('系统初始化失败:', error);
        return res.status(500).json({
            success: false,
            message: '系统初始化失败: ' + error.message
        });
    }
};

// 获取系统状态
exports.getSystemStatus = async (req, res) => {
    try {
        const status = {
            server: {
                status: 'running',
                startTime: global.serverStartTime,
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
                nodeVersion: process.version
            },
            database: {
                type: process.env.DB_TYPE || 'mysql',
                host: process.env.DB_HOST,
                initialized: false
            }
        };

        // 检查数据库连接
        try {
            const initStatus = await systemService.checkInitialized();
            status.database.initialized = initStatus.initialized;
            status.database.message = initStatus.message;
        } catch (error) {
            status.database.status = 'error';
            status.database.message = error.message;
        }

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('获取系统状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取系统状态失败: ' + error.message
        });
    }
};
