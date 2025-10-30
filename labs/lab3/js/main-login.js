/* ES6 highlights:
 * - ES module imports.
 * - Arrow functions for DOM wiring.
 * - Uses store's Map/Set powered APIs (verify, incrementFail, lock).
 */

import { verifyCredentials, incrementFail, isLocked, resetFail } from "./store.js";
import { setFormMessage, setFieldError, clearFieldError } from "./ui.js";
import { validateUsername } from "./validators.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const username = document.getElementById("loginUsername");
  const password = document.getElementById("loginPassword");
  const msg = document.getElementById("loginMessage");
  const btn = document.getElementById("btnLogin") || document.querySelector('button[type="submit"]');

  console.log("[Login] wired.");

  function runValidation(){
    let ok = true;
    const u = validateUsername(username.value);
    if (!u.ok){ setFieldError(username, u.message); ok=false; } else { clearFieldError(username); }
    if (!password.value || password.value.length === 0){ setFieldError(password, "Password is required."); ok=false; } else { clearFieldError(password); }
    btn.disabled = !ok;
    return ok;
  }

  for (const el of [username, password]) {
    el.addEventListener("input", () => { setFormMessage(msg, "", ""); runValidation(); });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    setFormMessage(msg, "", "");
    if (!runValidation()) { setFormMessage(msg, "bad", "Please fix the highlighted fields."); return; }

    const u = username.value;
    if (isLocked(u)) { setFormMessage(msg, "bad", "Account temporarily locked due to repeated failures."); return; }

    const res = verifyCredentials(u, password.value);
    if (res.ok) {
      resetFail(u);
      setFormMessage(msg, "ok", "Login successful.");
    } else {
      if (res.reason === "no-user") {
        setFieldError(username, "User not found.");
      } else if (res.reason === "bad-pass") {
        const n = incrementFail(u, 5);
        setFieldError(password, `Incorrect password. Failed attempts: ${n}/5`);
        if (n >= 5) setFormMessage(msg, "bad", "Account temporarily locked.");
      } else if (res.reason === "locked") {
        setFormMessage(msg, "bad", "Account temporarily locked.");
      }
    }
  });

  btn && (btn.disabled = true);
});
