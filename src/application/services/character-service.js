const characterRepository = require('../../infrastructure/repositories/character-repository');
const walletService = require('./wallet-service');
const { groq } = require('../../config/groq');
const systemPromptData = require('../../prompts/system-base.json');

const CHARACTER_CREATION_COST = 50; // Custo para creators criarem personagem
const MIN_CHARACTER_PRICE = 0;      // Preço mínimo para venda
const MAX_CHARACTER_PRICE = 1000;   // Preço máximo para venda

class CharacterService {
    async createCharacter(userId, userRole, characterData, ipAddress = null) {
        const {
            name,
            gender,
            style,
            baseNarrative,
            roleplayStyle,
            initialPhrases,
            avatarUrl,
            observations,
            negativeWords,
            price
        } = characterData;

        // Verificar permissões
        if (!['creator', 'staff'].includes(userRole)) {
            throw new Error('Apenas creators e staff podem criar personagens');
        }

        // Validar preço
        if (price < MIN_CHARACTER_PRICE || price > MAX_CHARACTER_PRICE) {
            throw new Error(`Preço deve estar entre ${MIN_CHARACTER_PRICE} e ${MAX_CHARACTER_PRICE} moedas`);
        }

        // Staff pode criar grátis e com preço 0, creators precisam pagar
        const shouldPayCreationCost = userRole === 'creator';
        const isApprovedByDefault = userRole === 'staff';

        let transactionResult = null;

        try {
            // Cobrar taxa de criação se for creator
            if (shouldPayCreationCost) {
                transactionResult = await walletService.spendCoins(
                    userId,
                    CHARACTER_CREATION_COST,
                    'Criação de personagem',
                    null,
                    'character_creation',
                    ipAddress
                );
            }

            // Gerar prompt com Groq
            const llmPrompt = await this.generateCharacterPrompt({
                name,
                gender,
                style,
                baseNarrative,
                roleplayStyle,
                initialPhrases,
                observations,
                negativeWords
            });

            // Criar personagem no banco
            const character = await characterRepository.create({
                name,
                gender,
                style,
                base_narrative: baseNarrative,
                roleplay_style: roleplayStyle,
                initial_phrases: JSON.stringify(initialPhrases),
                avatar_url: avatarUrl,
                observations,
                negative_words: JSON.stringify(negativeWords),
                llm_prompt: llmPrompt,
                creator_id: userId,
                price,
                is_approved: isApprovedByDefault,
                is_public: true,
                is_default: false
            });

            return character;

        } catch (error) {
            // Se houve cobrança e deu erro, não há como reverter automaticamente
            // O sistema de transações do wallet já garante atomicidade
            throw error;
        }
    }

    async generateCharacterPrompt(characterData) {
        const {
            name,
            gender,
            style,
            baseNarrative,
            roleplayStyle,
            initialPhrases,
            observations,
            negativeWords
        } = characterData;

        // Montar prompt para o Groq
        const userPrompt = `
Crie um personagem para roleplay com as seguintes características:

Nome: ${name}
Gênero: ${gender}
Estilo: ${style}
Narrativa base: ${baseNarrative}
Estilo de roleplay: ${roleplayStyle}
Frases iniciais: ${initialPhrases.join(', ')}
Observações: ${observations || 'Nenhuma'}
Palavras negativas (evitar): ${negativeWords.join(', ')}

Por favor, gere um personagem completo e detalhado seguindo exatamente o formato JSON solicitado.
        `.trim();

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPromptData.systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                model: systemPromptData.model,
                temperature: systemPromptData.temperature,
                max_completion_tokens: systemPromptData.maxTokens,
                top_p: 1,
                stream: false
            });

            const response = chatCompletion.choices[0]?.message?.content;
            
            if (!response) {
                throw new Error('Resposta vazia do LLM');
            }

            // Tentar parsear o JSON
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(response);
            } catch (parseError) {
                // Se não conseguir parsear, usar resposta como texto simples
                console.warn('Falha ao parsear resposta do LLM como JSON:', parseError);
                return response;
            }

            // Verificar se tem a estrutura esperada
            if (parsedResponse.prompt) {
                return parsedResponse.prompt;
            } else {
                return response;
            }

        } catch (error) {
            console.error('Erro ao gerar prompt com Groq:', error);
            throw new Error('Falha ao gerar prompt do personagem. Tente novamente.');
        }
    }

    async getPublicCharacters(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const characters = await characterRepository.findPublicApproved(limit, offset);
        
        return {
            characters,
            pagination: {
                page,
                limit,
                has_more: characters.length === limit
            }
        };
    }

    async getCharacterById(id) {
        const character = await characterRepository.findById(id);
        
        if (!character) {
            throw new Error('Personagem não encontrado');
        }

        return character;
    }

    async getUserCharacters(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const characters = await characterRepository.findByCreatorId(userId, limit, offset);
        
        return {
            characters,
            pagination: {
                page,
                limit,
                has_more: characters.length === limit
            }
        };
    }

    async approveCharacter(characterId, staffId, isApproved = true) {
        const character = await characterRepository.findById(characterId);
        
        if (!character) {
            throw new Error('Personagem não encontrado');
        }

        return await characterRepository.updateApprovalStatus(characterId, isApproved, staffId);
    }

    async purchaseCharacter(userId, characterId, ipAddress = null) {
        const character = await characterRepository.findById(characterId);
        
        if (!character) {
            throw new Error('Personagem não encontrado');
        }

        if (!character.is_public || !character.is_approved) {
            throw new Error('Personagem não está disponível para compra');
        }

        // Verificar se já foi comprado
        const existingPurchase = await characterRepository.findPurchaseByUserAndCharacter(userId, characterId);
        if (existingPurchase) {
            throw new Error('Você já possui este personagem');
        }

        // Verificar se é o próprio criador
        if (character.creator_id === userId) {
            throw new Error('Você não pode comprar seu próprio personagem');
        }

        let transactionResult = null;

        // Se o personagem tem preço > 0, cobrar
        if (character.price > 0) {
            transactionResult = await walletService.spendCoins(
                userId,
                character.price,
                `Compra do personagem: ${character.name}`,
                characterId,
                'character_purchase',
                ipAddress
            );
        }

        // Registrar compra
        const purchase = await characterRepository.purchaseCharacter(
            userId,
            characterId,
            character.price,
            transactionResult?.transaction_id || null
        );

        return {
            purchase,
            character
        };
    }

    async toggleFavorite(userId, characterId) {
        const character = await characterRepository.findById(characterId);
        
        if (!character) {
            throw new Error('Personagem não encontrado');
        }

        if (!character.is_public || !character.is_approved) {
            throw new Error('Personagem não está disponível');
        }

        return await characterRepository.toggleFavorite(userId, characterId);
    }

    async getUserPurchases(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const purchases = await characterRepository.findPurchasesByUserId(userId, limit, offset);
        
        return {
            purchases,
            pagination: {
                page,
                limit,
                has_more: purchases.length === limit
            }
        };
    }

    async getUserFavorites(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const favorites = await characterRepository.findFavoritesByUserId(userId, limit, offset);
        
        return {
            favorites,
            pagination: {
                page,
                limit,
                has_more: favorites.length === limit
            }
        };
    }
}

module.exports = new CharacterService();