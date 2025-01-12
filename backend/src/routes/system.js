const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/auth');

/*
// 检查系统初始化状态
router.get('/check-init', authMiddleware, (req, res) => {
    // 处理检查初始化状态逻辑
});

// 验证数据库配置
router.post('/validate-db', authMiddleware, systemController.validateDbConfig);

// 初始化系统
router.post('/initialize', authMiddleware, (req, res) => {
    // 处理初始化逻辑
});

// 获取系统状态
router.get('/status', authMiddleware, systemController.getSystemStatus);

// 获取企业账套列表
router.get('/companies', authMiddleware, systemController.getCompanies);

// 用户登录
router.post('/login', systemController.login);

module.exports = router;
*/
// 检查系统初始化状态
router.get('/check-init', systemController.checkSystemInit);

// 验证数据库配置
router.post('/validate-db', systemController.validateDbConfig);

// 初始化系统
router.post('/initialize', systemController.initializeDatabase);

// 获取系统状态
router.get('/status', systemController.getSystemStatus);

// 获取企业账套列表
//router.get('/companies', systemController.getCompanies);
router.get('/companies', authMiddleware, systemController.getCompanies);

// 切换数据库
//router.post('/switch-database',  systemController.switchDatabase);
router.post('/switch-database', authMiddleware, systemController.switchDatabase);

// 用户登录
router.post('/login', systemController.login);

// 科目相关路由
router.get('/subjects',subjectController.getSubjects);
router.post('/subjects', authMiddleware, subjectController.addSubject);
router.put('/subjects/:id', authMiddleware, subjectController.updateSubject);
router.patch('/subjects/:id/status', authMiddleware, subjectController.toggleSubjectStatus);
router.post('/subjects/import', authMiddleware, subjectController.importSubjects);
router.get('/subjects/export', authMiddleware, subjectController.exportSubjects);

module.exports = router;