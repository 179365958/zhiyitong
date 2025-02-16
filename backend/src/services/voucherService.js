// src/services/voucherService.js
const { getConnection } = require('../utils/db');

// 创建凭证
async function createVoucher(database, voucherData, entries) {
  let connection;

  try {
    connection = await getConnection(database);
    await connection.beginTransaction();

    // 1. 插入凭证记录
    const [voucherResult] = await connection.execute(
      'INSERT INTO voucher (period_id, voucher_type, voucher_no, voucher_date, summary, total_debit, total_credit, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        voucherData.period_id,
        voucherData.voucher_type,
        voucherData.voucher_no,
        voucherData.voucher_date,
        voucherData.summary,
        voucherData.total_debit,
        voucherData.total_credit,
        voucherData.created_by,
        new Date()
      ]
    );

    const voucherId = voucherResult.insertId;

    // 2. 插入分录记录
    for (const entry of entries) {
      await connection.execute(
        'INSERT INTO voucher_entry (voucher_id, subject_id, summary, currency_id, exchange_rate, debit_amount, credit_amount, entry_order, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          voucherId,
          entry.subject_id,
          entry.summary,
          entry.currency_id,
          entry.exchange_rate,
          entry.debit_amount,
          entry.credit_amount,
          entry.entry_order,
          new Date(),
          entry.created_by
        ]
      );
    }

    // 3. 更新科目余额
    for (const entry of entries) {
      const debitOrCredit = entry.debit_amount > 0 ? 'debit' : 'credit';
      const amount = entry.debit_amount > 0 ? entry.debit_amount : entry.credit_amount;

      await connection.execute(
        `UPDATE subject_balance
         SET period_${debitOrCredit} = period_${debitOrCredit} + ?,
             end_${debitOrCredit} = end_${debitOrCredit} + ?
         WHERE period_id = ? AND subject_id = ? AND currency_id = ?`,
        [amount, amount, voucherData.period_id, entry.subject_id, entry.currency_id]
      );
    }

    // 提交事务
    await connection.commit();
    console.log('Transaction committed successfully');
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error('Transaction rolled back due to error:', error);
    }
    throw error; // 抛出错误，由控制器处理
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 获取凭证列表
async function getVoucherList(database) {
  const connection = await getConnection(database);
  try {
    const [vouchers] = await connection.execute('SELECT * FROM voucher');
    return vouchers;
  } finally {
    connection.release();
  }
}

// 获取凭证详情
async function getVoucherDetail(database, voucherId) {
  const connection = await getConnection(database);
  try {
    const [voucher] = await connection.execute('SELECT * FROM voucher WHERE id = ?', [voucherId]);
    if (voucher.length > 0) {
      const [entries] = await connection.execute('SELECT * FROM voucher_entry WHERE voucher_id = ?', [voucherId]);
      return { ...voucher[0], entries };
    }
    return null;
  } finally {
    connection.release();
  }
}

