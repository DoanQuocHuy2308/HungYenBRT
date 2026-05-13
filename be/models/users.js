const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('users', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Mã định danh duy nhất của người dùng'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notEmpty: { msg: 'Tên không được để trống' } 
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: { 
                isEmail: { msg: 'Định dạng email không hợp lệ' } 
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                is: { args: /^[0-9]{10,11}$/i, msg: 'Số điện thoại phải từ 10-11 chữ số' }
            }
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        sex: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Giới tính (thường là string để dễ map dữ liệu client)'
        },
        cccd_number: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: { args: /^[0-9]{12}$/i, msg: 'Căn cước công dân phải đủ 12 chữ số' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true, 
            comment: 'Bắt buộc đối với Customer. Employee có thể login bằng bảng employees'
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Khối dữ liệu eKYC bắt buộc theo nghiệp vụ xe buýt
        cccd_front: { 
            type: DataTypes.STRING, 
            allowNull: false,
            validate: { notEmpty: true }
        },
        cccd_back: { 
            type: DataTypes.STRING, 
            allowNull: false,
            validate: { notEmpty: true }
        },
        issue_date: { 
            type: DataTypes.DATEONLY, 
            allowNull: false 
        },
        address: { 
            type: DataTypes.STRING, 
            allowNull: false,
            validate: { notEmpty: true }
        },
        id_Role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Quyền: 1-Admin, 2-Nhân viên, 3-Khách hàng'
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Trạng thái online: true khi login'
        },
        is_locked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Trạng thái khóa tài khoản: true khi bị admin khóa'
        },
        // Smart Biometric Upgrade cho BRT
        is_face_registered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Xác định user đã đăng ký khuôn mặt chưa'
        },
        face_data: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
            comment: 'Dữ liệu vector khuôn mặt'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
        indexes: [
            { unique: true, fields: ['phone'] },
            { unique: true, fields: ['cccd_number'] },
            { unique: true, fields: ['email'] }
        ]
    });

    User.associate = (models) => {
        User.belongsTo(models.roles, { foreignKey: 'id_Role' });
        User.hasOne(models.employees, { foreignKey: 'Id_User' });
        User.hasMany(models.tickets, { foreignKey: 'Id_User' });
        User.hasMany(models.discount_registrations, { foreignKey: 'id_User' });
    };

    return User;
};
