const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas (sin autenticación)
// GET /api/vehicles - Obtener todos los vehículos
router.get('/', vehicleController.getAllVehicles);

// GET /api/vehicles/:id - Obtener un vehículo por ID
router.get('/:id', vehicleController.getVehicleById);

// Rutas protegidas (requieren autenticación)
// POST /api/vehicles - Crear vehículo (con imagen)
router.post('/', auth, upload.single('image'), vehicleController.createVehicle);

// PUT /api/vehicles/:id - Actualizar vehículo (con imagen opcional)
router.put('/:id', auth, upload.single('image'), vehicleController.updateVehicle);

// DELETE /api/vehicles/:id - Eliminar vehículo
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;
