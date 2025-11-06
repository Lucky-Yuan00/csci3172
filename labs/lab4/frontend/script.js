// ==============================
// Feature toggles
// ==============================

// prod on Netlify domains OR opt-in flag for netlify dev
const DETECT_NETLIFY =
  /\bnetlify\.(app|live)\b$/i.test(location.hostname) ||
  (location.hostname === "localhost" && !!window.__NETLIFY_DEV__);

// ==============================
// API resolution with graceful fallback
// ==============================
const API_CANDIDATES = [
  "/.netlify/functions/api",
  "/api"
];

async function resolveApiBase() {
  if (!DETECT_NETLIFY) return null;
  for (const base of API_CANDIDATES) {
    try {
      const r = await fetch(`${base}/health`, { method: "GET" });
      if (r.ok) return base;
    } catch {}
  }
  return null;
}

let API_BASE = null;

// ==============================
// Static fallback data (mirrors backend)
// ==============================
const FALLBACK_CUISINES = [
  { slug: "",      name: "All cuisines" },
  { slug: "lu",    name: "Shandong (Lu)" },
  { slug: "yue",   name: "Cantonese (Yue)" },
  { slug: "min",   name: "Fujian (Min)" },
  { slug: "su",    name: "Jiangsu (Su)" },
  { slug: "zhe",   name: "Zhejiang (Zhe)" },
  { slug: "xiang", name: "Hunan (Xiang)" },
  { slug: "hui",   name: "Anhui (Hui)" },
  { slug: "chuan", name: "Sichuan (Chuan)" }
];

const CU_KEYWORDS = {
  lu:    ["shandong","lu","scallion","braise","dezhou","bao"],
  yue:   ["cantonese","yue","guangdong","dim sum","steamed","char siu","soy sauce"],
  min:   ["fujian","min","oyster","soup","fo tiao","lamian"],
  su:    ["jiangsu","su","yangzhou","lion head","sweet","crab"],
  zhe:   ["zhejiang","zhe","hangzhou","dongpo","shaoxing"],
  xiang: ["hunan","xiang","duo jiao","smoked","spicy"],
  hui:   ["anhui","hui","ham","bamboo","stew"],
  chuan: ["sichuan","chuan","mapo","ma po","kung pao","mala","chili","pepper","szechuan"]
};

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

const SLUGS = ["lu","yue","min","su","zhe","xiang","hui","chuan"];
const API_PUBLIC = "https://www.themealdb.com/api/json/v1/1";

// Fixed Top 5 IDs
const FIXED_TOP5_IDS = ["52946", "52952", "52948", "52949", "52950"];

// ==============================
// DOM
// ==============================
const $ = (s) => document.querySelector(s);
const grid = $("#grid");
const countEl = $("#count");
const cuisineSelect = $("#cuisineSelect");
const dietSelect = $("#dietSelect");
const qInput = $("#q");
const btnSearch = $("#btnSearch");
const btnTop5 = $("#btnTop5");
const errorEl = $("#formError");
const srAnnounceEl = $("#srAnnounce");

// Modals
const modalTop5 = $("#modalTop5");
const modalDetail = $("#modalDetail");
const topList = $("#topList");
const detailHost = $("#detail");

// ==============================
// UI builders
// ==============================
function buildCuisineSelect(cuisines) {
  cuisineSelect.innerHTML = "";
  cuisineSelect.append(new Option("All cuisines", ""));
  cuisines.forEach(c => {
    if (!c.slug || !c.name) return;
    cuisineSelect.append(new Option(c.name, c.slug));
  });
}

function buildDietSelect() {
  const diets = ["Any diet","Vegetarian","Vegan","Pescatarian","Dairy-free","Gluten-free"];
  dietSelect.innerHTML = "";
  diets.forEach(d => dietSelect.append(new Option(d, d.toLowerCase())));
}

// ==============================
// Helpers
// ==============================
const norm = (s="") => String(s || "").toLowerCase().trim();

function announce(msg) {
  if (srAnnounceEl) srAnnounceEl.textContent = String(msg || "");
}

function clearError() {
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
}

function showError(msg) {
  if (errorEl) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }
  announce(msg);
}

function setButtonLoading(btn, isLoading, busyText) {
  if (!btn) return;
  const key = "_orig";
  if (isLoading) {
    if (!btn[key]) btn[key] = btn.textContent;
    btn.textContent = busyText || btn.textContent;
    btn.setAttribute("aria-disabled", "true");
    btn.disabled = true;
  } else {
    btn.textContent = btn[key] || btn.textContent;
    btn.removeAttribute("aria-disabled");
    btn.disabled = false;
  }
}

