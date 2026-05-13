const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TicketLog = sequelize.define('ticket_logs', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Id_Ticket: {
            type: DataTypes.UUID,
            allowNull: false
        },
        location_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        device_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        scan_direction: {
            type: DataTypes.ENUM('ENTRY', 'EXIT', 'CHECK', 'RESTOCK'),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false // e.g. valid, invalid_station, expired
        },
        surcharge_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        scan_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    TicketLog.associate = (models) => {
        TicketLog.belongsTo(models.ticket_details, { foreignKey: 'Id_Ticket', as: 'ticket' });
        TicketLog.belongsTo(models.locations, { foreignKey: 'location_id', as: 'location' });
    };

    return TicketLog;
};
