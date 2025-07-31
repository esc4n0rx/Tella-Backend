const { stripe } = require('../../config/stripe');
const walletRepository = require('../../infrastructure/repositories/wallet-repository');
const transactionRepository = require('../../infrastructure/repositories/transaction-repository');
const walletService = require('./wallet-service');

class StripeService {
    async createPaymentSession(userId, packageId, successUrl, cancelUrl, ipAddress) {
        // Buscar pacote
        const packages = await walletRepository.getPackages();
        const selectedPackage = packages.find(p => p.id === packageId);
        
        if (!selectedPackage) {
            throw new Error('Pacote não encontrado');
        }

        // Criar sessão do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPackage.stripe_price_id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                user_id: userId,
                package_id: packageId,
                coins_amount: selectedPackage.coins_amount.toString()
            }
        });

        // Registrar compra pendente
        await transactionRepository.createStripePurchase({
            user_id: userId,
            package_id: packageId,
            stripe_payment_intent_id: session.payment_intent,
            stripe_session_id: session.id,
            status: 'pending',
            amount_paid_brl: selectedPackage.price_brl,
            coins_purchased: selectedPackage.coins_amount,
            ip_address: ipAddress
        });

        return {
            session_id: session.id,
            session_url: session.url,
            package: selectedPackage
        };
    }

    async handlePaymentSuccess(paymentIntentId, ipAddress = null) {
        // Buscar compra
        const purchase = await transactionRepository.getStripePurchaseByPaymentIntent(paymentIntentId);
        
        if (!purchase) {
            throw new Error('Compra não encontrada');
        }

        if (purchase.status === 'completed') {
            return purchase; // Já processada
        }

        // Verificar se o payment intent foi realmente pago
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Pagamento não confirmado pelo Stripe');
        }

        // Adicionar moedas à carteira
        await walletService.addCoins(
            purchase.user_id,
            purchase.coins_purchased,
            `Compra de ${purchase.coins_purchased} Tella Coins`,
            paymentIntentId,
            'stripe_payment',
            ipAddress
        );

        // Atualizar status da compra
        const updatedPurchase = await transactionRepository.updateStripePurchase(paymentIntentId, {
            status: 'completed',
            completed_at: new Date().toISOString()
        });

        return updatedPurchase;
    }

    async handlePaymentFailure(paymentIntentId) {
        const purchase = await transactionRepository.getStripePurchaseByPaymentIntent(paymentIntentId);
        
        if (!purchase) {
            throw new Error('Compra não encontrada');
        }

        await transactionRepository.updateStripePurchase(paymentIntentId, {
            status: 'failed'
        });

        return purchase;
    }

    async getPurchaseHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const { data, error } = await supabaseAdmin
            .from('tella_stripe_purchases')
            .select(`
                *,
                tella_coin_packages (
                    name,
                    coins_amount
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            purchases: data,
            pagination: {
                page,
                limit,
                has_more: data.length === limit
            }
        };
    }
}

module.exports = new StripeService();