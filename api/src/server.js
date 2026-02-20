const express = require("express");
const cors = require("cors");
const path = require("path");

require("./db");
const { listHandler } = require("./listRoute");

const app = express();

// In production (single service), same-origin => CORS not needed.
// Keep CORS only for local dev (5173 -> 4000).
if (process.env.NODE_ENV !== "production") {
    app.use(cors({ origin: "http://localhost:5173" }));
}

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/list", listHandler);

// ---- Serve React build in production ----
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../../web/dist");
    app.use(express.static(distPath));

    // SPA fallback — serves index.html for any unmatched request
    app.use((req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// Start server
if (require.main === module) {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app };
