const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TicketPrice = sequelize.define('ticket_prices', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Id_Ticket_Type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'FK → ticket_types'
        },
        From_Location_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Điểm đi. Để NULL nếu là vé không theo chặng (Vé ngày, tháng...)'
        },
        To_Location_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Điểm đến. Để NULL nếu là vé không theo chặng'
        },
        Price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['Id_Ticket_Type', 'From_Location_Id', 'To_Location_Id'],
                name: 'unique_ticket_price_route'
            }
        ]
    });

    TicketPrice.associate = (models) => {
        TicketPrice.belongsTo(models.ticket_types, { foreignKey: 'Id_Ticket_Type', as: 'ticket_type' });
        TicketPrice.belongsTo(models.locations, { foreignKey: 'From_Location_Id', as: 'fromLocation' });
        TicketPrice.belongsTo(models.locations, { foreignKey: 'To_Location_Id', as: 'toLocation' });
    };

    return TicketPrice;
};
