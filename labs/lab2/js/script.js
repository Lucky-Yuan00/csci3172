'use strict';
const CURRENCY  = 'USD';
const LOW_STOCK = 3;

/* ---------- Initial Data ---------- */
const inventory = [
  { name: 'Elixir of Mending', type: 'potion', price: 13.25, quantity: 9, description: 'Restores minor vitality over time.' },
  { name: 'Arcane Tonic', type: 'potion', price: 14.75, quantity: 6, description: 'Replenishes a small amount of mana.' },
  { name: 'Sparkweaver Wand', type: 'wand', price: 42.00, quantity: 3, description: 'Crackles with caged lightning.' },
  { name: 'Scroll of Minor Wonder', type: 'scroll', price: 19.75, quantity: 5, description: 'Single-use incantation with a playful effect.' },
  { name: 'Scrying Orb (Pocket)', type: 'trinket', price: 52.00, quantity: 2, description: 'Palm-sized orb for brief glimpses ahead.' },
  { name: 'Forager\'s Herb Satchel', type: 'component', price: 5.25, quantity: 18, description: 'Common reagents for basic recipes.' },
  { name: 'Cloak of Whispers', type: 'apparel', price: 93.00, quantity: 1, description: 'A light cloak that softens sound.' },
  { name: 'Ash Phoenix Quill', type: 'component', price: 72.00, quantity: 1, description: 'A rare catalyst warm to the touch.' },
  { name: 'Runic Keystone', type: 'trinket', price: 20.50, quantity: 11, description: 'Etched with protective sigils.' },
  { name: 'Scroll of Appraisal', type: 'scroll', price: 17.00, quantity: 4, description: 'Reveals hidden properties of items.' },
];
const initialInventory = JSON.parse(JSON.stringify(inventory));

/* ---------- DOM ---------- */
const listEl = document.getElementById('inventory-list');
const messagesEl = document.getElementById('messages');

const addToggle = document.getElementById('add-toggle');
const addForm = document.getElementById('add-form');
const nameInput = document.getElementById('name');
const typeInput = document.getElementById('type');
const priceInput = document.getElementById('price');
const qtyInput = document.getElementById('quantity');
const descInput = document.getElementById('description');

const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const clearSearchBtn = document.getElementById('clear-search');
const sortSelect = document.getElementById('sort-select');
const layoutToggleBtn = document.getElementById('layout-toggle');

const calcTotalBtn = document.getElementById('calc-total-btn');
const totalValueOut = document.getElementById('total-value');

const discountInput = document.getElementById('discount-input');
const applyDiscountBtn = document.getElementById('apply-discount-btn');

const chipsRow = document.getElementById('chips-row');
const featuredRow = document.getElementById('featured-row');

const mItems = document.getElementById('m-items');
const mQty = document.getElementById('m-qty');
const mValue = document.getElementById('m-value');

const resetBtn = document.getElementById('reset-btn');

/* segmented control */
const viewCardsBtn = document.getElementById('view-cards');
const viewGroupedBtn = document.getElementById('view-grouped');
let grouped = false;

/* hero (sticky header) for auto-hide */
const heroEl = document.getElementById('hero') || document.querySelector('.hero');

/* low-stock section container (for quick hide while searching) */
const lowStockSection = featuredRow ? featuredRow.closest('section') : null;

/* ---------- Utils ---------- */
const norm = (s) => String(s || '').trim().toLowerCase();
function money(n){
  return new Intl.NumberFormat(undefined, { style:'currency', currency:CURRENCY }).format(n);
}
function showMessage(text, kind='info'){
  const span = document.createElement('span');
  span.className = `msg ${kind}`;
  span.textContent = text;
  messagesEl.innerHTML = '';
  messagesEl.appendChild(span);
}
function getTypeSet(items=inventory){
  const s = new Set();
  for (const it of items) s.add(it.type);
  return s;
}

/* ---------- Chips ---------- */
function renderTypeChips(){
  chipsRow.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip active';
  all.textContent = 'All';
  all.dataset.value = '';
  chipsRow.appendChild(all);
  for (const t of getTypeSet()){
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = t;
    btn.dataset.value = t;
    chipsRow.appendChild(btn);
  }
}
function syncChipsActive(){
  const val = norm(typeFilter.value);
  for (const el of chipsRow.querySelectorAll('.chip')){
    el.classList.toggle('active', norm(el.dataset.value) === val);
  }
}

