const getClientIP = (req) => {
    // Verifica vários headers para obter o IP real
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           req.ip ||
           'unknown';
};

const trackIP = (req, res, next) => {
    req.clientIP = getClientIP(req);
    next();
};

module.exports = { trackIP, getClientIP };