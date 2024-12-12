const systemService = require('../services/systemService');

// 检查系统初始化状态
exports.checkSystemInit = async (req, res) => {
    try {
        const status = await systemService.checkSystemInit();
        res.json(status);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '检查系统初始化状态失败'
        });
    }
};

// 验证数据库配置
exports.validateDbConfig = async (req, res) => {
    try {
        const result = await systemService.validateDbConfig(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '验证数据库配置失败'
        });
    }
};

// 初始化系统
exports.initializeSystem = async (req, res) => {
    try {
        const result = await systemService.initializeSystem();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '系统初始化失败'
        });
    }
};

// 获取系统状态
exports.getSystemStatus = async (req, res) => {
    try {
        const status = await systemService.getSystemStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '获取系统状态失败'
        });
    }
};

// 获取企业账套列表
exports.getCompanies = async (req, res) => {
    try {
        const companies = await systemService.getCompanies();
        res.json(companies);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '获取企业账套列表失败'
        });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await systemService.login(username, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '登录失败'
        });
    }
};