const { SystemConfig, sequelize } = require('../models');
const logger = require('../utils/logger');
const { encrypt } = require('../utils/crypto');
const mysql = require('mysql2/promise');
const sql = require('mssql');
const fs = require('fs').promises;
const path = require('path');

class SystemService {
    /**
     * 测试数据库连接
     */
    async testDatabaseConnection(dbConfig) {
        try {
            // MySQL 连接测试
            if (dbConfig.type === 'mysql' || !dbConfig.type) {
                const connection = await mysql.createConnection({
                    host: dbConfig.host,
                    port: dbConfig.port,
                    user: dbConfig.username,
                    password: dbConfig.password
                });
                await connection.end();
            }
            // SQL Server 连接测试
            else if (dbConfig.type === 'mssql') {
                const pool = new sql.ConnectionPool({
                    server: dbConfig.host,
                    port: parseInt(dbConfig.port),
                    user: dbConfig.username,
                    password: dbConfig.password,
                    options: {
                        trustServerCertificate: true
                    }
                });
                await pool.connect();
                await pool.close();
            }

            return {
                success: true,
                message: '数据库连接成功'
            };
        } catch (error) {
            logger.error('数据库连接测试失败:', error);
            return {
                success: false,
                message: '数据库连接失败: ' + error.message
            };
        }
    }

