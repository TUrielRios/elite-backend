const { Admin } = require('../models');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // Verificar si ya existe un admin
        const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });

        if (existingAdmin) {
            console.log('⚠️  El usuario admin ya existe.');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email || 'N/A');
            return;
        }

        // Crear admin inicial
        const admin = await Admin.create({
            username: 'admin',
            email: 'admin@elitecarrental.com',
            password: 'admin123' // El hook beforeCreate lo hasheará automáticamente
        });

        console.log('✅ Usuario admin creado exitosamente!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email:', admin.email);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
