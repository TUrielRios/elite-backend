const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const auth = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        // Verificar formato: "Bearer TOKEN"
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        // Verificar y decodificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar admin en la base de datos
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o usuario no encontrado'
            });
        }

        // Agregar admin a la request
        req.admin = admin;
        req.adminId = admin.id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
            error: error.message
        });
    }
};

module.exports = auth;