    /**
     * 检查系统是否已初始化
     */
    async checkInitialized() {
        try {
            // 尝试连接数据库
            if (process.env.DB_TYPE === 'mysql' || !process.env.DB_TYPE) {
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS
                });

                // 检查系统数据库是否存在
                const [rows] = await connection.query(`
                    SELECT SCHEMA_NAME 
                    FROM INFORMATION_SCHEMA.SCHEMATA 
                    WHERE SCHEMA_NAME = ?
                `, [process.env.DB_SYS_NAME]);

                await connection.end();

                if (rows.length === 0) {
                    return {
                        initialized: false,
                        message: '系统数据库未创建'
                    };
                }

                // 连接系统数据库检查表是否存在
                const sysConnection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_SYS_NAME
                });

                const [tables] = await sysConnection.query(`
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = ?
                `, [process.env.DB_SYS_NAME]);

                await sysConnection.end();

                if (tables.length === 0) {
                    return {
                        initialized: false,
                        message: '系统表未创建'
                    };
                }
            }
            // SQL Server
            else if (process.env.DB_TYPE === 'mssql') {
                const pool = new sql.ConnectionPool({
                    server: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    options: {
                        trustServerCertificate: true
                    }
                });

                await pool.connect();

                // 检查系统数据库是否存在
                const result = await pool.request().query(`
                    SELECT name 
                    FROM sys.databases 
                    WHERE name = '${process.env.DB_SYS_NAME}'
                `);

                if (result.recordset.length === 0) {
                    await pool.close();
                    return {
                        initialized: false,
                        message: '系统数据库未创建'
                    };
                }

                // 检查系统表是否存在
                await pool.request().query(`USE [${process.env.DB_SYS_NAME}]`);
                const tableResult = await pool.request().query(`
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'
                `);

                await pool.close();

                if (tableResult.recordset.length === 0) {
                    return {
                        initialized: false,
                        message: '系统表未创建'
                    };
                }
            }

            return {
                initialized: true,
                message: '系统已初始化'
            };
        } catch (error) {
            logger.error('检查系统状态失败:', error);
            return {
                initialized: false,
                message: '检查系统状态失败: ' + error.message
            };
        }
    }

    /**
     * 初始化系统
     */
    async initializeSystem(dbConfig, adminUser) {
        try {
            // 根据数据库类型选择初始化方法
            if (dbConfig.type === 'mssql') {
                await this.initializeMSSQL(dbConfig);
            } else {
                await this.initializeMySQL(dbConfig);
            }

            // 创建管理员账户
            await this.createAdminUser({
                ...adminUser,
                password: await encrypt(adminUser.password)
            });

            // 记录系统配置
            await this.saveSystemConfig();

            return {
                success: true,
                message: '系统初始化成功'
            };
        } catch (error) {
            logger.error('系统初始化失败:', error);
            throw error;
        }
    }

    // 私有方法
    async initializeMySQL(dbConfig) {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
            multipleStatements: true // 允许执行多条SQL语句
        });

        try {
            // 读取系统初始化SQL文件
            const sysDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/01_create_system_db.sql'),
                'utf8'
            );

            // 读取账套模板SQL文件
            const companyDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/02_create_company_db.sql'),
                'utf8'
            );

            // 执行系统初始化SQL
            await connection.query(sysDbSql);
            logger.info('系统数据库初始化完成');

            // 执行账套模板SQL
            await connection.query(companyDbSql);
            logger.info('账套模板数据库初始化完成');

        } catch (error) {
            logger.error('MySQL数据库初始化失败:', error);
            throw error;
        } finally {
            await connection.end();
        }
    }

    async initializeMSSQL(dbConfig) {
        const pool = new sql.ConnectionPool({
            server: dbConfig.host,
            port: parseInt(dbConfig.port),
            user: dbConfig.username,
            password: dbConfig.password,
            options: {
                trustServerCertificate: true
            }
        });

        try {
            await pool.connect();

            // 读取并转换MySQL SQL文件为MSSQL格式
            // 注意：这里需要转换SQL语法
            const sysDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/01_create_system_db.sql'),
                'utf8'
            );
            const mssqlSysDbSql = this.convertToMSSQL(sysDbSql);

            const companyDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/02_create_company_db.sql'),
                'utf8'
            );
            const mssqlCompanyDbSql = this.convertToMSSQL(companyDbSql);

            // 执行系统初始化SQL
            await pool.request().batch(mssqlSysDbSql);
            logger.info('系统数据库初始化完成');

            // 执行账套模板SQL
            await pool.request().batch(mssqlCompanyDbSql);
            logger.info('账套模板数据库初始化完成');

        } catch (error) {
            logger.error('MSSQL数据库初始化失败:', error);
            throw error;
        } finally {
            await pool.close();
        }
    }

    // 将MySQL SQL转换为MSSQL格式
    convertToMSSQL(mysqlSql) {
        // 这里需要实现MySQL到MSSQL的SQL转换
        // 主要转换点：
        // 1. AUTO_INCREMENT -> IDENTITY(1,1)
        // 2. ENGINE=InnoDB -> 删除
        // 3. 字符集声明方式
        // 4. 日期时间函数
        // 此处仅为示例，实际需要更完整的转换逻辑
        return mysqlSql
            .replace(/AUTO_INCREMENT/g, 'IDENTITY(1,1)')
            .replace(/ENGINE=InnoDB/g, '')
            .replace(/DEFAULT CHARSET=utf8mb4/g, '')
            .replace(/NOW\(\)/g, 'GETDATE()');
    }

    async checkDatabase() {
        const [results] = await sequelize.query(
            'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
            {
                replacements: ['zyt_sys'],
                type: sequelize.QueryTypes.SELECT
            }
        );
        return !!results;
    }

    async checkTables() {
        const tables = ['sys_accounting_system', 'sys_company', 'sys_user', 'sys_permission', 
                       'sys_ai_knowledge', 'sys_ai_config', 'sys_subject_template'];
        for (const table of tables) {
            const [exists] = await sequelize.query(
                'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
                {
                    replacements: ['zyt_sys', table],
                    type: sequelize.QueryTypes.SELECT
                }
            );
            if (!exists) return false;
        }
        return true;
    }

    async checkAdminUser() {
        const [result] = await sequelize.query(
            'SELECT COUNT(*) as count FROM zyt_sys.sys_user WHERE is_admin = 1',
            {
                type: sequelize.QueryTypes.SELECT
            }
        );
        return result && result.count > 0;
    }

    async createAdminUser(adminUser) {
        await sequelize.query(
            `INSERT INTO zyt_sys.sys_user (
                username, password, real_name, email, 
                is_admin, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())`,
            {
                replacements: [
                    adminUser.username,
                    adminUser.password,
                    adminUser.realName,
                    adminUser.email
                ]
            }
        );
    }

    async saveSystemConfig() {
        await SystemConfig.bulkCreate([
            {
                config_key: 'system_initialized',
                config_value: 'true',
                description: '系统是否已初始化'
            },
            {
                config_key: 'init_time',
                config_value: new Date().toISOString(),
                description: '系统初始化时间'
            }
        ]);
    }
}

module.exports = new SystemService();
