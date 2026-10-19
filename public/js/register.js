(async () => {
  const me = await currentUser();
  if (me) { location.href = me.role === 'admin' ? '/admin.html' : '/bookings.html'; return; }
  mountHeader(null);

  const form = document.getElementById('form');
  const btn = form.querySelector('button[type=submit]');
  phoneMask(form.phone);
  liveValidate(form, RULES);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    if (!validateForm(form, RULES)) return;
    busy(btn, true);
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: {
          login: form.login.value.trim(),
          password: form.password.value,
          fullName: form.fullName.value.trim(),
          phone: form.phone.value,
          email: form.email.value.trim(),
        },
      });
      await api('/api/auth/login', {
        method: 'POST',
        body: { login: form.login.value.trim(), password: form.password.value },
      });
      location.href = '/bookings.html';
    } catch (err) {
      showServerErrors(form, err);
      busy(btn, false, 'Создать пользователя');
    }
  });
})();
