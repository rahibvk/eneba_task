const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function listGames({ search = "", limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (search && search.trim()) params.set("search", search.trim());
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const url = `${API_BASE}/list?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json();
}
