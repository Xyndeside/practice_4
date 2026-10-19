(async () => {
  const user = await requireUser('/admin.html', 'admin');
  if (!user) return;

  const list = document.getElementById('list');
  const counter = document.getElementById('counter');
  const fQ = document.getElementById('f-q');
  const fStatus = document.getElementById('f-status');
  const fRoom = document.getElementById('f-room');

  const rooms = await api('/api/rooms');
  fRoom.insertAdjacentHTML('beforeend', rooms.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join(''));

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  function card(b) {
    const options = ['Новая', 'Мероприятие назначено', 'Завершено']
      .map((s) => `<option${s === b.status ? ' selected' : ''}>${s}</option>`).join('');
    return `<article class="card booking" data-id="${b.id}">
      <div class="booking__head"><h3>${esc(b.room.name)}</h3><span class="chip-slot">${chip(b.status)}</span></div>
      <p class="client">${esc(b.user.fullName)} · ${esc(b.user.login)}<br>${esc(b.user.phone)} · ${esc(b.user.email)}</p>
      <dl class="booking__meta">
        <dt>Тип</dt><dd>${esc(b.room.type)}</dd>
        <dt>Дата начала</dt><dd>${fmtDate(b.startDate)}</dd>
        <dt>Оплата</dt><dd>${PAY[b.paymentMethod]}</dd>
        <dt>Заявка №</dt><dd>${b.id}</dd>
      </dl>
      ${b.review ? `<div class="review"><span class="stars">${stars(b.review.rating)}</span><p style="margin:4px 0 0">${esc(b.review.text)}</p></div>` : ''}
      <div class="booking__foot">
        <label class="hint" for="st-${b.id}">Статус:</label>
        <select class="status-select" id="st-${b.id}" data-id="${b.id}">${options}</select>
      </div>
    </article>`;
  }

  async function load() {
    const params = new URLSearchParams();
    if (fQ.value.trim()) params.set('q', fQ.value.trim());
    if (fStatus.value) params.set('status', fStatus.value);
    if (fRoom.value) params.set('roomId', fRoom.value);
    try {
      const items = await api('/api/admin/bookings?' + params);
      counter.textContent = `Найдено заявок: ${items.length}`;
      list.innerHTML = items.length
        ? items.map(card).join('')
        : '<div class="empty" style="grid-column:1/-1">По этим условиям заявок нет.</div>';
      stagger(list);
    } catch (err) {
      toast(err.message, true);
    }
  }

  list.addEventListener('change', async (e) => {
    const sel = e.target.closest('.status-select');
    if (!sel) return;
    // «Новая» вернуть нельзя: администратор выбирает «Мероприятие назначено» или «Завершено»
    if (sel.value === 'Новая') { load(); return; }
    try {
      await api(`/api/admin/bookings/${sel.dataset.id}/status`, { method: 'PATCH', body: { status: sel.value } });
      const slot = sel.closest('article').querySelector('.chip-slot');
      slot.innerHTML = chip(sel.value);
      slot.firstElementChild.classList.add('pulse');
      toast('Статус заявки обновлён');
      if (fStatus.value && fStatus.value !== sel.value) setTimeout(load, 700);
    } catch (err) {
      toast(err.message, true);
      load();
    }
  });

  let timer;
  fQ.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 250); });
  fStatus.addEventListener('change', load);
  fRoom.addEventListener('change', load);
  document.getElementById('f-reset').addEventListener('click', () => setTimeout(load, 0));

  load();
})();
