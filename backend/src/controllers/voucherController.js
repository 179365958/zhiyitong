// src/controllers/voucherController.js
const voucherService = require('../services/voucherService');

// 创建凭证
exports.createVoucher = async (req, res) => {
  const voucherData = req.body.voucher;
  const entries = req.body.entries;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.createVoucher(database, voucherData, entries);
    res.status(201).json({ message: 'Voucher created successfully' });
  } catch (error) {
    console.error('创建凭证失败:', error);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
};

// 获取凭证列表
exports.getVoucherList = async (req, res) => {
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const vouchers = await voucherService.getVoucherList(database);
    res.status(200).json(vouchers);
  } catch (error) {
    console.error('获取凭证列表失败:', error);
    res.status(500).json({ error: 'Failed to fetch voucher list' });
  }
};

// 获取凭证详情
exports.getVoucherDetail = async (req, res) => {
  const voucherId = req.params.id;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const voucher = await voucherService.getVoucherDetail(database, voucherId);
    if (voucher) {
      res.status(200).json(voucher);
    } else {
      res.status(404).json({ error: 'Voucher not found' });
    }
  } catch (error) {
    console.error('获取凭证详情失败:', error);
    res.status(500).json({ error: 'Failed to fetch voucher detail' });
  }
};

// 更新凭证
exports.updateVoucher = async (req, res) => {
  const voucherId = req.params.id;
  const voucherData = req.body.voucher;
  const entries = req.body.entries;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.updateVoucher(database, voucherId, voucherData, entries);
    res.status(200).json({ message: 'Voucher updated successfully' });
  } catch (error) {
    console.error('更新凭证失败:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

// 删除凭证
exports.deleteVoucher = async (req, res) => {
  const voucherId = req.params.id;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.deleteVoucher(database, voucherId);
    res.status(200).json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('删除凭证失败:', error);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};

// 提交凭证审核
exports.submitVoucherReview = async (req, res) => {
  const voucherId = req.params.id;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.submitVoucherReview(database, voucherId);
    res.status(200).json({ message: 'Voucher submitted for review successfully' });
  } catch (error) {
    console.error('提交凭证审核失败:', error);
    res.status(500).json({ error: 'Failed to submit voucher for review' });
  }
};

// 审核凭证
exports.reviewVoucher = async (req, res) => {
  const voucherId = req.params.id;
  const reviewData = req.body;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.reviewVoucher(database, voucherId, reviewData);
    res.status(200).json({ message: 'Voucher reviewed successfully' });
  } catch (error) {
    console.error('审核凭证失败:', error);
    res.status(500).json({ error: 'Failed to review voucher' });
  }
};

// 批量审核凭证
exports.batchReviewVouchers = async (req, res) => {
  const voucherIds = req.body.voucherIds;
  const reviewData = req.body.reviewData;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.batchReviewVouchers(database, voucherIds, reviewData);
    res.status(200).json({ message: 'Batch review completed successfully' });
  } catch (error) {
    console.error('批量审核凭证失败:', error);
    res.status(500).json({ error: 'Failed to batch review vouchers' });
  }
};

// 获取下一个凭证号
exports.getNextVoucherNumber = async (req, res) => {
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    console.log('Starting to get next voucher number');
    console.log('Database object:', database);

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
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const subjects = await voucherService.getAccountSubjects(database);
    res.status(200).json(subjects);
  } catch (error) {
    console.error('获取科目列表失败:', error);
    res.status(500).json({ error: 'Failed to fetch account subjects' });
  }
};

// 获取常用摘要
exports.getCommonAbstracts = async (req, res) => {
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const abstracts = await voucherService.getCommonAbstracts(database);
    res.status(200).json(abstracts);
  } catch (error) {
    console.error('获取常用摘要失败:', error);
    res.status(500).json({ error: 'Failed to fetch common abstracts' });
  }
};

// 保存常用摘要
exports.saveCommonAbstract = async (req, res) => {
  const abstractData = req.body;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.saveCommonAbstract(database, abstractData);
    res.status(201).json({ message: 'Common abstract saved successfully' });
  } catch (error) {
    console.error('保存常用摘要失败:', error);
    res.status(500).json({ error: 'Failed to save common abstract' });
  }
};

// 获取辅助核算项目
exports.getAuxiliaryItems = async (req, res) => {
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const items = await voucherService.getAuxiliaryItems(database);
    res.status(200).json(items);
  } catch (error) {
    console.error('获取辅助核算项目失败:', error);
    res.status(500).json({ error: 'Failed to fetch auxiliary items' });
  }
};

// 导出凭证
exports.exportVouchers = async (req, res) => {
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    const filePath = await voucherService.exportVouchers(database);
    res.download(filePath);
  } catch (error) {
    console.error('导出凭证失败:', error);
    res.status(500).json({ error: 'Failed to export vouchers' });
  }
};

// 导入凭证
exports.importVouchers = async (req, res) => {
  const file = req.file;
  const database = req.session.currentDatabase; // 从会话中获取当前数据库名称

  if (!database) {
    return res.status(400).json({ success: false, message: '未选择数据库' });
  }

  try {
    await voucherService.importVouchers(database, file);
    res.status(200).json({ message: 'Vouchers imported successfully' });
  } catch (error) {
    console.error('导入凭证失败:', error);
    res.status(500).json({ error: 'Failed to import vouchers' });
  }
};