/* ---------- Filters / Sort / Layout ---------- */
function sortItems(items){
  const val = sortSelect.value;
  const arr = items.slice();
  const byName = (a,b)=>a.name.localeCompare(b.name);
  const byPrice = (a,b)=>a.price-b.price;
  const byQty = (a,b)=>a.quantity-b.quantity;
  switch(val){
    case 'name-asc': return arr.sort(byName);
    case 'price-asc': return arr.sort(byPrice);
    case 'price-desc': return arr.sort((a,b)=>byPrice(b,a));
    case 'qty-asc': return arr.sort(byQty);
    case 'qty-desc': return arr.sort((a,b)=>byQty(b,a));
    default: return arr;
  }
}
function getFilteredItems(){
  const q = norm(searchInput.value), t = norm(typeFilter.value);
  const base = inventory.filter(it=>{
    const matchQ = !q || it.name.toLowerCase().includes(q) || it.type.toLowerCase().includes(q);
    const matchT = !t || it.type.toLowerCase()===t;
    return matchQ && matchT;
  });
  return sortItems(base);
}

/* ---------- Metrics + Low stock ---------- */
function updateMetrics(){
  const items = inventory.length;
  const qty = inventory.reduce((s,it)=>s+it.quantity,0);
  const val = inventory.reduce((s,it)=>s+it.price*it.quantity,0);
  mItems.textContent = String(items);
  mQty.textContent = String(qty);
  mValue.textContent = money(val);
}
function renderFeatured(){
  if(!featuredRow) return;
  const top = inventory
    .filter(it=>it.quantity<=LOW_STOCK)
    .sort((a,b)=>a.quantity-b.quantity)
    .slice(0,10);
  featuredRow.innerHTML = '';
  for (const it of top){
    const card = document.createElement('div');  card.className='mini-card';
    const title = document.createElement('div');  title.className='mini-title'; title.textContent=it.name;
    const meta = document.createElement('div');  meta.className='mini-meta';
    meta.innerHTML = `<span class="badge">${it.type}</span> • ${money(it.price)} • Qty: <strong>${it.quantity}</strong>`;
    const p = document.createElement('p'); p.textContent = it.description || '';
    card.append(title, meta, p);
    featuredRow.appendChild(card);
  }
}

/* Hide/show Low Stock section depending on current search/filter */
function updateLowStockVisibility(){
  if(!lowStockSection) return;
  const hasQuery = norm(searchInput.value).length > 0;
  const hasFilter = norm(typeFilter.value).length > 0;
  const shouldHide = hasQuery || hasFilter;
  lowStockSection.classList.toggle('hidden', shouldHide);
}

/* ---------- CRUD ---------- */
function getItem(name){
  if(!name) return null;
  const t = norm(name);
  return inventory.find(it=>norm(it.name)===t) || null;
}
function addItem(item){
  if(!item || !item.name || !item.type) return showMessage('Name and type are required.','error');
  if(typeof item.price!=='number' || Number.isNaN(item.price) || item.price<0)
    return showMessage('Price must be a non-negative number.','error');
  if(!Number.isInteger(item.quantity) || item.quantity<0)
    return showMessage('Quantity must be a non-negative integer.','error');
  if(getItem(item.name))
    return showMessage('Item name already exists. Use a different name.','error');

  inventory.push({
    name: String(item.name),
    type: String(item.type),
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: String(item.description || ''),
    createdAt: Date.now()
  });
  postDataChange('Item added.');
}
function removeItem(name){
  const t = norm(name);
  const idx = inventory.findIndex(it=>norm(it.name)===t);
  if(idx===-1) return showMessage('Item not found.','error');
  if(!confirm(`Remove "${name}"?`)) return;
  inventory.splice(idx,1);
  postDataChange('Item removed.');
}
function postDataChange(msg){
  populateTypeFilter();
  renderTypeChips();
  syncChipsActive();
  updateMetrics();
  renderFeatured();
  renderList(getFilteredItems());
  updateLowStockVisibility();
  showMessage(msg,'success');
}

