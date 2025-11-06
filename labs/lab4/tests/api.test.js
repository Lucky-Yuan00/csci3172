/** @jest-environment node */

const request = require("supertest");

let app = null;
try {
  ({ app } = require("../netlify/functions/api"));
} catch (e) {
  const mod = require("../netlify/functions/api"); 
  app = (mod && (mod.app || (mod.default && mod.default.app))) || null;
}

if (!app) {
  throw new Error(
    'Cannot find Express app from "../netlify/functions/api". ' +
    "Please export it via `module.exports.app = app` or `export { app }`."
  );
}

describe("API smoke tests", () => {
  const agent = request(app);

  it("GET /health -> 200 {ok:true}", async () => {
    const res = await agent.get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /cuisines -> array", async () => {
    const res = await agent.get("/cuisines");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cuisines)).toBe(true);
  });

  it("GET /recipes -> shape", async () => {
    const res = await agent.get("/recipes?limit=5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.meals)).toBe(true);
    expect(typeof res.body.total).toBe("number");
  });
});
