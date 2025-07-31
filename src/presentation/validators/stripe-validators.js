const { z } = require('zod');

const createPaymentSessionSchema = z.object({
    package_id: z.string()
        .uuid('Package ID deve ser um UUID válido'),
    
    success_url: z.string()
        .url('Success URL deve ser uma URL válida'),
    
    cancel_url: z.string()
        .url('Cancel URL deve ser uma URL válida')
});

module.exports = {
    createPaymentSessionSchema
};