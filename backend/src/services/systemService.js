const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // 注意：需要安装 bcrypt 包
const fs = require('fs').promises;
const path = require('path');
const { pool, dbConfig } = require('../config/database'); // 引入数据库配置和连接池
const jwt = require('jsonwebtoken'); // 确保导入jsonwebtoken
const session = require('express-session');
const { getConnection } = require('../utils/db'); // 引入数据库连接逻辑

// 检查 MySQL 连接状态
exports.checkSystemInit = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    // 获取数据库版本
    const [rows] = await connection.query('SELECT version() AS version');
    const dbVersion = rows[0].version;

    // 检查 zyt_sys 数据库是否存在
    const [dbRows] = await connection.query(`SHOW DATABASES LIKE 'zyt_sys'`);
    const dbExists = dbRows.length > 0;

    // 检查 zyt_sys 数据库是否建立
    let zytSysStatus = '';
    if (dbExists) {
      await connection.query('USE zyt_sys');
      const [tables] = await connection.query('SHOW TABLES');
      if (tables.length > 0) {
        zytSysStatus = '已建立';
      } else {
        zytSysStatus = '未建立';
      }
    } else {
      zytSysStatus = '未建立';
    }

    return {
      success: true,
      message: '数据库连接成功',
      dbVersion,
      zytSysStatus: zytSysStatus // 返回 zyt_sys 数据库的状态
    };
  } catch (error) {
    return {
      success: false,
      message: '数据库连接失败：' + error.message,
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 初始化系统
exports.initializeDatabase = async (username, password) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // 检查数据库是否存在
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    const dbExists = rows.length > 0;

    if (dbExists) {
      // 删除现有数据库
      await connection.query(`DROP DATABASE ${dbConfig.database}`);
    }

    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, '../../sql/01_create_system_db.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');

    // 分割 SQL 语句
    const sqlStatements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // 执行每个 SQL 语句
    for (const statement of sqlStatements) {
      if (statement) {
        await connection.query(statement);
      }
    }

    // 插入管理员用户
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(`
      INSERT INTO sys_user (username, password, real_name, email, mobile, is_admin, status, created_at, created_by)
      VALUES (?, ?, '管理员', NULL, NULL, 1, 1, NOW(), 1)
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, [username, hashedPassword]);

    return {
      success: true,
      message: '系统初始化成功'
    };
  } catch (error) {
    console.error('初始化系统失败:', error);
    return {
      success: false,
      message: '系统初始化失败：' + error.message
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 验证数据库配置
exports.validateDbConfig = async (dbConfig) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);
    return {
      success: true,
      message: '数据库配置有效'
    };
  } catch (error) {
    return {
      success: false,
      message: '数据库配置无效：' + error.message
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 获取系统状态
exports.getSystemStatus = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    const [dbSize] = await connection.query(`
      SELECT table_schema AS 'database',
      ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
      FROM information_schema.tables
      WHERE table_schema = ?
      GROUP BY table_schema
    `, [dbConfig.database]);

    return {
      success: true,
      status: {
        database: dbConfig.database,
        size: dbSize[0]?.size_mb || 0,
        uptime: process.uptime()
      }
    };
  } catch (error) {
    return {
      success: false,
      message: '获取系统状态失败：' + error.message
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 获取企业账套列表
exports.getCompanies = async (params = {}) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    // 构建查询条件
    const queryConditions = [];
    const queryParams = [];
    const countParams = [];

    // 添加用户权限过滤
    if (params.userId) {
      queryConditions.push('(created_by = ? OR id IN (SELECT company_id FROM sys_user_company WHERE user_id = ?))');
      queryParams.push(params.userId, params.userId);
      countParams.push(params.userId, params.userId);
    }

    if (params.companyName) {
      queryConditions.push('company_name LIKE ?');
      queryParams.push(`%${params.companyName}%`);
      countParams.push(`%${params.companyName}%`);
    }

    if (params.status !== undefined && params.status !== null) {
      queryConditions.push('status = ?');
      queryParams.push(params.status);
      countParams.push(params.status);
    }

    // 分页参数
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // 构建完整查询
    const whereClause = queryConditions.length > 0 
      ? `WHERE ${queryConditions.join(' AND ')}`
      : '';

    // 查询列表
    const listQuery = `
      SELECT * FROM sys_company 
      ${whereClause}
      LIMIT ? OFFSET ?
    `;
    const fullListParams = [...queryParams, pageSize, offset];

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total FROM sys_company 
      ${whereClause}
    `;

    // 执行查询
    const [companies] = await connection.query(listQuery, fullListParams);
    const [countResult] = await connection.query(countQuery, queryParams);
    const total = countResult[0].total;

    return {
      success: true,
      data: {
        list: companies,
        total: total,
        page: page,
        pageSize: pageSize
      }
    };
  } catch (error) {
    console.error('获取企业账套列表错误:', error);
    return {
      success: false,
      message: '获取企业账套列表失败：' + error.message
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 创建企业账套
exports.createCompany = async (companyData) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    const { company_code, company_name, db_name, status = 1 } = companyData;

    const [result] = await connection.query(`
      INSERT INTO sys_company (company_code, company_name, db_name, status, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [company_code, company_name, db_name, status]);

    return {
      id: result.insertId,
      ...companyData
    };
  } catch (error) {
    console.error('创建企业账套失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 更新企业账套
exports.updateCompany = async (id, companyData) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    const { company_code, company_name, db_name, status } = companyData;

    const [result] = await connection.query(`
      UPDATE sys_company 
      SET company_code = ?, company_name = ?, db_name = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [company_code, company_name, db_name, status, id]);

    if (result.affectedRows === 0) {
      throw new Error('企业账套不存在');
    }

    return { id, ...companyData };
  } catch (error) {
    console.error('更新企业账套失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 删除企业账套
exports.deleteCompany = async (id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    const [result] = await connection.query('DELETE FROM sys_company WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('企业账套不存在');
    }

    return true;
  } catch (error) {
    console.error('删除企业账套失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 切换数据库
exports.switchDatabase = async (companyId, userId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`USE ${dbConfig.database}`);

    const [rows] = await connection.query('SELECT db_name FROM sys_company WHERE id = ?', [companyId]);
    if (rows.length === 0) {
      throw new Error('Company not found');
    }

    const dbName = rows[0].db_name;

    // 将数据库名称存储在会话中
    session.dbName = dbName;

    // 记录最近使用的账套信息
    await connection.query('UPDATE sys_user SET recent_company_id = ? WHERE id = ?', [companyId, userId]);

    return {
      success: true,
      message: 'Database switched successfully'
    };
  } catch (error) {
    console.error('Error switching database:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// 获取数据库连接
exports.getConnection = async () => {
  let connection;
  try {
    const dbName = session.dbName || dbConfig.database;
    connection = await pool.getConnection();
    await connection.query(`USE ${dbName}`);
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
};

// 用户登录
exports.login = async (username, password, logintype) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('USE zyt_sys');

    if (logintype === 'admin') {
      // 管理员登录逻辑
      const [users] = await connection.query(
        'SELECT * FROM sys_user WHERE username = ? AND status = 1',
        [username]
      );

      if (users.length === 0) {
        return {
          success: false,
          message: '用户不存在或已被禁用'
        };
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: '密码错误'
        };
      }

      // 生成 JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return {
        success: true,
        message: '登录成功',
        token: token, // 返回生成的 token
        data: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          isAdmin: user.is_admin[0] === 1,
          status: user.status
        }
      };
    } else if (logintype === 'user') {
      // 普通用户登录逻辑
      const [users] = await connection.query(
        'SELECT * FROM sys_user WHERE username = ? AND status = 1',
        [username]
      );

      if (users.length === 0) {
        return {
          success: false,
          message: '用户不存在或已被禁用'
        };
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: '密码错误'
        };
      }

      // 获取用户有权限的账套列表
      const [companyRows] = await connection.query('SELECT company_id FROM sys_user_company WHERE user_id = ?', [user.id]);
      const companyIds = companyRows.map(row => row.company_id);
      const recentCompany = companyRows.find(row => row.company_id === user.recent_company_id);

      // 生成 JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return {
        success: true,
        message: '登录成功',
        token: token, // 返回生成的 token
        data: {
          id: user.id,
          username: user.username,
          realName: user.real_name,
          isAdmin: user.is_admin[0] === 1,
          status: user.status,
          recentCompanyId: user.recent_company_id, // 返回最近使用的账套ID
          companyIds: companyIds, // 返回用户有权限的账套列表
          company: recentCompany ? { id: recentCompany.company_id, name: recentCompany.company_name } : null
        }
      };
    } else {
      throw new Error('无效的登录类型');
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      message: '登录失败：' + error.message
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};