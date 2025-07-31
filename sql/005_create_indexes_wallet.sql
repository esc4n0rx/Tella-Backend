-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tella_wallets_user_id ON tella_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_tella_transactions_user_id ON tella_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tella_transactions_wallet_id ON tella_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_tella_transactions_type ON tella_transactions(type);
CREATE INDEX IF NOT EXISTS idx_tella_transactions_reference ON tella_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_tella_transactions_created_at ON tella_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tella_stripe_purchases_user_id ON tella_stripe_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_tella_stripe_purchases_payment_intent ON tella_stripe_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_tella_stripe_purchases_status ON tella_stripe_purchases(status);
CREATE INDEX IF NOT EXISTS idx_tella_coin_packages_active ON tella_coin_packages(is_active);

-- Índice para controle de IP
CREATE INDEX IF NOT EXISTS idx_tella_transactions_ip ON tella_transactions(ip_address);
CREATE INDEX IF NOT EXISTS idx_tella_stripe_purchases_ip ON tella_stripe_purchases(ip_address);