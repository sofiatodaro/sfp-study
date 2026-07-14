/* SFP Study 1.5 – aggiornamento Piano di studi modificabile */
(() => {
  'use strict';

  if (!Array.isArray(db.studyPlan)) db.studyPlan = [];
  const selectedPlanItems = new Set();

  const style = document.createElement('style');
  style.textContent = `
    .planToolbar{display:flex;gap:.65rem;flex-wrap:wrap;align-items:center}
    .planItem{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center}
    .planOrder{display:flex;flex-direction:column;gap:4px}
    .planOrder button{padding:2px 8px;min-width:34px}
    .planActions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    .planBadge{display:inline-block;padding:3px 9px;border-radius:999px;background:rgba(141,103,216,.14);font-size:.78rem;margin-top:5px}
    .danger{border-color:#d45b69!important;color:#b63d4c!important}
    #planFileInput{display:none}
    @media(max-width:680px){.planItem{grid-template-columns:1fr}.planOrder{flex-direction:row}.planActions{justify-content:flex-start}}
  `;
  document.head.appendChild(style);

  const nav = document.querySelector('#nav');
  const examButton = nav.querySelector('[data-view="esami"]');
  const planButton = document.createElement('button');
  planButton.dataset.view = 'piano';
  planButton.textContent = '☷ Piano di studi';
  nav.insertBefore(planButton, examButton);

  const main = document.querySelector('main');
  const examsSection = document.querySelector('#esami');
  const planSection = document.createElement('section');
  planSection.id = 'piano';
  planSection.className = 'view';
  planSection.innerHTML = `
    <div class="sectionHead">
      <div>
        <h2>Piano di studi</h2>
        <p class="muted">Modifica moduli, lezioni e date senza perdere manuale e registro.</p>
      </div>
      <div class="planToolbar">
        <button class="secondary" id="markSelectedDone">✓ Segna fatte</button>
        <button class="secondary" id="postponeSelected">+1 giorno</button>
        <button class="secondary" id="importPlan">Importa</button>
        <button class="secondary" id="exportPlan">Esporta</button>
        <button class="primary" id="addPlanItem">+ Nuova attività</button>
        <input id="planFileInput" type="file" accept="application/json,.json">
      </div>
    </div>
    <article class="card" style="margin-bottom:16px">
      <strong>Modifica protetta</strong>
      <p class="muted" style="margin-bottom:0">Le modifiche riguardano il piano. Le lezioni già completate restano nel manuale e nel registro.</p>
    </article>
    <div id="studyPlanList" class="list"></div>
  `;
  main.insertBefore(planSection, examsSection);

  function planEsc(value = '') {
    return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function ensureSubjects() {
    return db.subjects.length
      ? db.subjects.map(s => `<option value="${planEsc(s.name)}">${planEsc(s.name)}</option>`).join('')
      : '<option value="Generale">Generale</option>';
  }

  function renderPlan() {
    const list = document.querySelector('#studyPlanList');
    if (!list) return;
    list.innerHTML = db.studyPlan.length ? db.studyPlan.map((item, index) => `
      <div class="listItem planItem">
        <label title="Seleziona attività" style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="planSelect" data-id="${item.id}" ${selectedPlanItems.has(item.id) ? 'checked' : ''}></label>
        <div class="planOrder">
          <button title="Sposta su" onclick="movePlanItem(${item.id},-1)" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button title="Sposta giù" onclick="movePlanItem(${item.id},1)" ${index === db.studyPlan.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
        <div>
          <strong>${planEsc(item.title)}</strong>
          <div class="meta">${planEsc(item.subject)} · ${planEsc(item.module || 'Senza modulo')}${item.date ? ' · ' + new Date(item.date + 'T12:00:00').toLocaleDateString('it-IT') : ''}</div>
          <span class="planBadge">${item.done ? 'Completata' : 'Da svolgere'}</span>
        </div>
        <div class="planActions">
          <button onclick="togglePlanItem(${item.id})">${item.done ? 'Riapri' : 'Completa'}</button>
          <button onclick="postponePlanItem(${item.id})" ${!item.date ? 'disabled title="Inserisci prima una data"' : ''}>+1 giorno</button>
          <button onclick="editPlanItem(${item.id})">Modifica</button>
          <button class="danger" onclick="removePlanItem(${item.id})">Elimina</button>
        </div>
      </div>`).join('') : '<div class="empty">Il piano è vuoto. Tocca “Nuova attività” per inserire il primo modulo o la prima lezione.</div>';
    list.querySelectorAll('.planSelect').forEach(box => {
      box.onchange = () => {
        const id = Number(box.dataset.id);
        if (box.checked) selectedPlanItems.add(id); else selectedPlanItems.delete(id);
      };
    });
  }

  function openPlanModal(item = null) {
    const dialog = document.querySelector('#modal');
    const fields = document.querySelector('#modalFields');
    dialog.dataset.type = item ? 'plan-edit' : 'plan-add';
    dialog.dataset.editId = item ? String(item.id) : '';
    document.querySelector('#modalTitle').textContent = item ? 'Modifica attività' : 'Nuova attività';
    fields.innerHTML = `
      <label>Titolo<input name="title" required value="${planEsc(item?.title || '')}" placeholder="Es. Lezione 3 – Comprensione del testo"></label>
      <label>Materia<select name="subject">${ensureSubjects()}</select></label>
      <label>Modulo<input name="module" value="${planEsc(item?.module || '')}" placeholder="Es. Modulo 1"></label>
      <label>Data prevista<input type="date" name="date" value="${planEsc(item?.date || '')}"></label>
      <label>Stato<select name="done"><option value="false">Da svolgere</option><option value="true" ${item?.done ? 'selected' : ''}>Completata</option></select></label>`;
    const subjectSelect = fields.querySelector('[name="subject"]');
    if (item?.subject) subjectSelect.value = item.subject;
    dialog.showModal();
  }


  function addDays(dateString, days) {
    if (!dateString) return dateString;
    const date = new Date(dateString + 'T12:00:00');
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function postponeFromItem(id) {
    const item = db.studyPlan.find(x => x.id === id);
    if (!item || !item.date) return false;
    const startDate = item.date;
    db.studyPlan.forEach(activity => {
      if (!activity.done && activity.date && activity.date >= startDate) {
        activity.date = addDays(activity.date, 1);
      }
    });
    return true;
  }

  window.postponePlanItem = id => {
    if (!postponeFromItem(id)) return toast('Inserisci prima la data della lezione');
    save();
    renderPlan();
    toast('Lezione e attività successive rimandate di 1 giorno');
  };

  window.editPlanItem = id => openPlanModal(db.studyPlan.find(x => x.id === id));
  window.removePlanItem = id => {
    if (!confirm('Eliminare questa attività dal piano?')) return;
    db.studyPlan = db.studyPlan.filter(x => x.id !== id);
    save();
    renderPlan();
  };
  window.togglePlanItem = id => {
    const item = db.studyPlan.find(x => x.id === id);
    if (item) item.done = !item.done;
    save();
    renderPlan();
  };
  window.movePlanItem = (id, direction) => {
    const index = db.studyPlan.findIndex(x => x.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= db.studyPlan.length) return;
    [db.studyPlan[index], db.studyPlan[next]] = [db.studyPlan[next], db.studyPlan[index]];
    save();
    renderPlan();
  };

  document.querySelector('#addPlanItem').onclick = () => openPlanModal();
  document.querySelector('#markSelectedDone').onclick = () => {
    if (!selectedPlanItems.size) return toast('Seleziona almeno una lezione');
    db.studyPlan.forEach(item => { if (selectedPlanItems.has(item.id)) item.done = true; });
    selectedPlanItems.clear();
    save();
    renderPlan();
    toast('Lezioni selezionate segnate come fatte');
  };
  document.querySelector('#postponeSelected').onclick = () => {
    if (!selectedPlanItems.size) return toast('Seleziona almeno una lezione');
    const selected = db.studyPlan.filter(item => selectedPlanItems.has(item.id) && item.date).sort((a,b) => a.date.localeCompare(b.date));
    if (!selected.length) return toast('Le lezioni selezionate non hanno una data');
    postponeFromItem(selected[0].id);
    selectedPlanItems.clear();
    save();
    renderPlan();
    toast('Piano rimandato di 1 giorno dalla prima lezione selezionata');
  };
  planButton.onclick = () => go('piano');

  const originalSubmit = document.querySelector('#modalForm').onsubmit;
  document.querySelector('#modalForm').onsubmit = event => {
    const type = document.querySelector('#modal').dataset.type;
    if (type !== 'plan-add' && type !== 'plan-edit') return originalSubmit.call(event.currentTarget, event);
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record = {
      id: type === 'plan-edit' ? Number(document.querySelector('#modal').dataset.editId) : Date.now(),
      title: String(form.get('title') || '').trim(),
      subject: String(form.get('subject') || 'Generale'),
      module: String(form.get('module') || '').trim(),
      date: String(form.get('date') || ''),
      done: String(form.get('done')) === 'true'
    };
    if (!record.title) return toast('Inserisci un titolo');
    if (type === 'plan-edit') {
      const index = db.studyPlan.findIndex(x => x.id === record.id);
      if (index >= 0) db.studyPlan[index] = record;
    } else db.studyPlan.push(record);
    save();
    renderPlan();
    document.querySelector('#modal').close();
    toast(type === 'plan-edit' ? 'Attività modificata' : 'Attività aggiunta');
  };

  document.querySelector('#exportPlan').onclick = () => {
    const payload = {
      app: 'SFP Study',
      version: '1.5-piano-modificabile',
      exportedAt: new Date().toISOString(),
      subjects: db.subjects,
      studyPlan: db.studyPlan
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
    link.download = 'SFP-Study-Piano.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const planInput = document.querySelector('#planFileInput');
  document.querySelector('#importPlan').onclick = () => planInput.click();
  planInput.onchange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.studyPlan)) throw new Error('Formato non valido');
      if (!confirm('Importare questo piano? Il piano attuale verrà sostituito.')) return;
      db.studyPlan = imported.studyPlan;
      if (Array.isArray(imported.subjects) && imported.subjects.length) db.subjects = imported.subjects;
      save();
      renderPlan();
      toast('Piano importato');
    } catch (error) {
      toast('File del piano non valido');
    } finally {
      event.target.value = '';
    }
  };

  // Aggiunge la modifica delle materie già esistenti.
  const originalRenderAll = renderAll;
  renderAll = function patchedRenderAll() {
    originalRenderAll();
    document.querySelector('#subjectsGrid').innerHTML = db.subjects.length ? db.subjects.map(s => `
      <article class="card subjectCard">
        <h3><i class="dot" style="background:${s.color || '#8d67d8'}"></i>${planEsc(s.name)}</h3>
        <p class="muted">${planEsc(s.teacher || 'Docente non indicato')}</p>
        <footer>
          <span>${db.lessons.filter(l => l.subject === s.name).length} lezioni</span>
          <span class="planActions"><button onclick="editSubject(${s.id})">Modifica</button><button class="danger" onclick="removeSubject(${s.id})">Rimuovi</button></span>
        </footer>
      </article>`).join('') : '<div class="empty">Nessuna materia ancora.</div>';
    renderPlan();
  };

  window.editSubject = id => {
    const subject = db.subjects.find(x => x.id === id);
    if (!subject) return;
    const oldName = subject.name;
    const name = prompt('Nome della materia', subject.name);
    if (name === null || !name.trim()) return;
    const teacher = prompt('Docente (facoltativo)', subject.teacher || '');
    subject.name = name.trim();
    subject.teacher = teacher === null ? subject.teacher : teacher.trim();
    db.lessons.forEach(l => { if (l.subject === oldName) l.subject = subject.name; });
    db.exams.forEach(e => { if (e.subject === oldName) e.subject = subject.name; });
    db.studyPlan.forEach(p => { if (p.subject === oldName) p.subject = subject.name; });
    save();
    toast('Materia aggiornata ovunque');
  };

  save();
})();
