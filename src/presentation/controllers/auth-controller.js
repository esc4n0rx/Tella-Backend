const authService = require('../../application/services/auth-service');

class AuthController {
    async firebaseLogin(req, res, next) {
        try {
            const { idToken } = req.validatedData;

            const result = await authService.firebaseLogin(idToken);

            res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: result.user.id,
                        nome: result.user.nome,
                        email: result.user.email,
                        url_avatar: result.user.url_avatar,
                        is_profile_complete: result.user.is_profile_complete
                    },
                    token: result.token,
                    needsProfileCompletion: result.needsProfileCompletion
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async completeRegistration(req, res, next) {
        try {
            const firebaseUid = req.user.firebase_uid;
            const registrationData = req.validatedData;

            const result = await authService.completeRegistration(firebaseUid, registrationData);

            res.status(200).json({
                success: true,
                message: 'Registro completado com sucesso',
                data: {
                    user: {
                        id: result.user.id,
                        nome: result.user.nome,
                        email: result.user.email,
                        url_avatar: result.user.url_avatar,
                        gender: result.user.gender,
                        idade: result.user.idade,
                        interesses: JSON.parse(result.user.interesses || '[]'),
                        is_profile_complete: result.user.is_profile_complete
                    },
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.user.firebase_uid);

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email,
                        url_avatar: user.url_avatar,
                        gender: user.gender,
                        idade: user.idade,
                        interesses: JSON.parse(user.interesses || '[]'),
                        is_profile_complete: user.is_profile_complete,
                        provider: user.provider,
                        last_login_at: user.last_login_at,
                        created_at: user.created_at
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const result = await authService.refreshToken(req.user.firebase_uid);

            res.status(200).json({
                success: true,
                message: 'Token renovado com sucesso',
                data: {
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();