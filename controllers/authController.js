const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

// Login de administrador
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Buscar admin por username
        const admin = await Admin.findOne({ where: { username } });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Comparar contraseña
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token válido por 7 días
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

// Obtener información del admin actual
exports.getCurrentAdmin = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                admin: {
                    id: req.admin.id,
                    username: req.admin.username,
                    email: req.admin.email
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};
