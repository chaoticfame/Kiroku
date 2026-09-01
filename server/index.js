import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initializeDatabase,
  registerUser,
  loginUser,
  getUserById,
  getEntriesForUser,
  getEntryById,
  addEntry,
  updateEntry,
  updateProgress,
  deleteEntry,
  deleteAllEntries,
  getUserStats
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kiroku-secret-key-2026-anime-manga';

// In-memory cache for Jikan to prevent rate limits
const jikanCache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Initialize SQLite DB
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets (images, logo)
app.use('/assets', express.static(path.join(__dirname, '../client/public')));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

// ----------------- AUTH ROUTES ----------------- //

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = registerUser(username.trim(), password);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = loginUser(username.trim(), password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: { id: user.id, username: user.username } });
});

// ----------------- ENTRY RULES VALIDATION ----------------- //

function validateEntryRules(type, status, progress, rating) {
  const plannedStatus = type === 'Manga' ? 'Plan to Read' : 'Plan to Watch';
  if (status === plannedStatus) {
    if (progress !== 0 || rating !== 0) {
      return `${plannedStatus} entries should keep progress and rating at 0.`;
    }
  } else if (status === 'Completed') {
    if (progress <= 0) {
      return 'Completed entries need progress greater than 0.';
    }
    if (rating <= 0) {
      return 'Completed entries need a rating from 1 to 10.';
    }
  }
  return null;
}

// ----------------- ENTRIES ROUTES ----------------- //

app.get('/api/entries', authenticateToken, (req, res) => {
  const { type, status, search, sort } = req.query;
  try {
    const entries = getEntriesForUser(req.user.id, { type, status, search, sort });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/entries', authenticateToken, (req, res) => {
  const { type, title, status, progress = 0, rating = 0, image_url } = req.body;

  if (!type || !title || !status) {
    return res.status(400).json({ error: 'Type, title, and status are required fields.' });
  }

  const progNum = parseInt(progress) || 0;
  const rateNum = parseInt(rating) || 0;

  const validationError = validateEntryRules(type, status, progNum, rateNum);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const newEntry = addEntry(req.user.id, {
      type,
      title,
      status,
      progress: progNum,
      rating: rateNum,
      image_url
    });
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/entries/:id', authenticateToken, (req, res) => {
  const entry = getEntryById(req.user.id, parseInt(req.params.id));
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found.' });
  }
  res.json(entry);
});

