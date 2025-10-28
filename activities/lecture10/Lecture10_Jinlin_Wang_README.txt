Course: CSCI 3172
Activity: Lecture 10 (L10) - RegEx Activity
Name: Jinlin Wang
Banner ID: B00911276

GitLab URL (directory of this activity):
https://git.cs.dal.ca/jinlin/csci3172/-/tree/main/activities/lecture10

What I implemented:
- First Name RegEx: letters only; optionally allows one middle name separated by a space; case-insensitive; tolerates incidental leading/trailing whitespace.
- Last Name RegEx: letters only; allows apostrophes and hyphens between letter segments (e.g., O'Brien, Smith-Burns); case-insensitive; no internal spaces; no leading/trailing punctuation.
- Email RegEx: traditional email format; local part allows letters/digits with ./_/- as separators; domain supports subdomains and hyphenated labels; top-level domain is 2-6 letters (e.g., uk, com, info, museum); fully anchored.
- Password RegEx: requires at least 12 characters, and at least one uppercase, one lowercase, one digit, one special; spaces are not allowed; fully anchored.
- Flags used: m (multiline) globally so ^/$ work per line; additionally i (ignore case) for the two name patterns.

Patterns:
- First Name (Flags: i, m)
`^\s*[A-Za-z]+(?:\s+[A-Za-z]+)?\s*$`

- Last Name (Flags: i, m)
`^\s*[A-Za-z]+(?:[-'][A-Za-z]+)*\s*$`

- Email (Flags: m)
`^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@(?:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,6}$`

- Password (Flags: m)
`^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])\S{12,}$`

Files & structure:
csci3172/
└── activities/
    └── lecture10/
        ├── Lecture10_Jinlin_Wang_README.txt
        ├── L10-RegEx Test Case.txt
        
How to run / test:
- Open https://regexr.com/
- Paste the entire contents of L10-RegEx Test Case.txt into the Text panel.
- For each field, paste the corresponding pattern into Expression, set flags as listed above, and verify highlights.
- Tip: Tools -> List shows all lines matched by the current pattern to make PASS collection easy.

Test cases & results (from L10-RegEx Test Case.txt):
- First Name - Passed: All lines under "## First Name"; Not Passed: None.
- Last Name  - Passed: All lines under "## Last Name";  Not Passed: None.
- Email      - Passed: All lines under "## Email" (TLD 2-6 letters; subdomains/hyphens supported; labels cannot start/end with '-'); Not Passed: None.
- Password   - Passed: All lines under "## Password" (>=12 chars; has upper/lower/digit/special; no spaces); Not Passed: None.

Reflection:
- regexr's live highlight and per-line m flag made boundary issues obvious; adding i for names matched the assignment's "non-case sensitive" requirement.
- Designing by rules (e.g., "labels + 2-6 letter TLD") rather than enumerating examples produced more robust expressions and fewer false positives.
- The trickiest part was balancing strictness and realism-e.g., allowing hyphenated/apostrophized surnames while rejecting internal spaces.

AI / tools disclosure:
- No external libraries or build tools were used.

Sources used:
- regexr.com (no external libraries or build tools)
- L10-RegEx Test Case.txt