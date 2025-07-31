const { z } = require('zod');

const firebaseLoginSchema = z.object({
    idToken: z.string()
        .min(1, 'Token Firebase é obrigatório'),
});

const completeRegistrationSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .trim(),
    
    url_avatar: z.string()
        .url('URL do avatar inválida')
        .optional()
        .or(z.literal('')),
    
    gender: z.enum(['masculino', 'feminino', 'nao_binario', 'outro', 'prefiro_nao_dizer'], {
        errorMap: () => ({ message: 'Gênero deve ser uma das opções válidas' })
    }),
    
    idade: z.number()
        .int('Idade deve ser um número inteiro')
        .min(13, 'Idade mínima é 13 anos')
        .max(120, 'Idade máxima é 120 anos'),
    
    interesses: z.array(z.string().trim())
        .min(1, 'Selecione pelo menos um interesse')
        .max(20, 'Máximo de 20 interesses permitidos')
});

module.exports = {
    firebaseLoginSchema,
    completeRegistrationSchema
};