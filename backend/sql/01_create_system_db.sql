-- 创建系统主库
CREATE DATABASE IF NOT EXISTS zyt_sys DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE zyt_sys;

-- 会计制度表
CREATE TABLE IF NOT EXISTS sys_accounting_system (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(50) NOT NULL,        -- 制度编码
    name            VARCHAR(100) NOT NULL,       -- 制度名称
    description     TEXT,                        -- 制度说明
    version         VARCHAR(50) NOT NULL,        -- 版本号
    effective_date  DATE NOT NULL,              -- 生效日期
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:启用 0:停用)
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    UNIQUE KEY uk_code_version (code, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计制度表';

-- 企业账套表
CREATE TABLE IF NOT EXISTS sys_company (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    company_code    VARCHAR(50) NOT NULL,        -- 企业编码
    company_name    VARCHAR(200) NOT NULL,       -- 企业名称
    tax_code        VARCHAR(50),                 -- 税号
    legal_person    VARCHAR(50),                 -- 法人
    contact         VARCHAR(50),                 -- 联系人
    phone           VARCHAR(20),                 -- 联系电话
    address         VARCHAR(200),                -- 地址
    email           VARCHAR(100),                -- 邮箱
    db_name         VARCHAR(100) NOT NULL,       -- 账套数据库名
    fiscal_year     INT NOT NULL,                -- 会计年度
    period_type     TINYINT NOT NULL DEFAULT 1,  -- 会计期间类型(1:12期间 2:13期间)
    begin_date      DATE NOT NULL,               -- 启用期间
    currency_code   VARCHAR(10) NOT NULL,        -- 本位币
    accounting_system_id INT NOT NULL,           -- 会计制度ID
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:正常 0:禁用)
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_company_code (company_code),
    UNIQUE KEY uk_db_name (db_name),
    FOREIGN KEY (accounting_system_id) REFERENCES sys_accounting_system(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业账套表';

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) NOT NULL,        -- 用户名
    password        VARCHAR(255) NOT NULL,       -- 密码(加密)，增加长度以支持bcrypt加密
    real_name       VARCHAR(50) NOT NULL,        -- 真实姓名
    email           VARCHAR(100),                -- 邮箱
    mobile          VARCHAR(20),                 -- 手机
    is_admin        BIT NOT NULL DEFAULT 0,      -- 是否管理员
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:正常 0:禁用)
    last_login      DATETIME,                    -- 最后登录时间
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    role_code       VARCHAR(50) NOT NULL,        -- 角色编码
    role_name       VARCHAR(100) NOT NULL,       -- 角色名称
    description     VARCHAR(200),                -- 描述
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:正常 0:禁用)
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    parent_id       INT,                         -- 父级权限ID
    perm_code       VARCHAR(50) NOT NULL,        -- 权限编码
    perm_name       VARCHAR(100) NOT NULL,       -- 权限名称
    perm_type       VARCHAR(20) NOT NULL,        -- 权限类型(menu:菜单 button:按钮)
    path            VARCHAR(200),                -- 菜单路径
    component       VARCHAR(200),                -- 前端组件
    icon            VARCHAR(50),                 -- 图标
    sort_no         INT NOT NULL DEFAULT 0,      -- 排序号
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:正常 0:禁用)
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_perm_code (perm_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 用户角色关系表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,                -- 用户ID
    role_id         INT NOT NULL,                -- 角色ID
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关系表';

-- 角色权限关系表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    role_id         INT NOT NULL,                -- 角色ID
    permission_id   INT NOT NULL,                -- 权限ID
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    UNIQUE KEY uk_role_perm (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关系表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,                -- 用户ID
    operation       VARCHAR(200) NOT NULL,       -- 操作内容
    method          VARCHAR(200) NOT NULL,       -- 请求方法
    params          TEXT,                        -- 请求参数
    ip              VARCHAR(50),                 -- IP地址
    location        VARCHAR(200),                -- 操作地点
    device          VARCHAR(200),                -- 设备信息
    status          TINYINT NOT NULL,            -- 状态(1:成功 0:失败)
    error_msg       TEXT,                        -- 错误信息
    created_at      DATETIME NOT NULL            -- 创建时间
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS sys_login_log (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,                -- 用户ID
    ip              VARCHAR(50),                 -- IP地址
    location        VARCHAR(200),                -- 登录地点
    device          VARCHAR(200),                -- 设备信息
    browser         VARCHAR(200),                -- 浏览器信息
    os              VARCHAR(200),                -- 操作系统
    status          TINYINT NOT NULL,            -- 状态(1:成功 0:失败)
    msg             VARCHAR(200),                -- 提示信息
    login_time      DATETIME NOT NULL            -- 登录时间
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- AI模型配置表
CREATE TABLE IF NOT EXISTS sys_ai_model (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    model_code      VARCHAR(50) NOT NULL COMMENT '模型编码',
    model_name      VARCHAR(100) NOT NULL COMMENT '模型名称',
    model_type      VARCHAR(50) NOT NULL COMMENT '模型类型(OCR/NLP/预测/分类等)',
    provider        VARCHAR(50) NOT NULL COMMENT 'AI服务提供商',
    api_config      JSON NOT NULL COMMENT 'API配置信息',
    model_params    JSON COMMENT '模型参数',
    version         VARCHAR(20) NOT NULL COMMENT '版本号',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态(0:禁用 1:启用)',
    description     TEXT COMMENT '说明',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_code_version (model_code, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表';

-- AI知识库表
CREATE TABLE IF NOT EXISTS sys_ai_knowledge (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    domain          VARCHAR(50) NOT NULL COMMENT '领域(会计准则/税收政策/行业规范等)',
    topic           VARCHAR(100) NOT NULL COMMENT '主题',
    content         TEXT NOT NULL COMMENT '内容',
    keywords        JSON COMMENT '关键词',
    reference       JSON COMMENT '参考来源',
    valid_from      DATE NOT NULL COMMENT '生效日期',
    valid_to        DATE COMMENT '失效日期',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_domain_topic (domain, topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI知识库表';

-- AI业务规则表
CREATE TABLE IF NOT EXISTS sys_ai_business_rule (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_code       VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_name       VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type       VARCHAR(50) NOT NULL COMMENT '规则类型(记账/审核/分析等)',
    condition_expr  JSON NOT NULL COMMENT '条件表达式',
    action_expr     JSON NOT NULL COMMENT '动作表达式',
    priority        INT NOT NULL DEFAULT 0 COMMENT '优先级',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_rule_code (rule_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI业务规则表';

-- AI分析模型表
CREATE TABLE IF NOT EXISTS sys_ai_analysis_model (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    model_code      VARCHAR(50) NOT NULL COMMENT '模型编码',
    model_name      VARCHAR(100) NOT NULL COMMENT '模型名称',
    analysis_type   VARCHAR(50) NOT NULL COMMENT '分析类型(财务/风险/预测等)',
    indicators      JSON NOT NULL COMMENT '指标配置',
    algorithm       JSON NOT NULL COMMENT '算法配置',
    threshold       JSON COMMENT '阈值设置',
    action_rules    JSON COMMENT '行动建议规则',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_model_code (model_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分析模型表';

-- AI训练数据集表
CREATE TABLE IF NOT EXISTS sys_ai_training_data (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    dataset_code    VARCHAR(50) NOT NULL COMMENT '数据集编码',
    dataset_name    VARCHAR(100) NOT NULL COMMENT '数据集名称',
    model_code      VARCHAR(50) NOT NULL COMMENT '关联模型编码',
    data_type       VARCHAR(50) NOT NULL COMMENT '数据类型',
    data_content    JSON NOT NULL COMMENT '数据内容',
    labels          JSON COMMENT '标签信息',
    validation      DECIMAL(5,2) COMMENT '验证准确率',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_dataset_code (dataset_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI训练数据集表';

-- AI使用记录表
CREATE TABLE IF NOT EXISTS sys_ai_usage_log (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    company_id      INT NOT NULL COMMENT '企业ID',
    model_code      VARCHAR(50) NOT NULL COMMENT '模型编码',
    feature_type    VARCHAR(50) NOT NULL COMMENT '功能类型',
    input_data      JSON COMMENT '输入数据',
    output_result   JSON COMMENT '输出结果',
    process_time    INT COMMENT '处理时间(ms)',
    status          TINYINT NOT NULL COMMENT '状态(0:失败 1:成功)',
    error_msg       TEXT COMMENT '错误信息',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    KEY idx_company_model (company_id, model_code),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用记录表';

-- AI模型配置表
CREATE TABLE IF NOT EXISTS sys_ai_config (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    provider        VARCHAR(50) NOT NULL,        -- 提供商(OpenAI/智谱/千问/文心)
    model_name      VARCHAR(50) NOT NULL,        -- 模型名称
    api_key         VARCHAR(500) NOT NULL,       -- API密钥(加密存储)
    api_url         VARCHAR(200),                -- API地址
    model_params    JSON,                        -- 模型参数
    token_limit     INT NOT NULL DEFAULT 0,      -- Token限制
    priority        INT NOT NULL DEFAULT 0,      -- 优先级
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:启用 0:禁用)
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    UNIQUE KEY uk_provider_model (provider, model_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表';

-- AI对话历史表
CREATE TABLE IF NOT EXISTS sys_ai_conversation (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,                -- 用户ID
    company_id      INT NOT NULL,                -- 企业ID
    session_id      VARCHAR(50) NOT NULL,        -- 会话ID
    business_type   VARCHAR(50) NOT NULL,        -- 业务类型
    business_id     INT,                         -- 业务ID
    query_text      TEXT NOT NULL,               -- 用户问题
    response_text   TEXT NOT NULL,               -- AI回答
    context_data    JSON,                        -- 上下文数据
    provider        VARCHAR(50) NOT NULL,        -- 使用的模型提供商
    model_name      VARCHAR(50) NOT NULL,        -- 使用的模型
    tokens_used     INT NOT NULL,                -- 消耗的token数
    duration_ms     INT NOT NULL,                -- 响应时间(毫秒)
    feedback        TINYINT,                     -- 反馈(1:有用 0:无用)
    created_at      DATETIME NOT NULL,
    KEY idx_user_session (user_id, session_id),
    KEY idx_business (business_type, business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话历史表';

-- AI知识库表
CREATE TABLE IF NOT EXISTS sys_ai_knowledge_base (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    category        VARCHAR(50) NOT NULL,        -- 知识类别
    title           VARCHAR(200) NOT NULL,       -- 标题
    content         TEXT NOT NULL,               -- 内容
    keywords        VARCHAR(500),                -- 关键词
    embedding       JSON,                        -- 向量嵌入
    source          VARCHAR(200),                -- 来源
    version         VARCHAR(50),                 -- 版本号
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI知识库表';

-- AI使用统计表
CREATE TABLE IF NOT EXISTS sys_ai_usage_stats (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    company_id      INT NOT NULL,                -- 企业ID
    user_id         INT NOT NULL,                -- 用户ID
    provider        VARCHAR(50) NOT NULL,        -- 提供商
    model_name      VARCHAR(50) NOT NULL,        -- 模型名称
    business_type   VARCHAR(50) NOT NULL,        -- 业务类型
    tokens_used     INT NOT NULL,                -- 使用的token数
    request_count   INT NOT NULL,                -- 请求次数
    success_count   INT NOT NULL,                -- 成功次数
    fail_count      INT NOT NULL,                -- 失败次数
    total_duration  INT NOT NULL,                -- 总耗时(毫秒)
    stat_date       DATE NOT NULL,               -- 统计日期
    created_at      DATETIME NOT NULL,
    KEY idx_company_date (company_id, stat_date),
    KEY idx_user_date (user_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用统计表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_config (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    config_key      VARCHAR(100) NOT NULL,       -- 配置键
    config_value    TEXT,                        -- 配置值
    config_type     VARCHAR(50) NOT NULL,        -- 配置类型(database/system/security等)
    description     VARCHAR(200),                -- 配置描述
    is_encrypted    TINYINT NOT NULL DEFAULT 0,  -- 是否加密存储
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:启用 0:禁用)
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 会计科目模板表
CREATE TABLE IF NOT EXISTS sys_subject_template (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    system_id       INT NOT NULL,                -- 会计制度ID
    code            VARCHAR(50) NOT NULL,        -- 科目编码
    name            VARCHAR(100) NOT NULL,       -- 科目名称
    parent_code     VARCHAR(50),                 -- 父级科目编码
    level           INT NOT NULL,                -- 科目级次
    category        VARCHAR(20) NOT NULL,        -- 科目类别
    direction       TINYINT NOT NULL,            -- 余额方向
    is_detail       BIT NOT NULL,                -- 是否明细科目
    is_cash         BIT NOT NULL DEFAULT 0,      -- 是否现金科目
    need_qty        BIT NOT NULL DEFAULT 0,      -- 是否数量核算
    need_aux        VARCHAR(200),                -- 辅助核算类型
    description     VARCHAR(500),                -- 科目说明
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    UNIQUE KEY uk_system_code (system_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计科目模板表';

-- 会计制度切换记录表
CREATE TABLE IF NOT EXISTS sys_accounting_system_change (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    company_id          INT NOT NULL,                -- 企业ID
    old_system_id       INT NOT NULL,                -- 原会计制度ID
    new_system_id       INT NOT NULL,                -- 新会计制度ID
    change_date         DATE NOT NULL,               -- 变更日期
    change_reason       VARCHAR(500),                -- 变更原因
    approval_status     TINYINT NOT NULL DEFAULT 0,  -- 审批状态(0:待审批 1:已审批 2:已拒绝)
    approved_by         INT,                         -- 审批人
    approved_at         DATETIME,                    -- 审批时间
    created_at          DATETIME NOT NULL,
    created_by          INT NOT NULL,
    KEY idx_company_date (company_id, change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计制度切换记录表';

-- 会计制度版本更新日志表
CREATE TABLE IF NOT EXISTS sys_accounting_system_version_log (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    system_id           INT NOT NULL,                -- 会计制度ID
    old_version         VARCHAR(50),                 -- 原版本
    new_version         VARCHAR(50) NOT NULL,        -- 新版本
    update_date         DATE NOT NULL,               -- 更新日期
    update_content      TEXT NOT NULL,               -- 更新内容
    reference_doc       VARCHAR(500),                -- 参考文档
    created_at          DATETIME NOT NULL,
    created_by          INT NOT NULL,
    KEY idx_system_version (system_id, new_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计制度版本更新日志表';

-- 科目对照映射表
CREATE TABLE IF NOT EXISTS sys_subject_mapping (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    from_system_id      INT NOT NULL,                -- 源制度ID
    to_system_id        INT NOT NULL,                -- 目标制度ID
    from_subject_code   VARCHAR(50) NOT NULL,        -- 源科目编码
    to_subject_code     VARCHAR(50) NOT NULL,        -- 目标科目编码
    mapping_type        TINYINT NOT NULL,            -- 映射类型(1:一对一 2:一对多 3:多对一)
    mapping_rule        TEXT,                        -- 映射规则
    created_at          DATETIME NOT NULL,
    created_by          INT NOT NULL,
    updated_at          DATETIME,
    updated_by          INT,
    UNIQUE KEY uk_mapping (from_system_id, to_system_id, from_subject_code, to_subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目对照映射表';

-- 初始化会计制度数据
INSERT IGNORE INTO sys_accounting_system 
(code, name, description, version, effective_date, status, created_at, created_by) 
VALUES 
('SMALL', '小企业会计准则', '小企业会计准则（2013年颁布）', '2013', '2013-01-01', 1, NOW(), 1),
('STANDARD', '企业会计准则', '企业会计准则（2021年版）', '2021', '2021-01-01', 1, NOW(), 1);

-- 初始化企业账套数据
INSERT IGNORE INTO sys_company 
(company_code, company_name, tax_code, legal_person, contact, phone, 
 address, email, db_name, fiscal_year, period_type, begin_date, 
 currency_code, accounting_system_id, status, created_at, created_by) 
VALUES 
('ZYT001', '智易通科技有限公司', '91110108MA7XXXXX', '张三', '李四', '13800138000', 
 '北京市海淀区中关村软件园', 'contact@zhiyitong.com', 'zyt_company_001', 2024, 1, '2024-01-01', 
 'CNY', 1, 1, NOW(), 1),
('ZYT002', '北京数字科技有限公司', '91110108MA7YYYYY', '王五', '赵六', '13900139000', 
 '北京市朝阳区望京科技园', 'contact@digitech.com', 'zyt_company_002', 2024, 1, '2024-01-01', 
 'CNY', 2, 1, NOW(), 1);

-- 初始化会计科目模板数据

-- 小企业会计准则科目模板
INSERT INTO sys_subject_template (system_id, code, name, parent_code, level, category, direction, is_detail, is_cash, need_qty, need_aux, description, created_at, created_by) 
VALUES
(1, '1001', '库存现金', NULL, 1, '资产', 1, 1, 1, 0, NULL, '现金科目', NOW(), 1),
(1, '1002', '银行存款', NULL, 1, '资产', 1, 1, 0, 0, NULL, '银行存款科目', NOW(), 1),
(1, '1012', '其他货币资金', NULL, 1, '资产', 1, 0, 0, 0, NULL, '其他货币资金科目', NOW(), 1),
(1, '1101', '短期投资', NULL, 1, '资产', 1, 0, 0, 0, NULL, '短期投资科目', NOW(), 1),
(1, '1121', '应收票据', NULL, 1, '资产', 1, 0, 0, 0, NULL, '应收票据科目', NOW(), 1),
(1, '1122', '应收账款', NULL, 1, '资产', 1, 0, 0, 0, NULL, '应收账款科目', NOW(), 1),
(1, '1123', '预付账款', NULL, 1, '资产', 1, 0, 0, 0, NULL, '预付账款科目', NOW(), 1),
(1, '1131', '应收股利', NULL, 1, '资产', 1, 0, 0, 0, NULL, '应收股利科目', NOW(), 1),
(1, '1132', '应收利息', NULL, 1, '资产', 1, 0, 0, 0, NULL, '应收利息科目', NOW(), 1),
(1, '1221', '其他应收款', NULL, 1, '资产', 1, 0, 0, 0, NULL, '其他应收款科目', NOW(), 1),
(1, '1401', '材料采购', NULL, 1, '资产', 1, 0, 0, 0, NULL, '材料采购科目', NOW(), 1),
(1, '1402', '在途物资', NULL, 1, '资产', 1, 0, 0, 0, NULL, '在途物资科目', NOW(), 1),
(1, '1403', '原材料', NULL, 1, '资产', 1, 1, 0, 0, NULL, '原材料科目', NOW(), 1),
(1, '1404', '材料成本差异', NULL, 1, '资产', 1, 0, 0, 0, NULL, '材料成本差异科目', NOW(), 1),
(1, '1405', '库存商品', NULL, 1, '资产', 1, 1, 0, 0, NULL, '库存商品科目', NOW(), 1),
(1, '1406', '发出商品', NULL, 1, '资产', 1, 0, 0, 0, NULL, '发出商品科目', NOW(), 1),
(1, '1407', '商品进销差价', NULL, 1, '资产', 1, 0, 0, 0, NULL, '商品进销差价科目', NOW(), 1),
(1, '1411', '周转材料', NULL, 1, '资产', 1, 0, 0, 0, NULL, '周转材料科目', NOW(), 1),
(1, '1421', '委托加工物资', NULL, 1, '资产', 1, 0, 0, 0, NULL, '委托加工物资科目', NOW(), 1),
(1, '1431', '委托代销商品', NULL, 1, '资产', 1, 0, 0, 0, NULL, '委托代销商品科目', NOW(), 1),
(1, '1501', '长期股权投资', NULL, 1, '资产', 1, 0, 0, 0, NULL, '长期股权投资科目', NOW(), 1),
(1, '1511', '固定资产', NULL, 1, '资产', 1, 1, 0, 0, NULL, '固定资产科目', NOW(), 1),
(1, '1512', '累计折旧', NULL, 1, '资产', 1, 0, 0, 0, NULL, '累计折旧科目', NOW(), 1),
(1, '1513', '固定资产减值准备', NULL, 1, '资产', 1, 0, 0, 0, NULL, '固定资产减值准备科目', NOW(), 1),
(1, '1521', '在建工程', NULL, 1, '资产', 1, 0, 0, 0, NULL, '在建工程科目', NOW(), 1),
(1, '1531', '固定资产清理', NULL, 1, '资产', 1, 0, 0, 0, NULL, '固定资产清理科目', NOW(), 1),
(1, '1601', '无形资产', NULL, 1, '资产', 1, 1, 0, 0, NULL, '无形资产科目', NOW(), 1),
(1, '1602', '累计摊销', NULL, 1, '资产', 1, 0, 0, 0, NULL, '累计摊销科目', NOW(), 1),
(1, '1603', '无形资产减值准备', NULL, 1, '资产', 1, 0, 0, 0, NULL, '无形资产减值准备科目', NOW(), 1),
(1, '1701', '长期待摊费用', NULL, 1, '资产', 1, 0, 0, 0, NULL, '长期待摊费用科目', NOW(), 1),
(1, '1801', '待处理财产损溢', NULL, 1, '资产', 1, 0, 0, 0, NULL, '待处理财产损溢科目', NOW(), 1),
(1, '2101', '短期借款', NULL, 1, '负债', -1, 1, 0, 0, NULL, '短期借款科目', NOW(), 1),
(1, '2201', '应付票据', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应付票据科目', NOW(), 1),
(1, '2202', '应付账款', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应付账款科目', NOW(), 1),
(1, '2203', '预收账款', NULL, 1, '负债', -1, 0, 0, 0, NULL, '预收账款科目', NOW(), 1),
(1, '2211', '应付职工薪酬', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应付职工薪酬科目', NOW(), 1),
(1, '2221', '应交税费', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应交税费科目', NOW(), 1),
(1, '2231', '应付利息', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应付利息科目', NOW(), 1),
(1, '2232', '应付股利', NULL, 1, '负债', -1, 0, 0, 0, NULL, '应付股利科目', NOW(), 1),
(1, '2241', '其他应付款', NULL, 1, '负债', -1, 0, 0, 0, NULL, '其他应付款科目', NOW(), 1),
(1, '2301', '预提费用', NULL, 1, '负债', -1, 0, 0, 0, NULL, '预提费用科目', NOW(), 1),
(1, '2401', '递延收益', NULL, 1, '负债', -1, 0, 0, 0, NULL, '递延收益科目', NOW(), 1),
(1, '2501', '长期借款', NULL, 1, '负债', -1, 0, 0, 0, NULL, '长期借款科目', NOW(), 1),
(1, '2701', '长期应付款', NULL, 1, '负债', -1, 0, 0, 0, NULL, '长期应付款科目', NOW(), 1),
(1, '2801', '预计负债', NULL, 1, '负债', -1, 0, 0, 0, NULL, '预计负债科目', NOW(), 1),
(1, '2901', '递延所得税负债', NULL, 1, '负债', -1, 0, 0, 0, NULL, '递延所得税负债科目', NOW(), 1),
(1, '3001', '实收资本', NULL, 1, '权益', -1, 1, 0, 0, NULL, '实收资本科目', NOW(), 1),
(1, '3101', '资本公积', NULL, 1, '权益', -1, 0, 0, 0, NULL, '资本公积科目', NOW(), 1),
(1, '3103', '盈余公积', NULL, 1, '权益', -1, 0, 0, 0, NULL, '盈余公积科目', NOW(), 1),
(1, '3104', '本年利润', NULL, 1, '权益', -1, 1, 0, 0, NULL, '本年利润科目', NOW(), 1),
(1, '3105', '利润分配', NULL, 1, '权益', -1, 0, 0, 0, NULL, '利润分配科目', NOW(), 1),
(1, '4001', '生产成本', NULL, 1, '成本', 1, 0, 0, 0, NULL, '生产成本科目', NOW(), 1),
(1, '4101', '制造费用', NULL, 1, '成本', 1, 0, 0, 0, NULL, '制造费用科目', NOW(), 1),
(1, '4301', '研发支出', NULL, 1, '成本', 1, 0, 0, 0, NULL, '研发支出科目', NOW(), 1),
(1, '4401', '工程施工', NULL, 1, '成本', 1, 0, 0, 0, NULL, '工程施工科目', NOW(), 1),
(1, '4403', '机械作业', NULL, 1, '成本', 1, 0, 0, 0, NULL, '机械作业科目', NOW(), 1),
(1, '5001', '主营业务收入', NULL, 1, '收入', -1, 1, 0, 0, NULL, '主营业务收入科目', NOW(), 1),
(1, '5051', '其他业务收入', NULL, 1, '收入', -1, 0, 0, 0, NULL, '其他业务收入科目', NOW(), 1),
(1, '5111', '投资收益', NULL, 1, '收入', -1, 0, 0, 0, NULL, '投资收益科目', NOW(), 1),
(1, '5301', '营业外收入', NULL, 1, '收入', -1, 0, 0, 0, NULL, '营业外收入科目', NOW(), 1),
(1, '5401', '主营业务成本', NULL, 1, '费用', 1, 1, 0, 0, NULL, '主营业务成本科目', NOW(), 1),
(1, '5402', '其他业务成本', NULL, 1, '费用', 1, 0, 0, 0, NULL, '其他业务成本科目', NOW(), 1),
(1, '5403', '税金及附加', NULL, 1, '费用', 1, 0, 0, 0, NULL, '税金及附加科目', NOW(), 1),
(1, '5601', '销售费用', NULL, 1, '费用', 1, 0, 0, 0, NULL, '销售费用科目', NOW(), 1),
(1, '5602', '管理费用', NULL, 1, '费用', 1, 0, 0, 0, NULL, '管理费用科目', NOW(), 1),
(1, '5603', '财务费用', NULL, 1, '费用', 1, 0, 0, 0, NULL, '财务费用科目', NOW(), 1),
(1, '5711', '营业外支出', NULL, 1, '费用', 1, 0, 0, 0, NULL, '营业外支出科目', NOW(), 1),
(1, '5801', '所得税费用', NULL, 1, '费用', 1, 0, 0, 0, NULL, '所得税费用科目', NOW(), 1);

-- 注意：
-- 1. 根据企业实际需要，可以增加或调整科目。
-- 2. 确保 sys_subject_template 表存在，并且字段与此脚本兼容。
-- 3. `NOW()` 函数生成当前时间，如果需要固定时间可替换为具体的时间值。

-- 企业会计准则科目模板
-- TODO: 添加企业会计准则的科目模板

-- 民间非营利组织会计制度科目模板
-- TODO: 添加民间非营利组织的科目模板

-- 插入管理员用户
INSERT INTO sys_user (username, password, real_name, email, mobile, is_admin, created_at, created_by)
VALUES ('admin', '加密后的密码', '管理员', 'admin@example.com', '1234567890', 1, NOW(), 1);

-- 插入普通用户数据
INSERT INTO sys_user (username, password, real_name, email, mobile, is_admin, status, created_at, created_by)
VALUES ('user', 'hashed_password_here', 'User', 'user@example.com', '1234567890', 0, 1, NOW(), 1);

-- 插入角色数据
INSERT INTO sys_role (role_code, role_name, description, status, created_at, created_by)
VALUES
('admin', '管理员', '具有所有权限的管理员角色', 1, NOW(), 1),
('normal_user', '普通用户', '普通用户角色，权限有限', 1, NOW(), 1);

-- 插入权限数据
INSERT INTO sys_permission (perm_code, perm_name, perm_type, path, component, icon, sort_no, status, created_at, created_by)
VALUES
('view_dashboard', '查看仪表盘', 'menu', '/dashboard', 'Dashboard', 'dashboard-icon', 1, 1, NOW(), 1),
('edit_settings', '编辑设置', 'button', NULL, NULL, 'settings-icon', 2, 1, NOW(), 1),
('view_reports', '查看报告', 'menu', '/reports', 'Reports', 'reports-icon', 3, 1, NOW(), 1);

-- 为管理员角色分配所有权限
INSERT INTO sys_role_permission (role_id, permission_id, created_at, created_by)
VALUES
(1, 1, NOW(), 1),  -- admin 角色查看仪表盘权限
(1, 2, NOW(), 1),  -- admin 角色编辑设置权限
(1, 3, NOW(), 1);  -- admin 角色查看报告权限

-- 为普通用户角色分配有限权限
INSERT INTO sys_role_permission (role_id, permission_id, created_at, created_by)
VALUES
(2, 1, NOW(), 1),  -- normal_user 角色查看仪表盘权限
(2, 3, NOW(), 1);  -- normal_user 角色查看报告权限

-- 将用户与角色关联
INSERT INTO sys_user_role (user_id, role_id, created_at, created_by)
VALUES
(1, 1, NOW(), 1),  -- 将 admin 用户与 admin 角色关联
(2, 2, NOW(), 1);  -- 将 user 用户与 normal_user 角色关联