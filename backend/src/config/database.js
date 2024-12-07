const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const dbConfig = {
    mysql: {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_SYS_NAME,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        timezone: '+08:00',
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        dialectOptions: {
            dateStrings: true,
            typeCast: true
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    mssql: {
        dialect: 'mssql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_SYS_NAME,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};

module.exports = dbConfig;
