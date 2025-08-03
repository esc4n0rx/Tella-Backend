const { Groq } = require('groq-sdk');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY não configurado no .env');
}

const groq = new Groq({
    apiKey: GROQ_API_KEY
});

module.exports = {
    groq
};