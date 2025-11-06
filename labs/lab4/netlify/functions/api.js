// CommonJS so Jest + supertest can require() it easily
const express = require("express");
const serverless = require("serverless-http");
const fetch = require("node-fetch");

// ------------------------------
// Constants & helpers
// ------------------------------
const API = "https://www.themealdb.com/api/json/v1/1";
const SLUGS = ["lu", "yue", "min", "su", "zhe", "xiang", "hui", "chuan"];

const CUISINES = [
  { slug: "lu",    name: "Shandong (Lu)",    keywords: ["shandong","lu","scallion","braise","dezhou"] },
  { slug: "yue",   name: "Cantonese (Yue)",  keywords: ["cantonese","yue","guangdong","dim sum","steamed","char siu","soy sauce"] },
  { slug: "min",   name: "Fujian (Min)",     keywords: ["fujian","min","oyster","soup","lamian","fo tiao"] },
  { slug: "su",    name: "Jiangsu (Su)",     keywords: ["jiangsu","su","yangzhou","lion head","sweet","crab"] },
  { slug: "zhe",   name: "Zhejiang (Zhe)",   keywords: ["zhejiang","zhe","hangzhou","dongpo","shaoxing"] },
  { slug: "xiang", name: "Hunan (Xiang)",    keywords: ["hunan","xiang","duo jiao","smoked","spicy"] },
  { slug: "hui",   name: "Anhui (Hui)",      keywords: ["anhui","hui","ham","bamboo","stew"] },
  { slug: "chuan", name: "Sichuan (Chuan)",  keywords: ["sichuan","chuan","mapo","kung pao","mala","chili","pepper","szechuan"] },
];

const HARD_ANCHORS = {
  "Chicken Congee": "yue",
  "Wontons": "yue",
  "Shrimp Chow Fun": "yue",
  "Char Siu": "yue",
  "Kung Pao Chicken": "chuan",
  "Mapo Tofu": "chuan",
  "Szechuan Beef": "chuan",
  "Hot and Sour Soup": "chuan",
  "Beef Lo Mein": "lu",
  "Sweet and Sour Pork": "yue",
  "Ma Po Tofu": "chuan",
  "General Tsos Chicken": "zhe"
};

const FIXED_TOP5_IDS = ["52946", "52952", "52948", "52949", "52950"];

const norm = (s = "") => String(s || "").toLowerCase().trim();
const stableSortBy = (arr, keyFn) =>
  [...arr].sort((a, b) => (keyFn(a) < keyFn(b) ? -1 : keyFn(a) > keyFn(b) ? 1 : 0));

function passesDiet(meal, diet) {
  const d = norm(diet || "any");
  if (!d || d === "any" || d === "any diet") return true;

  const ings = [];
  const tags = norm(meal.strTags || "").split(",").map(s => s.trim()).filter(Boolean);
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && String(ing).trim()) ings.push(norm(ing));
  }

  const meats = ["beef","pork","chicken","lamb","mutton","duck","turkey","bacon","ham","sausage","veal","prosciutto"];
  const seafood = ["fish","salmon","tuna","shrimp","prawn","crab","oyster","clam","anchovy","squid","octopus","scallop"];
  const dairy = ["milk","cheese","cream","butter","yogurt","ghee","parmesan","evaporated milk","condensed milk"];
  const eggs  = ["egg","mayonnaise"];
  const gfBlock = ["wheat","barley","rye","flour","bread","breadcrumbs","noodle","pasta","dumpling","bao","bun","tortilla","soy sauce"];

  const hasAny = (list) => ings.some(i => list.some(w => i.includes(w)));

  switch (d) {
    case "vegetarian":   return !hasAny(meats) && !hasAny(seafood);
    case "vegan":        return !hasAny(meats) && !hasAny(seafood) && !hasAny(dairy) && !hasAny(eggs) && !ings.some(i => i.includes("honey"));
    case "pescatarian":  return !hasAny(meats);
    case "dairy-free":   return !hasAny(dairy);
    case "gluten-free":  return tags.includes("gluten free") || !hasAny(gfBlock);
    default:             return true;
  }
}

function softGuessSlug(meal) {
  const hay = norm([meal.strMeal, meal.strArea, meal.strCategory, meal.strTags].filter(Boolean).join(" | "));
  for (const c of CUISINES) if (c.keywords.some(kw => hay.includes(norm(kw)))) return c.slug;
  return null;
}

async function fetchChineseList() {
  const r = await fetch(`${API}/filter.php?a=Chinese`);
  const j = await r.json();
  return j.meals || [];
}

async function expandDetails(list) {
  const details = await Promise.all(
    list.map(x =>
      fetch(`${API}/lookup.php?i=${x.idMeal}`)
        .then(r => r.json())
        .catch(() => ({ meals: [] }))
    )
  );
  return details.map(d => d.meals && d.meals[0]).filter(Boolean);
}

