const { supabaseAdmin } = require('../../config/database');

class WalletRepository {
    async findByUserId(userId) {
        const { data, error } = await supabaseAdmin
            .from('tella_wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async create(walletData) {
        const { data, error } = await supabaseAdmin
            .from('tella_wallets')
            .insert([walletData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async updateBalance(userId, newBalance, totalEarned = null, totalSpent = null) {
        const updateData = { 
            balance: newBalance,
            updated_at: new Date().toISOString()
        };

        if (totalEarned !== null) {
            updateData.total_earned = totalEarned;
        }

        if (totalSpent !== null) {
            updateData.total_spent = totalSpent;
        }

        const { data, error } = await supabaseAdmin
            .from('tella_wallets')
            .update(updateData)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async getPackages() {
        const { data, error } = await supabaseAdmin
            .from('tella_coin_packages')
            .select('*')
            .eq('is_active', true)
            .order('coins_amount', { ascending: true });

        if (error) {
            throw error;
        }

        return data;
    }

    async getPackageByStripeProductId(productId) {
        const { data, error } = await supabaseAdmin
            .from('tella_coin_packages')
            .select('*')
            .eq('stripe_product_id', productId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }
}

module.exports = new WalletRepository();