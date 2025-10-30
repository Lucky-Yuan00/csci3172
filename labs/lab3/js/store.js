/* ES6 highlights:
 * - Modern collections: Map/Set for in-memory DB (users, emails, fail counts, lock set).
 * - JSON persistence to localStorage with robust try/catch.
 * - Parameter destructuring: addUser({ username, email, password }).
 * - Pure frontend store; no backend or external files, per lab requirement.
 */

// In-memory + localStorage persistence with logs
const usersMap    = new Map();
const emailsTaken = new Set();
const failCount   = new Map();
const lockedUsers = new Set();

const PRESET = [
  { username: "AlphaUser",   email: "alpha@example.com",   password: "A1b2c3d4e5!F" },
  { username: "BravoUser",   email: "bravo@example.net",   password: "B3ravo!2025x" },
  { username: "CharlieUser", email: "charlie@example.org", password: "Ch@rlie2025Go!" }
];

const STORAGE_KEY = "lab3_users_v1";
const PERSIST = true;

function saveToStorage() {
  if (!PERSIST) return;
  try {
    const obj = Object.create(null);
    for (const [u, rec] of usersMap) obj[u] = { email: rec.email, password: rec.password };
    const json = JSON.stringify(obj);
    localStorage.setItem(STORAGE_KEY, json);
    console.log("[store] saved to storage:", json);
  } catch (err) {
    console.warn("[store] persist failed; memory-only:", err);
  }
}

function loadFromStorage() {
  if (!PERSIST) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    console.log("[store] loaded raw:", raw);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null) throw new Error("Invalid JSON");
    for (const k in obj) {
      const rec = obj[k];
      if (!rec || typeof rec.email !== "string" || typeof rec.password !== "string") continue;
      const key = (k || "").toLowerCase();
      usersMap.set(key, { email: rec.email, password: rec.password });
      emailsTaken.add((rec.email || "").toLowerCase());
    }
  } catch (err) {
    console.warn("[store] storage load failed; clearing corrupt data:", err);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }
}

for (const u of PRESET) {
  const key = u.username.toLowerCase();
  usersMap.set(key, { email: u.email, password: u.password });
  emailsTaken.add(u.email.toLowerCase());
}
loadFromStorage();

export function hasUsername(username) {
  return usersMap.has((username || "").toLowerCase());
}
export function hasEmail(email) {
  return emailsTaken.has((email || "").toLowerCase());
}
export function addUser({ username, email, password }) {
  const key = (username || "").toLowerCase();
  if (usersMap.has(key)) throw new Error("Username already exists.");
  if (emailsTaken.has((email || "").toLowerCase())) throw new Error("Email already used.");
  usersMap.set(key, { email, password });
  emailsTaken.add((email || "").toLowerCase());
  failCount.delete(key); lockedUsers.delete(key);
  saveToStorage();  // <-- 持久化
  return true;
}
export function verifyCredentials(username, password) {
  const key = (username || "").toLowerCase();
  if (lockedUsers.has(key)) return { ok: false, reason: "locked" };
  const rec = usersMap.get(key);
  if (!rec) return { ok: false, reason: "no-user" };
  if (rec.password !== password) return { ok: false, reason: "bad-pass" };
  return { ok: true };
}
export function incrementFail(username, limit = 5) {
  const key = (username || "").toLowerCase();
  const n = (failCount.get(key) || 0) + 1;
  failCount.set(key, n);
  if (n >= limit) lockedUsers.add(key);
  return n;
}
export function isLocked(username) {
  return lockedUsers.has((username || "").toLowerCase());
}
export function resetFail(username) {
  const key = (username || "").toLowerCase();
  failCount.delete(key); lockedUsers.delete(key);
}
export function listUsers() {
  return Array.from(usersMap.entries());
}
export function __clearPersistedUsersDev() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}
