const { verifyFirebaseToken, getFirebaseUser } = require('../../config/firebase');
const { generateToken } = require('../../config/jwt');
const userRepository = require('../../infrastructure/repositories/user-repository');

class AuthService {
    async firebaseLogin(idToken) {
        // Verifica e decodifica o token do Firebase
        const decodedToken = await verifyFirebaseToken(idToken);
        const firebaseUid = decodedToken.uid;
        
        // Busca dados completos do usuário no Firebase
        const firebaseUser = await getFirebaseUser(firebaseUid);
        
        // Verifica se usuário já existe no nosso sistema
        let tellaUser = await userRepository.findByFirebaseUid(firebaseUid);

        if (!tellaUser) {
            // Extrai dados do usuário Firebase para criar registro
            const providerData = firebaseUser.providerData[0] || {};
            
            const userData = {
                firebase_uid: firebaseUid,
                nome: firebaseUser.displayName || decodedToken.name || 'Usuário',
                email: firebaseUser.email || decodedToken.email,
                url_avatar: firebaseUser.photoURL || decodedToken.picture || null,
                provider: providerData.providerId || 'firebase',
                is_profile_complete: false,
                last_login_at: new Date().toISOString()
            };

            tellaUser = await userRepository.create(userData);
        } else {
            // Atualiza último login
            await userRepository.updateLastLogin(firebaseUid);
        }

        // Gera token JWT interno
        const jwtToken = generateToken({
            user_id: tellaUser.id,
            firebase_uid: tellaUser.firebase_uid,
            email: tellaUser.email
        });

        return {
            user: tellaUser,
            token: jwtToken,
            needsProfileCompletion: !tellaUser.is_profile_complete
        };
    }

    async completeRegistration(firebaseUid, registrationData) {
        // Verifica se usuário existe
        const existingUser = await userRepository.findByFirebaseUid(firebaseUid);
        if (!existingUser) {
            throw new Error('Usuário não encontrado');
        }

        if (existingUser.is_profile_complete) {
            throw new Error('Perfil já foi completado anteriormente');
        }

        // Atualiza perfil com dados complementares
        const updatedUser = await userRepository.updateProfile(firebaseUid, {
            nome: registrationData.nome,
            url_avatar: registrationData.url_avatar || existingUser.url_avatar,
            gender: registrationData.gender,
            idade: registrationData.idade,
            interesses: JSON.stringify(registrationData.interesses)
        });

        // Gera novo token com dados atualizados
        const jwtToken = generateToken({
            user_id: updatedUser.id,
            firebase_uid: updatedUser.firebase_uid,
            email: updatedUser.email
        });

        return {
            user: updatedUser,
            token: jwtToken
        };
    }

    async getCurrentUser(firebaseUid) {
        const user = await userRepository.findByFirebaseUid(firebaseUid);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    }

    async refreshToken(firebaseUid) {
        const user = await userRepository.findByFirebaseUid(firebaseUid);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Gera novo token JWT
        const jwtToken = generateToken({
            user_id: user.id,
            firebase_uid: user.firebase_uid,
            email: user.email
        });

        return {
            user,
            token: jwtToken
        };
    }
}

module.exports = new AuthService();