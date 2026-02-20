const request = require("supertest");
const { app } = require("./server");

test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
});

test("GET /list returns seeded games", async () => {
    const res = await request(app).get("/list");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(13);
    const titles = res.body.items.map((x) => x.title);
    expect(titles).toContain("FIFA 23");
    expect(titles).toContain("Red Dead Redemption 2");
    expect(titles).toContain("Elden Ring");
    expect(titles).toContain("Baldur's Gate 3");
});

test("GET /list?search=red finds Red Dead Redemption 2", async () => {
    const res = await request(app).get("/list").query({ search: "red" });
    expect(res.status).toBe(200);
    const titles = res.body.items.map((x) => x.title);
    expect(titles).toContain("Red Dead Redemption 2");
});

test("GET /list?search=fif finds FIFA 23", async () => {
    const res = await request(app).get("/list").query({ search: "fif" });
    expect(res.status).toBe(200);
    const titles = res.body.items.map((x) => x.title);
    expect(titles).toContain("FIFA 23");
});

test("GET /list?search=   behaves like /list", async () => {
    const res1 = await request(app).get("/list");
    const res2 = await request(app).get("/list").query({ search: "   " });
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res2.body.total).toBe(res1.body.total);
});
