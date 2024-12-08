const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// 检查系统初始化状态
router.get('/check-init', systemController.checkSystemInit);

// 验证数据库配置
router.post('/validate-db', systemController.validateDbConfig);

// 初始化系统
router.post('/initialize', systemController.initializeSystem);

// 获取系统状态
router.get('/status', systemController.getSystemStatus);

// 获取企业账套列表
router.get('/companies', systemController.getCompanies);

// 用户登录
router.post('/login', systemController.login);

module.exports = router;
