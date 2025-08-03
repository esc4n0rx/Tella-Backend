const { z } = require('zod');

const createCharacterSchema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .trim(),
    
    gender: z.enum(['masculino', 'feminino', 'nao_binario', 'outro'], {
        errorMap: () => ({ message: 'Gênero deve ser uma das opções válidas' })
    }),
    
    style: z.string()
        .min(2, 'Estilo deve ter pelo menos 2 caracteres')
        .max(100, 'Estilo deve ter no máximo 100 caracteres')
        .trim(),
    
    baseNarrative: z.string()
        .min(10, 'Narrativa base deve ter pelo menos 10 caracteres')
        .max(2000, 'Narrativa base deve ter no máximo 2000 caracteres')
        .trim(),
    
    roleplayStyle: z.string()
        .min(10, 'Estilo de roleplay deve ter pelo menos 10 caracteres')
        .max(1000, 'Estilo de roleplay deve ter no máximo 1000 caracteres')
        .trim(),
    
    initialPhrases: z.array(z.string().trim())
        .min(1, 'Deve ter pelo menos uma frase inicial')
        .max(10, 'Máximo de 10 frases iniciais'),
    
    avatarUrl: z.string()
        .url('URL do avatar inválida')
        .optional()
        .or(z.literal('')),
    
    observations: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional()
        .default(''),
    
    negativeWords: z.array(z.string().trim())
        .max(20, 'Máximo de 20 palavras negativas')
        .default([]),
    
    price: z.number()
        .int('Preço deve ser um número inteiro')
        .min(0, 'Preço deve ser maior ou igual a zero')
        .max(1000, 'Preço máximo é 1000 moedas')
        .default(0)
});

const paginationSchema = z.object({
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

const approveCharacterSchema = z.object({
    isApproved: z.boolean()
        .default(true)
});

module.exports = {
    createCharacterSchema,
    paginationSchema,
    approveCharacterSchema
};