app.put('/api/entries/:id', authenticateToken, (req, res) => {
  const entryId = parseInt(req.params.id);
  const { type, title, status, progress = 0, rating = 0, image_url } = req.body;

  if (!type || !title || !status) {
    return res.status(400).json({ error: 'Type, title, and status are required fields.' });
  }

  const progNum = parseInt(progress) || 0;
  const rateNum = parseInt(rating) || 0;

  const validationError = validateEntryRules(type, status, progNum, rateNum);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const updated = updateEntry(req.user.id, entryId, {
      type,
      title,
      status,
      progress: progNum,
      rating: rateNum,
      image_url
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/entries/:id/progress', authenticateToken, (req, res) => {
  const entryId = parseInt(req.params.id);
  const { progress } = req.body;

  if (progress === undefined || isNaN(progress)) {
    return res.status(400).json({ error: 'Valid progress number required.' });
  }

  try {
    const updated = updateProgress(req.user.id, entryId, progress);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/entries/:id', authenticateToken, (req, res) => {
  const success = deleteEntry(req.user.id, parseInt(req.params.id));
  if (!success) {
    return res.status(404).json({ error: 'Entry not found or already deleted.' });
  }
  res.json({ message: 'Entry deleted successfully.' });
});

app.delete('/api/entries', authenticateToken, (req, res) => {
  const count = deleteAllEntries(req.user.id);
  res.json({ message: `Cleared ${count} entries.` });
});

// ----------------- STATS ROUTE ----------------- //

app.get('/api/stats', authenticateToken, (req, res) => {
  try {
    const stats = getUserStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- JIKAN API PROXY WITH CACHING ----------------- //

// Fallback data if Jikan is unreachable or rate limited
const FALLBACK_POPULAR_ANIME = [
  { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", score: 9.1, episodes: 64, synopsis: "Two brothers search for a Philosopher's Stone after a failed alchemy attempt.", genres: ["Action", "Adventure", "Drama", "Fantasy"], image_url: "https://myanimelist.net/images/anime/1208/94745.jpg" },
  { mal_id: 52991, title: "Frieren: Beyond Journey's End", score: 9.3, episodes: 28, synopsis: "An elf mage re-examines her past adventure after the hero passes away.", genres: ["Adventure", "Drama", "Fantasy"], image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg" },
  { mal_id: 9253, title: "Steins;Gate", score: 9.0, episodes: 24, synopsis: "A self-proclaimed mad scientist discovers a method of sending messages to the past.", genres: ["Drama", "Sci-Fi", "Suspense"], image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg" },
  { mal_id: 19, title: "Monster", score: 8.9, episodes: 74, synopsis: "An elite neurosurgeon's life unravels after saving a boy who grows up to be a charismatic psychopath.", genres: ["Drama", "Mystery", "Suspense"], image_url: "https://cdn.myanimelist.net/images/anime/10/18793.jpg" },
  { mal_id: 16498, title: "Attack on Titan", score: 8.5, episodes: 25, synopsis: "Humanity fights giant man-eating Titans within enormous walled cities.", genres: ["Action", "Suspense"], image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg" },
  { mal_id: 40748, title: "Jujutsu Kaisen", score: 8.6, episodes: 24, synopsis: "A high schooler swallows a cursed talisman and becomes host to a powerful demon.", genres: ["Action", "Fantasy"], image_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg" }
];

const FALLBACK_POPULAR_MANGA = [
  { mal_id: 2, title: "Berserk", score: 9.4, chapters: 380, synopsis: "Guts, a wandering mercenary, seeks revenge against his former comrade Griffith.", genres: ["Action", "Adventure", "Drama", "Fantasy", "Horror"], image_url: "https://myanimelist.net/images/manga/1/157897.jpg" },
  { mal_id: 13, title: "One Piece", score: 9.2, chapters: 1100, synopsis: "Monkey D. Luffy embarks on a journey across the Grand Line to find the One Piece.", genres: ["Action", "Adventure", "Fantasy"], image_url: "https://myanimelist.net/images/manga/2/253146.jpg" },
  { mal_id: 656, title: "Vagabond", score: 9.3, chapters: 327, synopsis: "The legendary journey of sword saint Miyamoto Musashi in 16th-century Japan.", genres: ["Action", "Adventure", "Historical"], image_url: "https://myanimelist.net/images/manga/1/259070.jpg" },
  { mal_id: 1706, title: "JoJo's Bizarre Adventure Part 7: Steel Ball Run", score: 9.3, chapters: 96, synopsis: "A trans-American horseback race in 1890 with secret supernatural stakes.", genres: ["Action", "Adventure", "Mystery", "Supernatural"], image_url: "https://cdn.myanimelist.net/images/manga/3/179882.jpg" }
];

async function fetchWithRetry(url, options = {}, retries = 2, delay = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status === 429) {
        return response;
      }
    } catch (err) {
      if (attempt === retries) throw err;
    }
    await new Promise(r => setTimeout(r, delay * (attempt + 1)));
  }
  return fetch(url, options);
}

app.get('/api/jikan/search', async (req, res) => {
  const { type = 'anime', q = '', limit = 12 } = req.query;
  const sanitizedType = type.toLowerCase() === 'manga' ? 'manga' : 'anime';
  const cacheKey = `search:${sanitizedType}:${q.toLowerCase().trim()}:${limit}`;

  if (jikanCache.has(cacheKey)) {
    const cached = jikanCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }
  }

  try {
    const encoded = encodeURIComponent(q.trim());
    const url = `https://api.jikan.moe/v4/${sanitizedType}?q=${encoded}&limit=${limit}&sfw=true`;
    const response = await fetchWithRetry(url, { headers: { 'Accept': 'application/json' } });

    if (response && response.status === 429) {
      return res.status(429).json({ error: 'Jikan rate limit reached. Please wait a moment and try again.' });
    }

    if (!response || !response.ok) {
      throw new Error(`Jikan API responded with status ${response ? response.status : 'unknown'}`);
    }

    const data = await response.json();
    const formatted = (data.data || []).map(item => ({
      mal_id: item.mal_id,
      title: item.title || item.title_english || item.title_japanese,
      title_japanese: item.title_japanese,
      episodes: item.episodes || item.chapters || null,
      chapters: item.chapters || null,
      score: item.score || null,
      synopsis: item.synopsis || 'No synopsis available.',
      genres: (item.genres || []).map(g => g.name),
      status: item.status,
      year: item.year || (item.published ? item.published.from?.slice(0, 4) : null),
      image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null
    }));

    jikanCache.set(cacheKey, { timestamp: Date.now(), data: formatted });
    res.json(formatted);
  } catch (err) {
    console.error('Jikan search error:', err.message);
    const fallbacks = sanitizedType === 'manga' ? FALLBACK_POPULAR_MANGA : FALLBACK_POPULAR_ANIME;
    const filtered = fallbacks.filter(f => f.title.toLowerCase().includes(q.toLowerCase().trim()));
    res.json(filtered.length > 0 ? filtered : fallbacks);
  }
});

app.get('/api/jikan/top', async (req, res) => {
  const { type = 'anime', limit = 10 } = req.query;
  const sanitizedType = type.toLowerCase() === 'manga' ? 'manga' : 'anime';
  const cacheKey = `top:${sanitizedType}:${limit}`;

  if (jikanCache.has(cacheKey)) {
    const cached = jikanCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }
  }

  try {
    const url = `https://api.jikan.moe/v4/top/${sanitizedType}?limit=${limit}&sfw=true`;
    const response = await fetchWithRetry(url, { headers: { 'Accept': 'application/json' } });

    if (!response || !response.ok) {
      throw new Error(`Jikan API error ${response ? response.status : 'offline'}`);
    }

    const data = await response.json();
    const formatted = (data.data || []).map(item => ({
      mal_id: item.mal_id,
      rank: item.rank,
      title: item.title || item.title_english,
      episodes: item.episodes || item.chapters || null,
      chapters: item.chapters || null,
      score: item.score || null,
      synopsis: item.synopsis,
      genres: (item.genres || []).map(g => g.name),
      image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null
    }));

    jikanCache.set(cacheKey, { timestamp: Date.now(), data: formatted });
    res.json(formatted);
  } catch (err) {
    console.error('Jikan top error, returning fallbacks:', err.message);
    const fallbacks = sanitizedType === 'manga' ? FALLBACK_POPULAR_MANGA : FALLBACK_POPULAR_ANIME;
    res.json(fallbacks);
  }
});

// Serve frontend in production build if present
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'), err => {
      if (err) {
        res.json({ message: 'Kiroku Backend API is running. Start the Vite dev server for the frontend.' });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Kiroku API Server running at http://localhost:${PORT}`);
});
