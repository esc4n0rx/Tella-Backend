const { supabaseAdmin } = require('../../config/database');

class UserRepository {
    async findByFirebaseUid(firebaseUid) {
        const { data, error } = await supabaseAdmin
            .from('tella_users')
            .select('*')
            .eq('firebase_uid', firebaseUid)
            .eq('is_deleted', false)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        return data;
    }

    async findByEmail(email) {
        const { data, error } = await supabaseAdmin
            .from('tella_users')
            .select('*')
            .eq('email', email)
            .eq('is_deleted', false)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    async create(userData) {
        const { data, error } = await supabaseAdmin
            .from('tella_users')
            .insert([userData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async updateProfile(firebaseUid, updateData) {
        const { data, error } = await supabaseAdmin
            .from('tella_users')
            .update({
                ...updateData,
                is_profile_complete: true,
                updated_at: new Date().toISOString()
            })
            .eq('firebase_uid', firebaseUid)
            .eq('is_deleted', false)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async updateLastLogin(firebaseUid) {
        const { error } = await supabaseAdmin
            .from('tella_users')
            .update({
                last_login_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('firebase_uid', firebaseUid)
            .eq('is_deleted', false);

        if (error) {
            throw error;
        }
    }
}

module.exports = new UserRepository();