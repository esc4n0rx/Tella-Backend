-- Adicionar campo de IP na tabela de usuários
ALTER TABLE tella_users ADD COLUMN IF NOT EXISTS registration_ip INET;
ALTER TABLE tella_users ADD COLUMN IF NOT EXISTS last_login_ip INET;

-- Índice para controle de IPs
CREATE INDEX IF NOT EXISTS idx_tella_users_registration_ip ON tella_users(registration_ip);