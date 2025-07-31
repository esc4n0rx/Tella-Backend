const express = require('express');
const authController = require('../controllers/auth-controller');
const { validate } = require('../middlewares/validation-middleware');
const { requireAuth } = require('../middlewares/auth-middleware');
const { firebaseLoginSchema, completeRegistrationSchema } = require('../validators/auth-validators');

const router = express.Router();

// Login com Firebase (Google, Facebook, Apple)
router.post('/firebase-login', 
    validate(firebaseLoginSchema), 
    authController.firebaseLogin
);

// Completar registro após login
router.post('/complete-registration', 
    requireAuth,
    validate(completeRegistrationSchema), 
    authController.completeRegistration
);

// Obter dados do usuário atual
router.get('/me', 
    requireAuth, 
    authController.getCurrentUser
);

// Renovar token JWT
router.post('/refresh-token',
    requireAuth,
    authController.refreshToken
);

module.exports = router;