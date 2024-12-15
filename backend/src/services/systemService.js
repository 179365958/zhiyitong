const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // 注意：需要安装 bcrypt 包
const fs = require('fs').promises;
const path = require('path');
const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SYS_NAME,
    sslmode: process.env.DB_SSLMODE,
    timezone: process.env.DB_TIMEZONE,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT),
    multipleStatements: process.env.DB_MULTIPLE_STATEMENTS === 'true'
};

// 检查系统初始化状态
exports.checkSystemInit = async () => {
    try {
        // 检查数据库连接
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        // 检查数据库是否存在
        const [rows] = await connection.query(`SHOW DATABASES LIKE '${config.database}'`);
        const dbExists = rows.length > 0;

        await connection.end();

        return {
            success: true,
            initialized: dbExists,
            message: dbExists ? '系统已初始化' : '系统未初始化'
        };
    } catch (error) {
        return {
            success: false,
            initialized: false,
            message: '数据库连接失败：' + error.message
        };
    }
};

// 验证数据库配置
exports.validateDbConfig = async (dbConfig) => {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.end();
        return {
            success: true,
            message: '数据库配置有效'
        };
    } catch (error) {
        return {
            success: false,
            message: '数据库配置无效：' + error.message
        };
    }
};

// 初始化系统
exports.initializeSystem = async (username, password) => {
    let connection;
    try {
        const config = {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_SYS_NAME
        };
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        // 检查数据库是否存在
        const [rows] = await connection.query(`SHOW DATABASES LIKE '${config.database}'`);
        const dbExists = rows.length > 0;

        if (dbExists) {
            // 删除现有数据库
            await connection.query(`DROP DATABASE ${config.database}`);
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
            await connection.end();
        }
    }
};

// 获取系统状态
exports.getSystemStatus = async () => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [dbSize] = await connection.query(`
            SELECT table_schema AS 'database',
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
            FROM information_schema.tables
            WHERE table_schema = ?
            GROUP BY table_schema
        `, [config.database]);

        await connection.end();

        return {
            success: true,
            status: {
                database: config.database,
                size: dbSize[0]?.size_mb || 0,
                uptime: process.uptime()
            }
        };
    } catch (error) {
        return {
            success: false,
            message: '获取系统状态失败：' + error.message
        };
    }
};

// 获取企业账套列表
exports.getCompanies = async (params = {}) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        // 构建查询条件
        const queryConditions = [];
        const queryParams = [];
        const countParams = [];

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
            await connection.end();
        }
    }
};

// 创建企业账套
exports.createCompany = async (companyData) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

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
            await connection.end();
        }
    }
};

// 更新企业账套
exports.updateCompany = async (id, companyData) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

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
            await connection.end();
        }
    }
};

// 删除企业账套
exports.deleteCompany = async (id) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

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
            await connection.end();
        }
    }
};

// 用户登录
exports.login = async (username, password) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [users] = await connection.query('SELECT * FROM sys_user WHERE username = ? AND status = 1', [username]);

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

        return {
            success: true,
            message: '登录成功',
            data: {
                id: user.id,
                username: user.username,
                realName: user.real_name,
                isAdmin: user.is_admin === 1,
                status: user.status
            }
        };
    } catch (error) {
        console.error('登录失败:', error);
        return {
            success: false,
            message: '登录失败：' + error.message
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};