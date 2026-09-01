import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'kiroku.db');

export const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables and safely upgrade schema if needed
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS anime_manga_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      rating INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Safe migration checks for existing SQLite databases
  try {
    db.exec('ALTER TABLE anime_manga_list ADD COLUMN image_url TEXT;');
  } catch (e) {
    // Column already exists
  }
}

// User operations
export function registerUser(username, password) {
  const check = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(username);
  if (check) {
    throw new Error('Username is already taken.');
  }

  const insert = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const result = insert.run(username, password);
  return { id: Number(result.lastInsertRowid), username };
}

export function loginUser(username, password) {
  const user = db.prepare('SELECT id, username, password FROM users WHERE LOWER(username) = LOWER(?) AND password = ?').get(username, password);
  if (!user) {
    return null;
  }
  return { id: user.id, username: user.username };
}

export function getUserById(id) {
  return db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
}

// Entry operations
export function getEntriesForUser(userId, { type, status, search, sort = 'recent' } = {}) {
  let query = 'SELECT id, user_id, type, title, status, progress, rating, image_url FROM anime_manga_list WHERE user_id = ?';
  const params = [userId];

  if (type && type !== 'All' && type !== 'All Types') {
    query += ' AND type = ?';
    params.push(type);
  }

  if (status && status !== 'All' && status !== 'All Statuses') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search && search.trim() !== '') {
    query += ' AND LOWER(title) LIKE ?';
    params.push(`%${search.trim().toLowerCase()}%`);
  }

  switch (sort) {
    case 'rating-desc':
      query += ' ORDER BY rating DESC, id DESC';
      break;
    case 'rating-asc':
      query += ' ORDER BY rating ASC, id DESC';
      break;
    case 'title-asc':
      query += ' ORDER BY LOWER(title) ASC';
      break;
    case 'title-desc':
      query += ' ORDER BY LOWER(title) DESC';
      break;
    case 'progress-desc':
      query += ' ORDER BY progress DESC';
      break;
    case 'recent':
    default:
      query += ' ORDER BY id DESC';
      break;
  }

  return db.prepare(query).all(...params);
}

export function getEntryById(userId, entryId) {
  return db.prepare('SELECT id, user_id, type, title, status, progress, rating, image_url FROM anime_manga_list WHERE id = ? AND user_id = ?').get(entryId, userId);
}

export function checkEntryExists(userId, type, title, excludeId = null) {
  let query = 'SELECT id FROM anime_manga_list WHERE user_id = ? AND type = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?))';
  const params = [userId, type, title];
  if (excludeId) {
    query += ' AND id <> ?';
    params.push(excludeId);
  }
  const row = db.prepare(query).get(...params);
  return !!row;
}

export function addEntry(userId, { type, title, status, progress = 0, rating = 0, image_url = null }) {
  if (checkEntryExists(userId, type, title)) {
    throw new Error(`"${title}" is already in your ${type} list.`);
  }

  const query = `
    INSERT INTO anime_manga_list (user_id, type, title, status, progress, rating, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = db.prepare(query).run(
    userId,
    type,
    title.trim(),
    status,
    Math.max(0, parseInt(progress) || 0),
    Math.max(0, Math.min(10, parseInt(rating) || 0)),
    image_url || null
  );

  return getEntryById(userId, Number(result.lastInsertRowid));
}

export function updateEntry(userId, entryId, { type, title, status, progress, rating, image_url }) {
  if (checkEntryExists(userId, type, title, entryId)) {
    throw new Error(`"${title}" is already in your ${type} list.`);
  }

  const query = `
    UPDATE anime_manga_list
    SET type = ?, title = ?, status = ?, progress = ?, rating = ?, image_url = ?
    WHERE id = ? AND user_id = ?
  `;

  db.prepare(query).run(
    type,
    title.trim(),
    status,
    Math.max(0, parseInt(progress) || 0),
    Math.max(0, Math.min(10, parseInt(rating) || 0)),
    image_url || null,
    entryId,
    userId
  );

  return getEntryById(userId, entryId);
}

export function updateProgress(userId, entryId, newProgress) {
  const safeProgress = Math.max(0, parseInt(newProgress) || 0);
  const query = `
    UPDATE anime_manga_list
    SET progress = ?
    WHERE id = ? AND user_id = ?
  `;
  db.prepare(query).run(safeProgress, entryId, userId);
  return getEntryById(userId, entryId);
}

export function deleteEntry(userId, entryId) {
  const result = db.prepare('DELETE FROM anime_manga_list WHERE id = ? AND user_id = ?').run(entryId, userId);
  return result.changes > 0;
}

export function deleteAllEntries(userId) {
  const result = db.prepare('DELETE FROM anime_manga_list WHERE user_id = ?').run(userId);
  return result.changes;
}

export function getUserStats(userId) {
  const entries = getEntriesForUser(userId);
  let animeCount = 0;
  let mangaCount = 0;
  let totalRating = 0;
  let ratedCount = 0;
  let totalAnimeProgress = 0;
  let totalMangaProgress = 0;

  const statusDistribution = {
    anime: { 'Plan to Watch': 0, 'Ongoing': 0, 'Completed': 0, 'On Hold': 0, 'Dropped': 0 },
    manga: { 'Plan to Read': 0, 'Ongoing': 0, 'Completed': 0, 'On Hold': 0, 'Dropped': 0 }
  };

  const topAnime = [];
  const topManga = [];

  for (const entry of entries) {
    if (entry.type === 'Anime') {
      animeCount++;
      totalAnimeProgress += entry.progress;
      if (statusDistribution.anime[entry.status] !== undefined) {
        statusDistribution.anime[entry.status]++;
      }
      if (entry.rating > 0) {
        topAnime.push(entry);
      }
    } else {
      mangaCount++;
      totalMangaProgress += entry.progress;
      if (statusDistribution.manga[entry.status] !== undefined) {
        statusDistribution.manga[entry.status]++;
      }
      if (entry.rating > 0) {
        topManga.push(entry);
      }
    }

    if (entry.rating > 0) {
      totalRating += entry.rating;
      ratedCount++;
    }
  }

  topAnime.sort((a, b) => b.rating - a.rating || b.id - a.id);
  topManga.sort((a, b) => b.rating - a.rating || b.id - a.id);

  const meanScore = ratedCount === 0 ? 0 : Number((totalRating / ratedCount).toFixed(1));

  return {
    totalEntries: entries.length,
    animeCount,
    mangaCount,
    ratedCount,
    meanScore,
    totalEpisodesWatched: totalAnimeProgress,
    totalChaptersRead: totalMangaProgress,
    statusDistribution,
    topAnime: topAnime.slice(0, 5),
    topManga: topManga.slice(0, 5)
  };
}
