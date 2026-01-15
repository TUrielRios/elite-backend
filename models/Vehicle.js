const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passengers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 20
        }
    },
    luggage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 20
        }
    },
    hand_luggage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 20
        }
    },
    features: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'vehicles',
    timestamps: true,
    underscored: true
});

module.exports = Vehicle;
