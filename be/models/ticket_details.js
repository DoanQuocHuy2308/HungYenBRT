const { DataTypes } = require('sequelize');

/**
 * ticket_details — Bản ghi thực thể của từng chiếc vé
 * 
 * Mỗi bản ghi đại diện cho 1 chiếc vé vật lý/điện tử có mã QR riêng.
 * Thừa hưởng lộ trình (From/To) từ lúc mua.
 */
module.exports = (sequelize) => {
    const TicketDetail = sequelize.define('ticket_details', {
        Id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Mã định danh duy nhất của chiếc vé (Dùng để quét QR)'
        },
        Id_Order: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'FK → tickets. Trỏ về đơn hàng tổng',
            field: 'id_order'
        },
        Id_Ticket_Type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Loại vé (Ngày, Tháng, Lượt...)',
            field: 'id_ticket_type'
        },
        From_Location: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Ga lên (Chỉ dùng cho vé Lượt)',
            field: 'from_location'
        },
        To_Location: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Ga xuống tối đa (Chỉ dùng cho vé Lượt)',
            field: 'to_location'
        },
        qr_token: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
            comment: 'Token dùng để sinh mã QR xoay vòng hoặc cố định'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Giá của riêng chiếc vé này tại thời điểm mua'
        },
        status: {
            type: DataTypes.ENUM('UNUSED', 'ACTIVE', 'USED', 'EXPIRED', 'LOCKED'),
            defaultValue: 'UNUSED',
            comment: 'Trạng thái sử dụng của riêng chiếc vé này'
        },
        is_in_system: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Đang ở trong hệ thống (Đã vào ga nhưng chưa ra)'
        },
        last_station_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Ga cuối cùng mà vé này vừa thực hiện quét'
        },
        StartDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Ngày bắt đầu sử dụng (thường set khi quét lần đầu)',
            field: 'start_date'
        },
        EndDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Ngày hết hạn',
            field: 'end_date'
        },
        IsFree: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_free'
        }
    }, {
        timestamps: true, // Tự động tạo createdAt, updatedAt cho tracking
        tableName: 'ticket_details'
    });

    TicketDetail.associate = (models) => {
        TicketDetail.belongsTo(models.tickets, { foreignKey: 'Id_Order', as: 'order' });
        TicketDetail.belongsTo(models.ticket_types, { foreignKey: 'Id_Ticket_Type', as: 'ticket_type' });
        TicketDetail.belongsTo(models.locations, { foreignKey: 'From_Location', as: 'fromLocation' });
        TicketDetail.belongsTo(models.locations, { foreignKey: 'To_Location', as: 'toLocation' });
        TicketDetail.belongsTo(models.locations, { foreignKey: 'last_station_id', as: 'lastLocation' });
        
        TicketDetail.hasMany(models.ticket_location, { foreignKey: 'Id_Ticket' });
        TicketDetail.hasMany(models.ticket_logs, { foreignKey: 'Id_Ticket' });
    };

    return TicketDetail;
};
