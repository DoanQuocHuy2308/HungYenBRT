const { DataTypes } = require('sequelize');

/**
 * tickets — Vé đã bán
 *
 * From_Location / To_Location:
 *   - Chỉ có giá trị khi loại vé thuộc kiểu TRIP (Id_Category = 1)
 *   - Null với TIME và PROMO (đi toàn tuyến)
 */
module.exports = (sequelize) => {
    const Ticket = sequelize.define('tickets', {
        Id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Mã đơn hàng (Order ID)',
            field: 'id'
        },
        Id_User: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'Người mua đơn hàng này',
            field: 'id_user'
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Tổng số lượng vé trong đơn hàng'
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Tổng số tiền của cả đơn hàng'
        },
        PurchaseDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'purchase_date'
        },
        code_promotion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        id_payment: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_payment_method: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Hình thức thanh toán tĩnh (Lookup Table)'
        },
        device_issued_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'ID của thiết bị/POS nơi tạo đơn hàng'
        },
        id_employee: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Nhân viên thực hiện bán vé'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'),
            defaultValue: 'PENDING',
            comment: 'Trạng thái thanh toán/xử lý của đơn hàng'
        },
        PaymentNote: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Nội dung/Ghi chú thanh toán (Mã giao dịch, memo...)'
        }
    }, {
        timestamps: false
    });

    Ticket.associate = (models) => {
        Ticket.belongsTo(models.users, { foreignKey: 'Id_User', as: 'user' });
        Ticket.belongsTo(models.employees, { foreignKey: 'id_employee', as: 'employee' });
        Ticket.belongsTo(models.payments, { foreignKey: 'id_payment', as: 'payment' });
        Ticket.belongsTo(models.payment_methods, { foreignKey: 'id_payment_method', as: 'payment_method' });
        Ticket.belongsTo(models.promotions, { foreignKey: 'code_promotion', targetKey: 'Code', as: 'promotion' });
        
        Ticket.hasMany(models.ticket_details, {
            foreignKey: 'Id_Order',
            as: 'details'
        });
    };

    return Ticket;
};
