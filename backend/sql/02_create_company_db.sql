-- 创建账套数据库模板
-- 注意：实际使用时需要替换数据库名
CREATE DATABASE IF NOT EXISTS zyt_example DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE zyt_example;
-- 科目表
CREATE TABLE IF NOT EXISTS account_subject (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(50) NOT NULL,            -- 科目编码
    name        VARCHAR(100) NOT NULL,           -- 科目名称
    parent_code VARCHAR(50),                     -- 父级科目编码
    level       INT NOT NULL,                    -- 科目级次
    category    VARCHAR(20) NOT NULL,            -- 科目类别(资产,负债,权益,成本,损益)
    direction   TINYINT NOT NULL,                -- 余额方向(1:借方 2:贷方)
    is_detail   BIT NOT NULL,                    -- 是否明细科目
    is_cash     BIT NOT NULL DEFAULT 0,          -- 是否现金科目
    need_qty    BIT NOT NULL DEFAULT 0,          -- 是否数量核算
    need_aux    VARCHAR(200),                    -- 辅助核算类型
    status      TINYINT NOT NULL DEFAULT 1,      -- 状态
    created_at  DATETIME NOT NULL,               -- 创建时间
    created_by  INT NOT NULL,                    -- 创建人
    updated_at  DATETIME,                        -- 更新时间
    updated_by  INT,                             -- 更新人
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目表';

-- 会计期间表
CREATE TABLE IF NOT EXISTS accounting_period (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    year            INT NOT NULL,                -- 会计年度
    period          INT NOT NULL,                -- 会计期间(1-12)
    start_date      DATE NOT NULL,               -- 起始日期
    end_date        DATE NOT NULL,               -- 结束日期
    is_closed       BIT NOT NULL DEFAULT 0,      -- 是否结账
    is_year_closed  BIT NOT NULL DEFAULT 0,      -- 是否年结
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_year_period (year, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计期间表';

-- 币种表
CREATE TABLE IF NOT EXISTS currency (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    currency_code   VARCHAR(10) NOT NULL,        -- 币种代码
    currency_name   VARCHAR(50) NOT NULL,        -- 币种名称
    exchange_rate   DECIMAL(18,8) NOT NULL,      -- 汇率
    is_base         BIT NOT NULL DEFAULT 0,      -- 是否本位币
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_currency_code (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='币种表';

-- 凭证字表
CREATE TABLE IF NOT EXISTS voucher_type (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    type_code       VARCHAR(10) NOT NULL,        -- 凭证字编码
    type_name       VARCHAR(50) NOT NULL,        -- 凭证字名称
    auto_number     BIT NOT NULL DEFAULT 1,      -- 是否自动编号
    start_number    INT NOT NULL DEFAULT 1,      -- 起始编号
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    updated_at      DATETIME,                    -- 更新时间
    updated_by      INT,                         -- 更新人
    UNIQUE KEY uk_type_code (type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证字表';

-- 凭证表
CREATE TABLE IF NOT EXISTS voucher (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    period_id       INT NOT NULL,                -- 会计期间ID
    voucher_type    VARCHAR(10) NOT NULL,        -- 凭证字
    voucher_no      VARCHAR(50) NOT NULL,        -- 凭证号
    voucher_date    DATE NOT NULL,               -- 凭证日期
    summary         VARCHAR(200),                -- 凭证摘要
    attachment_count INT NOT NULL DEFAULT 0,      -- 附件数量
    total_debit     DECIMAL(18,2) NOT NULL,      -- 借方合计
    total_credit    DECIMAL(18,2) NOT NULL,      -- 贷方合计
    created_by      INT NOT NULL,                -- 制单人ID
    created_at      DATETIME NOT NULL,           -- 制单时间
    reviewed_by     INT,                         -- 审核人ID
    reviewed_at     DATETIME,                    -- 审核时间
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态(1:未审核 2:已审核 3:作废)
    is_ai_generated BIT NOT NULL DEFAULT 0,      -- AI生成标记
    ai_confidence  DECIMAL(5,2),                -- AI置信度
    ai_suggestion TEXT,                        -- AI建议
    UNIQUE KEY uk_period_no (period_id, voucher_type, voucher_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证表';

-- 凭证分录表
CREATE TABLE IF NOT EXISTS voucher_entry (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id      INT NOT NULL,                -- 凭证ID
    subject_id      INT NOT NULL,                -- 科目ID
    summary         VARCHAR(200),                -- 摘要
    currency_id     INT NOT NULL DEFAULT 1,      -- 币种ID
    exchange_rate   DECIMAL(18,8),               -- 汇率
    original_amount DECIMAL(18,2),               -- 原币金额
    debit_amount    DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 借方金额
    credit_amount   DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 贷方金额
    quantity        DECIMAL(18,4),               -- 数量
    unit_price      DECIMAL(18,4),               -- 单价
    entry_order     INT NOT NULL,                -- 分录序号
    ai_matched BIT NOT NULL DEFAULT 0,          -- AI匹配标记
    ai_score   DECIMAL(5,2),                    -- AI匹配分数
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    KEY idx_voucher (voucher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证分录表';

-- 科目余额表
CREATE TABLE IF NOT EXISTS subject_balance (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    period_id       INT NOT NULL,                -- 会计期间ID
    subject_id      INT NOT NULL,                -- 科目ID
    currency_id     INT NOT NULL DEFAULT 1,      -- 币种ID
    begin_debit     DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期初借方余额
    begin_credit    DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期初贷方余额
    period_debit    DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 本期借方发生额
    period_credit   DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 本期贷方发生额
    end_debit       DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期末借方余额
    end_credit      DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期末贷方余额
    qty_begin       DECIMAL(18,4),               -- 期初数量
    qty_in          DECIMAL(18,4),               -- 本期入库数量
    qty_out         DECIMAL(18,4),               -- 本期出库数量
    qty_end         DECIMAL(18,4),               -- 期末数量
    UNIQUE KEY uk_period_subject (period_id, subject_id, currency_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目余额表';

-- 附件表
CREATE TABLE IF NOT EXISTS attachment (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    business_type   VARCHAR(50) NOT NULL,        -- 业务类型
    business_id     INT NOT NULL,                -- 业务ID
    file_name       VARCHAR(200) NOT NULL,       -- 文件名
    file_path       VARCHAR(500) NOT NULL,       -- 文件路径
    file_size       BIGINT NOT NULL,             -- 文件大小
    file_type       VARCHAR(50),                 -- 文件类型
    created_at      DATETIME NOT NULL,           -- 创建时间
    created_by      INT NOT NULL,                -- 创建人
    KEY idx_business (business_type, business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';

-- AI辅助记账规则表
CREATE TABLE IF NOT EXISTS ai_accounting_rule (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_type       VARCHAR(50) NOT NULL,        -- 规则类型
    business_scene  VARCHAR(100) NOT NULL,       -- 业务场景
    keywords        VARCHAR(500),                -- 关键词
    subject_code    VARCHAR(50),                 -- 建议科目
    summary_template VARCHAR(200),               -- 摘要模板
    rule_content    JSON,                        -- 规则内容
    usage_count     INT NOT NULL DEFAULT 0,      -- 使用次数
    success_rate    DECIMAL(5,2),                -- 成功率
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    KEY idx_scene (business_scene)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI辅助记账规则表';

-- AI分析报告表
CREATE TABLE IF NOT EXISTS ai_analysis_report (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    report_type     VARCHAR(50) NOT NULL,        -- 报告类型
    period_id       INT NOT NULL,                -- 会计期间
    report_content  JSON NOT NULL,               -- 报告内容
    risk_level      TINYINT,                     -- 风险等级
    suggestions     TEXT,                        -- 建议
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    KEY idx_period (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分析报告表';

-- AI预警规则表
CREATE TABLE IF NOT EXISTS ai_alert_rule (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_name       VARCHAR(100) NOT NULL,       -- 规则名称
    rule_type       VARCHAR(50) NOT NULL,        -- 规则类型
    condition_expr  TEXT NOT NULL,               -- 条件表达式
    alert_level     TINYINT NOT NULL,            -- 预警级别
    alert_message   VARCHAR(500),                -- 预警消息
    status          TINYINT NOT NULL DEFAULT 1,  -- 状态
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI预警规则表';

-- AI预警记录表
CREATE TABLE IF NOT EXISTS ai_alert_log (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_id         INT NOT NULL,                -- 规则ID
    alert_level     TINYINT NOT NULL,            -- 预警级别
    alert_content   TEXT NOT NULL,               -- 预警内容
    business_type   VARCHAR(50),                 -- 业务类型
    business_id     INT,                         -- 业务ID
    is_processed    BIT NOT NULL DEFAULT 0,      -- 是否处理
    process_note    VARCHAR(500),                -- 处理说明
    created_at      DATETIME NOT NULL,
    processed_at    DATETIME,
    processed_by    INT,
    KEY idx_rule (rule_id),
    KEY idx_business (business_type, business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI预警记录表';

-- 期初余额表
CREATE TABLE IF NOT EXISTS account_initial_balance (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    subject_id      INT NOT NULL,                -- 科目ID
    period_year     INT NOT NULL,                -- 启用年度
    period_month    INT NOT NULL,                -- 启用月份
    currency_code   VARCHAR(10) NOT NULL,        -- 币种
    debit_amount    DECIMAL(18,2) DEFAULT 0,     -- 借方金额
    credit_amount   DECIMAL(18,2) DEFAULT 0,     -- 贷方金额
    debit_qty       DECIMAL(18,2) DEFAULT 0,     -- 借方数量
    credit_qty      DECIMAL(18,2) DEFAULT 0,     -- 贷方数量
    aux_info        JSON,                        -- 辅助核算信息
    created_at      DATETIME NOT NULL,
    created_by      INT NOT NULL,
    updated_at      DATETIME,
    updated_by      INT,
    UNIQUE KEY uk_subject_period (subject_id, period_year, period_month, currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='期初余额表';

-- 会计制度变更明细表
CREATE TABLE IF NOT EXISTS accounting_system_change_detail (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    change_id           INT NOT NULL,                -- 变更记录ID
    old_subject_id      INT NOT NULL,                -- 原科目ID
    new_subject_id      INT NOT NULL,                -- 新科目ID
    mapping_type        TINYINT NOT NULL,            -- 映射类型(1:一对一 2:一对多 3:多对一)
    conversion_rule     TEXT,                        -- 转换规则
    balance_transfer    TEXT,                        -- 余额转移说明
    status             TINYINT NOT NULL DEFAULT 0,   -- 执行状态(0:待执行 1:已执行 2:执行失败)
    error_message      TEXT,                         -- 错误信息
    created_at         DATETIME NOT NULL,
    created_by         INT NOT NULL,
    updated_at         DATETIME,
    updated_by         INT,
    KEY idx_change_id (change_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计制度变更明细表';

-- 科目映射历史表
CREATE TABLE IF NOT EXISTS subject_mapping_history (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    change_detail_id    INT NOT NULL,                -- 变更明细ID
    voucher_id          INT,                         -- 转换凭证ID
    old_balance         DECIMAL(18,2),               -- 原科目余额
    new_balance         DECIMAL(18,2),               -- 新科目余额
    difference          DECIMAL(18,2),               -- 差额
    handle_method       VARCHAR(500),                -- 处理方法
    created_at          DATETIME NOT NULL,
    created_by          INT NOT NULL,
    KEY idx_detail_id (change_detail_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目映射历史表';

-- AI票据识别记录表
CREATE TABLE IF NOT EXISTS ai_document_recognition_record (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    doc_type        VARCHAR(50) NOT NULL COMMENT '单据类型(发票/收据/合同等)',
    doc_number      VARCHAR(100) COMMENT '单据编号',
    doc_date        DATE COMMENT '单据日期',
    recognition_data JSON NOT NULL COMMENT '识别数据',
    original_file   VARCHAR(200) COMMENT '原始文件路径',
    confidence      DECIMAL(5,2) COMMENT '置信度',
    verify_status   TINYINT NOT NULL DEFAULT 0 COMMENT '验证状态(0:待验证 1:已验证)',
    verify_result   TINYINT COMMENT '验证结果(0:不通过 1:通过)',
    verify_note     TEXT COMMENT '验证说明',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    verified_at     DATETIME COMMENT '验证时间',
    verified_by     INT COMMENT '验证人',
    KEY idx_doc_number (doc_number),
    KEY idx_doc_date (doc_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI票据识别记录表';

-- AI自动记账规则表
CREATE TABLE IF NOT EXISTS ai_booking_rule (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_code       VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_name       VARCHAR(100) NOT NULL COMMENT '规则名称',
    business_type   VARCHAR(50) NOT NULL COMMENT '业务类型',
    match_condition JSON NOT NULL COMMENT '匹配条件',
    subject_rules   JSON NOT NULL COMMENT '科目规则',
    amount_rules    JSON NOT NULL COMMENT '金额规则',
    auxiliary_rules JSON COMMENT '辅助核算规则',
    priority        INT NOT NULL DEFAULT 0 COMMENT '优先级',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_rule_code (rule_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI自动记账规则表';

-- AI自动记账结果表
CREATE TABLE IF NOT EXISTS ai_booking_result (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    doc_id          INT NOT NULL COMMENT '关联单据ID',
    rule_code       VARCHAR(50) NOT NULL COMMENT '匹配规则编码',
    voucher_type    VARCHAR(50) NOT NULL COMMENT '凭证字',
    booking_date    DATE NOT NULL COMMENT '记账日期',
    entries         JSON NOT NULL COMMENT '分录数据',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态(0:待审核 1:已审核 2:已驳回)',
    error_msg       TEXT COMMENT '错误信息',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    approved_at     DATETIME COMMENT '审核时间',
    approved_by     INT COMMENT '审核人',
    KEY idx_doc_id (doc_id),
    KEY idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI自动记账结果表';

-- AI审核规则表
CREATE TABLE IF NOT EXISTS ai_audit_rule (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    rule_code       VARCHAR(50) NOT NULL COMMENT '规则编码',
    rule_name       VARCHAR(100) NOT NULL COMMENT '规则名称',
    audit_type      VARCHAR(50) NOT NULL COMMENT '审核类型',
    check_points    JSON NOT NULL COMMENT '检查点配置',
    risk_level      TINYINT NOT NULL COMMENT '风险等级(1-5)',
    auto_action     VARCHAR(50) COMMENT '自动处理动作',
    notification    JSON COMMENT '通知配置',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    UNIQUE KEY uk_rule_code (rule_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI审核规则表';

-- AI审核记录表
CREATE TABLE IF NOT EXISTS ai_audit_record (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    target_type     VARCHAR(50) NOT NULL COMMENT '审核对象类型',
    target_id       INT NOT NULL COMMENT '审核对象ID',
    rule_code       VARCHAR(50) NOT NULL COMMENT '规则编码',
    check_result    JSON NOT NULL COMMENT '检查结果',
    risk_level      TINYINT COMMENT '风险等级(1-5)',
    status          TINYINT NOT NULL COMMENT '状态(0:异常 1:正常)',
    remark          TEXT COMMENT '备注',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    KEY idx_target (target_type, target_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI审核记录表';

-- AI财务分析记录表
CREATE TABLE IF NOT EXISTS ai_financial_analysis (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    analysis_type   VARCHAR(50) NOT NULL COMMENT '分析类型',
    period_start    DATE NOT NULL COMMENT '期间开始',
    period_end      DATE NOT NULL COMMENT '期间结束',
    indicators      JSON NOT NULL COMMENT '指标数据',
    analysis_result JSON NOT NULL COMMENT '分析结果',
    suggestions     JSON COMMENT '建议措施',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    KEY idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI财务分析记录表';

-- AI异常预警记录表
CREATE TABLE IF NOT EXISTS ai_warning_record (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    warning_type    VARCHAR(50) NOT NULL COMMENT '预警类型',
    warning_level   TINYINT NOT NULL COMMENT '预警等级(1-5)',
    warning_content TEXT NOT NULL COMMENT '预警内容',
    related_data    JSON COMMENT '相关数据',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态(0:未处理 1:已处理 2:已忽略)',
    handle_note     TEXT COMMENT '处理说明',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handled_at      DATETIME COMMENT '处理时间',
    handled_by      INT COMMENT '处理人',
    KEY idx_warning_type (warning_type),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI异常预警记录表';

-- AI决策建议记录表
CREATE TABLE IF NOT EXISTS ai_decision_suggestion (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    scenario        VARCHAR(100) NOT NULL COMMENT '决策场景',
    analysis_data   JSON NOT NULL COMMENT '分析数据',
    suggestions     JSON NOT NULL COMMENT '建议内容',
    risk_analysis   JSON COMMENT '风险分析',
    benefit_analysis JSON COMMENT '收益分析',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    feedback        TEXT COMMENT '反馈',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      INT NOT NULL,
    updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT,
    KEY idx_scenario (scenario),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI决策建议记录表';

-- 辅助核算类型表
CREATE TABLE IF NOT EXISTS auxiliary_type (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(20) NOT NULL,         -- 类型编码
    name            VARCHAR(50) NOT NULL,         -- 类型名称
    status          TINYINT NOT NULL DEFAULT 1,   -- 状态
    created_at      DATETIME NOT NULL,            -- 创建时间
    created_by      INT NOT NULL,                 -- 创建人
    updated_at      DATETIME,                     -- 更新时间
    updated_by      INT,                          -- 更新人
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='辅助核算类型表';

-- 辅助核算项目表
CREATE TABLE IF NOT EXISTS auxiliary_item (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    type_id         INT NOT NULL,                 -- 类型ID
    code            VARCHAR(20) NOT NULL,         -- 项目编码
    name            VARCHAR(50) NOT NULL,         -- 项目名称
    status          TINYINT NOT NULL DEFAULT 1,   -- 状态
    created_at      DATETIME NOT NULL,            -- 创建时间
    created_by      INT NOT NULL,                 -- 创建人
    updated_at      DATETIME,                     -- 更新时间
    updated_by      INT,                          -- 更新人
    UNIQUE KEY uk_type_code (type_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='辅助核算项目表';

-- 辅助核算余额表
CREATE TABLE IF NOT EXISTS auxiliary_balance (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    period_id       INT NOT NULL,                 -- 会计期间ID
    subject_id      INT NOT NULL,                 -- 科目ID
    auxiliary_type_id INT NOT NULL,               -- 辅助核算类型ID
    auxiliary_id    INT NOT NULL,                 -- 辅助核算项目ID
    currency_id     INT NOT NULL DEFAULT 1,       -- 币种ID
    begin_debit     DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期初借方余额
    begin_credit    DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期初贷方余额
    period_debit    DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 本期借方发生额
    period_credit   DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 本期贷方发生额
    end_debit       DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期末借方余额
    end_credit      DECIMAL(18,2) NOT NULL DEFAULT 0,  -- 期末贷方余额
    UNIQUE KEY uk_balance (period_id, subject_id, auxiliary_type_id, auxiliary_id, currency_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='辅助核算余额表';

-- 凭证分录辅助核算表
CREATE TABLE IF NOT EXISTS voucher_entry_auxiliary (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    entry_id        INT NOT NULL,                 -- 分录ID
    auxiliary_type_id INT NOT NULL,               -- 辅助核算类型ID
    auxiliary_id    INT NOT NULL,                 -- 辅助核算项目ID
    created_at      DATETIME NOT NULL,            -- 创建时间
    created_by      INT NOT NULL,                 -- 创建人
    KEY idx_entry (entry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证分录辅助核算表';

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) NOT NULL,        -- 用户名
    password        VARCHAR(255) NOT NULL,       -- 密码(加密)，增加长度以支持bcrypt加密
    real_name       VARCHAR(50) NOT NULL,        -- 真实姓名
    email           VARCHAR(100),                -- 邮箱
    mobile          VARCHAR(20),                 -- 手机
    is_admin        BIT NOT NULL DEFAULT 0,      -- 是否管理员
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

INSERT INTO sys_user (username, password, real_name, email, mobile, is_admin, created_at, created_by)
VALUES ('admin', '加密后的密码', '管理员', 'admin@example.com', '1234567890', 1, NOW(), 1);

-- 插入普通用户数据
INSERT INTO sys_user (username, password, real_name, email, mobile, is_admin, status, created_at, created_by)
VALUES ('user', 'hashed_password_here', 'User', 'user@example.com', '1234567890', 0, 1, NOW(), 1);