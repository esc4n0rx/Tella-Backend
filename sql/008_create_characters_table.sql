-- Tabela de personagens
CREATE TABLE IF NOT EXISTS tella_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('masculino', 'feminino', 'nao_binario', 'outro')),
    style VARCHAR(100) NOT NULL,
    base_narrative TEXT NOT NULL,
    roleplay_style TEXT NOT NULL,
    initial_phrases JSONB NOT NULL DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    observations TEXT,
    negative_words JSONB NOT NULL DEFAULT '[]'::jsonb,
    llm_prompt TEXT NOT NULL,
    creator_id UUID REFERENCES tella_users(id) ON DELETE SET NULL,
    price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
    is_public BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras de personagens (N:N entre users e characters)
CREATE TABLE IF NOT EXISTS tella_character_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tella_users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES tella_characters(id) ON DELETE CASCADE,
    price_paid INTEGER NOT NULL CHECK (price_paid >= 0),
    transaction_id UUID REFERENCES tella_transactions(id) ON DELETE SET NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_character_purchase UNIQUE(user_id, character_id)
);

-- Tabela de favoritos (N:N entre users e characters)
CREATE TABLE IF NOT EXISTS tella_character_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tella_users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES tella_characters(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_character_favorite UNIQUE(user_id, character_id)
);

-- Triggers para updated_at
CREATE TRIGGER update_tella_characters_updated_at 
    BEFORE UPDATE ON tella_characters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tella_characters_creator_id ON tella_characters(creator_id);
CREATE INDEX IF NOT EXISTS idx_tella_characters_public_approved ON tella_characters(is_public, is_approved) WHERE is_public = true AND is_approved = true;
CREATE INDEX IF NOT EXISTS idx_tella_characters_default ON tella_characters(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_tella_characters_price ON tella_characters(price);
CREATE INDEX IF NOT EXISTS idx_tella_character_purchases_user_id ON tella_character_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_tella_character_purchases_character_id ON tella_character_purchases(character_id);
CREATE INDEX IF NOT EXISTS idx_tella_character_favorites_user_id ON tella_character_favorites(user_id);

-- Comentários
COMMENT ON TABLE tella_characters IS 'Personagens criados por creators e staff';
COMMENT ON COLUMN tella_characters.price IS 'Preço em Tella Coins para comprar o personagem';
COMMENT ON COLUMN tella_characters.is_approved IS 'Se o personagem foi aprovado por um staff';
COMMENT ON COLUMN tella_characters.llm_prompt IS 'Prompt final gerado pelo LLM para uso no roleplay';
COMMENT ON TABLE tella_character_purchases IS 'Histórico de compras de personagens pelos usuários';
COMMENT ON TABLE tella_character_favorites IS 'Personagens favoritados pelos usuários';