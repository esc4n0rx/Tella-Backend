const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            let dataToValidate;
            
            switch (source) {
                case 'query':
                    dataToValidate = req.query;
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
                case 'body':
                default:
                    dataToValidate = req.body;
                    break;
            }

            const validatedData = schema.parse(dataToValidate);
            req.validatedData = validatedData;
            next();
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};

module.exports = { validate };