const walletService = require('../../application/services/wallet-service');

class WalletController {
    async getBalance(req, res, next) {
        try {
            const userId = req.user.id;
            const balance = await walletService.getBalance(userId);

            res.status(200).json({
                success: true,
                data: balance
            });
        } catch (error) {
            next(error);
        }
    }

    async spendCoins(req, res, next) {
        try {
            const userId = req.user.id;
            const { amount, description, reference_id, reference_type } = req.validatedData;
            const ipAddress = req.clientIP;

            const result = await walletService.spendCoins(
                userId, 
                amount, 
                description, 
                reference_id, 
                reference_type,
                ipAddress
            );

            res.status(200).json({
                success: true,
                message: 'Moedas gastas com sucesso',
                data: result
            });
        } catch (error) {
            if (error.message === 'Saldo insuficiente') {
                return res.status(400).json({
                    error: 'Saldo insuficiente',
                    message: 'Você não possui moedas suficientes para esta transação'
                });
            }
            next(error);
        }
    }

    async getTransactionHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = req.validatedData;

            const history = await walletService.getTransactionHistory(userId, page, limit);

            res.status(200).json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    async getPackages(req, res, next) {
        try {
            const packages = await walletService.getPackages();

            res.status(200).json({
                success: true,
                data: {
                    packages
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WalletController();