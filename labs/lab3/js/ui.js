/* ES6 highlights:
 * - Small DOM util functions exported as a module.
 * - Class toggling and message helpers used by register/login scripts.
 */

export function setFormMessage(el, type, text) {
  el.classList.remove("ok", "bad");
  if (type) el.classList.add(type);
  el.textContent = text || "";
}
export function setFieldError(inputEl, message) {
  inputEl.classList.remove("is-valid");
  inputEl.classList.add("is-error");
  const msg = document.querySelector(`.error[data-for="${inputEl.id}"]`);
  if (msg) msg.textContent = message || "";
}
export function clearFieldError(inputEl) {
  inputEl.classList.remove("is-error");
  inputEl.classList.add("is-valid");
  const msg = document.querySelector(`.error[data-for="${inputEl.id}"]`);
  if (msg) msg.textContent = "";
}