/* ---------- Rendering ---------- */
function buildNameCounts(){
  const map = new Map();
  for(const it of inventory){
    const key = norm(it.name);
    map.set(key, (map.get(key)||0) + 1);
  }
  return map;
}
function isDuplicate(name){
  const counts = buildNameCounts();
  return (counts.get(norm(name))||0) > 1;
}

function renderList(items){
  grouped ? renderGroupedByType(items) : renderFlat(items);
}

function renderFlat(items){
  listEl.classList.toggle('list', layoutToggleBtn.getAttribute('aria-pressed')==='true');
  listEl.innerHTML = '';
  if(!items || items.length===0){
    const empty = document.createElement('div');
    empty.textContent = 'No items to display.';
    empty.className = 'item-meta';
    listEl.appendChild(empty);
    return;
  }
  for (const item of items) listEl.appendChild(makeItemCard(item));
}
function renderGroupedByType(items){
  listEl.classList.remove('list');
  listEl.innerHTML = '';
  if(!items || items.length===0){
    const empty = document.createElement('div');
    empty.textContent = 'No items to display.';
    empty.className = 'item-meta';
    listEl.appendChild(empty);
    return;
  }
  const groups = new Map();
  for(const it of items){
    if(!groups.has(it.type)) groups.set(it.type, []);
    groups.get(it.type).push(it);
  }
  for(const [type, arr] of groups.entries()){
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = `Type: ${type} (${arr.length})`;
    listEl.appendChild(title);
    for(const item of arr) listEl.appendChild(makeItemCard(item));
  }
}
function makeItemCard(item){
  const card = document.createElement('div'); card.className='item-card';
  if(isDuplicate(item.name)){
    const flag = document.createElement('span'); flag.className='dup-flag'; flag.textContent='Duplicate';
    card.appendChild(flag);
  }
  const h3 = document.createElement('h3'); h3.textContent=item.name;
  const meta = document.createElement('div'); meta.className='item-meta';
  meta.innerHTML = `<span class="badge">${item.type}</span> &nbsp;•&nbsp; <span class="price">${money(item.price)}</span> &nbsp;•&nbsp; Qty: <strong>${item.quantity}</strong>`;
  const desc = document.createElement('p'); desc.textContent=item.description||'';
  const actions = document.createElement('div'); actions.className='item-actions';
  const delBtn = document.createElement('button');
  delBtn.className='btn'; delBtn.textContent='Remove';
  delBtn.setAttribute('data-action','remove');
  delBtn.setAttribute('data-name', item.name);
  actions.appendChild(delBtn);

  card.append(h3, meta);
  if(item.description) card.appendChild(desc);
  card.appendChild(actions);
  return card;
}

/* ---------- Calc / Extras ---------- */
function searchItems(){ renderList(getFilteredItems()); }
function calculateTotalValue(){
  const total = inventory.reduce((s,it)=>s+it.price*it.quantity,0);
  totalValueOut.value = money(total);
  showMessage('Total value updated.','success');
  return total;
}
function applyDiscount(pct){
  const n = Number(pct);
  if(Number.isNaN(n) || n<0 || n>90)
    return showMessage('Discount must be between 0 and 90.','error');
  for(const it of inventory){
    const discounted = it.price * (1 - n/100);
    it.price = Math.round(discounted*100)/100;
  }
  postDataChange(`Applied ${n}% discount to all items.`);
}
function resetData(){
  if(!confirm('Reset to initial 10 items?')) return;
  inventory.splice(0, inventory.length, ...JSON.parse(JSON.stringify(initialInventory)));
  postDataChange('Data reset.');
}

/* ---------- Events ---------- */
addToggle.addEventListener('click', ()=>{
  const exp = addToggle.getAttribute('aria-expanded')==='true';
  addToggle.setAttribute('aria-expanded', String(!exp));
  if(!exp) nameInput.focus();
});
addForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const name = nameInput.value.trim(),
        type = typeInput.value.trim();
  const price = parseFloat(priceInput.value),
        qty   = parseInt(qtyInput.value,10);
  const description = descInput.value.trim();
  addItem({ name, type, price, quantity:qty, description });
  if(messagesEl.textContent.includes('Item added.')){
    addForm.reset();
    nameInput.focus();
  }
});