function setLoading(isLoading, opts = {}) {
  const { forTop5 = false } = opts;
  grid.setAttribute("aria-busy", isLoading ? "true" : "false");
  setButtonLoading(btnSearch, isLoading && !forTop5, "Searching…");
  setButtonLoading(btnTop5, isLoading && forTop5, "Loading…");
  if (isLoading && countEl) countEl.textContent = "Loading…";
  if (isLoading) clearError();
}

function passesDiet(meal, diet) {
  const d = norm(diet || "any");
  if (!d || d === "any" || d === "any diet") return true;

  const ings = [];
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
    case "gluten-free":  return !hasAny(gfBlock);
    default:             return true;
  }
}

function softGuessSlug(meal) {
  const hay = norm([meal.strMeal, meal.strArea, meal.strCategory, meal.strTags].filter(Boolean).join(" | "));
  for (const [slug, kws] of Object.entries(CU_KEYWORDS)) {
    if (kws.some(kw => hay.includes(norm(kw)))) return slug;
  }
  return null;
}

function stableSortBy(arr, keyFn) {
  return [...arr].sort((a,b) => (keyFn(a) < keyFn(b) ? -1 : keyFn(a) > keyFn(b) ? 1 : 0));
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
      let minSlug = SLUGS[0], minCnt = counts[SLUGS[0]];
      for (const s of SLUGS) if (counts[s] < minCnt) { minSlug = s; minCnt = counts[s]; }
      return minSlug;
    };
    if (!(target && counts[target] <= Math.min(...Object.values(counts)) + 1)) target = pickLeast();
    assignment.set(m.idMeal, target); counts[target]++; buckets[target].push(m);
  }

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

// ==============================
// Client fallback (when API_BASE == null)
// ==============================
async function fetchChineseList() {
  const r = await fetch(`${API_PUBLIC}/filter.php?a=Chinese`);
  const j = await r.json();
  return (j.meals || []);
}

async function expandDetails(list) {
  const details = await Promise.all(
    list.map(x =>
      fetch(`${API_PUBLIC}/lookup.php?i=${x.idMeal}`)
        .then(r => r.json())
        .catch(() => ({ meals: [] }))
    )
  );
  return details.map(d => d.meals && d.meals[0]).filter(Boolean);
}

async function clientSearch({ ingredients, cuisineSlug, diet, limit }) {
  if (!ingredients.length) {
    const raw = await fetchChineseList();
    const expanded = await expandDetails(raw);
    const { assignment, buckets } = makeUniqueAssignment(expanded);
    let pool = SLUGS.flatMap(s => buckets[s].filter(m => passesDiet(m, diet)));
    if (cuisineSlug) pool = pool.filter(m => assignment.get(m.idMeal) === cuisineSlug);
    return { meals: pool.slice(0, limit), total: pool.length };
  }

  let base = null;
  {
    const r0 = await fetch(`${API_PUBLIC}/filter.php?i=${encodeURIComponent(ingredients[0])}`);
    const j0 = await r0.json();
    base = j0.meals || [];
    for (const ing of ingredients.slice(1)) {
      const r = await fetch(`${API_PUBLIC}/filter.php?i=${encodeURIComponent(ing)}`);
      const j = await r.json();
      const set = new Set((j.meals || []).map(x => x.idMeal));
      base = base.filter(x => set.has(x.idMeal));
    }
  }
  const expanded = await expandDetails(base);
  const { assignment } = makeUniqueAssignment(expanded);
  let filtered = expanded.filter(m => passesDiet(m, diet));
  if (cuisineSlug) filtered = filtered.filter(m => assignment.get(m.idMeal) === cuisineSlug);
  return { meals: filtered.slice(0, limit), total: filtered.length };
}

