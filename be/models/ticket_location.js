const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TicketLocation = sequelize.define('ticket_location', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Id_Ticket: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'FK → tickets. Bản ghi đại diện cho vé cụ thể'
        },
        Id_Location: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'FK → locations. Ga nằm trong danh sách được phép dừng'
        },
        Created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'ticket_location',
        timestamps: false,
        indexes: [
            {
                fields: ['Id_Ticket'],
                name: 'idx_ticket_whitelist'
            },
            {
                fields: ['Id_Location'],
                name: 'idx_location_whitelist'
            },
            {
                unique: true,
                fields: ['Id_Ticket', 'Id_Location'],
                name: 'unique_ticket_location'
            }
        ]
    });

    TicketLocation.associate = (models) => {
        TicketLocation.belongsTo(models.ticket_details, { foreignKey: 'Id_Ticket', as: 'ticket' });
        TicketLocation.belongsTo(models.locations, { foreignKey: 'Id_Location', as: 'location' });
    };

    return TicketLocation;
};
