-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS tella_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tella_users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES tella_wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'purchase', 'refund', 'bonus')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    reference_id VARCHAR(255), -- Para referenciar compras do Stripe, gastos em features, etc
    reference_type VARCHAR(50), -- 'stripe_payment', 'character_creation', 'message_generation', etc
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras via Stripe
CREATE TABLE IF NOT EXISTS tella_stripe_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tella_users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES tella_transactions(id) ON DELETE SET NULL,
    package_id UUID NOT NULL REFERENCES tella_coin_packages(id),
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_session_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    amount_paid_brl DECIMAL(10,2) NOT NULL,
    coins_purchased INTEGER NOT NULL,
    ip_address INET,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tella_stripe_purchases_updated_at 
    BEFORE UPDATE ON tella_stripe_purchases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE tella_transactions IS 'Log completo de todas as transações de moedas';
COMMENT ON COLUMN tella_transactions.type IS 'Tipo de transação: earn (ganhar), spend (gastar), purchase (compra), refund (reembolso), bonus (bônus)';
COMMENT ON COLUMN tella_transactions.reference_id IS 'ID de referência externa (ex: payment_intent do Stripe)';
COMMENT ON COLUMN tella_transactions.reference_type IS 'Tipo da referência (ex: stripe_payment, character_creation)';

COMMENT ON TABLE tella_stripe_purchases IS 'Registro de compras via Stripe';
COMMENT ON COLUMN tella_stripe_purchases.status IS 'Status da compra: pending, completed, failed, refunded';