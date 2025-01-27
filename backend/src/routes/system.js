const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/auth');

// 检查系统初始化状态
router.get('/check-init', systemController.checkSystemInit, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 验证数据库配置
router.post('/validate-db', systemController.validateDbConfig, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 初始化系统
router.post('/initialize', systemController.initializeDatabase, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 获取系统状态
router.get('/status', systemController.getSystemStatus, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 获取企业账套列表
router.get('/companies', authMiddleware, systemController.getCompanies, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 创建账套
router.post('/createCompany', authMiddleware, systemController.createCompany, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 更新账套
router.put('/updateCompany/:id', authMiddleware, systemController.updateCompany, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
// 删除账套
router.delete('/deleteCompany/:id', authMiddleware, systemController.deleteCompany, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 备份账套
router.post('/companies/:id/backup', authMiddleware, systemController.backupCompany, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 切换数据库
router.post('/switch-database', authMiddleware, systemController.switchDatabase, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 用户登录
router.post('/login', systemController.login, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 科目相关路由
router.get('/subjects', subjectController.getSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
router.post('/subjects', authMiddleware, subjectController.addSubject, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
router.put('/subjects/:id', authMiddleware, subjectController.updateSubject, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
router.patch('/subjects/:id/status', authMiddleware, subjectController.toggleSubjectStatus, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
router.post('/subjects/import', authMiddleware, subjectController.importSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
router.get('/subjects/export', authMiddleware, subjectController.exportSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;