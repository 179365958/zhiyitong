const systemService = require('../services/systemService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

        // 1. 检查数据库连接
        const connectionResult = await systemService.testDatabaseConnection(dbConfig);
        if (!connectionResult.success) {
            return res.status(400).json({ success: false, message: '数据库连接失败' });
        }

        // 2. 执行 SQL 脚本
        const sqlFilePath = path.join(__dirname, '../../sql/01_create_system_db.sql');
        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

        await systemService.executeSqlCommands(sqlCommands);

        // 3. 初始化系统
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

// 获取企业账套列表
exports.getCompanies = async (req, res) => {
    try {
        const companies = await systemService.getCompanyList();
        return res.json({
            success: true,
            data: companies
        });
    } catch (error) {
        logger.error('获取企业账套列表失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取企业账套列表失败: ' + error.message
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

// 登录接口
exports.login = async (req, res) => {
    try {
        const { serverAddress, companyId, username, password, loginDate } = req.body;

        // 参数校验
        if (!serverAddress || !companyId || !username || !password) {
            return res.status(400).json({
                success: false,
                message: '登录参数不完整'
            });
        }

        // 调用登录服务
        const loginResult = await systemService.login({
            serverAddress,
            companyId,
            username,
            password,
            loginDate
        });

        // 登录成功
        if (loginResult.success) {
            return res.json({
                success: true,
                message: '登录成功',
                data: {
                    user: loginResult.user,
                    token: loginResult.token
                }
            });
        } else {
            // 登录失败
            return res.status(401).json({
                success: false,
                message: loginResult.message || '登录失败'
            });
        }
    } catch (error) {
        logger.error('登录过程发生错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};
