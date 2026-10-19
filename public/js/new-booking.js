(async () => {
  const user = await requireUser('/new-booking.html', 'user');
  if (!user) return;

  const form = document.getElementById('form');
  const btn = form.querySelector('button[type=submit]');

  const now = new Date();
  const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.startDate.min = iso;
  form.startDate.value = iso;

  const rooms = await api('/api/rooms');
  const byType = rooms.reduce((acc, r) => ((acc[r.type] ||= []).push(r), acc), {});
  form.roomId.insertAdjacentHTML('beforeend', Object.entries(byType).map(([type, list]) =>
    `<optgroup label="${esc(type)}">${list.map((r) =>
      `<option value="${r.id}">${esc(r.name)} — до ${r.capacity} мест</option>`).join('')}</optgroup>`
  ).join(''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    let ok = true;
    if (!form.roomId.value) { setError(form, 'roomId', 'Выберите помещение'); ok = false; }
    if (!form.startDate.value) { setError(form, 'startDate', 'Укажите дату начала'); ok = false; }
    else if (form.startDate.value < iso) { setError(form, 'startDate', 'Дата не может быть в прошлом'); ok = false; }
    if (!ok) return;

    busy(btn, true);
    try {
      await api('/api/bookings', {
        method: 'POST',
        body: {
          roomId: Number(form.roomId.value),
          startDate: form.startDate.value,
          paymentMethod: form.paymentMethod.value,
        },
      });
      toast('Заявка отправлена администратору');
      setTimeout(() => (location.href = '/bookings.html'), 700);
    } catch (err) {
      showServerErrors(form, err);
      busy(btn, false, 'Отправить');
    }
  });
})();
