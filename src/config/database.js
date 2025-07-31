const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configurações do Supabase não encontradas no .env');
}

// Cliente com service key apenas para operações de banco de dados
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
    supabaseAdmin
};