function makeUniqueAssignment(meals) {
  const assignment = new Map();
  const buckets = Object.fromEntries(SLUGS.map(s => [s, []]));
  const counts = Object.fromEntries(SLUGS.map(s => [s, 0]));
  const sorted = stableSortBy(meals, m => String(m.idMeal));

  for (const m of sorted) {
    const name = m.strMeal || "";
    let target = HARD_ANCHORS[name] || softGuessSlug(m);
    const pickLeast = () => {
      let minSlug = SLUGS[0], minCnt = counts[minSlug];
      for (const s of SLUGS) if (counts[s] < minCnt) { minSlug = s; minCnt = counts[s]; }
      return minSlug;
    };
    if (!(target && counts[target] <= Math.min(...Object.values(counts)) + 1)) target = pickLeast();
    assignment.set(m.idMeal, target); counts[target]++; buckets[target].push(m);
  }

  // ensure non-empty buckets
  for (const s of SLUGS) {
    if (buckets[s].length === 0 && sorted.length) {
      const donor = SLUGS.find(k => buckets[k].length > 1);
      if (donor) {
        const moved = buckets[donor].pop();
        assignment.set(moved.idMeal, s);
        buckets[s].push(moved);
      }
    }
  }
  return { assignment, buckets };
}

async function loadPartitionedPool({ diet = "any" } = {}) {
  const list = await fetchChineseList();
  const detailed = await expandDetails(list);
  const { assignment, buckets } = makeUniqueAssignment(detailed);
  const bucketsDiet = Object.fromEntries(SLUGS.map(s => [s, buckets[s].filter(m => passesDiet(m, diet))]));
  return { detailed, assignment, buckets, bucketsDiet };
}

function mapMeal(m) {
  return { id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb };
}

// ------------------------------
// Express app & routes
// ------------------------------
const app = express();
const router = express.Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.get("/cuisines", (_req, res) => res.json({ cuisines: CUISINES.map(({slug,name}) => ({slug,name})) }));

router.get("/recipes", async (req, res) => {
  try {
    const slug = String(req.query.cuisine || "").trim();
    const diet = norm(req.query.diet || "any");
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 200));
    const ingredients = String(req.query.ingredients || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 3);

    if (!ingredients.length) {
      const { bucketsDiet } = await loadPartitionedPool({ diet });
      let pool = [];
      if (slug && SLUGS.includes(slug)) pool = bucketsDiet[slug];
      else pool = SLUGS.flatMap(s => bucketsDiet[s]);
      return res.json({ meals: pool.slice(0, limit).map(mapMeal), total: pool.length });
    }

    // intersect by ingredients first
    let base = null;
    {
      const r0 = await fetch(`${API}/filter.php?i=${encodeURIComponent(ingredients[0])}`);
      const j0 = await r0.json();
      base = j0.meals || [];
      for (const ing of ingredients.slice(1)) {
        const r = await fetch(`${API}/filter.php?i=${encodeURIComponent(ing)}`);
        const j = await r.json();
        const set = new Set((j.meals || []).map(x => x.idMeal));
        base = base.filter(x => set.has(x.idMeal));
      }
    }
    const expanded = await expandDetails(base);
    const { assignment } = makeUniqueAssignment(expanded);
    let filtered = expanded.filter(m => passesDiet(m, diet));
    if (slug && SLUGS.includes(slug)) filtered = filtered.filter(m => assignment.get(m.idMeal) === slug);
    res.json({ meals: filtered.slice(0, limit).map(mapMeal), total: filtered.length });
  } catch {
    res.status(500).json({ error: "Upstream error" });
  }
});

// extras for frontend (Top 5 & detail)
router.get("/top", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
    const details = await Promise.all(
      FIXED_TOP5_IDS.slice(0, limit).map(async (id) => {
        const r = await fetch(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
        const j = await r.json();
        const m = j.meals && j.meals[0];
        return m ? mapMeal(m) : null;
      })
    );
    res.json({ meals: details.filter(Boolean), total: FIXED_TOP5_IDS.length });
  } catch {
    res.status(500).json({ error: "Upstream error" });
  }
});

router.get("/recipe/:id", async (req, res) => {
  try {
    const r = await fetch(`${API}/lookup.php?i=${encodeURIComponent(req.params.id)}`);
    const j = await r.json();
    const m = j.meals && j.meals[0];
    if (!m) return res.status(404).json({ error: "Not found" });

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`];
      const measure = m[`strMeasure${i}`];
      if (ing && String(ing).trim()) ingredients.push({ ingredient: String(ing).trim(), measure: String(measure || "").trim() });
    }
    res.json({
      meal: {
        id: m.idMeal, name: m.strMeal, area: m.strArea, category: m.strCategory,
        instructions: m.strInstructions, thumb: m.strMealThumb,
        tags: (m.strTags || "").split(",").map(s => s.trim()).filter(Boolean),
        youtube: m.strYoutube, source: m.strSource, ingredients
      }
    });
  } catch {
    res.status(500).json({ error: "Upstream error" });
  }
});

// Mount for BOTH environments:
// 1) Root for tests/dev: supertest(app).get("/health")
// 2) Netlify production path for deployed functions
app.use("/", router);
app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
module.exports.app = app;
