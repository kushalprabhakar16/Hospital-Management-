/* ============================================================
   app.js — Shared app shell, navigation, components, modules
   Used by dashboard.html, patients.html, doctors.html
   ============================================================ */

/* ----------  Helpers  ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = name => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = n => '₹' + Number(n || 0).toLocaleString('en-IN');

function showToast(msg, type = 'success') {
  let wrap = $('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'circle-exclamation' : 'circle-info';
  t.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${esc(msg)}`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function avatarHTML(item, cls = 'avatar-initials') {
  if (item.photo) return `<img class="${cls.replace('initials', 'sm')}" src="${item.photo}" alt="">`;
  return `<div class="${cls}">${initials(item.name)}</div>`;
}

/* ----------  Theme  ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kmsh_theme', theme);
  $$('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.theme === theme));
}
function applyMode(mode) {
  document.documentElement.setAttribute('data-mode', mode);
  localStorage.setItem('kmsh_mode', mode);
  const icon = $('#modeToggle i');
  if (icon) icon.className = mode === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ----------  Demo banner  ---------- */
function showDemoBanner() {
  if (API.isOnline()) return;
  if ($('.demo-banner')) return;
  const b = document.createElement('div');
  b.className = 'demo-banner';
  b.innerHTML = '<i class="fa-solid fa-flask"></i> DEMO MODE · LocalStorage';
  document.body.appendChild(b);
}

/* ----------  App shell  ---------- */
function buildShell(page, title) {
  const user = Auth.currentUser() || { name: 'User', role: '' };
  const nav = [
    { group: 'Main', items: [
      { id: 'dashboard', icon: 'gauge-high', label: 'Dashboard', href: 'dashboard.html' },
    ]},
    { group: 'Management', items: [
      { id: 'patients', icon: 'user-injured', label: 'Patients', href: 'patients.html', count: 'patients' },
      { id: 'doctors', icon: 'user-doctor', label: 'Doctors', href: 'doctors.html', count: 'doctors' },
      { id: 'appointments', icon: 'calendar-check', label: 'Appointments', href: 'dashboard.html#appointments', count: 'appointments' },
      { id: 'operations', icon: 'syringe', label: 'Operations', href: 'dashboard.html#operations' },
      { id: 'laboratory', icon: 'flask', label: 'Laboratory', href: 'dashboard.html#laboratory' },
      { id: 'pharmacy', icon: 'prescription-bottle-medical', label: 'Pharmacy', href: 'dashboard.html#pharmacy' },
      { id: 'billing', icon: 'file-invoice-dollar', label: 'Billing', href: 'dashboard.html#billing' },
      { id: 'staff', icon: 'users-gear', label: 'Staff', href: 'dashboard.html#staff' },
    ]},
    { group: 'System', items: [
      { id: 'reports', icon: 'chart-pie', label: 'Reports', href: 'dashboard.html#reports' },
      { id: 'departments', icon: 'building', label: 'Departments', href: 'dashboard.html#departments' },
    ]},
  ];
  const db = DB.get();
  const counts = { patients: db.patients.length, doctors: db.doctors.length, appointments: db.appointments.length };

  const navHTML = nav.map(g => `
    <div class="nav-group-label">${g.group}</div>
    ${g.items.map(it => `
      <a href="${it.href}" class="nav-item ${it.id === page ? 'active' : ''}" data-nav="${it.id}">
        <i class="fa-solid fa-${it.icon}"></i> <span>${it.label}</span>
        ${it.count ? `<span class="badge-count">${counts[it.count] || 0}</span>` : ''}
      </a>`).join('')}
  `).join('');

  return `
    <div class="app-shell">
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-logo"><i class="fa-solid fa-plus"></i></div>
          <div class="brand-text"><strong>KUSHAL</strong><span>Multi Speciality Hospital</span></div>
        </div>
        ${navHTML}
        <div class="sidebar-footer">
          <button class="nav-item" onclick="Auth.logout()"><i class="fa-solid fa-right-from-bracket"></i> <span>Logout</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="btn-icon menu-toggle" id="menuToggle"><i class="fa-solid fa-bars"></i></button>
          <div class="page-title">${title}</div>
          <div class="search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input class="input" id="globalSearch" placeholder="Search patients, doctors, records...">
          </div>
          <div class="topbar-actions">
            <div class="theme-switcher" id="themeSwitcher">
              <span class="theme-dot royal" data-theme="royal" title="Royal"></span>
              <span class="theme-dot emerald" data-theme="emerald" title="Emerald"></span>
              <span class="theme-dot teal" data-theme="teal" title="Teal"></span>
              <span class="theme-dot luxury" data-theme="luxury" title="Luxury"></span>
              <span class="theme-dot purple" data-theme="purple" title="Purple"></span>
            </div>
            <button class="icon-btn" id="modeToggle" title="Toggle dark mode"><i class="fa-solid fa-moon"></i></button>
            <button class="icon-btn always" title="Notifications"><i class="fa-solid fa-bell"></i><span class="dot"></span></button>
            <div class="user-chip">
              <div class="avatar">${initials(user.name)}</div>
              <div class="meta"><strong>${esc(user.name)}</strong><span>${esc(user.role)}</span></div>
            </div>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>
  `;
}

