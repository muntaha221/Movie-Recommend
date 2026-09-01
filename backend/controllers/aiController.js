const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const axios = require('axios');

// Fetch real poster + rating from TMDB (working key)
const fetchTMDBData = async (title) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return null;
    const res = await axios.get(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`
    );
    const results = res.data.results || [];
    const best = results.find((r) => r.poster_path);
    if (best) {
      return {
        posterPath: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
        voteAverage: best.vote_average || 7.5,
        releaseYear: (best.release_date || best.first_air_date || '').slice(0, 4) || 'Unknown',
        tmdbId: best.id
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { prompt } = req.body;
    let recommendations = [];

    const systemPrompt = `You are a movie recommendation engine.
Analyze the user's mood or request and suggest exactly 3 diverse movies or TV shows.
Context: It is 2026. Suggest relevant, well-known titles.

CRITICAL: Your response must be a single valid JSON object. No extra text outside JSON.
Format:
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "reason": "Why this fits the user mood in 1-2 sentences."
    }
  ]
}`;

    // --- Try Groq first (fastest) ---
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('Attempting Groq for prompt:', prompt);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: 'qwen/qwen3.8-27b',
          response_format: { type: 'json_object' }
        });
        const responseText = chatCompletion.choices[0]?.message?.content || '';
        console.log('Groq raw:', responseText);
        const data = JSON.parse(responseText);
        if (data.recommendations && Array.isArray(data.recommendations)) {
          recommendations = data.recommendations;
          console.log('Groq success:', recommendations.length);
        }
      } catch (e) {
        console.error('Groq Error:', e.message);
      }
    }

    // --- Fallback to Gemini ---
    if ((!recommendations || recommendations.length === 0) && process.env.GEMINI_API_KEY) {
      try {
        console.log('Attempting Gemini fallback for prompt:', prompt);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.6-flash',
          generationConfig: { responseMimeType: 'application/json' }
        });
        const result = await model.generateContent([systemPrompt, prompt]);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        console.log('Gemini raw:', cleanedText);
        let data;
        try {
          data = JSON.parse(cleanedText);
        } catch (parseError) {
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) data = JSON.parse(jsonMatch[0]);
        }
        if (data && data.recommendations && Array.isArray(data.recommendations)) {
          recommendations = data.recommendations;
        } else if (data && Array.isArray(data)) {
          recommendations = data;
        }
        console.log('Gemini success:', recommendations.length);
      } catch (e) {
        console.error('Gemini Error:', e.message);
      }
    }

    if (!recommendations || recommendations.length === 0) {
      console.log('All AI providers failed.');
      return res.json({ recommendations: [] });
    }

    // Enhance with real TMDB posters & ratings
    const enhanced = await Promise.all(
      recommendations.slice(0, 3).map(async (rec) => {
        const tmdb = await fetchTMDBData(rec.title);
        return {
          ...rec,
          tmdbId: tmdb?.tmdbId || Math.floor(Math.random() * 1000000),
          posterPath: tmdb?.posterPath || null,
          voteAverage: tmdb?.voteAverage || 7.5,
          releaseYear: tmdb?.releaseYear || 'Unknown'
        };
      })
    );

    res.json({ recommendations: enhanced });
  } catch (error) {
    console.error('Controller Error:', error);
    res.json({ recommendations: [] });
  }
};
