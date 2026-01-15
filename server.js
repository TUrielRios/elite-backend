const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'Elite Car Rental API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            vehicles: '/api/vehicles'
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Error de Multer (archivos)
    if (err.message && err.message.includes('imágenes')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
            process.exit(1);
        }

        // Sincronizar modelos con la base de datos
        await syncDatabase();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}`);
            console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
