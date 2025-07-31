const stripeService = require('../../application/services/stripe-service');
const { stripe, STRIPE_WEBHOOK_SECRET } = require('../../config/stripe');

class StripeController {
   async createPaymentSession(req, res, next) {
       try {
           const userId = req.user.id;
           const { package_id, success_url, cancel_url } = req.validatedData;
           const ipAddress = req.clientIP;

           const session = await stripeService.createPaymentSession(
               userId, 
               package_id, 
               success_url, 
               cancel_url,
               ipAddress
           );

           res.status(200).json({
               success: true,
               message: 'Sessão de pagamento criada com sucesso',
               data: session
           });
       } catch (error) {
           next(error);
       }
   }

   async handleWebhook(req, res, next) {
       try {
           const sig = req.headers['stripe-signature'];
           let event;

           try {
               event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
           } catch (err) {
               console.error('Webhook signature verification failed:', err.message);
               return res.status(400).json({ error: 'Invalid signature' });
           }

           // Handle the event
           switch (event.type) {
               case 'payment_intent.succeeded':
                   await stripeService.handlePaymentSuccess(
                       event.data.object.id,
                       req.clientIP
                   );
                   console.log('Payment succeeded:', event.data.object.id);
                   break;

               case 'payment_intent.payment_failed':
                   await stripeService.handlePaymentFailure(event.data.object.id);
                   console.log('Payment failed:', event.data.object.id);
                   break;

               default:
                   console.log(`Unhandled event type: ${event.type}`);
           }

           res.status(200).json({ received: true });
       } catch (error) {
           console.error('Webhook error:', error);
           next(error);
       }
   }

   async getPurchaseHistory(req, res, next) {
       try {
           const userId = req.user.id;
           const { page, limit } = req.validatedData;

           const history = await stripeService.getPurchaseHistory(userId, page, limit);

           res.status(200).json({
               success: true,
               data: history
           });
       } catch (error) {
           next(error);
       }
   }

   async getPaymentStatus(req, res, next) {
       try {
           const { payment_intent_id } = req.params;
           
           // Verificar se o payment intent pertence ao usuário
           const purchase = await transactionRepository.getStripePurchaseByPaymentIntent(payment_intent_id);
           
           if (!purchase || purchase.user_id !== req.user.id) {
               return res.status(404).json({
                   error: 'Pagamento não encontrado'
               });
           }

           const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

           res.status(200).json({
               success: true,
               data: {
                   payment_intent_id: paymentIntent.id,
                   status: paymentIntent.status,
                   amount: paymentIntent.amount,
                   currency: paymentIntent.currency,
                   purchase_status: purchase.status,
                   coins_purchased: purchase.coins_purchased
               }
           });
       } catch (error) {
           next(error);
       }
   }
}

module.exports = new StripeController();