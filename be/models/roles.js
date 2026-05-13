const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('roles', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { msg: 'Tên Role không được trùng lặp' },
            validate: { 
                notEmpty: true 
            },
            field: 'name'
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'description'
        },
        Created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        timestamps: false
    });

    Role.associate = (models) => {
        Role.hasMany(models.users, { foreignKey: 'id_Role' });
    };

    return Role;
};
