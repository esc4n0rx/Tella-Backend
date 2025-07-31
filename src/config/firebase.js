const admin = require('firebase-admin');
require('dotenv').config();

// Configuração do Firebase Admin
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
    throw new Error('Configurações do Firebase Admin não encontradas no .env');
}

// Inicializa Firebase Admin apenas se ainda não foi inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        projectId: firebaseConfig.projectId
    });
}

const auth = admin.auth();

/**
 * Verifica e decodifica um token ID do Firebase
 * @param {string} idToken - Token ID do Firebase
 * @returns {Promise<Object>} - Dados decodificados do usuário
 */
const verifyFirebaseToken = async (idToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error(`Token Firebase inválido: ${error.message}`);
    }
};

/**
 * Obtém dados completos do usuário no Firebase
 * @param {string} uid - UID do usuário no Firebase
 * @returns {Promise<Object>} - Dados do usuário
 */
const getFirebaseUser = async (uid) => {
    try {
        const userRecord = await auth.getUser(uid);
        return userRecord;
    } catch (error) {
        throw new Error(`Erro ao buscar usuário Firebase: ${error.message}`);
    }
};

module.exports = {
    auth,
    verifyFirebaseToken,
    getFirebaseUser
};