// src/routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// 数据验证规则
const voucherValidation = [
    body('voucher.period_id').isInt().withMessage('period_id 必须是整数'),
    body('voucher.voucher_type').isString().withMessage('voucher_type 必须是字符串'),
    body('voucher.voucher_no').isString().withMessage('voucher_no 必须是字符串'),
    body('voucher.voucher_date').isISO8601().withMessage('voucher_date 必须是有效的日期'),
    body('voucher.summary').optional().isString().withMessage('summary 必须是字符串'),
    body('voucher.total_debit').isDecimal().withMessage('total_debit 必须是十进制数'),
    body('voucher.total_credit').isDecimal().withMessage('total_credit 必须是十进制数'),
    body('voucher.created_by').isInt().withMessage('created_by 必须是整数'),
    body('entries').isArray({ min: 1 }).withMessage('entries 必须是非空数组'),
    body('entries.*.subject_id').isInt().withMessage('subject_id 必须是整数'),
    body('entries.*.summary').optional().isString().withMessage('summary 必须是字符串'),
    body('entries.*.currency_id').isInt().withMessage('currency_id 必须是整数'),
    body('entries.*.exchange_rate').isDecimal().withMessage('exchange_rate 必须是十进制数'),
    body('entries.*.debit_amount').isDecimal().withMessage('debit_amount 必须是十进制数'),
    body('entries.*.credit_amount').isDecimal().withMessage('credit_amount 必须是十进制数'),
    body('entries.*.entry_order').isInt().withMessage('entry_order 必须是整数'),
    body('entries.*.created_by').isInt().withMessage('created_by 必须是整数')
];

// 自定义中间件：打印接收到的数据
const logRequestBody = (req, res, next) => {
    console.log('Received Data:', req.body);
    next();
};

// 创建凭证
router.post(
    '/',
    authMiddleware,
    logRequestBody, 
    voucherValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    voucherController.createVoucher,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取凭证列表
router.get(
    '/',
    authMiddleware,
    voucherController.getVoucherList,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取下一个凭证号
router.get(
    '/number',
    authMiddleware,
    voucherController.getNextVoucherNumber,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取凭证详情
router.get(
    '/:id',
    authMiddleware,
    voucherController.getVoucherDetail,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 更新凭证
router.put(
    '/:id',
    authMiddleware,
    voucherController.updateVoucher,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 删除凭证
router.delete(
    '/:id',
    authMiddleware,
    voucherController.deleteVoucher,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 提交凭证审核
router.post(
    '/:id/submit',
    authMiddleware,
    voucherController.submitVoucherReview,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 审核凭证
router.post(
    '/:id/review',
    authMiddleware,
    voucherController.reviewVoucher,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 批量审核凭证
router.post(
    '/batch-review',
    authMiddleware,
    voucherController.batchReviewVouchers,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取科目列表
router.get(
    '/account-subjects',
    authMiddleware,
    voucherController.getAccountSubjects,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取常用摘要
router.get(
    '/common-abstracts',
    authMiddleware,
    voucherController.getCommonAbstracts,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 保存常用摘要
router.post(
    '/common-abstracts',
    authMiddleware,
    voucherController.saveCommonAbstract,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 获取辅助核算项目
router.get(
    '/auxiliary-items',
    authMiddleware,
    voucherController.getAuxiliaryItems,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 导出凭证
router.get(
    '/export',
    authMiddleware,
    voucherController.exportVouchers,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

// 导入凭证
router.post(
    '/import',
    authMiddleware,
    voucherController.importVouchers,
    (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    }
);

module.exports = router;