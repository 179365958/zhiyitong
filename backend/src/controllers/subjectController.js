const subjectService = require('../services/subjectService');

// 获取科目列表
exports.getSubjects = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    const subjects = await subjectService.getSubjects(database);
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('获取科目列表失败:', error);
    res.status(500).json({ success: false, message: '获取科目列表失败' });
  }
};

// 添加科目
exports.addSubject = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    const subject = await subjectService.addSubject(database, req.body);
    res.json({ success: true, data: subject });
  } catch (error) {
    console.error('添加科目失败:', error);
    res.status(500).json({ success: false, message: '添加科目失败' });
  }
};

// 更新科目
exports.updateSubject = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    const subject = await subjectService.updateSubject(database, req.params.id, req.body);
    res.json({ success: true, data: subject });
  } catch (error) {
    console.error('更新科目失败:', error);
    res.status(500).json({ success: false, message: '更新科目失败' });
  }
};

// 切换科目状态
exports.toggleSubjectStatus = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    await subjectService.toggleSubjectStatus(database, req.params.id);
    res.json({ success: true, message: '状态切换成功' });
  } catch (error) {
    console.error('切换科目状态失败:', error);
    res.status(500).json({ success: false, message: '切换科目状态失败' });
  }
};

// 导入科目
exports.importSubjects = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    await subjectService.importSubjects(database);
    res.json({ success: true, message: '导入成功' });
  } catch (error) {
    console.error('导入科目失败:', error);
    res.status(500).json({ success: false, message: '导入科目失败' });
  }
};

// 导出科目
exports.exportSubjects = async (req, res) => {
  try {
    const database = req.session.currentDatabase; // 从会话中获取当前数据库名称
    if (!database) {
      return res.status(400).json({ success: false, message: '未选择数据库' });
    }
    const filePath = await subjectService.exportSubjects(database);
    res.download(filePath);
  } catch (error) {
    console.error('导出科目失败:', error);
    res.status(500).json({ success: false, message: '导出科目失败' });
  }
};