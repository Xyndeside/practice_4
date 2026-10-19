(async () => {
  const me = await currentUser();
  if (me) { location.href = me.role === 'admin' ? '/admin.html' : '/bookings.html'; return; }
  mountHeader(null);

  const form = document.getElementById('form');
  const btn = form.querySelector('button[type=submit]');
  const rules = { login: () => '', password: () => '' }; // только проверка «не пусто»
  liveValidate(form, rules);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    if (!validateForm(form, rules)) return;
    busy(btn, true);
    try {
      const { user } = await api('/api/auth/login', {
        method: 'POST',
        body: { login: form.login.value.trim(), password: form.password.value },
      });
      location.href = user.role === 'admin' ? '/admin.html' : '/bookings.html';
    } catch (err) {
      showServerErrors(form, err);
      busy(btn, false, 'Войти');
    }
  });
})();
