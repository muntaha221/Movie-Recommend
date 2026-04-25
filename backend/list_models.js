const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const key = 'AIzaSyACUgWp_Kq93hsmfDa4U108yZayDmRLS10';

async function list() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await axios.get(url);
    console.log('Models:', res.data.models.map(m => m.name));
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}

list();
