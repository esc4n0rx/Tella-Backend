const express = require('express');
const characterController = require('../controllers/character-controller');
const { validate } = require('../middlewares/validation-middleware');
const { requireAuth } = require('../middlewares/auth-middleware');
const { trackIP } = require('../middlewares/ip-tracking-middleware');
const { 
    createCharacterSchema, 
    paginationSchema, 
    approveCharacterSchema 
} = require('../validators/character-validators');

const router = express.Router();

// Aplicar middlewares em todas as rotas
router.use(trackIP);
router.use(requireAuth);

// Middleware para verificar se é staff
const requireStaff = (req, res, next) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({
            error: 'Acesso negado',
            message: 'Apenas staff podem acessar esta funcionalidade'
        });
    }
    next();
};

// Middleware para verificar se é creator ou staff
const requireCreatorOrStaff = (req, res, next) => {
    if (!['creator', 'staff'].includes(req.user.role)) {
        return res.status(403).json({
            error: 'Acesso negado',
            message: 'Apenas creators e staff podem acessar esta funcionalidade'
        });
    }
    next();
};

// Rotas públicas (autenticadas)
router.get('/', 
    validate(paginationSchema, 'query'), 
    characterController.getCharacters
);

router.get('/:id', 
    characterController.getCharacterById
);

router.post('/:id/favorite', 
    characterController.toggleFavorite
);

router.post('/:id/purchase', 
    characterController.purchaseCharacter
);

router.get('/user/purchases', 
    validate(paginationSchema, 'query'), 
    characterController.getMyPurchases
);

router.get('/user/favorites', 
    validate(paginationSchema, 'query'), 
    characterController.getMyFavorites
);

// Rotas para creators e staff
router.post('/', 
    requireCreatorOrStaff,
    validate(createCharacterSchema), 
    characterController.createCharacter
);

router.get('/user/created', 
    requireCreatorOrStaff,
    validate(paginationSchema, 'query'), 
    characterController.getMyCharacters
);

// Rotas exclusivas do staff
router.patch('/:id/approve', 
    requireStaff,
    validate(approveCharacterSchema), 
    characterController.approveCharacter
);

module.exports = router;