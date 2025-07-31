const express = require('express');
const authController = require('../controllers/auth-controller');
const { validate } = require('../middlewares/validation-middleware');
const { requireAuth } = require('../middlewares/auth-middleware');
const { trackIP } = require('../middlewares/ip-tracking-middleware');
const { firebaseLoginSchema, completeRegistrationSchema } = require('../validators/auth-validators');

const router = express.Router();

// Aplicar tracking de IP em todas as rotas
router.use(trackIP);

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