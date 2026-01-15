const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/login - Login de administrador
router.post('/login', authController.login);

// GET /api/auth/me - Obtener admin actual (protegida)
router.get('/me', auth, authController.getCurrentAdmin);

module.exports = router;
