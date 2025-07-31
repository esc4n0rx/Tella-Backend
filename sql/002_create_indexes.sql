-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_tella_users_supabase_id ON tella_users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_tella_users_email ON tella_users(email);
CREATE INDEX IF NOT EXISTS idx_tella_users_is_deleted ON tella_users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_tella_users_created_at ON tella_users(created_at);

-- Índice GIN para busca em interesses (JSONB)
CREATE INDEX IF NOT EXISTS idx_tella_users_interesses ON tella_users USING GIN(interesses);