const admin = require('firebase-admin');

// Leer credenciales desde variable de entorno o archivo local
let serviceAccount;
if (process.env.FIREBASE_CONFIG) {
    // En producción (Vercel), leer desde variable de entorno
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
    // En desarrollo local, leer desde archivo
    serviceAccount = require('../key.json');
}

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'reservatusturnos-450a5.appspot.com'
});

const bucket = admin.storage().bucket();

/**
 * Sube un archivo a Firebase Storage
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {Promise<string>} URL pública del archivo
 */
const uploadToFirebase = async (fileBuffer, filename, mimetype) => {
    try {
        // Crear referencia al archivo en Firebase Storage
        const file = bucket.file(`vehicles/${filename}`);

        // Subir el archivo
        await file.save(fileBuffer, {
            metadata: {
                contentType: mimetype,
            },
            public: true, // Hacer el archivo público
        });

        // Obtener la URL pública
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/vehicles/${filename}`;

        return publicUrl;
    } catch (error) {
        console.error('Error al subir archivo a Firebase:', error);
        throw new Error('Error al subir imagen a Firebase Storage');
    }
};

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} fileUrl - URL del archivo en Firebase
 * @returns {Promise<void>}
 */
const deleteFromFirebase = async (fileUrl) => {
    try {
        if (!fileUrl || !fileUrl.includes('storage.googleapis.com')) {
            return; // No es un archivo de Firebase
        }

        // Extraer el path del archivo desde la URL
        const urlParts = fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        const filePath = `${folder}/${filename}`;

        // Eliminar el archivo
        await bucket.file(filePath).delete();
        console.log(`✅ Archivo eliminado de Firebase: ${filePath}`);
    } catch (error) {
        console.error('Error al eliminar archivo de Firebase:', error);
        // No lanzar error, solo loguearlo
    }
};

module.exports = {
    bucket,
    admin,
    uploadToFirebase,
    deleteFromFirebase
};
