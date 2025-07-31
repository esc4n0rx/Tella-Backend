const app = require('./app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`
🚀 Tella Backend rodando!
📍 Porta: ${PORT}
🌍 Ambiente: ${NODE_ENV}
📅 Iniciado em: ${new Date().toISOString()}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});