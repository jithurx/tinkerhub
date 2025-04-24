const form = document.getElementById('login-form');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const email = form.email.value;
  const pwd   = form.password.value;
  const role  = form.role.value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // Save token & role
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    window.location.href = 'dashboard.html';
  } catch (err) {
    document.getElementById('login-error').textContent = err.message;
  }
});
