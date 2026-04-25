const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const key = process.env.GEMINI_API_KEY;
console.log('Testing key:', key);

async function test() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello' }] }]
    });
    console.log('Success:', res.data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}

test();