// ==============================
// Render
// ==============================
function renderCards(list) {
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const m of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="card__img" src="${m.thumb || m.strMealThumb}" alt="${m.name || m.strMeal}">
      <div class="card__body">
        <h4 class="card__title">${m.name || m.strMeal}</h4>
      </div>
      <div class="card__cta">
        <button class="card__btn" data-id="${m.id || m.idMeal}">View details</button>
      </div>
    `;
    frag.append(card);
  }
  grid.append(frag);

  grid.querySelectorAll(".card__btn").forEach(btn => {
    btn.addEventListener("click", (e) => openDetail(btn.dataset.id, e.currentTarget));
  });
}

function renderCount(n) {
  countEl.textContent = `Found ${n} result(s).`;
  if (n === 0) announce("No results found.");
}

// ==============================
// Detail
// ==============================
async function openDetail(id, triggerBtn) {
  const meal = await (async () => {
    if (API_BASE) {
      try {
        const r = await fetch(`${API_BASE}/recipe/${id}`);
        if (r.ok) {
          const j = await r.json();
          return j.meal;
        }
      } catch {}
    }
    const r = await fetch(`${API_PUBLIC}/lookup.php?i=${id}`);
    const j = await r.json();
    const m = j.meals && j.meals[0];
    if (!m) return null;
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`];
      const ms = m[`strMeasure${i}`];
      if (ing && String(ing).trim()) ingredients.push({ ingredient: String(ing).trim(), measure: String(ms || "").trim() });
    }
    return {
      id: m.idMeal, name: m.strMeal, area: m.strArea, category: m.strCategory,
      instructions: m.strInstructions, thumb: m.strMealThumb,
      tags: (m.strTags || "").split(",").map(s => s.trim()).filter(Boolean),
      ingredients
    };
  })();

  if (!meal) return;

  detailHost.innerHTML = `
    <h3>${meal.name}</h3>
    <img class="detail__hero" src="${meal.thumb}" alt="${meal.name}">
    <div class="tags">
      ${[meal.area, meal.category].filter(Boolean).map(t => `<span class="tag">${t}</span>`).join("")}
      ${(meal.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
    </div>
    <div class="detail__cols">
      <div class="detail__box">
        <h4>Ingredients</h4>
        <ul>${(meal.ingredients || []).map(i => `<li>${i.ingredient} — ${i.measure || ""}</li>`).join("")}</ul>
      </div>
      <div class="detail__box">
        <h4>Instructions</h4>
        <p style="white-space:pre-line">${meal.instructions || "No instructions."}</p>
      </div>
    </div>
  `;
  showModal(modalDetail, true, triggerBtn);
}

// ==============================
// Top 5  (always the same; never filtered)
// ==============================
async function fetchMealSummaryById(id) {
  if (API_BASE) {
    try {
      const r = await fetch(`${API_BASE}/recipe/${id}`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        if (j && j.meal) return { id: j.meal.id, name: j.meal.name, thumb: j.meal.thumb };
      }
    } catch {}
  }
  const r = await fetch(`${API_PUBLIC}/lookup.php?i=${id}`);
  const j = await r.json();
  const m = j.meals && j.meals[0];
  return m ? { id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb } : null;
}

async function openTop5(triggerBtn) {
  setLoading(true, { forTop5: true });
  announce("Loading top five.");
  let meals = [];

  try {
    if (API_BASE) {
      const r = await fetch(`${API_BASE}/top?limit=5`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        meals = (j.meals || []).slice(0, 5);
      }
    }
    if (!meals.length) {
      const details = await Promise.all(FIXED_TOP5_IDS.map(fetchMealSummaryById));
      meals = details.filter(Boolean);
    }

    topList.innerHTML = "";
    meals.forEach((m, idx) => {
      const row = document.createElement("div");
      row.className = "rank";
      row.innerHTML = `
        <div class="rank__num">${idx + 1}</div>
        <img class="rank__img" src="${m.thumb}" alt="${m.name}">
        <div>
          <div class="rank__name">${m.name}</div>
          <div class="rank__meta">ID: ${m.id}</div>
        </div>
        <div class="rank__spacer"></div>
        <button class="rank__btn" data-id="${m.id}">View details</button>
      `;
      topList.append(row);
    });
    topList.querySelectorAll(".rank__btn").forEach(b =>
      b.addEventListener("click", (e) => openDetail(b.dataset.id, e.currentTarget))
    );
    showModal(modalTop5, true, triggerBtn);
  } catch {
    showError("Failed to load Top 5. Please try again.");
  } finally {
    setLoading(false, { forTop5: true });
  }
}

