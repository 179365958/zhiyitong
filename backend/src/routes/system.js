const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// 检查系统初始化状态
router.get('/check-init', systemController.checkSystemInit);

// 初始化系统
router.post('/initialize', systemController.initializeSystem);

module.exports = router;