// 更新凭证
async function updateVoucher(database, voucherId, voucherData, entries) {
  let connection;
  try {
    connection = await getConnection(database);
    await connection.beginTransaction();

    // 1. 更新凭证记录
    await connection.execute(
      'UPDATE voucher SET period_id = ?, voucher_type = ?, voucher_no = ?, voucher_date = ?, summary = ?, total_debit = ?, total_credit = ? WHERE id = ?',
      [
        voucherData.period_id,
        voucherData.voucher_type,
        voucherData.voucher_no,
        voucherData.voucher_date,
        voucherData.summary,
        voucherData.total_debit,
        voucherData.total_credit,
        voucherId
      ]
    );

    // 2. 删除旧的分录记录
    await connection.execute('DELETE FROM voucher_entry WHERE voucher_id = ?', [voucherId]);

    // 3. 插入新的分录记录
    for (const entry of entries) {
      await connection.execute(
        'INSERT INTO voucher_entry (voucher_id, subject_id, summary, currency_id, exchange_rate, debit_amount, credit_amount, entry_order, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          voucherId,
          entry.subject_id,
          entry.summary,
          entry.currency_id,
          entry.exchange_rate,
          entry.debit_amount,
          entry.credit_amount,
          entry.entry_order,
          new Date(),
          entry.created_by
        ]
      );
    }

    // 提交事务
    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 删除凭证
async function deleteVoucher(database, voucherId) {
  const connection = await getConnection(database);
  try {
    await connection.execute('DELETE FROM voucher WHERE id = ?', [voucherId]);
  } finally {
    connection.release();
  }
}

// 提交凭证审核
async function submitVoucherReview(database, voucherId) {
  const connection = await getConnection(database);
  try {
    await connection.execute('UPDATE voucher SET status = "submitted" WHERE id = ?', [voucherId]);
  } finally {
    connection.release();
  }
}

// 审核凭证
async function reviewVoucher(database, voucherId, reviewData) {
  const connection = await getConnection(database);
  try {
    await connection.execute('UPDATE voucher SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?', [
      reviewData.status,
      reviewData.reviewed_by,
      new Date(),
      voucherId
    ]);
  } finally {
    connection.release();
  }
}

// 批量审核凭证
async function batchReviewVouchers(database, voucherIds, reviewData) {
  const connection = await getConnection(database);
  try {
    await connection.execute(
      'UPDATE voucher SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id IN (?)',
      [reviewData.status, reviewData.reviewed_by, new Date(), voucherIds]
    );
  } finally {
    connection.release();
  }
}

// 获取下一个凭证号
async function getNextVoucherNumber(database) {
  const connection = await getConnection(database);
  try {
    console.log('Executing query to get next voucher number');
    const [result] = await connection.execute('SELECT MAX(voucher_no) AS maxVoucherNo FROM voucher');
    console.log('Query result:', result);

    if (result.length === 0 || result[0].maxVoucherNo === null) {
      console.log('No existing voucher numbers found, starting from 1');
      return 1; // 返回数字
    }

    const maxVoucherNo = result[0].maxVoucherNo;
    console.log('Max voucher number:', maxVoucherNo);

    // 确保 maxVoucherNo 是一个数字
    if (typeof maxVoucherNo !== 'number') {
      console.error('maxVoucherNo 不是一个有效的数字:', maxVoucherNo);
      throw new Error('获取的最大凭证编号无效');
    }

    const nextVoucherNumber = parseInt(maxVoucherNo) + 1;
    console.log('Next voucher number:', nextVoucherNumber);
    return nextVoucherNumber; // 返回数字
  } catch (error) {
    console.error('Error fetching next voucher number:', error);
    throw new Error('Failed to fetch next voucher number!');
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 获取科目列表
async function getAccountSubjects(database) {
  const connection = await getConnection(database);
  try {
    const [subjects] = await connection.execute('SELECT * FROM subject');
    return subjects;
  } finally {
    connection.release();
  }
}

// 获取常用摘要
async function getCommonAbstracts(database) {
  const connection = await getConnection(database);
  try {
    const [abstracts] = await connection.execute('SELECT * FROM common_abstract');
    return abstracts;
  } finally {
    connection.release();
  }
}

// 保存常用摘要
async function saveCommonAbstract(database, abstractData) {
  const connection = await getConnection(database);
  try {
    await connection.execute('INSERT INTO common_abstract (content, created_by) VALUES (?, ?)', [
      abstractData.content,
      abstractData.created_by
    ]);
  } finally {
    connection.release();
  }
}

// 获取辅助核算项目
async function getAuxiliaryItems(database) {
  const connection = await getConnection(database);
  try {
    const [items] = await connection.execute('SELECT * FROM auxiliary_item');
    return items;
  } finally {
    connection.release();
  }
}

// 导出凭证
async function exportVouchers(database) {
  // 实现导出逻辑，返回文件路径
  return '/path/to/exported/file.csv';
}

// 导入凭证
async function importVouchers(database, file) {
  // 实现导入逻辑
  console.log('Importing vouchers from file:', file.path);
}

module.exports = {
  createVoucher,
  getVoucherList,
  getVoucherDetail,
  updateVoucher,
  deleteVoucher,
  submitVoucherReview,
  reviewVoucher,
  batchReviewVouchers,
  getNextVoucherNumber,
  getAccountSubjects,
  getCommonAbstracts,
  saveCommonAbstract,
  getAuxiliaryItems,
  exportVouchers,
  importVouchers
};