(() => {
  // ----- State -----
  const creatures = []; // { id, name, type, habitat, imageUrl, notes }

  // ----- DOM references -----
  const form = document.getElementById('addCreatureForm');
  const nameInput = document.getElementById('creatureName');
  const typeInput = document.getElementById('creatureType');
  const habitatInput = document.getElementById('creatureHabitat');
  const listContainer = document.getElementById('creatureSanctuary');

  // ----- Inject search bar (no HTML change) -----
  const searchWrap = document.createElement('div');
  searchWrap.className = 'form-group';
  const searchLabel = document.createElement('label');
  searchLabel.setAttribute('for', 'searchInput');
  searchLabel.textContent = 'Search (name or type):';
  const searchInput = document.createElement('input');
  searchInput.id = 'searchInput';
  searchInput.className = 'form-control';
  searchInput.placeholder = 'e.g., dragon or aquatic';
  searchWrap.appendChild(searchLabel);
  searchWrap.appendChild(searchInput);
  form.parentNode.insertBefore(searchWrap, form.nextSibling);

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderList(creatures);
    const filtered = creatures.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
    renderList(filtered);
  });

  // ----- Add creature -----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const creature = {
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name: nameInput.value.trim(),
      type: typeInput.value.trim(),
      habitat: habitatInput.value.trim(),
      imageUrl: '', // set via Image button
      notes: ''     // set via Notes button
    };
    if (!creature.name || !creature.type || !creature.habitat) return;

    creatures.push(creature);
    form.reset();
    nameInput.focus();
    renderList(creatures);
  });

  // ----- Render list -----
  function renderList(list) {
    listContainer.innerHTML = '';
    if (!list || list.length === 0) {
      listContainer.innerHTML = '<p>No creatures yet. Add one above!</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'list-group';

    list.forEach(c => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex flex-column';

      const mainLine = document.createElement('div');
      mainLine.className = 'd-flex justify-content-between align-items-center';

      const text = document.createElement('span');
      text.innerHTML = `<strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.type)} · ${escapeHtml(c.habitat)}`;

      const btnGroup = document.createElement('div');

      // ---- Notes button ----
      const notesBtn = document.createElement('button');
      notesBtn.className = 'btn btn-sm btn-outline-secondary mr-2';
      notesBtn.textContent = 'Notes';
      notesBtn.addEventListener('click', () => {
        const updated = prompt('Add/edit notes for this creature:', c.notes || '');
        if (updated !== null) {
          c.notes = updated.trim();
          renderList(list === creatures ? creatures : list);
        }
      });

      // ---- Image button ----
      const imgBtn = document.createElement('button');
      imgBtn.className = 'btn btn-sm btn-outline-primary mr-2';
      imgBtn.textContent = 'Image';
      imgBtn.addEventListener('click', () => {
        const url = prompt('Paste image URL or relative path (e.g., img/dragon.png):', c.imageUrl || '');
        if (url !== null) {
          c.imageUrl = url.trim();
          renderList(list === creatures ? creatures : list);
        }
      });

      // ---- Remove button ----
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-outline-danger';
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', () => {
        const idx = creatures.findIndex(x => x.id === c.id);
        if (idx > -1) {
          creatures.splice(idx, 1);
          renderList(creatures);
        }
      });

      btnGroup.appendChild(notesBtn);
      btnGroup.appendChild(imgBtn);
      btnGroup.appendChild(delBtn);

      mainLine.appendChild(text);
      mainLine.appendChild(btnGroup);
      li.appendChild(mainLine);

      // show notes if present
      if (c.notes) {
        const notesP = document.createElement('small');
        notesP.className = 'text-muted mt-1';
        notesP.textContent = `Notes: ${c.notes}`;
        li.appendChild(notesP);
      }

      // show image if present (with graceful error handling)
      if (c.imageUrl) {
        const img = document.createElement('img');
        img.src = c.imageUrl;
        img.alt = c.name;
        img.className = 'mt-2 img-fluid';
        img.loading = 'lazy';
        img.onerror = () => {
          img.remove();
          const warn = document.createElement('small');
          warn.className = 'text-muted';
          warn.textContent = '(image failed to load)';
          li.appendChild(warn);
        };
        li.appendChild(img);
      }

      ul.appendChild(li);
    });

    listContainer.appendChild(ul);
  }

  // ----- util: escape HTML to prevent injection -----
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  // initial render
  renderList(creatures);
})();
