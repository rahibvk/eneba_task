const Database = require("better-sqlite3");
const path = require("path");

// Creates/opens local SQLite file in api/ directory
const dbPath = path.join(__dirname, "../data.sqlite");
const db = new Database(dbPath);

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    image_url TEXT,
    platform TEXT,
    region TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Full-text search table for fuzzy-ish search later (Phase 2)
  CREATE VIRTUAL TABLE IF NOT EXISTS games_fts
  USING fts5(title, content='games', content_rowid='id');
`);

function seedIfEmpty() {
  const { cnt } = db.prepare("SELECT COUNT(*) as cnt FROM games").get();
  if (cnt > 0) return;

  const seed = [
    {
      title: "FIFA 23",
      price_cents: 1499,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1811260/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Red Dead Redemption 2",
      price_cents: 1999,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Split Fiction",
      price_cents: 999,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/2001120/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Grand Theft Auto V",
      price_cents: 1299,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg",
      platform: "PC",
      region: "Global",
    },
    {
      title: "The Witcher 3: Wild Hunt",
      price_cents: 899,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Cyberpunk 2077",
      price_cents: 2499,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Elden Ring",
      price_cents: 3499,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
      platform: "PC",
      region: "Global",
    },
    {
      title: "Hogwarts Legacy",
      price_cents: 2999,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/990080/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "God of War Ragnarök",
      price_cents: 3999,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/2322010/header.jpg",
      platform: "PlayStation",
      region: "EU",
    },
    {
      title: "Minecraft",
      price_cents: 1999,
      currency: "EUR",
      image_url: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
      platform: "PC",
      region: "Global",
    },
    {
      title: "Forza Horizon 5",
      price_cents: 2499,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1551360/header.jpg",
      platform: "Xbox",
      region: "Global",
    },
    {
      title: "Call of Duty: Modern Warfare III",
      price_cents: 4999,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1938090/header.jpg",
      platform: "PC",
      region: "EU",
    },
    {
      title: "Baldur's Gate 3",
      price_cents: 4499,
      currency: "EUR",
      image_url: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg",
      platform: "PC",
      region: "Global",
    },
  ];

  const insertGame = db.prepare(`
    INSERT INTO games (title, price_cents, currency, image_url, platform, region)
    VALUES (@title, @price_cents, @currency, @image_url, @platform, @region)
  `);

  const insertFTS = db.prepare(`
    INSERT INTO games_fts(rowid, title) VALUES (?, ?)
  `);

  const tx = db.transaction(() => {
    for (const g of seed) {
      const info = insertGame.run(g);
      insertFTS.run(info.lastInsertRowid, g.title);
    }
  });

  tx();
}

seedIfEmpty();

module.exports = { db };
