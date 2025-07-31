const Stripe = require('stripe');
require('dotenv').config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurado no .env');
}

if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado no .env');
}

const stripe = Stripe(STRIPE_SECRET_KEY);

module.exports = {
    stripe,
    STRIPE_WEBHOOK_SECRET
};