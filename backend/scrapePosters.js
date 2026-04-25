const axios = require('axios');
const fs = require('fs');

const moviesToSearch = [
  // Marvel
  'The Avengers', 'Avengers: Age of Ultron', 'Avengers: Infinity War', 'Avengers: Endgame', 'Captain America: The Winter Soldier',
  // Iron Man
  'Iron Man', 'Iron Man 2', 'Iron Man 3',
  // DC
  'Man of Steel', 'Batman v Superman: Dawn of Justice', 'Wonder Woman', 'Zack Snyder\'s Justice League', 'Aquaman',
  // Transformers
  'Transformers', 'Transformers: Revenge of the Fallen', 'Transformers: Dark of the Moon', 'Transformers: Age of Extinction',
  // Star Wars
  'Star Wars', 'The Empire Strikes Back', 'Return of the Jedi', 'Star Wars: The Force Awakens',
  // Star Trek
  'Star Trek', 'Star Trek Into Darkness', 'Star Trek Beyond',
  // Series (TV)
  'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Boys'
];

async function scrape() {
  const results = {};
  for (const title of moviesToSearch) {
    try {
      // Search TMDB website directly
      const url = `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = response.data;
      // Look for the first poster image path like /t/p/w94_and_h141_bestv2/xxxx.jpg
      const match = html.match(/\/t\/p\/w94_and_h141_bestv2(\/[a-zA-Z0-9_]+\.jpg)/);
      if (match && match[1]) {
        results[title] = match[1];
        console.log(`Found ${title}: ${match[1]}`);
      } else {
        console.log(`Not found for ${title}`);
      }
    } catch (e) {
      console.log(`Error on ${title}`);
    }
    // Wait a bit to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('scraped_posters.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

scrape();
