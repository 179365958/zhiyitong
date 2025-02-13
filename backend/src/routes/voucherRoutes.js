// backend/src/routes/voucherRoutes.js
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

// 创建凭证
router.post(
    '/vouchers',
    authMiddleware,
    voucherValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    voucherController.createVoucher
);

// 获取凭证列表
router.get('/vouchers', authMiddleware, voucherController.getVoucherList);

// 获取凭证详情
router.get('/vouchers/:id', authMiddleware, voucherController.getVoucherDetail);

// 更新凭证
router.put('/vouchers/:id', authMiddleware, voucherController.updateVoucher);

// 删除凭证
router.delete('/vouchers/:id', authMiddleware, voucherController.deleteVoucher);

// 提交凭证审核
router.post('/vouchers/:id/submit', authMiddleware, voucherController.submitVoucherReview);

// 审核凭证
router.post('/vouchers/:id/review', authMiddleware, voucherController.reviewVoucher);

// 批量审核凭证
router.post('/vouchers/batch-review', authMiddleware, voucherController.batchReviewVouchers);

// 获取下一个凭证号
router.get('/vouchers/number', authMiddleware, voucherController.getNextVoucherNumber);

// 获取科目列表
router.get('/account-subjects', authMiddleware, voucherController.getAccountSubjects);

// 获取常用摘要
router.get('/vouchers/common-abstracts', authMiddleware, voucherController.getCommonAbstracts);

// 保存常用摘要
router.post('/vouchers/common-abstracts', authMiddleware, voucherController.saveCommonAbstract);

// 获取辅助核算项目
router.get('/auxiliary-items', authMiddleware, voucherController.getAuxiliaryItems);

// 导出凭证
router.get('/vouchers/export', authMiddleware, voucherController.exportVouchers);

// 导入凭证
router.post('/vouchers/import', authMiddleware, voucherController.importVouchers);

module.exports = router;