function mountShell(page, title, renderer) {
  document.title = `${title} · Kushal Multi Speciality Hospital`;
  document.body.innerHTML = buildShell(page, title);
  showDemoBanner();

  // Theme
  const theme = localStorage.getItem('kmsh_theme') || 'royal';
  const mode = localStorage.getItem('kmsh_mode') || 'light';
  applyTheme(theme); applyMode(mode);

  $('#themeSwitcher').addEventListener('click', e => {
    const dot = e.target.closest('.theme-dot'); if (!dot) return;
    applyTheme(dot.dataset.theme);
  });
  $('#modeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-mode');
    applyMode(cur === 'dark' ? 'light' : 'dark');
  });

  // Mobile sidebar
  const sb = $('#sidebar'), bd = $('#sidebarBackdrop');
  $('#menuToggle').addEventListener('click', () => { sb.classList.add('open'); bd.classList.add('open'); });
  bd.addEventListener('click', () => { sb.classList.remove('open'); bd.classList.remove('open'); });

  // Render content
  renderer($('#content'));
}

/* ----------  Modal helpers  ---------- */
function openModal(title, bodyHTML, opts = {}) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal ${opts.size || ''}">
    <div class="modal-head"><h3>${title}</h3><button class="modal-close" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="modal-body">${bodyHTML}</div>
    ${opts.footer ? `<div class="modal-foot">${opts.footer}</div>` : ''}
  </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('open'));
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  return ov;
}
function closeModal() { $$('.modal-overlay').forEach(m => { m.classList.remove('open'); setTimeout(() => m.remove(), 300); }); }

function confirmDialog(title, message, onConfirm) {
  const ov = openModal(`<i class="fa-solid fa-triangle-exclamation" style="color:var(--c-error)"></i> ${title}`,
    `<p style="color:var(--text-soft);font-size:.95rem">${message}</p>`,
    { footer: `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-danger" id="confirmBtn"><i class="fa-solid fa-check"></i> Confirm</button>` });
  $('#confirmBtn', ov).addEventListener('click', () => { closeModal(); onConfirm(); });
}

/* ----------  File upload preview  ---------- */
function bindPhotoUpload(inputId, previewId) {
  const input = $('#' + inputId), preview = $('#' + previewId);
  if (!input || !preview) return;
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      preview.style.backgroundImage = `url(${ev.target.result})`;
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
      preview.innerHTML = '';
      preview.dataset.dataUrl = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ----------  Pagination state  ---------- */
const Pager = {
  state: {},
  init(key, total, pageSize, render) {
    Pager.state[key] = { page: 1, pageSize, total, render };
  },
  go(key, page) {
    const s = Pager.state[key]; if (!s) return;
    const pages = Math.max(1, Math.ceil(s.total / s.pageSize));
    s.page = Math.min(Math.max(1, page), pages);
    s.render();
  },
  controls(key, current, total, pageSize) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1) return `<div class="pagination"><span class="info">${total} record(s)</span></div>`;
    const btns = [];
    btns.push(`<button onclick="Pager.go('${key}',${current - 1})" ${current <= 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>`);
    const maxBtns = 7;
    let start = Math.max(1, current - 3), end = Math.min(pages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    if (start > 1) btns.push(`<button onclick="Pager.go('${key}',1)">1</button>`);
    if (start > 2) btns.push(`<button disabled>…</button>`);
    for (let i = start; i <= end; i++) btns.push(`<button class="${i === current ? 'active' : ''}" onclick="Pager.go('${key}',${i})">${i}</button>`);
    if (end < pages - 1) btns.push(`<button disabled>…</button>`);
    if (end < pages) btns.push(`<button onclick="Pager.go('${key}',${pages})">${pages}</button>`);
    btns.push(`<button onclick="Pager.go('${key}',${current + 1})" ${current >= pages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`);
    return `<div class="pagination">${btns.join('')}<span class="info">Page ${current} of ${pages} · ${total} record(s)</span></div>`;
  }
};
window.Pager = Pager;

/* ----------  Table renderer (with mobile cards)  ---------- */
function renderTable({ columns, rows, rowKey, actions, empty }) {
  if (!rows.length) return `<div class="empty-state"><i class="fa-solid fa-folder-open"></i><h4>${empty || 'No records found'}</h4><p>Add a new record to get started.</p></div>`;
  const head = columns.map(c => `<th data-sort="${c.sort || ''}">${c.label}${c.sort ? ` <i class="fa-solid fa-sort"></i>` : ''}</th>`).join('') + '<th>Actions</th>';
  const body = rows.map(r => `
    <tr>
      ${columns.map(c => `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}
      <td><div class="row-actions">${actions(r)}</div></td>
    </tr>`).join('');
  const mobile = rows.map(r => `
    <div class="mobile-card glass">
      <div class="mc-head">${columns[0].render ? columns[0].render(r) : esc(r[columns[0].key])}
        <div style="margin-left:auto">${actions(r)}</div>
      </div>
      <div class="mc-body">
        ${columns.slice(1).map(c => `<div><div class="lbl">${c.label}</div><div>${c.render ? c.render(r) : esc(r[c.key]) || '—'}</div></div>`).join('')}
      </div>
    </div>`).join('');
  return `
    <div class="table-wrap"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="mobile-cards">${mobile}</div>
  `;
}

/* ----------  Export helpers  ---------- */
function exportCSV(filename, columns, rows) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows.map(r => columns.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  showToast('Exported as CSV', 'success');
}

function printPage() { window.print(); }

/* ----------  Init on every page  ---------- */
async function initApp() {
  // Probe backend once
  await API.probe();
  DB.seed();
}
window.initApp = initApp;