// ==============================
// Search
// ==============================
async function doSearch() {
  setLoading(true);
  announce("Searching recipes.");
  const cuisineSlug = cuisineSelect.value;
  const dietValue = (dietSelect.value || "any").toLowerCase();
  const ingredients = qInput.value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3);
  const limit = 200;

  let payload = { meals: [], total: 0 };

  try {
    if (API_BASE) {
      const url = new URL(`${API_BASE}/recipes`, location.origin);
      if (cuisineSlug) url.searchParams.set("cuisine", cuisineSlug);
      if (dietValue && dietValue !== "any diet") url.searchParams.set("diet", dietValue);
      if (ingredients.length) url.searchParams.set("ingredients", ingredients.join(","));
      url.searchParams.set("limit", limit);
      const r = await fetch(url);
      if (r.ok) payload = await r.json();
    }

    if (!payload.meals || !payload.meals.length) {
      const dietForClient = dietValue === "any diet" ? "any" : dietValue;
      const { meals, total } = await clientSearch({ ingredients, cuisineSlug, diet: dietForClient, limit });
      payload = {
        meals: meals.map(m => ({ id: m.idMeal, name: m.strMeal, thumb: m.strMealThumb })),
        total
      };
    }

    renderCards(payload.meals || []);
    renderCount(payload.total || 0);
  } catch {
    showError("Failed to load recipes. Please try again.");
  } finally {
    setLoading(false);
  }
}

// ==============================
// Modal helpers (accessibility)
// ==============================
let lastFocusEl = null;

function getFocusableEls(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => el.offsetParent !== null || container === el);
}

function trapTabKey(e, container) {
  if (e.key !== "Tab") return;
  const focusables = getFocusableEls(container);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

function showModal(el, show, triggerEl) {
  el.classList.toggle("show", !!show);
  el.setAttribute("aria-hidden", show ? "false" : "true");
  document.body.style.overflow = show ? "hidden" : "";

  if (show) {
    lastFocusEl = triggerEl || document.activeElement;
    setTimeout(() => {
      const focusables = getFocusableEls(el);
      (focusables[0] || el).focus();
    }, 0);

    el._onKeydown = (e) => {
      if (e.key === "Escape") {
        showModal(el, false);
      } else {
        trapTabKey(e, el);
      }
    };
    document.addEventListener("keydown", el._onKeydown);
  } else {
    if (el._onKeydown) {
      document.removeEventListener("keydown", el._onKeydown);
      el._onKeydown = null;
    }
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      setTimeout(() => lastFocusEl.focus(), 0);
    }
  }
}

function wireModalClose() {
  document.querySelectorAll("[data-close='top5']").forEach(x =>
    x.addEventListener("click", () => showModal(modalTop5, false))
  );
  document.querySelectorAll("[data-close='detail']").forEach(x =>
    x.addEventListener("click", () => showModal(modalDetail, false))
  );
}

// ==============================
// Keyboard shortcuts
// ==============================
function isEditableTarget(t) {
  return !!t && (
    t.tagName === "INPUT" ||
    t.tagName === "SELECT" ||
    t.tagName === "TEXTAREA" ||
    t.isContentEditable === true
  );
}

function shortcutsAllowed() {
  const anyModalOpen =
    modalTop5.classList.contains("show") ||
    modalDetail.classList.contains("show");
  return !anyModalOpen;
}

function bindShortcuts() {
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    const inEdit = isEditableTarget(t);

    if (e.key === "/" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !inEdit) {
      e.preventDefault();
      qInput.focus();
      qInput.select();
      announce("Focused search input.");
      return;
    }

    if ((e.key === "Enter") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      btnSearch.click();
      return;
    }

    if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey && !e.altKey && !inEdit) {
      if (!shortcutsAllowed()) return;
      e.preventDefault();
      openTop5(btnTop5);
      return;
    }

    if (e.key === "?" && !inEdit) {
      e.preventDefault();
      announce("Shortcuts: slash focuses search, Ctrl+Enter searches, T opens Top 5, Alt+C cuisine filter, Alt+D diet filter, Escape closes dialog.");
      return;
    }

    if (e.altKey && !e.ctrlKey && !e.metaKey && !inEdit) {
      const k = e.key.toLowerCase();
      if (k === "c") {
        e.preventDefault();
        cuisineSelect.focus();
        announce("Focused cuisine filter.");
      } else if (k === "d") {
        e.preventDefault();
        dietSelect.focus();
        announce("Focused diet filter.");
      }
    }
  });
}

// ==============================
// Init
// ==============================
async function init() {
  API_BASE = await resolveApiBase();

  try {
    if (API_BASE) {
      const r = await fetch(`${API_BASE}/cuisines`);
      const j = await r.json();
      buildCuisineSelect(j.cuisines || []);
    } else {
      buildCuisineSelect(FALLBACK_CUISINES.slice(1));
    }
  } catch {
    buildCuisineSelect(FALLBACK_CUISINES.slice(1));
  }

  buildDietSelect();
  wireModalClose();

  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSearch.click();
  });

  btnSearch.addEventListener("click", doSearch);
  btnTop5.addEventListener("click", (e) => openTop5(e.currentTarget));

  bindShortcuts();

  await doSearch();
}

init();
