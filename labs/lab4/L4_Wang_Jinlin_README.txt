# CSCI 3172 — Lab 4
## Chinese Recipe Finder — Recipe Recommender

**Student:** Jinlin Wang (B00911276)  
**Semester:** Fall 2025  
**Submission:** Lab 4 — Chinese Recipe Finder  
**Date Created:** 05 Nov 2025

---

## Live URLs
- **Netlify (Final Submission URL):** https://lab4-jinlin.netlify.app/
- **Local Dev (Netlify Dev):** http://localhost:8888/ (only works when running via terminal command `npm run dev`)

---

## Git Repositories
- **GitLab (Assessment Repo):** https://git.cs.dal.ca/jinlin/csci3172/-/tree/main/labs/lab4
- **GitHub (Netlify Deploy Mirror):** https://github.com/Lucky-Yuan00/csci3172

---

## How to Run (Local)
**Requirements:** Node.js ≥ 18 and npm

```bash
# run these inside labs/lab4
npm install             # install dependencies (Netlify Dev + test deps)
npm run dev             # start local server via Netlify Dev on http://localhost:8888
npm test                # run unit/integration tests
```

- Front‑end is served from **/frontend**  
- Serverless API endpoints are mounted under **/.netlify/functions/api** (proxied as **/api/*** via `netlify.toml`)

**Build:** No build step is required to run locally for this lab.

---

## Netlify Deploy Configuration (used for the live site)
When connecting the **GitHub mirror** to Netlify:

- **Branch to deploy:** `main`
- **Base directory:** `labs/lab4`
- **Publish directory:** `labs/lab4/frontend`
- **Functions directory:** `labs/lab4/netlify/functions`
- **Build command:** `npm run build`

> This matches the repository layout and ensures that the static front‑end and Netlify Functions are deployed correctly.

---

## Project Structure
```
labs/lab4/
├─ data/ # curated dataset (e.g., cuisines.json)
├─ frontend/ # static client (index.html, style.css, script.js)
├─ netlify/
│ └─ functions/
│ └─ api.js # Express-based Netlify Function (serverless API)
├─ tests/ # Jest tests (api.test.js, frontend.test.js)
├─ .env # local environment file (ignored in Git)
├─ .gitignore # ignores node_modules/ and .netlify/ folders
├─ L4_Wang_Jinlin_README.txt # course submission README
├─ netlify.toml # Netlify deploy & proxy configuration
├─ package.json # scripts, dependencies, Jest config
└─ package-lock.json # npm lockfile
```

---

## Tech Stack
- **Front-end:** HTML5, CSS3, JavaScript
- **Back-end:** Node.js 18+, Express 5 on Netlify Functions (serverless)
- **Testing:** Jest, jsdom, supertest

---

## Features Implemented — Front‑end
1. **Ingredient search** with optional **cuisine** and **diet** filters, plus “**Top 5**” quick action.  
2. **Responsive card grid** (12‑column) with images, titles, and short descriptors.  
3. **Detail panel** for a chosen recipe (title, image, summary, key ingredients).  
4. **Result count**, **empty‑state messaging**, and **loading indicators**.  
5. **Accessibility:** labeled inputs, ARIA attributes, visible focus states, keyboard‑friendly controls.

---

## Features Implemented — Back‑end (Serverless API)
- **GET `/api/health`** → `{ ok: true }` (smoke check)  
- **GET `/api/cuisines`** → `{ cuisines: [...] }` served from `/data/cuisines.json`  
- **GET `/api/recipes?q=&cuisine=&diet=&limit=`** → `{ meals: [...], total: N }`  
  - Filters by ingredient(s), cuisine, and diet; supports limiting results.  
  - Returns well‑formed JSON and appropriate **400/500** error codes on invalid input or failures.

---

## API & Data
- **Primary data:** curated JSON focusing on the **“Eight Great Cuisines”** of China (Yue、Lu、Min、Su、Zhe、Xiang、Hui、Chuan).  
- Designed to be **easily extended** to public APIs such as **TheMealDB** or **Edamam** if needed.

---

## Error Handling
- **Client:** `try/catch` around `fetch()`, disabled buttons during requests, informative empty states.  
- **Server:** input validation, safe defaults (e.g., for `limit`), and explicit JSON error payloads with HTTP status codes.

---

## Testing
- **Client (jsdom):** verifies UI renders list/grid, search box, and actions.  
- **Server (supertest):** verifies `/health`, `/cuisines`, `/recipes` output shape and happy paths.  
- **Command:** `npm test`

---

## Accessibility & UI
- Color contrast and focus states checked; semantic labels for selects/inputs.  
- ARIA live region for status/result count.  
- Keyboard navigation verified for key actions.

---

## Cross‑Browser Validation
Validated on **Chrome**, **Edge**, and **Firefox** (Windows 10).

---

## Known Limitations
- Dataset is intentionally small for demo purposes; broader regional coverage would require additional sources.  
- Some recipe images are placeholders; production would implement caching and add explicit attributions.

---

## Academic Integrity / Sources
- Code is original for this lab. General documentation consulted: Netlify Functions and Express.  
- Data regarding cuisine categories compiled from open sources; any third‑party API references are noted in code comments when applicable.

---

## Maintainers (GitLab)
- Added: mosquera, yuxuanw, shrutic
