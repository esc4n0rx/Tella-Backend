const walletRepository = require('../../infrastructure/repositories/wallet-repository');
const transactionRepository = require('../../infrastructure/repositories/transaction-repository');
const { supabaseAdmin } = require('../../config/database');

class WalletService {
    async getOrCreateWallet(userId) {
        let wallet = await walletRepository.findByUserId(userId);
        
        if (!wallet) {
            // Criar wallet com saldo inicial de 150 moedas
            wallet = await walletRepository.create({
                user_id: userId,
                balance: 150,
                total_earned: 150
            });

            // Registrar transação de bônus inicial
            await transactionRepository.create({
                user_id: userId,
                wallet_id: wallet.id,
                type: 'bonus',
                amount: 150,
                balance_before: 0,
                balance_after: 150,
                description: 'Bônus de registro - 150 Tella Coins gratuitos',
                reference_type: 'registration_bonus'
            });
        }

        return wallet;
    }

    async getBalance(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        return {
            balance: wallet.balance,
            total_earned: wallet.total_earned,
            total_spent: wallet.total_spent
        };
    }

    async spendCoins(userId, amount, description, referenceId = null, referenceType = null, ipAddress = null) {
        if (amount <= 0) {
            throw new Error('Quantidade de moedas deve ser maior que zero');
        }

        // Usar transação do banco para garantir consistência
        const { data, error } = await supabaseAdmin.rpc('spend_tella_coins', {
            p_user_id: userId,
            p_amount: amount,
            p_description: description,
            p_reference_id: referenceId,
            p_reference_type: referenceType,
            p_ip_address: ipAddress
        });

        if (error) {
            if (error.message.includes('insufficient_balance')) {
                throw new Error('Saldo insuficiente');
            }
            throw error;
        }

        return data;
    }

    async addCoins(userId, amount, description, referenceId = null, referenceType = null, ipAddress = null) {
        if (amount <= 0) {
            throw new Error('Quantidade de moedas deve ser maior que zero');
        }

        const wallet = await this.getOrCreateWallet(userId);
        const newBalance = wallet.balance + amount;
        const newTotalEarned = wallet.total_earned + amount;

        // Atualizar wallet
        const updatedWallet = await walletRepository.updateBalance(
            userId, 
            newBalance, 
            newTotalEarned, 
            null
        );

        // Registrar transação
        await transactionRepository.create({
            user_id: userId,
            wallet_id: wallet.id,
            type: 'earn',
            amount: amount,
            balance_before: wallet.balance,
            balance_after: newBalance,
            description: description,
            reference_id: referenceId,
            reference_type: referenceType,
            ip_address: ipAddress
        });

        return updatedWallet;
    }

    async getTransactionHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const transactions = await transactionRepository.getByUserId(userId, limit, offset);
        
        return {
            transactions,
            pagination: {
                page,
                limit,
                has_more: transactions.length === limit
            }
        };
    }

    async getPackages() {
        return await walletRepository.getPackages();
    }

    async checkIPRestrictions(ipAddress, userId = null) {
        const recentTransactions = await transactionRepository.getUserTransactionsByIP(ipAddress, 24);
        
        // Contar usuários únicos que fizeram transações com este IP nas últimas 24h
        const uniqueUsers = new Set(recentTransactions.map(t => t.user_id));
        
        // Se houver mais de 3 usuários diferentes usando o mesmo IP, pode ser suspeito
        if (uniqueUsers.size > 3 && userId && !uniqueUsers.has(userId)) {
            throw new Error('Muitas contas ativas detectadas neste IP. Entre em contato com o suporte.');
        }

        return {
            unique_users_count: uniqueUsers.size,
            recent_transactions_count: recentTransactions.length
        };
    }
}

module.exports = new WalletService();