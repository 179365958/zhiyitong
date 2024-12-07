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
    config_key      VARCHAR(50) NOT NULL,        -- 配置键
    config_value    TEXT NOT NULL,               -- 配置值
    description     VARCHAR(200),                -- 配置说明
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,           -- 创建时间
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,           -- 更新时间
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

-- 初始化基础会计制度数据
INSERT INTO sys_accounting_system (code, name, description, version, effective_date, status, created_at, created_by) VALUES
('SMALL', '小企业会计准则', '小企业会计准则（2013年颁布）', '2013', '2013-01-01', 1, NOW(), 1),
('CAS', '企业会计准则', '企业会计准则（2006年颁布）', '2006', '2007-01-01', 1, NOW(), 1),
('NPO', '民间非营利组织会计制度', '民间非营利组织会计制度（2005年颁布）', '2005', '2005-01-01', 1, NOW(), 1);

-- 初始化会计科目模板数据

-- 小企业会计准则科目模板
INSERT INTO sys_subject_template 
(system_id, code, name, parent_code, level, category, direction, is_detail, is_cash, need_qty, description, created_at, created_by) 
VALUES
-- 资产类
(1, '1001', '库存现金', NULL, 1, '资产', 1, 1, 1, 0, '企业库存的货币资金', NOW(), 1),
(1, '1002', '银行存款', NULL, 1, '资产', 1, 1, 1, 0, '企业存入银行的货币资金', NOW(), 1),
(1, '1012', '其他货币资金', NULL, 1, '资产', 1, 1, 1, 0, '企业的其他货币资金', NOW(), 1),
(1, '1101', '短期投资', NULL, 1, '资产', 1, 0, 0, 0, '企业持有的能够随时变现的投资', NOW(), 1),
(1, '1121', '应收票据', NULL, 1, '资产', 1, 1, 0, 0, '企业因销售商品等而收到的票据', NOW(), 1),

-- 负债类
(1, '2001', '短期借款', NULL, 1, '负债', 2, 1, 0, 0, '企业向银行等金融机构借入的期限在1年内的借款', NOW(), 1),
(1, '2201', '应付票据', NULL, 1, '负债', 2, 1, 0, 0, '企业因购买材料等而出具的票据', NOW(), 1),

-- 权益类
(1, '3001', '实收资本', NULL, 1, '权益', 2, 1, 0, 0, '投资者实际投入的资本', NOW(), 1),
(1, '3002', '资本公积', NULL, 1, '权益', 2, 1, 0, 0, '企业收到的除实收资本以外的其他资本性投入', NOW(), 1),

-- 成本类
(1, '4001', '生产成本', NULL, 1, '成本', 1, 0, 0, 0, '企业进行生产过程中发生的成本', NOW(), 1),
(1, '4101', '制造费用', NULL, 1, '成本', 1, 0, 0, 0, '企业生产过程中发生的间接费用', NOW(), 1),

-- 损益类
(1, '5001', '主营业务收入', NULL, 1, '损益', 2, 1, 0, 0, '企业销售商品等主营业务收入', NOW(), 1),
(1, '5051', '其他业务收入', NULL, 1, '损益', 2, 1, 0, 0, '企业除主营业务以外的其他业务收入', NOW(), 1),
(1, '5401', '主营业务成本', NULL, 1, '损益', 1, 1, 0, 0, '企业销售商品等主营业务成本', NOW(), 1),
(1, '5402', '其他业务成本', NULL, 1, '损益', 1, 1, 0, 0, '企业其他业务发生的成本', NOW(), 1);

-- 企业会计准则科目模板
-- TODO: 添加企业会计准则的科目模板

-- 民间非营利组织会计制度科目模板
-- TODO: 添加民间非营利组织的科目模板
