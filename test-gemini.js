const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Test Gemini API
async function testGemini() {
    try {
        console.log('Testing Gemini API Key...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: "Halo, ini adalah test. Balas dengan satu kalimat singkat.",
            config: {
                responseMimeType: 'text/plain'
            }
        });

        console.log('✅ Gemini API Working!');
        console.log('Response:', response.text);
        console.log('\n🎉 API Key valid dan bisa digunakan!');
        
    } catch (error) {
        console.error('❌ Gemini API Error:');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        
        if (error.status === 400) {
            console.log('\n⚠️ API Key tidak valid atau format request salah');
        } else if (error.status === 429) {
            console.log('\n⚠️ Quota API habis atau terlalu banyak request');
        } else if (error.status === 403) {
            console.log('\n⚠️ API Key tidak memiliki akses atau expired');
        }
    }
}

testGemini();
