# 智易通（ZhiYiTong）- 智能财务管理系统

智易通是一个基于AI技术的智能财务管理系统，专为中小企业设计，提供全方位的财务管理解决方案。

## 🌟 主要特性

### 1. 智能化功能
- 票据智能识别
- 自动记账
- 智能审核
- 财务分析
- 风险预警
- 决策支持

### 2. 多租户支持
- 企业级账套管理
- 灵活的权限控制
- 数据安全隔离

### 3. 会计准则支持
- 小企业会计准则
- 企业会计准则
- 民间非营利组织会计制度

### 4. AI增强功能
- 智能单据处理
- 自动化记账
- 智能财务分析
- 风险预警系统
- 决策支持系统

## 🛠 技术栈

### 后端
- Node.js
- Express
- TypeScript
- MySQL

### 前端
- Vue 3
- Element Plus
- TypeScript

### AI技术
- OCR识别
- NLP处理
- 机器学习
- 知识图谱

## 📦 项目结构
```
account/
├── docs/              # 文档
│   ├── 项目说明.md
│   └── 数据库设计说明.md
├── sql/               # 数据库脚本
│   ├── 01_create_system_db.sql
│   ├── 02_create_company_db.sql
│   └── 03_init_subject_templates.sql
├── src/               # 源代码
│   ├── backend/       # 后端代码
│   └── frontend/      # 前端代码
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- MySQL >= 8.0
- npm >= 7

### 安装步骤
1. 克隆项目
```bash
git clone https://github.com/yourusername/zhiyitong.git
```

2. 安装依赖
```bash
cd zhiyitong
npm install
```

3. 初始化数据库
```bash
# 执行sql目录下的脚本
mysql -u root -p < sql/01_create_system_db.sql
mysql -u root -p < sql/02_create_company_db.sql
mysql -u root -p < sql/03_init_subject_templates.sql
```

4. 启动项目
```bash
npm run dev
```

## 📄 许可证

[MIT](LICENSE)