listEl.addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-action="remove"]');
  if(!btn) return;
  const name = btn.getAttribute('data-name');
  if(name) removeItem(name);
});

searchInput.addEventListener('input', ()=>{
  searchItems();
  syncChipsActive();
  updateLowStockVisibility();   // hide/show Low Stock while typing
});
typeFilter.addEventListener('change', ()=>{
  searchItems();
  syncChipsActive();
  updateLowStockVisibility();   // also react to type filter
});
clearSearchBtn.addEventListener('click', ()=>{
  searchInput.value=''; typeFilter.value=''; sortSelect.value='default';
  renderList(inventory); syncChipsActive(); updateLowStockVisibility();
  searchInput.focus();
});

sortSelect.addEventListener('change', ()=>{ renderList(getFilteredItems()); });

layoutToggleBtn.addEventListener('click', ()=>{
  const pressed = layoutToggleBtn.getAttribute('aria-pressed')==='true';
  layoutToggleBtn.setAttribute('aria-pressed', String(!pressed));
  layoutToggleBtn.textContent = !pressed ? 'Layout: List' : 'Layout: Grid';
  renderList(getFilteredItems());
});

/* segmented view switch */
function setView(mode){
  grouped = (mode === 'grouped');
  viewCardsBtn.classList.toggle('active', !grouped);
  viewGroupedBtn.classList.toggle('active', grouped);
  viewCardsBtn.setAttribute('aria-selected', String(!grouped));
  viewGroupedBtn.setAttribute('aria-selected', String(grouped));
  renderList(getFilteredItems());
}
viewCardsBtn.addEventListener('click', ()=> setView('cards'));
viewGroupedBtn.addEventListener('click', ()=> setView('grouped'));

calcTotalBtn.addEventListener('click', ()=>{ calculateTotalValue(); });
applyDiscountBtn.addEventListener('click', ()=>{ applyDiscount(discountInput.value); });
resetBtn.addEventListener('click', resetData);

chipsRow.addEventListener('click',(e)=>{
  const btn = e.target.closest('.chip');
  if(!btn) return;
  typeFilter.value = btn.dataset.value || '';
  searchItems(); syncChipsActive(); updateLowStockVisibility();
});

/* Auto-hide hero on scroll down; reveal on scroll up (with hysteresis) */
(function initHeroAutoHide(){
  if(!heroEl) return;

  let lastY = window.pageYOffset || window.scrollY;
  let hidden = false;

  const HIDE_AFTER = 140; // only hide after we pass this vertical offset
  const SHOW_SENSITIVITY = 24;  // need this much upward motion to re-show
  const MIN_DELTA = 4;   // ignore tiny jitter

  window.addEventListener('scroll', () => {
    const y  = window.pageYOffset || window.scrollY;
    const dy = y - lastY;

    // shadow once we leave the very top
    heroEl.classList.toggle('hero--shadow', y > 2);

    // ignore tiny oscillation to prevent flicker
    if (Math.abs(dy) <= MIN_DELTA) { lastY = y; return; }

    if (!hidden) {
      // scrolling down past threshold -> hide once
      if (dy > 0 && y > HIDE_AFTER) {
        heroEl.classList.add('hero--hidden');
        hidden = true;
      }
    } else {
      // scrolling up with enough distance OR back near top -> show
      if (dy < -SHOW_SENSITIVITY || y < 10) {
        heroEl.classList.remove('hero--hidden');
        hidden = false;
      }
    }

    lastY = y;
  }, { passive: true });
})();


/* ---------- Init ---------- */
function populateTypeFilter(){
  const current = typeFilter.value;
  typeFilter.innerHTML = '<option value="">All types</option>';
  for(const t of getTypeSet()){
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    typeFilter.appendChild(opt);
  }
  if ([...getTypeSet(), ''].includes(current)) typeFilter.value = current;
}
function init(){
  populateTypeFilter();
  renderTypeChips();
  syncChipsActive();
  updateMetrics();
  renderFeatured();
  renderList(inventory);
  updateLowStockVisibility(); // set initial state
}
init();
