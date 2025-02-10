const { getConnection } = require('../utils/db');

async function createVoucher(voucherData, entries) {
  let connection;

  try {
    connection = await pool.getConnection();
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
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  createVoucher
};