const { getConnection } = require('../utils/db');

// 获取科目列表
exports.getSubjects = async (database) => {
  let connection;
  try {
    connection = await getConnection(database);
    const [subjects] = await connection.query('SELECT * FROM account_subject');
    return subjects;
  } catch (error) {
    console.error('获取科目列表失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 添加科目
exports.addSubject = async (database, subjectData) => {
  let connection;
  try {
    connection = await getConnection(database);
    const { code, name, category, direction } = subjectData;
    const [result] = await connection.query(`
      INSERT INTO account_subject (code, name, category, direction, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [code, name, category, direction]);
    return { id: result.insertId, ...subjectData };
  } catch (error) {
    console.error('添加科目失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 更新科目
exports.updateSubject = async (database, id, subjectData) => {
  let connection;
  try {
    connection = await getConnection(database);
    const { code, name, category, direction } = subjectData;
    const [result] = await connection.query(`
      UPDATE account_subject 
      SET code = ?, name = ?, category = ?, direction = ?, updated_at = NOW()
      WHERE id = ?
    `, [code, name, category, direction, id]);
    if (result.affectedRows === 0) {
      throw new Error('科目不存在');
    }
    return { id, ...subjectData };
  } catch (error) {
    console.error('更新科目失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 切换科目状态
exports.toggleSubjectStatus = async (database, id) => {
  let connection;
  try {
    connection = await getConnection(database);
    const [subject] = await connection.query('SELECT status FROM account_subject WHERE id = ?', [id]);
    if (subject.length === 0) {
      throw new Error('科目不存在');
    }
    const newStatus = subject[0].status === 'active' ? 'inactive' : 'active';
    await connection.query('UPDATE account_subject SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);
  } catch (error) {
    console.error('切换科目状态失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 导入科目
exports.importSubjects = async (database) => {
  // 实现导入科目的逻辑
};

// 导出科目
exports.exportSubjects = async (database) => {
  // 实现导出科目的逻辑
};