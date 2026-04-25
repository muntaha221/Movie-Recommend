const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const axios = require('axios');

// Using OMDB to fetch original IMDb ratings and posters
const fetchOMDBData = async (title) => {
  try {
    const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=thewdb`);
    if (res.data && res.data.Response === 'True') {
      return {
        posterPath: res.data.Poster !== 'N/A' ? res.data.Poster : null,
        voteAverage: res.data.imdbRating !== 'N/A' ? parseFloat(res.data.imdbRating) : 8.0,
        releaseYear: res.data.Year
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
    
    const systemPrompt = `You are a real-time movie search engine powered by AI.
Search the internet for the most accurate and up-to-date movie recommendations.

Analyze the user's mood or request and suggest exactly 3 diverse movies.
Context: It is 2026.

CRITICAL: Your response must be a single JSON object.
Format:
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "reason": "Explain why this movie is trending and fits the user's mood."
    }
  ]
}
Do not include any text outside the JSON.`;

    // Try Groq First for better performance
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("Attempting Groq recommendation for prompt:", prompt);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";
        console.log("Cleaned Groq Text:", responseText);
        
        const data = JSON.parse(responseText);
        if (data.recommendations && Array.isArray(data.recommendations)) {
          recommendations = data.recommendations;
          console.log(`Successfully generated ${recommendations.length} recommendations via Groq.`);
        }
      } catch (e) {
        console.error("Groq Error Full:", e);
      }
    }
    
    // Fallback to Gemini Path
    if ((!recommendations || recommendations.length === 0) && process.env.GEMINI_API_KEY) {
      try {
        console.log("Attempting Gemini recommendation fallback for prompt:", prompt);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([systemPrompt, prompt]);
        const responseText = result.response.text();
        
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        console.log("Cleaned Gemini Text:", cleanedText);
        
        let data;
        try {
          data = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError.message);
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
          }
        }
        
        if (data && data.recommendations && Array.isArray(data.recommendations)) {
          recommendations = data.recommendations;
          console.log(`Successfully generated ${recommendations.length} recommendations via Gemini.`);
        } else if (data && Array.isArray(data)) {
          recommendations = data;
        }
      } catch (e) {
        console.error("Gemini Error Full:", e);
      }
    }

    if (!recommendations || recommendations.length === 0) {
      console.log("Internet search failed or returned no results. Returning empty list.");
      recommendations = [];
    }

    // Enhance with OMDB data (posters, real IMDb ratings)
    const enhanced = await Promise.all(recommendations.slice(0, 3).map(async (rec) => {
      const omdbData = await fetchOMDBData(rec.title);
      return {
        ...rec,
        tmdbId: Math.floor(Math.random() * 1000000), // Mock ID since we use OMDB
        posterPath: omdbData?.posterPath || null,
        voteAverage: omdbData?.voteAverage || 8.0,
        releaseYear: omdbData?.releaseYear || "Unknown"
      };
    }));

    res.json({ recommendations: enhanced });
    
  } catch (error) {
    console.error("Controller Error:", error);
    res.json({ recommendations: [] });
  }
};
