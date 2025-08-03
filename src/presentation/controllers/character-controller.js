const characterService = require('../../application/services/character-service');

class CharacterController {
    async createCharacter(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const characterData = req.validatedData;
            const ipAddress = req.clientIP;

            const character = await characterService.createCharacter(
                userId,
                userRole,
                characterData,
                ipAddress
            );

            res.status(201).json({
                success: true,
                message: userRole === 'staff' 
                    ? 'Personagem criado e aprovado com sucesso' 
                    : 'Personagem criado com sucesso. Aguardando aprovação.',
                data: {
                    character: {
                        id: character.id,
                        name: character.name,
                        style: character.style,
                        price: character.price,
                        is_approved: character.is_approved,
                        created_at: character.created_at
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getCharacters(req, res, next) {
        try {
            const { page, limit } = req.validatedData;

            const result = await characterService.getPublicCharacters(page, limit);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getCharacterById(req, res, next) {
        try {
            const { id } = req.params;

            const character = await characterService.getCharacterById(id);

            res.status(200).json({
                success: true,
                data: {
                    character
                }
            });
        } catch (error) {
            if (error.message === 'Personagem não encontrado') {
                return res.status(404).json({
                    error: 'Personagem não encontrado'
                });
            }
            next(error);
        }
    }

    async getMyCharacters(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = req.validatedData;

            const result = await characterService.getUserCharacters(userId, page, limit);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async approveCharacter(req, res, next) {
        try {
            const { id } = req.params;
            const staffId = req.user.id;
            const { isApproved } = req.validatedData;

            const character = await characterService.approveCharacter(id, staffId, isApproved);

            res.status(200).json({
                success: true,
                message: isApproved ? 'Personagem aprovado com sucesso' : 'Personagem rejeitado',
                data: {
                    character: {
                        id: character.id,
                        name: character.name,
                        is_approved: character.is_approved,
                        updated_at: character.updated_at
                    }
                }
            });
        } catch (error) {
            if (error.message === 'Personagem não encontrado') {
                return res.status(404).json({
                    error: 'Personagem não encontrado'
                });
            }
            next(error);
        }
    }

    async purchaseCharacter(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const ipAddress = req.clientIP;

            const result = await characterService.purchaseCharacter(userId, id, ipAddress);

            res.status(200).json({
                success: true,
                message: 'Personagem comprado com sucesso',
                data: result
            });
        } catch (error) {
            if (error.message.includes('não encontrado') || 
                error.message.includes('não está disponível') ||
                error.message.includes('já possui') ||
                error.message.includes('próprio personagem')) {
                return res.status(400).json({
                    error: error.message
                });
            }
            if (error.message === 'Saldo insuficiente') {
                return res.status(400).json({
                    error: 'Saldo insuficiente',
                    message: 'Você não possui moedas suficientes para comprar este personagem'
                });
            }
            next(error);
        }
    }

    async toggleFavorite(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const result = await characterService.toggleFavorite(userId, id);

            res.status(200).json({
                success: true,
                message: result.action === 'added' 
                    ? 'Personagem adicionado aos favoritos' 
                    : 'Personagem removido dos favoritos',
                data: {
                    action: result.action
                }
            });
        } catch (error) {
            if (error.message.includes('não encontrado') || 
                error.message.includes('não está disponível')) {
                return res.status(400).json({
                    error: error.message
                });
            }
            next(error);
        }
    }

    async getMyPurchases(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = req.validatedData;

            const result = await characterService.getUserPurchases(userId, page, limit);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyFavorites(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = req.validatedData;

            const result = await characterService.getUserFavorites(userId, page, limit);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CharacterController();