const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);

    // Erro de validação do Supabase
    if (error.code) {
        return res.status(400).json({
            error: 'Erro no banco de dados',
            message: error.message
        });
    }

    // Erro genérico
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
    });
};

module.exports = { errorHandler };