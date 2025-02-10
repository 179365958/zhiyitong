const voucherService = require('../services/voucherService');

// 创建凭证
exports.createVoucher = async (req, res) => {
  const voucherData = req.body.voucher;
  const entries = req.body.entries;

  try {
    await voucherService.createVoucher(req.database, voucherData, entries);
    res.status(201).json({ message: 'Voucher created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create voucher' });
  }
};