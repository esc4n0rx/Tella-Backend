const express = require('express');
const stripeController = require('../controllers/stripe-controller');
const { validate } = require('../middlewares/validation-middleware');
const { requireAuth } = require('../middlewares/auth-middleware');
const { trackIP } = require('../middlewares/ip-tracking-middleware');
const { createPaymentSessionSchema } = require('../validators/stripe-validators');
const { transactionHistorySchema } = require('../validators/wallet-validators');

const router = express.Router();

// Webhook do Stripe (sem autenticação)
router.post('/webhook', 
    express.raw({ type: 'application/json' }), 
    trackIP,
    stripeController.handleWebhook
);

// Rotas autenticadas
router.use(trackIP);
router.use(requireAuth);

// Criar sessão de pagamento
router.post('/create-payment-session',
    validate(createPaymentSessionSchema),
    stripeController.createPaymentSession
);

// Histórico de compras
router.get('/purchase-history',
    validate(transactionHistorySchema, 'query'),
    stripeController.getPurchaseHistory
);

// Status de um pagamento específico
router.get('/payment-status/:payment_intent_id',
    stripeController.getPaymentStatus
);

module.exports = router;