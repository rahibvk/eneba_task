const { z } = require("zod");
const { db } = require("./db");

const querySchema = z.object({
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).max(500).optional().default(0),
});

function normalizeSearch(s) {
    const trimmed = (s || "").trim();
    return trimmed.length ? trimmed : null;
}

function buildFtsQuery(search) {
    // "red dead" -> "red* dead*"
    const tokens = search
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => t.replace(/[^a-z0-9]/g, ""))
        .filter(Boolean);

    if (!tokens.length) return null;
    return tokens.map((t) => `${t}*`).join(" ");
}

function mapGame(row) {
    return {
        id: row.id,
        title: row.title,
        priceCents: row.price_cents,
        currency: row.currency,
        imageUrl: row.image_url,
        platform: row.platform,
        region: row.region,
    };
}

function listHandler(req, res) {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: { message: parsed.error.message } });
    }

    const { limit, offset } = parsed.data;
    const search = normalizeSearch(parsed.data.search);

    // No search -> default list
    if (!search) {
        const rows = db
            .prepare(
                `SELECT id, title, price_cents, currency, image_url, platform, region
         FROM games
         ORDER BY title ASC
         LIMIT ? OFFSET ?`
            )
            .all(limit, offset);

        const { total } = db.prepare(`SELECT COUNT(*) as total FROM games`).get();
        return res.json({ items: rows.map(mapGame), total });
    }

    // Search -> FTS first
    const fts = buildFtsQuery(search);

    // For very short inputs, fallback to LIKE (keeps UX nice)
    if (!fts || search.length < 2) {
        const like = `%${search}%`;
        const rows = db
            .prepare(
                `SELECT id, title, price_cents, currency, image_url, platform, region
         FROM games
         WHERE lower(title) LIKE lower(?)
         ORDER BY title ASC
         LIMIT ? OFFSET ?`
            )
            .all(like, limit, offset);

        return res.json({ items: rows.map(mapGame), total: rows.length });
    }

    // FTS Search
    const rows = db
        .prepare(
            `SELECT g.id, g.title, g.price_cents, g.currency, g.image_url, g.platform, g.region
       FROM games_fts
       JOIN games g ON g.id = games_fts.rowid
       WHERE games_fts.title MATCH ?
       ORDER BY bm25(games_fts) ASC
       LIMIT ? OFFSET ?`
        )
        .all(fts, limit, offset);

    return res.json({ items: rows.map(mapGame), total: rows.length });
}

module.exports = { listHandler };
