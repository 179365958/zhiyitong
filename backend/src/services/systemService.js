const { SystemConfig, sequelize } = require('../models');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const sql = require('mssql');

class SystemService {
    // 测试数据库连接
    async testDatabaseConnection(dbConfig) {
        try {
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.username,
                password: dbConfig.password
            });
            await connection.end();
            return { success: true, message: '数据库连接成功' };
        } catch (error) {
            logger.error('数据库连接失败:', error);
            return { success: false, message: '数据库连接失败: ' + error.message };
        }
    }

    // 检查系统是否已初始化
    async checkInitialized() {
        try {
            const databaseExists = await this.checkDatabase();
            const tablesExists = await this.checkTables();
            const adminUserExists = await this.checkAdminUser();

            return {
                success: true,
                initialized: databaseExists && tablesExists && adminUserExists
            };
        } catch (error) {
            logger.error('检查系统初始化状态失败:', error);
            return { success: false, message: '检查系统初始化状态失败' };
        }
    }

    // 获取企业账套列表
    async getCompanyList() {
        try {
            const [companies] = await sequelize.query(
                `SELECT id, company_code, company_name FROM sys_company WHERE status = 1`,
                { type: sequelize.QueryTypes.SELECT }
            );
            return companies || [];
        } catch (error) {
            logger.error('获取企业账套列表失败:', error);
            throw new Error('获取企业账套列表失败: ' + error.message);
        }
    }

    // 初始化系统
    async initializeSystem(dbConfig, adminUser) {
        const transaction = await sequelize.transaction();
        try {
            // 验证输入参数
            if (!dbConfig || !adminUser) {
                throw new Error('初始化参数不能为空');
            }

            if (!adminUser.username || !adminUser.password) {
                throw new Error('管理员用户名和密码不能为空');
            }

            // 创建系统数据库
            logger.info('开始创建系统数据库...');
            await sequelize.query(`CREATE DATABASE IF NOT EXISTS zyt_sys 
                DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`, 
                { transaction }
            );
            logger.info('系统数据库创建成功');

            // 切换到系统数据库
            await sequelize.query(`USE zyt_sys`, { transaction });

            // 创建系统配置表
            logger.info('开始创建系统配置表...');
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS sys_config (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    config_key VARCHAR(100) NOT NULL,
                    config_value TEXT,
                    config_type VARCHAR(50) NOT NULL,
                    created_at DATETIME NOT NULL,
                    created_by INT NOT NULL,
                    updated_at DATETIME,
                    UNIQUE KEY uk_config_key (config_key)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表'
            `, { transaction });
            logger.info('系统配置表创建成功');

            // 创建会计制度表
            logger.info('开始创建会计制度表...');
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS sys_accounting_system (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    code VARCHAR(50) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    version VARCHAR(50) NOT NULL,
                    effective_date DATE NOT NULL,
                    status TINYINT NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL,
                    created_by INT NOT NULL,
                    updated_at DATETIME,
                    updated_by INT,
                    UNIQUE KEY uk_code_version (code, version)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计制度表'
            `, { transaction });
            logger.info('会计制度表创建成功');

            // 创建企业账套表
            logger.info('开始创建企业账套表...');
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS sys_company (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    company_code VARCHAR(50) NOT NULL,
                    company_name VARCHAR(200) NOT NULL,
                    tax_code VARCHAR(50),
                    legal_person VARCHAR(50),
                    contact VARCHAR(50),
                    phone VARCHAR(20),
                    address VARCHAR(200),
                    email VARCHAR(100),
                    db_name VARCHAR(100) NOT NULL,
                    fiscal_year INT NOT NULL,
                    period_type TINYINT NOT NULL DEFAULT 1,
                    begin_date DATE NOT NULL,
                    currency_code VARCHAR(10) NOT NULL,
                    accounting_system_id INT NOT NULL,
                    status TINYINT NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL,
                    created_by INT NOT NULL,
                    updated_at DATETIME,
                    updated_by INT,
                    UNIQUE KEY uk_company_code (company_code),
                    UNIQUE KEY uk_db_name (db_name),
                    FOREIGN KEY (accounting_system_id) REFERENCES sys_accounting_system(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业账套表'
            `, { transaction });
            logger.info('企业账套表创建成功');

            // 创建用户表
            logger.info('开始创建用户表...');
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS sys_user (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    real_name VARCHAR(50) NOT NULL,
                    email VARCHAR(100),
                    mobile VARCHAR(20),
                    is_admin BIT NOT NULL DEFAULT 0,
                    status TINYINT NOT NULL DEFAULT 1,
                    last_login DATETIME,
                    created_at DATETIME NOT NULL,
                    created_by INT NOT NULL,
                    updated_at DATETIME,
                    updated_by INT,
                    UNIQUE KEY uk_username (username)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
            `, { transaction });
            logger.info('用户表创建成功');

            // 保存系统配置
            logger.info('开始保存系统配置...');
            const systemConfig = await this.saveSystemConfig(dbConfig, transaction);
            logger.info('系统配置保存成功');

            // 创建默认会计制度
            logger.info('开始创建默认会计制度...');
            const [existingAccountingSystems] = await sequelize.query(
                `SELECT id FROM sys_accounting_system WHERE code IN ('SMALL', 'STANDARD')`,
                { 
                    transaction, 
                    type: sequelize.QueryTypes.SELECT 
                }
            );

            let accountingSystemId = existingAccountingSystems && existingAccountingSystems.length > 0 
                ? existingAccountingSystems[0].id 
                : null;

            if (!accountingSystemId) {
                const [newAccountingSystems] = await sequelize.query(
                    `INSERT INTO sys_accounting_system 
                    (code, name, description, version, effective_date, status, created_at, created_by) 
                    VALUES 
                    ('SMALL', '小企业会计准则', '小企业会计准则（2013年颁布）', '2013', '2013-01-01', 1, NOW(), 1),
                    ('STANDARD', '企业会计准则', '企业会计准则（2021年版）', '2021', '2021-01-01', 1, NOW(), 1)
                    ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
                    { transaction, type: sequelize.QueryTypes.INSERT }
                );
                accountingSystemId = newAccountingSystems && newAccountingSystems.insertId;
                logger.info(`创建默认会计制度成功，ID: ${accountingSystemId}`);
            }

            // 创建默认企业账套
            logger.info('开始创建默认企业账套...');
            const [company] = await sequelize.query(
                `INSERT INTO sys_company 
                (company_code, company_name, tax_code, legal_person, contact, phone, 
                 address, email, db_name, fiscal_year, period_type, begin_date, 
                 currency_code, accounting_system_id, status, created_at, created_by) 
                VALUES 
                ('ZYT001', '智易通科技有限公司', '91110108MA7XXXXX', '张三', '李四', '13800138000', 
                 '北京市海淀区中关村软件园', 'contact@zhiyitong.com', 'zyt_company_001', 2024, 1, '2024-01-01', 
                 'CNY', ${accountingSystemId || 1}, 1, NOW(), 1)
                ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
                { 
                    transaction, 
                    type: sequelize.QueryTypes.INSERT
                }
            );
            const companyId = company && company.insertId;
            logger.info(`创建默认企业账套成功，ID: ${companyId}`);

            // 创建默认管理员用户
            logger.info('开始创建默认管理员用户...');
            const hashedPassword = await this.hashPassword(adminUser.password);
            const [user] = await sequelize.query(
                `INSERT INTO sys_user 
                (username, password, real_name, email, mobile, is_admin, status, created_at, created_by) 
                VALUES 
                ('${adminUser.username}', '${hashedPassword}', '${adminUser.realName || '系统管理员'}', 
                 '${adminUser.email || ''}', '${adminUser.mobile || ''}', 1, 1, NOW(), 1)
                ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
                { 
                    transaction, 
                    type: sequelize.QueryTypes.INSERT
                }
            );
            const userId = user && user.insertId;
            logger.info(`创建默认管理员用户成功，ID: ${userId}`);

            // 提交事务
            await transaction.commit();
            logger.info('系统初始化事务提交成功');

            return {
                success: true,
                message: '系统初始化成功',
                data: {
                    systemConfig,
                    accountingSystemId: accountingSystemId,
                    companyId: companyId,
                    userId: userId
                }
            };
        } catch (error) {
            // 回滚事务
            await transaction.rollback();
            logger.error('系统初始化失败:', error);
            throw new Error('系统初始化失败: ' + error.message);
        }
    }

    // 保存系统配置
    async saveSystemConfig(dbConfig, transaction = null) {
        try {
            // 如果没有传入事务，则创建新事务
            const isExternalTransaction = !!transaction;
            if (!transaction) {
                transaction = await sequelize.transaction();
            }

            // 确保使用 zyt_sys 数据库
            await sequelize.query('USE zyt_sys', { transaction });

            // 准备配置项
            const configEntries = [
                { key: 'DB_TYPE', value: dbConfig.type || 'mysql', type: 'database' },
                { key: 'DB_HOST', value: dbConfig.host || 'localhost', type: 'database' },
                { key: 'DB_PORT', value: dbConfig.port || '3306', type: 'database' },
                { key: 'DB_USER', value: dbConfig.username || '', type: 'database' },
                { key: 'DB_NAME', value: dbConfig.database || '', type: 'database' }
            ];

            // 插入或更新配置
            for (const config of configEntries) {
                await sequelize.query(
                    `INSERT INTO sys_config 
                    (config_key, config_value, config_type, created_at, created_by) 
                    VALUES 
                    (:key, :value, :type, NOW(), 1)
                    ON DUPLICATE KEY UPDATE 
                    config_value = :value,
                    updated_at = NOW()`,
                    { 
                        transaction, 
                        replacements: {
                            key: config.key,
                            value: config.value,
                            type: config.type
                        }
                    }
                );
            }

            // 如果是内部事务，提交事务
            if (!isExternalTransaction) {
                await transaction.commit();
            }

            logger.info('系统配置保存成功');
            return configEntries;
        } catch (error) {
            // 如果是内部事务，回滚事务
            if (!isExternalTransaction && transaction) {
                await transaction.rollback();
            }
            logger.error('保存系统配置失败:', error);
            throw new Error('保存系统配置失败: ' + error.message);
        }
    }

    // 加密配置信息
    async encryptConfig(configValue) {
        if (!configValue) return '';
        // 使用 crypto 模块进行对称加密
        const crypto = require('crypto');
        const algorithm = 'aes-256-cbc';
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(configValue, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // 返回加密后的值和密钥信息
        return JSON.stringify({
            value: encrypted,
            key: key.toString('hex'),
            iv: iv.toString('hex')
        });
    }

    // 密码哈希
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // MySQL数据库初始化
    async initializeMySQL(dbConfig) {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
            multipleStatements: true
        });

        try {
            const sysDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/01_create_system_db.sql'),
                'utf8'
            );

            const companyDbSql = await fs.readFile(
                path.join(__dirname, '../../sql/02_create_company_db.sql'),
                'utf8'
            );

            await connection.query(sysDbSql);
            logger.info('系统数据库初始化完成');

            await connection.query(companyDbSql);
            logger.info('账套模板数据库初始化完成');

        } catch (error) {
            logger.error('MySQL数据库初始化失败:', error);
            throw error;
        } finally {
            await connection.end();
        }
    }

    // MSSQL数据库初始化
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

    // 转换MySQL SQL到MSSQL的方法
    convertToMSSQL(mysqlSql) {
        return mysqlSql;
    }

    // 检查数据库
    async checkDatabase() {
        try {
            const [results] = await sequelize.query(
                'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
                { replacements: ['zyt_sys'] }
            );
            return results && results.length > 0;
        } catch (error) {
            logger.error('检查数据库失败:', error);
            return false;
        }
    }

    // 检查表
    async checkTables() {
        try {
            const tables = ['sys_accounting_system', 'sys_company', 'sys_user', 'sys_permission', 
                           'sys_ai_knowledge', 'sys_ai_config', 'sys_subject_template'];
            
            // 先检查数据库是否存在
            const databaseExists = await this.checkDatabase();
            if (!databaseExists) {
                logger.warn('系统数据库 zyt_sys 不存在');
                return false;
            }

            // 使用 sequelize 查询表是否存在
            for (const table of tables) {
                const [results] = await sequelize.query(
                    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'zyt_sys' AND TABLE_NAME = ?`,
                    { replacements: [table] }
                );
                
                if (!results || results.length === 0) {
                    logger.warn(`表 ${table} 不存在`);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            logger.error('检查系统表失败:', error);
            return false;
        }
    }

    // 检查管理员用户
    async checkAdminUser() {
        try {
            // 先检查数据库是否存在
            const databaseExists = await this.checkDatabase();
            if (!databaseExists) {
                logger.warn('系统数据库 zyt_sys 不存在');
                return false;
            }

            // 检查表是否存在
            const tableExists = await this.checkTableExists('sys_user');
            if (!tableExists) {
                logger.warn('系统用户表 sys_user 不存在');
                return false;
            }

            // 查询管理员用户
            const [result] = await sequelize.query(
                'SELECT COUNT(*) as count FROM zyt_sys.sys_user WHERE is_admin = 1',
                { type: sequelize.QueryTypes.SELECT }
            );
            
            return result && result.count > 0;
        } catch (error) {
            logger.error('检查管理员用户失败:', error);
            return false;
        }
    }

    // 检查特定表是否存在
    async checkTableExists(tableName) {
        try {
            const [results] = await sequelize.query(
                `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'zyt_sys' AND TABLE_NAME = ?`,
                { replacements: [tableName] }
            );
            
            return results && results.length > 0;
        } catch (error) {
            logger.error(`检查表 ${tableName} 是否存在失败:`, error);
            return false;
        }
    }
}

module.exports = new SystemService();
