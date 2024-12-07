const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SystemConfig extends Model {
        static associate(models) {
            // 定义关联
        }
    }

    SystemConfig.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '配置键'
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '配置值'
        },
        description: {
            type: DataTypes.STRING(200),
            comment: '配置说明'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'SystemConfig',
        tableName: 'sys_config',
        timestamps: true,
        underscored: true
    });

    return SystemConfig;
};
