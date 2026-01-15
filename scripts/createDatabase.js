const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
    // Conectar al servidor PostgreSQL (sin especificar base de datos)
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres' // Usar la DB por defecto
    });

    try {
        await client.connect();
        console.log('✅ Conectado al servidor PostgreSQL');

        // Verificar si la base de datos ya existe
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [process.env.DB_NAME]
        );

        if (result.rows.length > 0) {
            console.log(`ℹ️  La base de datos "${process.env.DB_NAME}" ya existe.`);
        } else {
            // Crear la base de datos
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`✅ Base de datos "${process.env.DB_NAME}" creada exitosamente!`);
        }

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await client.end();
        process.exit(1);
    }
};

createDatabase();
