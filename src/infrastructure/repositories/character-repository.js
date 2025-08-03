const { supabaseAdmin } = require('../../config/database');

class CharacterRepository {
    async create(characterData) {
        const { data, error } = await supabaseAdmin
            .from('tella_characters')
            .insert([characterData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('tella_characters')
            .select(`
                *,
                creator:creator_id (
                    id,
                    nome,
                    url_avatar
                )
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async findPublicApproved(limit = 50, offset = 0) {
        const { data, error } = await supabaseAdmin
            .from('tella_characters')
            .select(`
                *,
                creator:creator_id (
                    id,
                    nome,
                    url_avatar
                )
            `)
            .eq('is_public', true)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return data;
    }

    async findByCreatorId(creatorId, limit = 50, offset = 0) {
        const { data, error } = await supabaseAdmin
            .from('tella_characters')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return data;
    }

    async updateApprovalStatus(id, isApproved, staffId) {
        const { data, error } = await supabaseAdmin
            .from('tella_characters')
            .update({
                is_approved: isApproved,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async purchaseCharacter(userId, characterId, pricePaid, transactionId) {
        const { data, error } = await supabaseAdmin
            .from('tella_character_purchases')
            .insert([{
                user_id: userId,
                character_id: characterId,
                price_paid: pricePaid,
                transaction_id: transactionId
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async findPurchaseByUserAndCharacter(userId, characterId) {
        const { data, error } = await supabaseAdmin
            .from('tella_character_purchases')
            .select('*')
            .eq('user_id', userId)
            .eq('character_id', characterId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async findPurchasesByUserId(userId, limit = 50, offset = 0) {
        const { data, error } = await supabaseAdmin
            .from('tella_character_purchases')
            .select(`
                *,
                character:character_id (
                    id,
                    name,
                    avatar_url,
                    style,
                    creator:creator_id (
                        id,
                        nome
                    )
                )
            `)
            .eq('user_id', userId)
            .order('purchased_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return data;
    }

    async toggleFavorite(userId, characterId) {
        // Verificar se já existe
        const { data: existing } = await supabaseAdmin
            .from('tella_character_favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('character_id', characterId)
            .single();

        if (existing) {
            // Remover favorito
            const { error } = await supabaseAdmin
                .from('tella_character_favorites')
                .delete()
                .eq('user_id', userId)
                .eq('character_id', characterId);

            if (error) {
                throw error;
            }

            return { action: 'removed' };
        } else {
            // Adicionar favorito
            const { data, error } = await supabaseAdmin
                .from('tella_character_favorites')
                .insert([{
                    user_id: userId,
                    character_id: characterId
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return { action: 'added', data };
        }
    }

    async findFavoritesByUserId(userId, limit = 50, offset = 0) {
        const { data, error } = await supabaseAdmin
            .from('tella_character_favorites')
            .select(`
                *,
                character:character_id (
                    id,
                    name,
                    avatar_url,
                    style,
                    price,
                    creator:creator_id (
                        id,
                        nome
                    )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new CharacterRepository();