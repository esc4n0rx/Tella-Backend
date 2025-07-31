-- Tabela principal de usuários do Tella
CREATE TABLE IF NOT EXISTS tella_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id UUID UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    url_avatar TEXT,
    gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'nao_binario', 'outro', 'prefiro_nao_dizer')),
    idade INTEGER CHECK (idade >= 13 AND idade <= 120),
    interesses JSONB DEFAULT '[]'::jsonb,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tella_users_updated_at 
    BEFORE UPDATE ON tella_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas colunas
COMMENT ON TABLE tella_users IS 'Tabela de usuários do app Tella';
COMMENT ON COLUMN tella_users.supabase_user_id IS 'ID do usuário no Supabase Auth';
COMMENT ON COLUMN tella_users.interesses IS 'Array JSON com tags de interesse do usuário';
COMMENT ON COLUMN tella_users.is_profile_complete IS 'Indica se o usuário completou o registro inicial';