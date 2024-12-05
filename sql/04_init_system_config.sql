-- 初始化系统配置数据

-- 初始化配置项
INSERT INTO sys_init_config (config_code, config_name, config_value, description, is_required, status, created_at, created_by) VALUES
('COMPANY_BASIC', '企业基础信息', 
    JSON_OBJECT(
        'company_name', 1,
        'tax_code', 1,
        'legal_person', 1,
        'contact', 0,
        'phone', 0,
        'address', 0,
        'email', 0
    ),
    '企业基础信息配置项', 1, 1, NOW(), 1),
('ACCOUNTING_SETUP', '会计核算设置',
    JSON_OBJECT(
        'accounting_system', 1,
        'fiscal_year', 1,
        'period_type', 1,
        'begin_date', 1,
        'currency_code', 1
    ),
    '会计核算基础设置', 1, 1, NOW(), 1),
('SUBJECT_SETUP', '科目设置',
    JSON_OBJECT(
        'use_template', 1,
        'template_code', 0,
        'allow_custom', 1
    ),
    '科目设置配置项', 1, 1, NOW(), 1),
('INITIAL_BALANCE', '期初余额',
    JSON_OBJECT(
        'require_balance', 1,
        'check_balance', 1,
        'allow_modify', 1
    ),
    '期初余额设置', 1, 1, NOW(), 1);

-- 初始化模板
INSERT INTO sys_init_template (template_code, template_name, industry_code, company_type, init_items, description, status, created_at, created_by) VALUES
('TRADE_SMALL', '小型贸易企业', 'TRADE', 'SMALL',
    JSON_OBJECT(
        'subject_template', 'SMALL',
        'init_steps', JSON_ARRAY(
            '基础信息设置',
            '科目设置',
            '期初余额录入',
            '往来单位设置'
        ),
        'optional_features', JSON_ARRAY(
            '库存管理',
            '固定资产'
        )
    ),
    '适用于小型贸易企业的初始化模板', 1, NOW(), 1),
('MANUFACTURE_SMALL', '小型生产企业', 'MANUFACTURE', 'SMALL',
    JSON_OBJECT(
        'subject_template', 'SMALL',
        'init_steps', JSON_ARRAY(
            '基础信息设置',
            '科目设置',
            '期初余额录入',
            '往来单位设置',
            '存货设置'
        ),
        'optional_features', JSON_ARRAY(
            '生产管理',
            '库存管理',
            '固定资产'
        )
    ),
    '适用于小型生产企业的初始化模板', 1, NOW(), 1),
('SERVICE_SMALL', '小型服务企业', 'SERVICE', 'SMALL',
    JSON_OBJECT(
        'subject_template', 'SMALL',
        'init_steps', JSON_ARRAY(
            '基础信息设置',
            '科目设置',
            '期初余额录入',
            '往来单位设置'
        ),
        'optional_features', JSON_ARRAY(
            '固定资产'
        )
    ),
    '适用于小型服务企业的初始化模板', 1, NOW(), 1);
