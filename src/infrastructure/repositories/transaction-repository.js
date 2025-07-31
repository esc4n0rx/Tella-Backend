const { supabaseAdmin } = require('../../config/database');

class TransactionRepository {
    async create(transactionData) {
        const { data, error } = await supabaseAdmin
            .from('tella_transactions')
            .insert([transactionData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async getByUserId(userId, limit = 50, offset = 0) {
        const { data, error } = await supabaseAdmin
            .from('tella_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return data;
    }

    async getByReference(referenceId, referenceType) {
        const { data, error } = await supabaseAdmin
            .from('tella_transactions')
            .select('*')
            .eq('reference_id', referenceId)
            .eq('reference_type', referenceType)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async createStripePurchase(purchaseData) {
        const { data, error } = await supabaseAdmin
            .from('tella_stripe_purchases')
            .insert([purchaseData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async updateStripePurchase(paymentIntentId, updateData) {
        const { data, error } = await supabaseAdmin
            .from('tella_stripe_purchases')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async getStripePurchaseByPaymentIntent(paymentIntentId) {
        const { data, error } = await supabaseAdmin
            .from('tella_stripe_purchases')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async getUserTransactionsByIP(ipAddress, hoursAgo = 24) {
        const timeAgo = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabaseAdmin
            .from('tella_transactions')
            .select('user_id, type, created_at')
            .eq('ip_address', ipAddress)
            .gte('created_at', timeAgo)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new TransactionRepository();