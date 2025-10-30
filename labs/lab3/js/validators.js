/* ES6 highlights:
 * - Named exports of pure validation helpers.
 * - Consistent boolean+message return shape used by callers.
 * - Centralizes regex rules so UI files stay clean.
 */

// ===== Character helpers (no built-ins) =====
function isUpper(c) { const x = c.charCodeAt(0); return x >= 65 && x <= 90; }
function isLower(c) { const x = c.charCodeAt(0); return x >= 97 && x <= 122; }
function isLetter(c){ return isUpper(c) || isLower(c); }
function isDigit(c) { const x = c.charCodeAt(0); return x >= 48 && x <= 57; }
function isAlphaNum(c){ return isLetter(c) || isDigit(c); }

// ===== Username: not start with digit; letters/digits only; no spaces/specials =====
export function validateUsername(str){
  if (!str || str.length === 0) return { ok:false, message:"Username is required." };
  if (isDigit(str[0]) || !isLetter(str[0])) return { ok:false, message:"Must start with a letter." };
  for (let i=0;i<str.length;i++){
    const ch = str[i];
    if (!isAlphaNum(ch)) return { ok:false, message:"Only letters and digits allowed; no spaces or symbols." };
  }
  return { ok:true };
}

// ===== Password: >=12, include 1 digit + 1 upper + 1 lower + 1 symbol =====
export function validatePassword(str){
  if (!str || str.length < 12) return { ok:false, message:"At least 12 characters." };
  let hasU=0, hasL=0, hasD=0, hasS=0;
  for (let i=0;i<str.length;i++){
    const ch = str[i];
    if (isUpper(ch)) hasU=1;
    else if (isLower(ch)) hasL=1;
    else if (isDigit(ch)) hasD=1;
    else hasS=1; // any non-alnum counts as symbol
  }
  if (!hasD) return { ok:false, message:"Include at least 1 digit." };
  if (!hasU) return { ok:false, message:"Include at least 1 uppercase letter." };
  if (!hasL) return { ok:false, message:"Include at least 1 lowercase letter." };
  if (!hasS) return { ok:false, message:"Include at least 1 symbol." };
  return { ok:true };
}

// ===== Confirm Password: strict match (no built-ins) =====
export function validateConfirm(pass, confirm){
  if (!pass || !confirm) return { ok:false, message:"Confirm your password." };
  if (pass.length !== confirm.length) return { ok:false, message:"Passwords do not match." };
  for (let i=0;i<pass.length;i++){ if (pass[i] !== confirm[i]) return { ok:false, message:"Passwords do not match." }; }
  return { ok:true };
}

// ===== Email: local@domain.tld, TLD length 2–8, letters only =====
export function validateEmail(str){
  if (!str || str.length === 0) return { ok:false, message:"Email is required." };

  // exactly one '@'
  let atIndex=-1, count=0;
  for (let i=0;i<str.length;i++){ if (str[i]==='@'){ atIndex=i; count++; } }
  if (count!==1 || atIndex===0 || atIndex===str.length-1){
    return { ok:false, message:"Email must contain one '@' with text before and after." };
  }

  // local part
  let prevDot=false;
  for (let i=0;i<atIndex;i++){
    const ch=str[i];
    const allowed = isLetter(ch)||isDigit(ch)||ch==='.'||ch==='_'||ch==='+'||ch==='%'||ch==='-';
    if (!allowed) return { ok:false, message:"Local part invalid." };
    if (ch==='.') {
      if (i===0 || i===atIndex-1 || prevDot) return { ok:false, message:"Dots not allowed at ends or doubled." };
      prevDot=true;
    } else prevDot=false;
  }

  // domain labels & TLD
  const start=atIndex+1; let haveDot=false; let labelLen=0;
  for (let i=start;i<str.length;i++){
    const ch=str[i];
    if (ch==='.') {
      if (labelLen===0) return { ok:false, message:"Domain has empty label." };
      haveDot=true; labelLen=0; continue;
    }
    if (!(isLetter(ch)||isDigit(ch)||ch==='-')) return { ok:false, message:"Domain contains invalid characters." };
    labelLen++;
  }
  const tldLen=labelLen;
  if (tldLen===0) return { ok:false, message:"Domain must end with a TLD." };
  if (!haveDot) return { ok:false, message:"Domain must contain a dot." };
  if (tldLen<2 || tldLen>8) return { ok:false, message:"TLD must be 2–8 letters." };
  for (let i=str.length - tldLen;i<str.length;i++){ if (!isLetter(str[i])) return { ok:false, message:"TLD must contain letters only." }; }

  return { ok:true };
}
