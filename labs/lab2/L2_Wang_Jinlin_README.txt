CSCI 3172 – Lab 2  README

Individual submission – An ES6 + DOM single-page “Magic Shop Inventory” app.
Semantic HTML5, responsive CSS (Grid/Flexbox), and accessible, keyboard-friendly UI.
No external CSS/JS frameworks or libraries.

Date Created: 12 Oct 2025
Last Modification Date: 12 Oct 2025
Lab URL: https://web.cs.dal.ca/~jinlin/csci3172/labs/lab2/
GitLab Repo: https://git.cs.dal.ca/jinlin/csci3172

Authors
- Jinlin Wang (zz939875@dal.ca) – Individual

Built With
- Plain HTML5, CSS3, and Vanilla ES6 JavaScript
- Layout: CSS Grid & Flexbox; responsive with media queries
- Accessibility: semantic landmarks, visible :focus-visible, ARIA where appropriate
- Tools: VS Code (editing), Git/GitLab (version control), FileZilla (deploy), W3C Validators (QA)

Project Structure
csci3172/
└─ labs/
   └─ lab2/
      ├─ index.html
      ├─ styles/
      │  └─ style.css
      ├─ js/
      │  └─ script.js
      └─ L2_Wang_Jinlin_README.txt

How to Run
- Open index.html in any modern browser.

What the App Does (Feature Checklist)
- Add / Remove items with validation (name/type required, non-negative price, integer quantity).
- Live search by name/type; type filter via select AND quick-filter chips.
- Sorting: Name ↑, Price ↑/↓, Quantity ↑/↓, Default.
- Grid/List layout toggle (accessible aria-pressed control).
- Calculate Total Value (Intl.NumberFormat for currency).
- Currency can be changed by editing the CURRENCY constant in js/script.js.
- Grouped view (Map): segmented control groups items by “type”.
- Apply Discount (%) across all items (0–90%, rounded to cents).
- Auto-updating metrics: Items, Total Qty, Total Value.
- Low Stock (≤ 3) horizontal cards (bonus): up to 10 lowest-qty items.
- When a search query is present, the Low Stock section auto-hides to reduce noise.
- Duplicate highlighting (bonus): duplicate item names are flagged on cards.
- Reset to the initial dataset.
- Sticky header with auto-hide on scroll (bonus).
- Fully responsive from mobile to desktop.

Validation
- HTML (W3C Nu): 0 errors, checked on 2025-10-12
- CSS  (W3C Jigsaw): 0 errors, checked on 2025-10-12

Sources Used
- None.

Artificial Intelligence Tools Used
- None.

Maintainers
- Added: mosquera, yuxuanw, shrutic

Acknowledgments
- Thanks to the course staff for the Lab 2 handout, examples, and validation guidance.
