require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const systemRoutes = require('./routes/system');
const voucherRoutes = require('./routes/voucherRoutes'); 
const subjectRoutes = require('./routes/subjectRoutes');

const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();

// 配置会话存储选项
const sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SYS_NAME,
};

// 创建会话存储
const sessionStore = new MySQLStore(sessionStoreOptions);

// 配置会话中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // 请使用一个安全的密钥
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { secure: false } // 在生产环境中应设置为 true
}));

// 配置 CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// API 路由配置
app.use('/api/system', systemRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api', subjectRoutes);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));


app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      error: 'API endpoint not found'
    })
  }
  next();
});

// 所有其他路由返回 index.html
/*
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
*/
// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error('应用错误:', err);
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        message: isDevelopment ? err.message : '服务器内部错误',
        stack: isDevelopment ? err.stack : undefined
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`服务器已启动，监听端口 ${PORT}`);
});

// 根据环境变量设置 CORS 选项
/*

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://0.0.0.0:3000', // 默认值为本地开发环境
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));  
*/