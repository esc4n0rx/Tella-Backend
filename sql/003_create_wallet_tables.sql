-- Tabela de wallet (saldo de moedas por usuário)
CREATE TABLE IF NOT EXISTS tella_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tella_users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_wallet UNIQUE(user_id)
);

-- Tabela de pacotes de compra
CREATE TABLE IF NOT EXISTS tella_coin_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    stripe_product_id VARCHAR(100) NOT NULL UNIQUE,
    stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
    coins_amount INTEGER NOT NULL CHECK (coins_amount > 0),
    price_brl DECIMAL(10,2) NOT NULL CHECK (price_brl > 0),
    cost_per_100_coins DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir pacotes padrão
INSERT INTO tella_coin_packages (name, stripe_product_id, stripe_price_id, coins_amount, price_brl, cost_per_100_coins) VALUES
('Tella Avulso', 'prod_SmcHxntAqRX2lb', 'price_1Rr32xI5nlZeb0YlXmpNbssB', 100, 1.40, 1.40),
('Tella Padrão', 'prod_SmcEU5azLkF8ZM', 'price_1Rr2zyI5nlZeb0Yl8RcveyHB', 1200, 19.90, 1.16),
('Tella Creators', 'prod_SmcFSPIwJc7RAb', 'price_1Rr30YI5nlZeb0Ylus8AKq5c', 3500, 49.90, 1.00),
('Tella Roleplayer+', 'prod_SmcFavNHcDebBg', 'price_1Rr316I5nlZeb0YlTusCyXmQ', 8000, 99.90, 0.87)
ON CONFLICT (stripe_product_id) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tella_wallets_updated_at 
    BEFORE UPDATE ON tella_wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tella_coin_packages_updated_at 
    BEFORE UPDATE ON tella_coin_packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE tella_wallets IS 'Saldo de Tella Coins por usuário';
COMMENT ON COLUMN tella_wallets.balance IS 'Saldo atual de moedas';
COMMENT ON COLUMN tella_wallets.total_earned IS 'Total de moedas ganhas historicamente';
COMMENT ON COLUMN tella_wallets.total_spent IS 'Total de moedas gastas historicamente';