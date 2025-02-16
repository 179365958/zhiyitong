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

// 获取凭证列表
exports.getVoucherList = async (req, res) => {
  try {
    const vouchers = await voucherService.getVoucherList(req.database);
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voucher list' });
  }
};

// 获取凭证详情
exports.getVoucherDetail = async (req, res) => {
  const voucherId = req.params.id;

  try {
    const voucher = await voucherService.getVoucherDetail(req.database, voucherId);
    if (voucher) {
      res.status(200).json(voucher);
    } else {
      res.status(404).json({ error: 'Voucher not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voucher detail' });
  }
};

// 更新凭证
exports.updateVoucher = async (req, res) => {
  const voucherId = req.params.id;
  const voucherData = req.body.voucher;
  const entries = req.body.entries;

  try {
    await voucherService.updateVoucher(req.database, voucherId, voucherData, entries);
    res.status(200).json({ message: 'Voucher updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

// 删除凭证
exports.deleteVoucher = async (req, res) => {
  const voucherId = req.params.id;

  try {
    await voucherService.deleteVoucher(req.database, voucherId);
    res.status(200).json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};

// 提交凭证审核
exports.submitVoucherReview = async (req, res) => {
  const voucherId = req.params.id;

  try {
    await voucherService.submitVoucherReview(req.database, voucherId);
    res.status(200).json({ message: 'Voucher submitted for review successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit voucher for review' });
  }
};

// 审核凭证
exports.reviewVoucher = async (req, res) => {
  const voucherId = req.params.id;
  const reviewData = req.body;

  try {
    await voucherService.reviewVoucher(req.database, voucherId, reviewData);
    res.status(200).json({ message: 'Voucher reviewed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review voucher' });
  }
};

// 批量审核凭证
exports.batchReviewVouchers = async (req, res) => {
  const voucherIds = req.body.voucherIds;
  const reviewData = req.body.reviewData;

  try {
    await voucherService.batchReviewVouchers(req.database, voucherIds, reviewData);
    res.status(200).json({ message: 'Batch review completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to batch review vouchers' });
  }
};

// 获取下一个凭证号
exports.getNextVoucherNumber = async (req, res) => {
  try {
    console.log('Starting to get next voucher number');
    const database = req.database;
    console.log('Database object:', database);

    if (!database) {
      console.error('Database object is undefined or null');
      return res.status(500).json({ error: 'Database connection is not available' });
    }

    const nextVoucherNumber = await voucherService.getNextVoucherNumber(database);
    console.log('Next voucher number fetched successfully:', nextVoucherNumber);
    res.status(200).json({ nextVoucherNumber });
  } catch (error) {
    console.error('Failed to fetch next voucher number:', error);
    res.status(500).json({ error: 'Failed to fetch next voucher number!' });
  }
};

// 获取科目列表
exports.getAccountSubjects = async (req, res) => {
  try {
    const subjects = await voucherService.getAccountSubjects(req.database);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account subjects' });
  }
};

// 获取常用摘要
exports.getCommonAbstracts = async (req, res) => {
  try {
    const abstracts = await voucherService.getCommonAbstracts(req.database);
    res.status(200).json(abstracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch common abstracts' });
  }
};

// 保存常用摘要
exports.saveCommonAbstract = async (req, res) => {
  const abstractData = req.body;

  try {
    await voucherService.saveCommonAbstract(req.database, abstractData);
    res.status(201).json({ message: 'Common abstract saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save common abstract' });
  }
};

// 获取辅助核算项目
exports.getAuxiliaryItems = async (req, res) => {
  try {
    const items = await voucherService.getAuxiliaryItems(req.database);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auxiliary items' });
  }
};

// 导出凭证
exports.exportVouchers = async (req, res) => {
  try {
    const filePath = await voucherService.exportVouchers(req.database);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export vouchers' });
  }
};

// 导入凭证
exports.importVouchers = async (req, res) => {
  const file = req.file;

  try {
    await voucherService.importVouchers(req.database, file);
    res.status(200).json({ message: 'Vouchers imported successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import vouchers' });
  }
};