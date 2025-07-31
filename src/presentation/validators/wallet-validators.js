const { z } = require('zod');

const spendCoinsSchema = z.object({
    amount: z.number()
        .int('Quantidade deve ser um número inteiro')
        .min(1, 'Quantidade deve ser maior que zero')
        .max(10000, 'Quantidade máxima é 10.000 moedas por transação'),
    
    description: z.string()
        .min(1, 'Descrição é obrigatória')
        .max(255, 'Descrição deve ter no máximo 255 caracteres'),
    
    reference_id: z.string()
        .max(255, 'Reference ID deve ter no máximo 255 caracteres')
        .optional(),
    
    reference_type: z.string()
        .max(50, 'Reference type deve ter no máximo 50 caracteres')
        .optional()
});

const transactionHistorySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, 'Página deve ser um número')
        .transform(Number)
        .refine(n => n >= 1, 'Página deve ser maior que zero')
        .optional()
        .default('1'),
    
    limit: z.string()
        .regex(/^\d+$/, 'Limit deve ser um número')
        .transform(Number)
        .refine(n => n >= 1 && n <= 100, 'Limit deve estar entre 1 e 100')
        .optional()
        .default('20')
});

module.exports = {
    spendCoinsSchema,
    transactionHistorySchema
};