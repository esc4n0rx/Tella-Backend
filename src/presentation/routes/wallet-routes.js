const express = require('express');
const walletController = require('../controllers/wallet-controller');
const { validate } = require('../middlewares/validation-middleware');
const { requireAuth } = require('../middlewares/auth-middleware');
const { trackIP } = require('../middlewares/ip-tracking-middleware');
const { spendCoinsSchema, transactionHistorySchema } = require('../validators/wallet-validators');

const router = express.Router();

// Aplicar middlewares em todas as rotas
router.use(trackIP);
router.use(requireAuth);

// Consultar saldo
router.get('/balance', walletController.getBalance);

// Gastar moedas
router.post('/spend', 
    validate(spendCoinsSchema), 
    walletController.spendCoins
);

// Histórico de transações
router.get('/transactions', 
    validate(transactionHistorySchema, 'query'), 
    walletController.getTransactionHistory
);

// Listar pacotes disponíveis
router.get('/packages', walletController.getPackages);

module.exports = router;