const { sequelize, testConnection } = require('../config/database');
const Vehicle = require('./Vehicle');
const Admin = require('./Admin');

// Aquí podrías definir asociaciones si las hay en el futuro
// Por ejemplo: Vehicle.belongsTo(Admin)

const models = {
    Vehicle,
    Admin
};

// Sincronizar todos los modelos con la base de datos
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force, alter: !force });
        console.log('✅ Database models synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing database models:', error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection,
    ...models,
    syncDatabase
};
