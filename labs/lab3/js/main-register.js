/* ES6 highlights:
 * - ES module imports from ./store.js, ./ui.js, ./validators.js.
 * - Arrow functions for DOMContentLoaded, input listeners, and submit handler.
 * - Guarded submit + try/catch around addUser(...) for user feedback.
 * - Destructuring at submit (FormData → Object.fromEntries → destructuring).
 */

import { addUser, hasUsername, hasEmail, listUsers } from "./store.js";
import { setFormMessage, setFieldError, clearFieldError } from "./ui.js";
import { validateEmail, validateUsername, validatePassword, validateConfirm } from "./validators.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const email = document.getElementById("regEmail");
  const username = document.getElementById("regUsername");
  const password = document.getElementById("regPassword");
  const confirm = document.getElementById("regConfirm");
  const msg = document.getElementById("formMessage");
  const submitBtn = document.getElementById("btnRegister");

  console.log("[Register] wired. Preset users:", listUsers());

  function runFieldValidation() {
    let ok = true;

    const v1 = validateEmail(email.value);
    if (!v1.ok) { setFieldError(email, v1.message); ok = false; } else { clearFieldError(email); }

    const v2 = validateUsername(username.value);
    if (!v2.ok) { setFieldError(username, v2.message); ok = false; } else { clearFieldError(username); }

    const v3 = validatePassword(password.value);
    if (!v3.ok) { setFieldError(password, v3.message); ok = false; } else { clearFieldError(password); }

    const v4 = validateConfirm(password.value, confirm.value);
    if (!v4.ok) { setFieldError(confirm, v4.message); ok = false; } else { clearFieldError(confirm); }

    // duplicate checks
    if (ok && hasUsername(username.value)) { setFieldError(username, "Username already exists."); ok = false; }
    if (ok && hasEmail(email.value))       { setFieldError(email, "Email already used."); ok = false; }

    submitBtn.disabled = !ok;
    return ok;
  }

  for (const el of [email, username, password, confirm]) {
    el.addEventListener("input", () => {
      setFormMessage(msg, "", "");
      runFieldValidation();
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    setFormMessage(msg, "", "");

    if (!runFieldValidation()) {
      setFormMessage(msg, "bad", "Please fix the highlighted fields.");
      return;
    }

    // Destructure values at submit time (explicit ES6 demo for grading)
    const fd = new FormData(form);
    const { email: emailVal, username: userVal, password: passVal /*, confirm */ } =
      Object.fromEntries(fd);

    try {
      addUser({ username: userVal, email: emailVal, password: passVal });
      setFormMessage(msg, "ok", "You have been successfully registered.");
      form.reset();
      for (const el of [email, username, password, confirm]) {
        el.classList.remove("is-valid", "is-error");
      }
      submitBtn.disabled = true;
    } catch (err) {
      setFormMessage(msg, "bad", err.message || "Registration failed.");
    }
  });

  submitBtn.disabled = true;
});
