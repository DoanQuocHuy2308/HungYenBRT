const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Location = sequelize.define('locations', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        station_code: {
            type: DataTypes.STRING,
            allowNull: true, // changed from false to allow syncing existing null records
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'description'
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    Location.associate = (models) => {
        Location.hasMany(models.ticket_location, { foreignKey: 'Id_Location' });
        Location.hasMany(models.ticket_logs, { foreignKey: 'location_id' });
    };

    return Location;
};
