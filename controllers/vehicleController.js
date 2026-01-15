const { Vehicle } = require('../models');
const { uploadToFirebase, deleteFromFirebase } = require('../config/firebase');
const path = require('path');

// Obtener todos los vehículos
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículos',
            error: error.message
        });
    }
};

// Obtener un vehículo por ID
exports.getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículo',
            error: error.message
        });
    }
};

// Crear nuevo vehículo
exports.createVehicle = async (req, res) => {
    try {
        const { name, passengers, luggage, hand_luggage, features } = req.body;

        // Validar campos requeridos
        if (!name || !passengers || luggage === undefined || hand_luggage === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Procesar features (puede venir como string JSON o array)
        let parsedFeatures = [];
        if (features) {
            try {
                parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
            } catch (e) {
                parsedFeatures = [];
            }
        }

        // Subir imagen a Firebase si existe
        let imageUrl = null;
        if (req.file) {
            try {
                // Generar nombre único para la imagen
                const ext = path.extname(req.file.originalname);
                const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

                // Subir a Firebase Storage
                imageUrl = await uploadToFirebase(
                    req.file.buffer,
                    uniqueFilename,
                    req.file.mimetype
                );

                console.log('✅ Imagen subida a Firebase:', imageUrl);
            } catch (uploadError) {
                console.error('Error al subir imagen a Firebase:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Error al subir imagen'
                });
            }
        }

        const vehicle = await Vehicle.create({
            name,
            passengers: parseInt(passengers),
            luggage: parseInt(luggage),
            hand_luggage: parseInt(hand_luggage),
            features: parsedFeatures,
            image_url: imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Vehículo creado exitosamente',
            data: vehicle
        });
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear vehículo',
            error: error.message
        });
    }
};

// Actualizar vehículo
exports.updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, passengers, luggage, hand_luggage, features } = req.body;

        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Procesar features
        let parsedFeatures = vehicle.features;
        if (features !== undefined) {
            try {
                parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
            } catch (e) {
                parsedFeatures = vehicle.features;
            }
        }

        // Actualizar datos
        const updateData = {
            name: name || vehicle.name,
            passengers: passengers !== undefined ? parseInt(passengers) : vehicle.passengers,
            luggage: luggage !== undefined ? parseInt(luggage) : vehicle.luggage,
            hand_luggage: hand_luggage !== undefined ? parseInt(hand_luggage) : vehicle.hand_luggage,
            features: parsedFeatures
        };

        // Si hay nueva imagen
        if (req.file) {
            try {
                // Generar nombre único para la nueva imagen
                const ext = path.extname(req.file.originalname);
                const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

                // Subir nueva imagen a Firebase
                const newImageUrl = await uploadToFirebase(
                    req.file.buffer,
                    uniqueFilename,
                    req.file.mimetype
                );

                // Eliminar imagen anterior de Firebase si existe
                if (vehicle.image_url) {
                    await deleteFromFirebase(vehicle.image_url);
                }

                updateData.image_url = newImageUrl;
                console.log('✅ Imagen actualizada en Firebase:', newImageUrl);
            } catch (uploadError) {
                console.error('Error al actualizar imagen en Firebase:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar imagen'
                });
            }
        }

        await vehicle.update(updateData);

        res.json({
            success: true,
            message: 'Vehículo actualizado exitosamente',
            data: vehicle
        });
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar vehículo',
            error: error.message
        });
    }
};

// Eliminar vehículo
exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Eliminar imagen de Firebase si existe
        if (vehicle.image_url) {
            await deleteFromFirebase(vehicle.image_url);
        }

        await vehicle.destroy();

        res.json({
            success: true,
            message: 'Vehículo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar vehículo',
            error: error.message
        });
    }
};
