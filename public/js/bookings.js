(async () => {
  const user = await requireUser('/bookings.html', 'user');
  if (!user) return;

  const list = document.getElementById('list');
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  function reviewBlock(b) {
    if (b.review) {
      return `<div class="review"><span class="stars" aria-label="Оценка ${b.review.rating} из 5">${stars(b.review.rating)}</span>
        <p style="margin:4px 0 0">${esc(b.review.text)}</p></div>`;
    }
    if (b.status === 'Завершено') {
      return `<div class="booking__foot"><button class="btn btn--brass btn--small" data-review="${b.id}">Оставить отзыв</button></div>`;
    }
    return '<p class="hint">Отзыв можно оставить после завершения мероприятия.</p>';
  }

  function card(b) {
    return `<article class="card booking" data-id="${b.id}">
      <div class="booking__head"><h3>${esc(b.room.name)}</h3>${chip(b.status)}</div>
      <dl class="booking__meta">
        <dt>Тип</dt><dd>${esc(b.room.type)}</dd>
        <dt>Дата начала</dt><dd>${fmtDate(b.startDate)}</dd>
        <dt>Оплата</dt><dd>${PAY[b.paymentMethod]}</dd>
        <dt>Заявка №</dt><dd>${b.id}</dd>
      </dl>
      <div class="slot">${reviewBlock(b)}</div>
    </article>`;
  }

  function openReviewForm(article, id) {
    const slot = article.querySelector('.slot');
    let rating = 0;
    slot.innerHTML = `<form class="review-form" novalidate>
      <div class="form-error" role="alert"></div>
      <div class="stars-input" role="group" aria-label="Оценка">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="Оценка ${n}">★</button>`).join('')}
      </div>
      <small class="err" data-for="rating"></small>
      <label class="field"><span>Ваш отзыв о мероприятии</span><textarea name="text"></textarea>
        <small class="err" data-for="text"></small></label>
      <button class="btn btn--small" type="submit">Отправить отзыв</button>
    </form>`;
    const form = slot.querySelector('form');
    const buttons = [...form.querySelectorAll('.stars-input button')];
    buttons.forEach((bt) => bt.addEventListener('click', () => {
      rating = Number(bt.dataset.n);
      buttons.forEach((x) => x.classList.toggle('on', Number(x.dataset.n) <= rating));
    }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(form);
      const text = form.elements.text.value.trim();
      let ok = true;
      if (!rating) { setError(form, 'rating', 'Поставьте оценку от 1 до 5'); ok = false; }
      if (text.length < 5) { setError(form, 'text', 'Напишите пару предложений'); ok = false; }
      if (!ok) return;
      try {
        const review = await api(`/api/bookings/${id}/review`, { method: 'POST', body: { rating, text } });
        slot.innerHTML = reviewBlock({ review, status: 'Завершено' });
        toast('Спасибо за отзыв!');
      } catch (err) {
        showServerErrors(form, err);
      }
    });
  }

  try {
    const bookings = await api('/api/bookings/my');
    if (!bookings.length) {
      list.classList.remove('grid');
      list.innerHTML = `<div class="empty"><p>Заявок пока нет.</p><a class="btn" href="/new-booking.html">Забронировать помещение</a></div>`;
      return;
    }
    list.innerHTML = bookings.map(card).join('');
    stagger(list);
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-review]');
      if (btn) openReviewForm(btn.closest('article'), btn.dataset.review);
    });
  } catch (err) {
    toast(err.message, true);
  }
})();
