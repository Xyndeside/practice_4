/* Общие функции портала «Конференции.РФ» */
const PAY = { onsite: 'При очном посещении', sbp: 'Переводом по СБП' };
const STATUS = {
  'Новая': 'chip--new',
  'Мероприятие назначено': 'chip--assigned',
  'Завершено': 'chip--done',
};

async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* пустой ответ */ }
  if (!res.ok) {
    const err = new Error(data?.message || 'Что-то пошло не так');
    err.status = res.status;
    err.errors = data?.errors || {};
    throw err;
  }
  return data;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function fmtDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

function chip(status) {
  return `<span class="chip ${STATUS[status] || 'chip--new'}">${esc(status)}</span>`;
}

function toast(message, bad = false) {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' bad' : '');
  el.setAttribute('role', 'status');
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

/* ---------- сессия и шапка ---------- */
async function currentUser() {
  const { user } = await api('/api/auth/me');
  return user;
}

function mountHeader(user, active) {
  const link = (href, text) =>
    `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${text}</a>`;
  let nav = '';
  if (user?.role === 'admin') {
    nav = link('/admin.html', 'Все заявки');
  } else if (user) {
    nav = link('/bookings.html', 'Мои заявки') + link('/new-booking.html', 'Новая заявка');
  }
  const who = user ? `<span class="who">${esc(user.fullName)}</span><button type="button" id="logout">Выйти</button>` : '';
  document.getElementById('top').innerHTML = `
    <div class="top__inner">
      <a class="logo" href="/">
        <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="6" width="28" height="20" rx="4" fill="#b8832b"/><rect x="7" y="11" width="18" height="3" rx="1.5" fill="#17203d"/><rect x="7" y="17" width="11" height="3" rx="1.5" fill="#17203d"/></svg>
        Конференции.РФ
      </a>
      <nav class="nav" aria-label="Основное меню">${nav}${who}</nav>
    </div>`;
  document.getElementById('logout')?.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    location.href = '/';
  });
}

/** Проверяет вход; при необходимости перенаправляет. Возвращает пользователя. */
async function requireUser(active, role) {
  const user = await currentUser();
  if (!user) { location.href = '/'; return null; }
  if (role && user.role !== role) {
    location.href = user.role === 'admin' ? '/admin.html' : '/bookings.html';
    return null;
  }
  mountHeader(user, active);
  return user;
}

/* ---------- валидация форм ---------- */
const RULES = {
  login: (v) => /^[A-Za-z0-9]{6,}$/.test(v) ? '' : 'Логин: латиница и цифры, не менее 6 символов',
  password: (v) => v.length >= 8 ? '' : 'Пароль: не менее 8 символов',
  fullName: (v) => /^[А-Яа-яЁё]+(?:\s+[А-Яа-яЁё]+)*$/.test(v.trim()) ? '' : 'ФИО: только кириллица и пробелы',
  phone: (v) => /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(v) ? '' : 'Телефон в формате 8(XXX)XXX-XX-XX',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Введите корректный адрес почты',
};

function setError(form, name, message) {
  const field = form.querySelector(`[name="${name}"]`)?.closest('.field');
  const out = form.querySelector(`.err[data-for="${name}"]`);
  if (field) field.classList.toggle('invalid', !!message);
  if (out) out.textContent = message || '';
}

function clearErrors(form) {
  form.querySelectorAll('.err').forEach((e) => (e.textContent = ''));
  form.querySelectorAll('.field.invalid').forEach((f) => f.classList.remove('invalid'));
  const fe = form.querySelector('.form-error');
  if (fe) fe.textContent = '';
}

function showServerErrors(form, err) {
  const known = Object.entries(err.errors || {});
  known.forEach(([name, msg]) => setError(form, name, msg));
  const fe = form.querySelector('.form-error');
  if (fe && !known.length) {
    fe.textContent = err.message;
    fe.classList.remove('shake'); void fe.offsetWidth; fe.classList.add('shake');
  }
}

/** Проверяет поля по правилам. Возвращает true, если всё верно. */
function validateForm(form, rules) {
  let ok = true;
  for (const [name, rule] of Object.entries(rules)) {
    const input = form.elements[name];
    const value = input.value;
    const message = !value.trim() ? 'Обязательное поле' : rule(value);
    setError(form, name, message);
    if (message) ok = false;
  }
  return ok;
}

function liveValidate(form, rules) {
  for (const [name, rule] of Object.entries(rules)) {
    form.elements[name].addEventListener('blur', (e) => {
      const v = e.target.value;
      setError(form, name, !v.trim() ? 'Обязательное поле' : rule(v));
    });
    form.elements[name].addEventListener('input', () => setError(form, name, ''));
  }
}

function busy(button, on, label) {
  button.disabled = on;
  button.innerHTML = on ? '<span class="spin"></span> Подождите…' : label;
}

function phoneMask(input) {
  input.addEventListener('input', () => {
    let d = input.value.replace(/\D/g, '');
    if (!d) { input.value = ''; return; }
    if (d[0] !== '8') d = '8' + d;
    d = d.slice(0, 11);
    let out = '8';
    if (d.length > 1) out += '(' + d.slice(1, 4);
    if (d.length >= 4) out += ')' + d.slice(4, 7);
    if (d.length >= 7) out += '-' + d.slice(7, 9);
    if (d.length >= 9) out += '-' + d.slice(9, 11);
    input.value = out;
  });
}

function stagger(container) {
  [...container.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
}
