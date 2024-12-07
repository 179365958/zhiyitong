const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SystemConfig = sequelize.define('SystemConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        config_key: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '配置键'
        },
        config_value: {
            type: DataTypes.TEXT,
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
        tableName: 'sys_config',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return SystemConfig;
};
