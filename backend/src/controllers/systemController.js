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
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        const result = await systemService.initializeSystem(username, password);
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
        const params = req.query;
        const result = await systemService.getCompanies(params);
        
        // 如果查询失败，返回错误
        if (!result.success) {
            return res.status(500).json(result);
        }

        // 确保返回的数据结构符合前端预期
        res.json({
            code: 200,
            data: result.data,
            message: 'success'
        });
    } catch (error) {
        console.error('获取企业账套列表错误:', error);
        res.status(500).json({
            code: 500,
            success: false,
            message: error.message || '获取企业账套列表失败'
        });
    }
};

// 创建企业账套
exports.createCompany = async (req, res) => {
    try {
        const companyData = req.body;
        const result = await systemService.createCompany(companyData);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '创建企业账套失败'
        });
    }
};

// 更新企业账套
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const companyData = req.body;
        const result = await systemService.updateCompany(id, companyData);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '更新企业账套失败'
        });
    }
};

// 删除企业账套
exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        await systemService.deleteCompany(id);
        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '删除企业账套失败'
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