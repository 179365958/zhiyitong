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
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

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
            await connection.query(statement);
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
exports.getCompanies = async () => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [companies] = await connection.query('SELECT * FROM companies');
        await connection.end();

        return {
            success: true,
            data: companies
        };
    } catch (error) {
        return {
            success: false,
            message: '获取企业账套列表失败：' + error.message
        };
    }
};

// 用户登录
exports.login = async (username, password) => {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });

        const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        await connection.end();

        if (users.length === 0) {
            return {
                success: false,
                message: '用户不存在'
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
            data: {
                id: user.id,
                username: user.username
            }
        };
    } catch (error) {
        return {
            success: false,
            message: '登录失败：' + error.message
        };
    }
};