CSCI 3172 - Lab 3 (Forms, Validation & Modules)
Student: Jinlin Wang (B00911276)
Semester: Fall 2025
Submission: Lab 3 - Login / Register pages with ES6 Modules
Date Created: 25 Oct 2025
Last Modification Date: 30 Oct 2025

Live URLs
- Local dev (example): http://localhost:5500/index.html (Register), http://localhost:5500/login.html (Login)
- Timberlea (final submission URL): https://web.cs.dal.ca/~jinlin/csci3172/labs/lab3/   (please verify it opens over HTTP, not file://)

GitLab Repo
- https://git.cs.dal.ca/jinlin/csci3172/-/tree/main/labs/lab3
- TA/Instructor have Maintainer access.

How to Run (IMPORTANT)
- Do NOT open pages via file://. Always use an HTTP server (e.g., VS Code Live Server or Timberlea).
- Tested on: Chrome, Microsoft Edge, and Firefox. No extensions required.
- Deployed on Timberlea with standard permissions (folders 755, files 644).

Built With
- HTML5, CSS3
- JavaScript (ES6 Modules; no external libraries)
- Browser localStorage (for demo persistence)

Project Structure
- /index.html - Register page (module entry: ./js/main-register.js)
- /login.html - Login page (module entry: ./js/main-login.js)
- /css/styles.css - Styles for both pages
- /js/main-register.js - Wire-up for Register page (listeners, async submit guard)
- /js/main-login.js - Wire-up for Login page (auth, fail counter, lockout)
- /js/validators.js - Pure validation helpers (email/username/password/confirm)
- /js/ui.js - UI helpers (field errors + form message)
- /js/store.js - In-memory DB + localStorage persistence; Map/Set based fail/lock tracking
- README: L3_Wang_Jinlin_README.txt

What I Implemented (Register)
(1) Form fields: email, username, password, confirm. All have inline error areas and ARIA live regions.
(2) Validation rules:
   - Email: traditional format with TLD length 2-8. 
   - Username: must start with a letter; no spaces or special characters.
   - Password: >=12 chars and must include at least 1 digit, 1 uppercase, 1 lowercase, 1 symbol.
   - Confirm: must match password.
   - Duplicate checks: username/email must be unique (checked against store).
(3) UX extras:
   - Password strength meter (0-4) that reacts as the user types.
   - CapsLock indicator for password/confirm inputs.
   - Show/Hide ("eye") toggles for password and confirm.
(4) Submit is disabled until all validations pass.
(5) On success: user record is added to the store and persisted; form resets; success message shown.

What I Implemented (Login)
(1) Validates that username exists, then compares password.
(2) Fail-attempt counter (Map) and lockout list (Set). After too many wrong tries the account is temporarily locked and a message is shown.
(3) On success: fail counter resets; success message shown.
(4) Same small UX extras: show/hide toggle + CapsLock indicator.

Data & Persistence
- Startup has preset demo users. Data is held in memory and also persisted to localStorage under key: lab3_users_v1. JSON load/save is wrapped in try/catch so corrupt data is cleared safely.
- Passwords are stored in plaintext for lab purposes.

ES6+ Highlights
- Module imports/exports across ./js/*.js.
- Arrow functions for event handlers & utilities.
- Destructuring at submit (FormData + Object.fromEntries) to pull email/username/password/confirm in one line.
- Modern collections: Map/Set for users/fails/locked tracking.
- Template strings and for...of loops to keep code concise.
- Defensive programming with try/catch around persistence and submit flow.

Validation Details (source: ./js/validators.js)
- Email regex enforces a conventional mailbox and 2-8 letter TLD.
- Username regex: starts with letter, followed by letters/digits only (no spaces or specials).
- Password checks length + the 4 character classes (digit, upper, lower, symbol).
- Confirm is strict equality with password.

Manual Test Plan
Register page
(1) Type a@b.c -> see "TLD must be 2-8 letters." Submit stays disabled.
(2) Username "1abc" -> see "Must start with a letter."
(3) Enter a short password -> "At least 12 characters." Strength shows 0-1.
(4) Enter a valid set (e.g., ok2@example.com / lab3ok2 / GoodPwd2025!ok) and matching confirm.
(5) Submit -> success message; open DevTools -> localStorage shows lab3_users_v1 updated.
(6) Try re-registering same username/email -> duplicate error shown.

Login page
(7) Try the new user with wrong password several times -> lockout message appears.
(8) Try the correct password -> "Login successful." The fail counter resets.

Accessibility & UI
- All error/success messages use aria-live for assistive tech.
- Interactive controls are focusable and usable via keyboard.
- Visual feedback uses consistent colors and spacing.

Academic Integrity / AI Tools
- None.

Sources Used
- None.

Maintainers
- Added: mosquera, yuxuanw, shrutic
