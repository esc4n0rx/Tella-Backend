const { verifyToken } = require('../../config/jwt');
const { supabaseAdmin } = require('../../config/database');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Token de acesso requerido'
            });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        // Verifica se o usuário ainda existe e está ativo
        const { data: user, error } = await supabaseAdmin
            .from('tella_users')
            .select('id, firebase_uid, nome, email, is_deleted')
            .eq('firebase_uid', decoded.firebase_uid)
            .eq('is_deleted', false)
            .single();

        if (error || !user) {
            return res.status(401).json({
                error: 'Token inválido ou usuário não encontrado'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }

        next(error);
    }
};

module.exports = { requireAuth };