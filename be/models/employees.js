const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Employee = sequelize.define('employees', {
        Id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        Id_User: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true, 
            comment: 'Map 1-1 với record định danh cá nhân bên bảng users'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notEmpty: { msg: 'Username của nhân viên không được để trống' } 
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Chuyên dùng để Auth Staff Portal, băm bằng bcrypt'
        },
        shiftStart: {
            type: DataTypes.TIME, 
            allowNull: true,
            comment: 'Giờ bắt đầu ca (VD: 06:00:00). Đã đổi từ DATE sang TIME để chuẩn thiết kế'
        },
        shiftEnd: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Giờ kết thúc ca (VD: 14:00:00).'
        }
    }, {
        timestamps: false,
        indexes: [
            { unique: true, fields: ['username'] }
        ]
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.users, { foreignKey: 'Id_User' });
        Employee.hasMany(models.tickets, { foreignKey: 'id_employee' });
    };

    return Employee;
};
