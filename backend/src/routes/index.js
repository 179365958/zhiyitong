// backend/src/routes/index.js
const express = require('express');
const systemRoutes = require('./system');
const voucherRoutes = require('./voucherRoutes');
const subjectRoutes = require('./subjectRoutes');

const router = express.Router();

// 系统相关路由
router.use('/system', systemRoutes);

// 凭证相关路由
router.use('/vouchers', voucherRoutes);

router.use('/subjects', subjectRoutes);

module.exports = router;