-- Adicionar campo role na tabela de usuários
DO $$ 
BEGIN
    -- Criar enum se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'creator', 'staff');
    END IF;
END $$;

-- Adicionar coluna role se não existir
ALTER TABLE tella_users 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Índice para consultas por role
CREATE INDEX IF NOT EXISTS idx_tella_users_role ON tella_users(role);

-- Comentário
COMMENT ON COLUMN tella_users.role IS 'Tipo de usuário: user (comum), creator (pode criar personagens), staff (admin)';